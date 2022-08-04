import './App.css';
import staging from './staging.faridevnz.me.json'
import { useEffect, useState } from 'react';

function App() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const emptyItems = new Array(10).fill({ value: 0 });
    setItems(emptyItems.concat(staging.ping));
  }, [staging])

  return (
    <div>
      <div className="card">
        { items.map((item, index) =>
          <div className={`item ${item.value === 0 ? 'item--light-grey' : ''} ${item.value > 0.035 ? 'item--orange' : 'item--green'} ${item.value === null ? 'item--red' : ''}`} key={index}></div>
        ) }
      </div>
    </div>
  );
}

export default App;
