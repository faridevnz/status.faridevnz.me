import { createContext, useState } from "react";

export type ThemeMode = 'light' | 'dark';
export interface IThemeContext {
  mode: ThemeMode;
  changeMode: (mode: ThemeMode) => void
}

// Context
const ThemeContext = createContext<IThemeContext | null>(null);

// Context Provider
const ThemeProvider: React.FC<any> = ({ children }) => {
    // state
    const [theme, setTheme] = useState<ThemeMode>('light');
    // functions
    const changeMode = (mode: ThemeMode) => {
      setTheme(mode);
      document.getElementsByTagName('html')[0].classList.add(mode);
      document.getElementsByTagName('html')[0].classList.remove(mode === 'dark' ? 'light' : 'dark');
    };
    // render
    return(
        <ThemeContext.Provider value={{ mode: theme, changeMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export { ThemeContext, ThemeProvider };