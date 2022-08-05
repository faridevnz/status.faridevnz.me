import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [frontends, setFrontends] = useState([]);
  const [backends, setBackends] = useState([]);
  const [previews, setPreviews] = useState([]);

  const exact70 = (items = []) => {
    const rest = 80 - items.length;
    return new Array(rest).fill({ value: 0 }).concat(items);
  }

  useEffect(() => {
    // take active sites
    axios.get('https://status.faridevnz.me/api/sites').then(res => {
      setFrontends(res.data.filter((site) => site.type === 'frontend').map(item => ({ ...item, tracking: { ...item.tracking, ping: exact70(item.tracking.ping) }})));
      setBackends(res.data.filter((site) => site.type === 'backend').map(item => ({ ...item, tracking: { ...item.tracking, ping: exact70(item.tracking.ping) }})));
      setPreviews(res.data.filter((site) => site.type === 'preview').map(item => ({ ...item, tracking: { ...item.tracking, ping: exact70(item.tracking.ping) }})));
    });
  }, []);

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
              <div key={index}>
                <div>
                  <span>{ site.sitename.split('.')[0] }</span>
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
              <div key={index}>
                <div>
                  <span>{ site.sitename.split('.')[0] }</span>
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
              <div key={index}>
                <div>
                  <span>{ site.sitename.split('.')[0] }</span>
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
            <span className='section-title'>METRICS</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
