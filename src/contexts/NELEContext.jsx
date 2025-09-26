import React, { createContext, useContext, useState } from 'react';
import { neleService } from '../services/neleService';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);

  const startMonitoring = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await neleService.startMonitoring();
      setCurrentSession(response);
      setIsMonitoring(true);
      setNeleEnabled(true);
    } catch (err) {
      setError(err.message);
      setIsMonitoring(false);
      setNeleEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopMonitoring = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await neleService.stopMonitoring();
      setCurrentSession(response);
      setIsMonitoring(false);
      setNeleEnabled(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNELE = async () => {
    if (isMonitoring) {
      await stopMonitoring();
    } else {
      await startMonitoring();
    }
  };

  const getStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await neleService.getStats();
      return stats;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    neleEnabled,
    isMonitoring,
    isLoading,
    error,
    currentSession,
    toggleNELE,
    getStats
  };

  return (
    <NELEContext.Provider value={value}>
      {children}
    </NELEContext.Provider>
  );
};