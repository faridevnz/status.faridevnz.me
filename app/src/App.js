import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [sites, setSites] = useState([]);

  useEffect(() => {
    // take active sites
    axios.get('https://status.faridevnz.me/api/sites').then(res => {
      setSites(res.data);
    });
  }, []);

  return (
    <div>
      { sites.map((site, index) => 
        <div key={index}>
          <div className='sitename'>{ site.sitename } - <a href={ site.site }>{ site.site }</a></div>
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
