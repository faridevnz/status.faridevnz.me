import './App.scss';
import React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { CpuCard } from './components/CpuCard/CpuCard';

function App() {
  // sites
  const [frontends, setFrontends] = useState([]);
  const [backends, setBackends] = useState([]);
  const [previews, setPreviews] = useState([]);
  // metrics
  const [metrics, setMetrics] = useState({});
  // current IP
  const [IP, setIP] = useState({});

  // FUNCTIONS
  
  const exact70 = (items = []) => {
    const rest = 80 - items.length;
    return new Array(rest).fill({ value: 0 }).concat(items);
  }

  const onTakeErrorLog = (site, type) => {
    const host = site.split('/')[0] ?? site;
    axios.get(`https://status.faridevnz.me/api/sites/${host}/${type}/logs`).then(res => console.log(res.data.error))
  }

  const onTakeAccessLog = (site, type) => {
    const host = site.split('/')[0] ?? site;
    axios.get(`https://status.faridevnz.me/api/sites/${host}/${type}/logs`).then(res => console.log(res.data.access))
  }


  // MAPPERS

  const map_tcp_connections = (connections = []) => {
    return connections.reduce((acc, ip) => {
      if (acc[`${ip}`] !== undefined) acc[`${ip}`]++;
      else acc[`${ip}`] = 1;
      return acc;
    }, {});
  }


  // EFFECTS

  useEffect(() => {
    // take active sites
    axios.get('https://status.faridevnz.me/api/sites').then(res => {
      setFrontends(res.data.filter((site) => site.type === 'frontend').map(item => ({ ...item, tracking: { ...item.tracking, ping: exact70(item.tracking.ping) }})));
      setBackends(res.data.filter((site) => site.type === 'backend').map(item => ({ ...item, tracking: { ...item.tracking, ping: exact70(item.tracking.ping) }})));
      setPreviews(res.data.filter((site) => site.type === 'preview').map(item => ({ ...item, tracking: { ...item.tracking, ping: exact70(item.tracking.ping) }})));
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // take the current IP
      axios.get('https://geolocation-db.com/json/').then(res => {
        setIP(res.data.IPv4);
      });
      // take metrics
      axios.get('https://status.faridevnz.me/api/metrics').then(res => {
        const tcp_conn = map_tcp_connections(res.data.stats.network.active_tcp_connections);
        setMetrics({ 
          ...res.data, 
          stats: { 
            ...res.data.stats, 
            network: { 
              ...res.data.stats.network, 
              active_tcp_connections: tcp_conn
            } 
          } 
        });
      })
    }, 1000);
    return () => clearInterval(interval);
  }, []);


  // RENDER

  return (
    <div>
      <div className='header'>
        <span className='title'>Wundart</span><span className='subtitle'>system status</span>
      </div>
      <div className='content'>
        <div className='section-container'>
          {/* FRONTEND AND BACKEND AND PREVIEW */}
          <div className='section-col ping-section'>
            {/* FRONTEND */}
            <span className='section-title'>FRONTEND</span>
            <br />
            <br />
            <br />
            { frontends.map((site, index) => 
              <div key={index} className='item-ping-card'>
                <div className='card-header'>
                  <span>{ site.sitename.split('.')[0] }</span>
                  <span>
                    <span className='log-link' onClick={() => onTakeErrorLog(site.site, 'frontend')}>error log</span>
                    <span className='log-link' onClick={() => onTakeAccessLog(site.site, 'frontend')}>access log</span>
                  </span>
                </div>
                <div className="card" key={index}>
                  { site.tracking.ping.map((ping, index) =>
                    <div className={`item ${ping.value === 0 ? 'item--light-grey' : ''} ${ping.value > 0.100 ? 'item--orange' : 'item--green'} ${ping.value === null ? 'item--red' : ''}`} key={index}></div>
                  ) }
                </div>
              </div>
            ) }
            {/* BACKEND */}
            <br />
            <br />
            <span className='section-title'>BACKEND</span>
            <br />
            <br />
            <br />
            { backends.map((site, index) => 
              <div key={index} className='item-ping-card'>
                <div className='card-header'>
                  <span>{ site.sitename.split('.')[0] }</span>
                  <span>
                  <span className='log-link' onClick={() => onTakeErrorLog(site.site, 'backend')}>error log</span>
                    <span className='log-link' onClick={() => onTakeAccessLog(site.site, 'backend')}>access log</span>
                  </span>
                </div>
                <div className="card" key={index}>
                  { site.tracking.ping.map((ping, index) =>
                    <div className={`item ${ping.value === 0 ? 'item--light-grey' : ''} ${ping.value > 0.100 ? 'item--orange' : 'item--green'} ${ping.value === null ? 'item--red' : ''}`} key={index}></div>
                    ) }
                </div>
              </div>
            ) }
            {/* PREVIEW */}
            <br />
            <br />
            <span className='section-title'>PREVIEW</span>
            <br />
            <br />
            <br />
            { previews.map((site, index) => 
              <div key={index} className='item-ping-card'>
                <div className='card-header'>
                  <span>{ site.sitename.split('.')[0] }</span>
                  <span>
                  <span className='log-link' onClick={() => onTakeErrorLog(site.site, 'preview')}>error log</span>
                    <span className='log-link' onClick={() => onTakeAccessLog(site.site, 'preview')}>access log</span>
                  </span>
                </div>
                <div className="card" key={index}>
                  { site.tracking.ping.map((ping, index) =>
                    <div className={`item ${ping.value === 0 ? 'item--light-grey' : ''} ${ping.value > 0.100 ? 'item--orange' : 'item--green'} ${ping.value === null ? 'item--red' : ''}`} key={index}></div>
                  ) }
                </div>
              </div>
            ) }
          </div>
          {/* METRICS */}
          <div className='section-col'>
            <div>
              <span className='section-title'>METRICS</span>
            </div>
            <br />
            <span className='section-subtitle'>CPU</span>
            <div className='cpus-container'>
              { Object.entries(metrics?.cpu?.specs.cores ?? {}).map(([core_name, specs]) => 
                // <div key={core_name}>Core {core_name} - vendor: { specs.vendor_id } cache: { specs.cache_size } - { specs.frequency }</div>
                <CpuCard 
                  key={core_name} 
                  name={core_name} 
                  vendor={specs.vendor_id} 
                  cache={specs.chace_size} 
                  frequency={specs.frequency}
                  load={100 - metrics.cpu.load[core_name].idle}
                />
              ) }
            </div>
            <br />
            <br />
            <span className='section-subtitle'>RAM</span>
            <br />
            <br />
            <span className='section-subtitle'>STATS</span>
            <br />
            <br />
            <div>TASKS</div>
            <br />
            <div>total: { metrics?.stats?.tasks.total }</div>
            <div>running: { metrics?.stats?.tasks.running }</div>
            <div>sleeping: { metrics?.stats?.tasks.sleeping }</div>
            <div>stopped: { metrics?.stats?.tasks.stopped }</div>
            <div>zombie: { metrics?.stats?.tasks.zombie }</div>
            <br />
            <br />
            <div>TPC CONNECTIONS</div>
            { Object.entries(metrics?.stats?.network.active_tcp_connections ?? {}).map(([ip, count]) => 
              <div key={ip}>{ ip } - { count } { ip === IP ? '- current': '' }</div>
            ) }
            <br />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
