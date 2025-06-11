"use client";

import React from 'react';
import { Globe } from 'lucide-react';
import { useCallLanguage, CallLanguage } from '@/contexts/call-language.context';
import { Button } from "@/components/ui/button";

export const CallLanguageSelector: React.FC = () => {
  const { callLanguage, setCallLanguage, getLocalizedText } = useCallLanguage();

  const languages = [
    { code: 'tr' as CallLanguage, name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en' as CallLanguage, name: 'English', flag: '🇺🇸' },
  ];

  const currentLanguage = languages.find(lang => lang.code === callLanguage);

  const handleLanguageChange = () => {
    setCallLanguage(callLanguage === 'tr' ? 'en' : 'tr');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLanguageChange}
      className="flex items-center gap-2 bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
      title={getLocalizedText('Dil değiştir', 'Change language')}
    >
      <Globe className="h-4 w-4" />
      <span className="text-sm font-medium">
        {currentLanguage?.flag} {currentLanguage?.code.toUpperCase()}
      </span>
    </Button>
  );
}; 
 