// read the folders in /var/www
import { promises as pfs } from 'fs'
import fs from 'fs';
import axios from 'axios';
import express from 'express';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { pino } from 'pino';
import { 
  core_number, 
  average_cpu_load, 
  current_cpu_load,
  cpu_specs, 
  current_memory_info, 
  current_running_tasks,
  network_usage, 
  active_tcp_connections
} from './modules/metrics.js';
import { WebSocketServer } from 'ws';


// LOGGERS

export const loggerInfo = pino({ write: './logs/info.log' });
export const loggerError = pino({ write: './logs/info.log' });


// VARIABLES

const app = express();
const Axios = axios.create();
let metrics = {};
const defaultFileContent = {
  ping: [],
  failures: []
}

// ROUTES ( API )

app.use(cors({ origin: '*' }));
app.use(pinoHttp());

app.get('/health/ping', async (req, res) => {
  res.send({ status: 1 });
});

app.get('/sites', async (req, res) => {
  loggerInfo.info({a: 1}, 'hello');
  const sites = await getSites();
  const result = [];
  sites.forEach((site) => {
    const type = /api/.test(site) ? 'backend' : /preview/.test(site) ? 'preview' : 'frontend';
    const sitename = type === 'backend' ? site.split('/')[0] + '.backend' : site + '.frontend';
    result.push({
      type,
      site,
      uri: `https://${site}`,
      sitename,
      tracking: (fs.existsSync(`./ping-results/${sitename}.json`)) ? JSON.parse(fs.readFileSync(`./ping-results/${sitename}.json`, 'utf-8')) : {}
    })
  })
  res.send(result);
});

app.get('/sites/:host/:type/logs', async (req, res) => {
  // take the site log
  const host = req.params.host;
  const error_log_path = req.params.type === 'backend' ? `/var/www/${host}/server/logs/error.log` : `/var/www/${host}/logs/error.log`;
  const access_log_path = req.params.type === 'backend' ? `/var/www/${host}/server/logs/access.log` : `/var/www/${host}/logs/access.log`;
  res.send({
    error: fs.readFileSync(error_log_path, 'utf-8'),
    access: fs.readFileSync(access_log_path, 'utf-8')
  });
});

app.get('/metrics', async (req, res) => {
  res.send(metrics);
});


// FUNCTIONS

Axios.interceptors.response.use(function (response) {
  response.config.metadata.endTime = new Date();
  response.duration = (response.config.metadata.endTime - response.config.metadata.startTime) / 1000;
  return response;
}, function (error) {
  return Promise.reject(error);
});

Axios.interceptors.request.use(
  function (config) {
    config.metadata = { startTime: new Date() };
    return config;
}, function (error) {
    return Promise.reject(error);
});

const ping = async (host, acceptedStatus = [200, 201]) => {
  return new Promise((resolve) => {
    Axios.get(host)
      .then(res => {
        if (acceptedStatus.includes(res.status)) resolve({ timestamp: res.config.metadata.startTime, value: res.duration });
        else resolve({ timestamp: res.config.metadata.startTime, value: null });
      })
      .catch((err) => resolve({ timestamp: err.config.metadata.startTime, value: null }));
  })
}

const getDirectories = async source =>
(await pfs.readdir(source, { withFileTypes: true }))
  .filter(dirent => 
    dirent.isDirectory() && 
    dirent.name.includes('faridevnz.me')
    // dirent.name !== 'status.faridevnz.me'
  )
  .map(dirent => dirent.name)

const getSites = async () => {
  const sites = [];
  // take directories
  const directories = await getDirectories('/var/www');
  // for each directory identify frontend and backend
  for ( let i = 0; i < directories.length; i++ ) {
    // identify frontend
    if ( fs.existsSync(`/var/www/${directories[i]}/app`) ) {
      sites.push(directories[i]);
    }
    // identify backend
    if ( fs.existsSync(`/var/www/${directories[i]}/server`) ) {
      sites.push(`${directories[i]}/api/health/ping`);
    }
  }
  return sites;
}

const savePingResult = (site, { timestamp, value }) => {
  // determine sitename for frontend and backend
  const sitename = /api/.test(site) ? site.split('/')[0] + '.backend' : site + '.frontend';
  // if file does not exists, create it ( host.json )
  if (!fs.existsSync(`./ping-results/${sitename}.json`)) {
    fs.writeFileSync(`./ping-results/${sitename}.json`, JSON.stringify(defaultFileContent), 'utf-8')
  }
  // append the result at the ping array
  const content = JSON.parse(fs.readFileSync(`./ping-results/${sitename}.json`, 'utf-8'))
  content.ping.push({ timestamp, value });
  // save failures timestamp
  if (value === null) {
    content.failures.push(timestamp)
  }
  // trim the array
  if (content.ping.length > 80) {
    content.ping = content.ping.slice(-80);
  }
  // save the new data
  fs.writeFileSync(`./ping-results/${sitename}.json`, JSON.stringify(content), 'utf-8')
}

const calculateMetrics = () => {
  const { total, ...memory_load } = current_memory_info();
  metrics = {
    cpu: {
      specs: { 
        core_num: core_number() ,
        cores: {
          ...cpu_specs(), 
        },
      },
      load: {
        average: average_cpu_load(),
        current: current_cpu_load()
      },
    },
    ram: {
      specs: {
        total: total
      },
      load: memory_load,
    },
    stats: {
      tasks: current_running_tasks(),
      network: {
        usage: network_usage(),
        active_tcp_connections: active_tcp_connections()
      }
    }
  };
}

// LISTEN SERVER
app.listen(3333, () => {
  console.log('listening on port 3333');
  // PING THE ACTIVE SITES
  setInterval(async () => {
    const sites = await getSites();
    sites.forEach((site) => {
      ping(`https://${site}`).then(({ timestamp, value }) => {
        // console.log(new Date().toLocaleString('it-IT', { timeZone: "Europe/Rome" }))
        // save the ping status
        savePingResult(site, { timestamp, value });
      });
    })
  }, 60000);
  // CALCULATE METRICS
  setInterval(async () => {
    calculateMetrics();
  }, 3000);
});
