import React from 'react';
import './TcpCard.scss';

export const TcpCard: React.FC<{ ips: {[key: string]: number}, current_ip: string }> = ({ ips, current_ip }) => {
  // FUNCTIONS
  const calculateBackgroundColor: (connectionsNumber: number) =>  string = (connectionsNumber: number) => {
    if ( connectionsNumber < 3 ) return 'extralight';
    else if ( connectionsNumber >= 3 && connectionsNumber < 5 ) return 'semilight';
    else if ( connectionsNumber >= 5 && connectionsNumber < 8 ) return 'medium';
    else if ( connectionsNumber >= 8 && connectionsNumber < 10 ) return 'heavy';
    else return 'extraheavy';
  };

  // RENDER
  return (
    <div className="tcp-card flex flex-col justify-between dark:bg-header-dark dark:text-white">
      {/* header */}
      <div className='flex justify-start items-end'>
        <span className='corename'>TCP CONN.</span>
      </div>
      {/* infos */}
      <div className='flex flex-col mt-3'>
        { Object.entries(ips ?? {}).map(([ip, n]: [string, number]) => 
          (
            <div className='flex justify-start items-center' key={ip}>
              <span className={`w-3 h-3 core-${calculateBackgroundColor(n)} rounded-full mr-2`}></span>
              <span className='text-sm'>{n}</span>
              <span className='ml-6'>{ip}</span>
            </div>
          )
        ) }
      </div>
    </div>
  );
}