import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'cs', name: 'Čeština' }
];

export function LanguagePicker() {
  const { i18n } = useTranslation();

  return (
    <div className="relative inline-block">
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="appearance-none bg-transparent pl-8 pr-4 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
      <Languages className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
    </div>
  );
}