/**
 * Generates a unique key for React components that is stable across renders
 * and unique within the current session.
 */
export function generateStableKey(prefix: string, ...parts: (string | number)[]): string {
  // Join all parts and create a hash
  const str = parts.filter(part => part != null).join('-');
  let hash = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Create a stable, unique key
  return `${prefix}-${hash.toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generates a unique key for lists that is stable across renders
 * and unique within the current session.
 */
export function generateListKey<T>(
  item: T,
  index: number,
  prefix: string,
  getUniqueIdentifier?: (item: T) => string
): string {
  if (getUniqueIdentifier && item) {
    try {
      const identifier = getUniqueIdentifier(item);
      if (identifier) {
        return generateStableKey(prefix, identifier);
      }
    } catch (error) {
      console.warn('Failed to generate unique identifier for item:', error);
    }
  }
  return generateStableKey(prefix, index.toString());
}