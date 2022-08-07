import React from 'react';
import './CpuCard.scss';
import cpuicon from  '../../assets/icons/cpuicon.svg';

export const CpuCard = ({ name, vendor, cache, frequency, load }) => {
  return (
    <div className="CpuCard">
      {/* icon */}
      <div className=''>
        <img src={cpuicon} />
      </div>
      {/* content */}
      <div className='CpuCard__content'>

      </div>
    </div>
  );
}