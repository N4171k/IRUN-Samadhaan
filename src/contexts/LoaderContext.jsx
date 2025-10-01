import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Loader from '../components/ui/Loader';

const LoaderContext = createContext(undefined);

export const LoaderProvider = ({ children, transitionDuration = 600 }) => {
  const location = useLocation();
  const [activeRequests, setActiveRequests] = useState(0);
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  useEffect(() => {
    setIsRouteLoading(true);

    const timeout = setTimeout(() => {
      setIsRouteLoading(false);
    }, transitionDuration);

    return () => clearTimeout(timeout);
  }, [location.key, transitionDuration]);

  const showLoader = useCallback(() => {
    setActiveRequests((prev) => prev + 1);
  }, []);

  const hideLoader = useCallback(() => {
    setActiveRequests((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const isManualLoading = activeRequests > 0;
  const isLoading = isRouteLoading || isManualLoading;

  const value = useMemo(
    () => ({
      isLoading,
      showLoader,
      hideLoader,
    }),
    [isLoading, showLoader, hideLoader]
  );

  return (
    <LoaderContext.Provider value={value}>
      {children}
      {isLoading && (
        <div className="loader-overlay">
          <Loader />
        </div>
      )}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const context = useContext(LoaderContext);

  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }

  return context;
};

export const useLoaderTask = () => {
  const { showLoader, hideLoader } = useLoader();

  return useCallback(
    async (task) => {
      showLoader();
      try {
        return await task();
      } finally {
        hideLoader();
      }
    },
    [showLoader, hideLoader]
  );
};
