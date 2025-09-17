import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CopyConfig, DEFAULT_COPY_CONFIG } from '@/types/copyConfig';
import { saveCopyConfig, loadCopyConfig, resetCopyConfig } from '@/utils/copyConfigService';

interface CopyConfigContextType {
  config: CopyConfig;
  updateConfig: (newConfig: Partial<CopyConfig>) => void;
  resetConfig: () => void;
}

const CopyConfigContext = createContext<CopyConfigContextType | undefined>(undefined);

interface CopyConfigProviderProps {
  children: ReactNode;
}

export const CopyConfigProvider: React.FC<CopyConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<CopyConfig>(DEFAULT_COPY_CONFIG);

  useEffect(() => {
    setConfig(loadCopyConfig());
  }, []);

  const updateConfig = (newConfig: Partial<CopyConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    saveCopyConfig(updatedConfig);
  };

  const resetConfig = () => {
    setConfig(DEFAULT_COPY_CONFIG);
    resetCopyConfig();
  };

  return (
    <CopyConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </CopyConfigContext.Provider>
  );
};

export const useCopyConfig = (): CopyConfigContextType => {
  const context = useContext(CopyConfigContext);
  if (!context) {
    throw new Error('useCopyConfig must be used within a CopyConfigProvider');
  }
  return context;
};