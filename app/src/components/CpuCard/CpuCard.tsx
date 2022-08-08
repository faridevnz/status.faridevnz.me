import React, { useEffect, useState } from 'react';
import './CpuCard.scss';

export const CpuCard: React.FC<{ name: string, vendor: string, cache: string, frequency: string, load: number }> = ({ name, vendor, cache, frequency, load }) => {
  // STATE
  const [color, setColor] = useState('core-heavy');

  // FUNCTIONS
  const calculateBackgroundColor: (load: number) =>  string = (load: number) => {
    if ( load < 5 ) return 'extralight';
    else if ( load >= 5 && load < 15 ) return 'light';
    else if ( load >= 15 && load < 25 ) return 'semilight';
    else if ( load >= 25 && load < 60 ) return 'medium';
    else if ( load >= 60 && load < 75 ) return 'semiheavy';
    else if ( load >= 75 && load < 90 ) return 'heavy';
    else return 'extraheavy';
  }

  // EFFECTS
  useEffect(() => {
    setColor(calculateBackgroundColor(load));
  }, [load]);


  // RENDER
  return (
    <div className="cpu-card flex flex-col justify-between">
      {/* header */}
      <div className='flex justify-between items-end'>
        <span className='corename'>Core {name}</span>
        <span className='text-xs'>{vendor}</span>
      </div>
      {/* infos */}
      <div className='flex justify-between items-center mt-1'>
        <div>
          <div className='text-xs'>{frequency.split(' ')[0]}<span className='font-light ml-2'>MHz</span></div>
          <div className='text-xs'>4096<span className='font-light ml-2'>KB cache</span></div>
        </div>
        <div className={`text-3xl text-${color}`}>{Math.floor(load)} <span className='text-black font-light'>%</span></div>
      </div>
      {/* bar */}
      <div className='w-full h-4 mt-1'>
        <div className='w-full h-full bg-core'>
          <div className={`h-full core-${color}`} style={{ width: `${Math.floor(load)}%`, color: `bg-${'core-light'}` }}></div>
        </div>
      </div>
    </div>
  );
}