"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type CallLanguage = 'tr' | 'en';

interface CallLanguageContextProps {
  callLanguage: CallLanguage;
  setCallLanguage: (language: CallLanguage) => void;
  toggleCallLanguage: () => void;
  getLocalizedText: (trText: string, enText: string) => string;
}

const CallLanguageContext = createContext<CallLanguageContextProps | undefined>(undefined);

export const CallLanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [callLanguage, setCallLanguage] = useState<CallLanguage>('tr');

  const toggleCallLanguage = () => {
    setCallLanguage(prev => prev === 'tr' ? 'en' : 'tr');
  };

  const getLocalizedText = (trText: string, enText: string) => {
    return callLanguage === 'tr' ? trText : enText;
  };

  return (
    <CallLanguageContext.Provider 
      value={{ 
        callLanguage, 
        setCallLanguage, 
        toggleCallLanguage, 
        getLocalizedText 
      }}
    >
      {children}
    </CallLanguageContext.Provider>
  );
};

export const useCallLanguage = () => {
  const context = useContext(CallLanguageContext);
  if (!context) {
    throw new Error('useCallLanguage must be used within a CallLanguageProvider');
  }
  return context;
}; 
