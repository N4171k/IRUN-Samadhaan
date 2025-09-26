import React, { createContext, useContext, useState } from 'react';

const NELEContext = createContext();

export const useNELE = () => {
  const context = useContext(NELEContext);
  if (!context) {
    throw new Error('useNELE must be used within a NELEProvider');
  }
  return context;
};

export const NELEProvider = ({ children }) => {
  const [neleEnabled, setNeleEnabled] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const toggleNELE = (enabled) => {
    setNeleEnabled(enabled);
    setIsMonitoring(enabled);
    console.log('NELE toggle:', enabled ? 'enabled' : 'disabled');
  };

  const value = {
    neleEnabled,
    isMonitoring,
    toggleNELE
  };

  return (
    <NELEContext.Provider value={value}>
      {children}
    </NELEContext.Provider>
  );
};