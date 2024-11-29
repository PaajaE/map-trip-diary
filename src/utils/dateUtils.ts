import { format, parse, isValid } from 'date-fns';
import { cs, enUS } from 'date-fns/locale';
import i18next from 'i18next';

const locales = {
  cs,
  en: enUS
};

function getLocale() {
  const language = i18next.language.split('-')[0];
  return locales[language as keyof typeof locales] || enUS;
}

export function formatDateForDisplay(dateString: string | null): string {
  if (!dateString) return i18next.t('common.noDate', 'No date');
  
  try {
    // First try parsing as ISO date
    let date = new Date(dateString);
    
    // If not valid, try parsing as YYYY-MM-DD
    if (!isValid(date)) {
      date = parse(dateString, 'yyyy-MM-dd', new Date());
    }

    if (!isValid(date)) {
      console.warn('Invalid date:', dateString);
      return i18next.t('common.invalidDate', 'Invalid date');
    }

    return format(date, 'PPP', { locale: getLocale() });
  } catch (error) {
    console.error('Error formatting date:', error);
    return i18next.t('common.invalidDate', 'Invalid date');
  }
}

export function formatDateForInput(dateString: string | null): string {
  if (!dateString) return new Date().toISOString().split('T')[0];
  
  try {
    // First try parsing as ISO date
    let date = new Date(dateString);
    
    // If not valid, try parsing as YYYY-MM-DD
    if (!isValid(date)) {
      date = parse(dateString, 'yyyy-MM-dd', new Date());
    }

    if (!isValid(date)) {
      console.warn('Invalid date for input:', dateString);
      return new Date().toISOString().split('T')[0];
    }

    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return new Date().toISOString().split('T')[0];
  }
}

export function formatDateForAPI(dateString: string | null): string {
  if (!dateString) return format(new Date(), 'yyyy-MM-dd');
  
  try {
    // First try parsing as ISO date
    let date = new Date(dateString);
    
    // If not valid, try parsing as YYYY-MM-DD
    if (!isValid(date)) {
      date = parse(dateString, 'yyyy-MM-dd', new Date());
    }

    if (!isValid(date)) {
      console.warn('Invalid date for API:', dateString);
      return format(new Date(), 'yyyy-MM-dd');
    }

    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date for API:', error);
    return format(new Date(), 'yyyy-MM-dd');
  }
}