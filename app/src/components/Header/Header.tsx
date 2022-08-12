import { useContext, ReactComponentElement } from 'react';
import { IThemeContext, ThemeContext } from '../../context/ThemeContext';
import DarkMode from './../../assets/icons/darkmode.svg';
import LightMode from './../../assets/icons/lightmode.svg';
import './Header.scss';

export const Header = () => {
  // STATE
  const { mode, changeMode } = useContext(ThemeContext) as IThemeContext;
  
  // RENDER
  return (
    <div className='flex justify-between items-center px-12 dark:bg-header-dark' style={{ height: '100px' }}>
      <span className='text-3xl flex flex-col items-center md:flex-row md:text-4xl font-extrabold'>
        <span className='dark:text-white'>Wundart</span>
        <span className='subtitle -ml-5 -mt-1 text-sm md:ml-3 md:mt-1 md:text-lg'>system status</span>
      </span>
      <div className='flex items-center cursor-pointer'>
        <div onClick={() => changeMode(mode === 'dark' ? 'light' : 'dark')}>
          { ( mode === 'light' ? <img src={LightMode} width="20"></img> : <img src={DarkMode} width="20"></img> ) }
        </div>
        <div className='ml-5 w-20 h-10 flex items-center justify-center rounded-md md:w-28 bg-slate-800 text-white cursor-pointer' onClick={() => window.open('https://wiki.faridevnz.me')}>visit wiki</div>
      </div>
    </div>
  );
}