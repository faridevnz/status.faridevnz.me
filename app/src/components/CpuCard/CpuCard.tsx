import React from 'react';
import './CpuCard.scss';
import cpuicon from  '../../assets/icons/cpuicon.svg';

export const CpuCard: React.FC<{ name: string, vendor: string, cache: string, frequency: string, load: number }> = ({ name, vendor, cache, frequency, load }) => {
  
  // FUNCTIONS
  
  const calculateBackgroundColor: () =>  string = () => {
    console.log(load)
    if ( load < 10 ) return '#94FF40';
    else if ( load >= 10 && load < 20 ) return '#B6FF40';
    else if ( load >= 20 && load < 35 ) return '#E4FF40';
    else if ( load >= 35 && load < 60 ) return '#FFEC40';
    else if ( load >= 60 && load < 75 ) return '#FFB340';
    else if ( load >= 75 && load < 90 ) return '#FF7A00';
    else return '#FF3D00';
  }


  // RENDER

  return (
    <div className="CpuCard">
      {/* icon */}
      <div className='CpuCard__image'>
        <img src={cpuicon} width="100" height="100" />
      </div>
      {/* content */}
      <div className='CpuCard__content'>
        <div>Core { name }</div>
        <div>{ vendor }</div>
        <div>{ cache } cache</div>
        <div>{ frequency }</div>
      </div>
      {/* load bar */}
      <div className='CpuCard__bar-container'>
        <div className='CpuCard__bar' style={{right: `${100-load}%`, backgroundColor: calculateBackgroundColor() }}></div>
      </div>
    </div>
  );
}