import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [items, setItems] = useState({}); // { site-name: items }
  const [parsedItems, setParsedItems] = useState([]) // [{ siteName: name, items: [] }]
  const [sites, setSites] = useState([]);

  useEffect(() => {
    // fetch items
    sites.forEach(site => {
      axios.get(`http://localhost:3333/sites/${site}`).then(res => {
        setItems((prevItems) => {
          return { ...prevItems, [site]: res.data.ping }
        })
      })
    })
  }, [sites])

  useEffect(() => {
    // take active sites
    axios.get('http://localhost:3333/sites').then(res => {
      setSites(res.data);
    })
  }, [])

  useEffect(() => {
    const temp = [];
    Object.entries(items).forEach(([siteName, items]) => {
      temp.push({ siteName, items })
    })
    setParsedItems(temp)
  }, [items])

  return (
    <div>
      { parsedItems.map((siteItem, index) => {
        <>
          <div className='sitename'>{ siteItem.siteName }</div>
          <div className="card" key={index}>
            { siteItem.items.map((item, index) =>
              <div className={`item ${item.value === 0 ? 'item--light-grey' : ''} ${item.value > 0.035 ? 'item--orange' : 'item--green'} ${item.value === null ? 'item--red' : ''}`} key={index}></div>
            ) }
          </div>
        </>
      }) }
    </div>
  );
}

export default App;
