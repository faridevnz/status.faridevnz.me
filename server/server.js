// read the folders in /var/www
import { promises as pfs } from 'fs'
import fs from 'fs';
import axios from 'axios';
import express from 'express';
import cors from 'cors';


// VARIABLES

const app = express();
const Axios = axios.create();
const defaultFileContent = {
  ping: [],
  failures: []
}


// ROUTES

app.use(cors({ origin: '*' }));

app.get('/sites', async (req, res) => {
  const sites = await getSites();
  const result = []
  sites.forEach((site) => {
    const type = /manage/.test(site) ? 'backend' : /preview/.test(site) ? 'preview' : 'frontend';
    const sitename = type === 'backend' ? site.split('/')[0] + '.backend' : site + '.frontend';
    result.push({
      type,
      site,
      uri: `https://${site}`,
      sitename,
      tracking: JSON.parse(fs.readFileSync(`./ping-results/${sitename}.json`, 'utf-8'))
    })
  })
  res.send(result);
});

app.get('/sites/:site/logs', async (req, res) => {
  // take the site log
  const site = req.params.site;
  const error_log = fs.readFileSync(`/var/www/${site}/logs/error.log`, 'utf-8');
  const access_log = fs.readFileSync(`/var/www/${site}/logs/access.log`, 'utf-8');
  res.send({
    error: error_log,
    access: access_log
  })
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
    dirent.name.includes('faridevnz.me') && 
    dirent.name !== 'status.faridevnz.me'
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
      sites.push(`${directories[i]}/api/manage/info`);
    }
  }
  return sites;
}

const savePingResult = (site, { timestamp, value }) => {
  // determine sitename for frontend and backend
  const sitename = /manage/.test(site) ? site.split('/')[0] + '.backend' : site + '.frontend';
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
})