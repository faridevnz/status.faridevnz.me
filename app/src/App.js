import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [frontends, setFrontends] = useState([]);
  const [backends, setBackends] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    // take active sites
    axios.get('https://status.faridevnz.me/api/sites').then(res => {
      setFrontends(res.data.filter((site) => site.type === 'frontend'));
      setBackends(res.data.filter((site) => site.type === 'backend'));
      setPreviews(res.data.filter((site) => site.type === 'preview'));
    });
  }, []);

  return (
    <div>
      <h1>BACKEND</h1>
      { backends.map((site, index) => 
        <div key={index}>
          <div className='sitename'>{ site.sitename } - <a href={ site.uri }>{ site.site }</a></div>
          <div className="card" key={index}>
            { site.tracking.ping.map((ping, index) =>
              <div className={`item ${ping.value === 0 ? 'item--light-grey' : ''} ${ping.value > 0.100 ? 'item--orange' : 'item--green'} ${ping.value === null ? 'item--red' : ''}`} key={index}></div>
            ) }
          </div>
        </div>
      ) }
      <h1>FRONTEND</h1>
      { frontends.map((site, index) => 
        <div key={index}>
          <div className='sitename'>{ site.sitename } - <a href={ site.uri }>{ site.site }</a></div>
          <div className="card" key={index}>
            { site.tracking.ping.map((ping, index) =>
              <div className={`item ${ping.value === 0 ? 'item--light-grey' : ''} ${ping.value > 0.100 ? 'item--orange' : 'item--green'} ${ping.value === null ? 'item--red' : ''}`} key={index}></div>
            ) }
          </div>
        </div>
      ) }
      <h1>PREVIEWS</h1>
      { previews.map((site, index) => 
        <div key={index}>
          <div className='sitename'>{ site.sitename } - <a href={ site.uri }>{ site.site }</a></div>
          <div className="card" key={index}>
            { site.tracking.ping.map((ping, index) =>
              <div className={`item ${ping.value === 0 ? 'item--light-grey' : ''} ${ping.value > 0.100 ? 'item--orange' : 'item--green'} ${ping.value === null ? 'item--red' : ''}`} key={index}></div>
            ) }
          </div>
        </div>
      ) }
    </div>
  );
}

export default App;
