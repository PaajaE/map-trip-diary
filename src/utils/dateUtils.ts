import { format, parse, isValid } from 'date-fns';

export function formatDateForDisplay(dateString: string | null): string {
  if (!dateString) return 'No date';
  
  try {
    // First try parsing as ISO date
    let date = new Date(dateString);
    
    // If not valid, try parsing as YYYY-MM-DD
    if (!isValid(date)) {
      date = parse(dateString, 'yyyy-MM-dd', new Date());
    }

    if (!isValid(date)) {
      console.warn('Invalid date:', dateString);
      return 'Invalid date';
    }

    return format(date, 'MMMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
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