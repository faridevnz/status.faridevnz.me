import React, { useEffect, useState } from 'react';
import './RamCard.scss';

export const RamCard: React.FC<{ size: number, free: number, buff_or_cache: number, used: number }> = ({ size, free, buff_or_cache, used }) => {
  // STATE
  const [color, setColor] = useState('core-heavy');
  const [usedPercentage, setUsedPercentage] = useState(0)

  // FUNCTIONS
  const calculateBackgroundColor: (usedPercentage: number) =>  string = (usedPercentage: number) => {
    if ( usedPercentage < 5 ) return 'extralight';
    else if ( usedPercentage >= 5 && usedPercentage < 15 ) return 'light';
    else if ( usedPercentage >= 15 && usedPercentage < 25 ) return 'semilight';
    else if ( usedPercentage >= 25 && usedPercentage < 60 ) return 'medium';
    else if ( usedPercentage >= 60 && usedPercentage < 75 ) return 'semiheavy';
    else if ( usedPercentage >= 75 && usedPercentage < 90 ) return 'heavy';
    else return 'extraheavy';
  }
  const calculateUsedPercentage = () => {
    return (used * 100) / size;
  }
  const megaToGiga = (mega: number, n: number) => {
    const mul = Math.pow(10, n);
    const giga = mega / 1000;
    return Math.round(giga * mul) / mul
  }

  // EFFECTS
  useEffect(() => {
    setColor(calculateBackgroundColor(calculateUsedPercentage()));
    setUsedPercentage(calculateUsedPercentage());
  }, [used]);


  // RENDER
  return (
    <div className="ram-card flex flex-col justify-between">
      {/* header */}
      <div className='flex justify-start items-end'>
        <span className='corename'>{megaToGiga(size, 1)} GB</span>
      </div>
      {/* infos */}
      <div className='flex justify-between items-center mt-1'>
        <div>
          <div className='text-xs font-semibold'>
            <span className='font-light mr-2'>free</span>
          </div>
          <div className='text-xs font-semibold'>
            {free}
            <span className='font-light ml-1'>MB</span>
          </div>
        </div>
        <div className={`text-3xl text-${color}`}>{megaToGiga(used, 3)} <span className='text-black font-light'>GB</span></div>
      </div>
      {/* bar */}
      <div className='w-full h-4 mt-1'>
        <div className='w-full h-full bg-core'>
          <div className={`h-full core-${color}`} style={{ width: `${usedPercentage}%`, color: `bg-${'core-light'}` }}></div>
        </div>
      </div>
    </div>
  );
}