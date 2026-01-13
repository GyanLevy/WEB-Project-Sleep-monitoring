import { createContext, useContext } from 'react';

// Create the AdminContext
export const AdminContext = createContext(null);

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
