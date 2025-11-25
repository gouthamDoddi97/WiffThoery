import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  // Get IST time and determine if it should be dark mode
  const getISTTheme = () => {
    // Get current UTC time
    const now = new Date();
    
    // Convert to IST (UTC + 5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const istTime = new Date(now.getTime() + istOffset);
    const istHour = istTime.getUTCHours();
    
    // Dark mode between 6 PM (18:00) and 6 AM (06:00) IST
    const isDarkTime = istHour >= 18 || istHour < 6;
    
    return isDarkTime ? 'dark' : 'light';
  };

  // Check and update theme based on IST time
  const updateThemeByTime = () => {
    const newTheme = getISTTheme();
    if (newTheme !== theme) {
      setTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  useEffect(() => {
    // Set initial theme
    updateThemeByTime();

    // Check every minute for time changes
    const interval = setInterval(updateThemeByTime, 60000);

    return () => clearInterval(interval);
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const value = {
    theme,
    isDark: theme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
