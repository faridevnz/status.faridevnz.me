import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { CpuCard } from './components/CpuCard/CpuCard';
import { parseMetrics } from './utils/parseMetrics';
import { RamCard } from './components/RamCard/RamCard';
import { TcpCard } from './components/TcpCard/TcpCard';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header/Header';

function App() {
  // sites
  const [frontends, setFrontends] = useState<any[]>([]);
  const [backends, setBackends] = useState<any[]>([]);
  const [previews, setPreviews] = useState<any[]>([]);
  // metrics
  const [metrics, setMetrics] = useState<any>({});
  // current IP
  const [IP, setIP] = useState('');

  // FUNCTIONS
  const exact70 = (items = []) => {
    const rest = 80 - items.length;
    return new Array(rest).fill({ value: 0 }).concat(items);
  }

  // API
  const fetchMetrics = () => {
    // take metrics
    axios.get('https://status.faridevnz.me/api/metrics').then(res => {
      setMetrics(parseMetrics(res.data));
    });
  }

  const fetchCurrentIp = () => {
    axios.get('https://geolocation-db.com/json/').then(res => {
      setIP(res.data.IPv4);
    });
  }

  const takeActiveSites = () => {
    axios.get('https://status.faridevnz.me/api/sites').then(res => {
      setFrontends(res.data.filter((site: any) => site.type === 'frontend').map((item: any) => ({ ...item, tracking: { ...item.tracking, ping: exact70(item.tracking.ping) }})));
      setBackends(res.data.filter((site: any) => site.type === 'backend').map((item: any) => ({ ...item, tracking: { ...item.tracking, ping: exact70(item.tracking.ping) }})));
      setPreviews(res.data.filter((site: any) => site.type === 'preview').map((item: any) => ({ ...item, tracking: { ...item.tracking, ping: exact70(item.tracking.ping) }})));
    });
  }
  
  // EFFECTS
  useEffect(() => {
    // take current ip
    fetchCurrentIp();
    // take active sites
    takeActiveSites();
    const interval = setInterval(() => {
      takeActiveSites();
      fetchCurrentIp();
    }, 20000); // 20s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(() => {
      fetchMetrics();
    }, 3000); // 3s
    return () => clearInterval(interval);
  }, []);


  // RENDER

  return (
    <ThemeProvider>
      <div className='app'>
        {/* HEADER */}
        <Header />
        {/* CONTENT */}
        <div className='bg-page-background dark:bg-page-dark min-h-[calc(100vh_-_100px)] w-full p-8 flex flex-col md:p-12 md:grid md:grid-cols-2'>
          <div className='flex justify-end'>
            {/* FRONTEND AND BACKEND AND PREVIEW */}
            <div className='section ping-section dark:bg-header-dark dark:text-white w-full p-8 md:w-[580px] md:p-[50px]'>
              
              {/* FRONTEND */}
              <span className='section-title'>FRONTEND</span>
              <div className='mt-7'></div>
              { frontends.map((site, index) => 
                <div key={index} className='mb-3'>
                  <div className='flex justify-between items-end mb-1'>
                    <span>{ site.sitename.split('.')[0] }</span>
                    <span className='log-link mb-1' onClick={() => window.open(site.uri, '_blank')}>{ `visit ${site.sitename.split('.')[0]} frontend` }</span>
                  </div>
                  <div className="grid grid-cols-[repeat(40,_minmax(0,_1fr))] gap-1 md:gap-0 md:flex" key={index}>
                    { site.tracking.ping.map((ping: any, index: number) =>
                      <div className={`item md:m-[1px] dark:opacity-90 ${ping.value === 0 ? 'item--light-grey' : ''} ${ping.value > 0.100 ? 'item--orange' : 'item--green'} ${ping.value === null ? 'item--red' : ''}`} key={index}></div>
                    ) }
                  </div>
                </div>
              ) }
              
              {/* BACKEND */}
              <div className='mt-12'></div>
              <span className='section-title'>BACKEND</span>
              <div className='mt-7'></div>
              { backends.map((site, index) => 
                <div key={index} className='mb-3'>
                  <div className='flex justify-between items-end mb-1'>
                    <span>{ site.sitename.split('.')[0] }</span>
                    <span className='log-link' onClick={() => window.open(site.uri, '_blank')}>{ `visit ${site.sitename.split('.')[0]} backend` }</span>
                  </div>
                  <div className="grid grid-cols-[repeat(40,_minmax(0,_1fr))] gap-1 md:gap-0 md:flex" key={index}>
                    { site.tracking.ping.map((ping: any, index: number) =>
                      <div className={`item md:m-[1px] dark:opacity-90 ${ping.value === 0 ? 'item--light-grey' : ''} ${ping.value > 0.100 ? 'item--orange' : 'item--green'} ${ping.value === null ? 'item--red' : ''}`} key={index}></div>
                      ) }
                  </div>
                </div>
              ) }
              
              {/* PREVIEW */}
              <div className='mt-12'></div>
              <span className='section-title'>PREVIEW</span>
              <div className='mt-7'></div>
              { previews.map((site, index) => 
                <div key={index} className='mb-3'>
                  <div className='flex justify-between items-end mb-1'>
                    <span>{ site.sitename.split('.')[0] }</span>
                    <span className='log-link' onClick={() => window.open(site.uri, '_blank')}>{ `visit ${site.sitename.split('.')[0]}` }</span>
                  </div>
                  <div className="grid grid-cols-[repeat(40,_minmax(0,_1fr))] gap-1 md:gap-0 md:flex" key={index}>
                    { site.tracking.ping.map((ping: any, index: number) =>
                      <div className={`item md:m-[1px] dark:opacity-90 ${ping.value === 0 ? 'item--light-grey' : ''} ${ping.value > 0.100 ? 'item--orange' : 'item--green'} ${ping.value === null ? 'item--red' : ''}`} key={index}></div>
                    ) }
                  </div>
                </div>
              ) }
            </div>
          </div>

          <div>
            
            {/* METRICS */}
            <div className='w-full p-8 pl-0 md:w-[580px] md:p-[50px]'>
              <div className='mb-10'>
                <span className='section-title'>METRICS</span>
              </div>
              {/* cpu */}
              <span className='section-subtitle'>CPU</span>
              <div className='w-fit md:grid md:grid-cols-2 mt-5 mb-10'>
                { Object.entries(metrics?.cpu?.specs.cores ?? {}).map(([core_name, specs]: [string, any]) => 
                  // <div key={core_name}>Core {core_name} - vendor: { specs.vendor_id } cache: { specs.cache_size } - { specs.frequency }</div>
                  <CpuCard 
                    key={core_name} 
                    name={core_name} 
                    vendor={specs.vendor_id} 
                    cache={specs.chace_size} 
                    frequency={specs.frequency}
                    load={100 - metrics.cpu.load.current[core_name].idle}
                  />
                ) }
              </div>
              {/* ram */}
              <span className='section-subtitle'>RAM</span>
              <div className='ram-container mt-5 mb-10'>
                <RamCard
                  size={metrics?.ram?.specs.total} 
                  free={metrics?.ram?.load.free} 
                  buff_or_cache={metrics?.ram?.load.buff_or_cache}
                  used={metrics?.ram?.load.used}
                />
              </div>
              {/* stats */}
              <span className='section-subtitle'>STATS</span>
              <div className='mt-5'>
                <TcpCard 
                  ips={metrics?.stats?.network.active_tcp_connections}
                  current_ip={IP}
                />
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
