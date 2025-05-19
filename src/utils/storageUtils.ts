
// Helper functions for storing and retrieving data from localStorage

export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`Saved ${key} to localStorage`);
    }
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const getFromLocalStorage = <T>(key: string): T | null => {
  try {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    return null;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return null;
  }
};

export const removeFromLocalStorage = (key: string): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
      console.log(`Removed ${key} from localStorage`);
    }
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
};
