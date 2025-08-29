'use client';

import { createContext, useContext, ReactNode } from 'react';

interface DevAuthContextType {
  isDevMode: boolean;
  devUser: {
    id: string;
    email: string;
    user_metadata: {
      full_name: string;
    };
  } | null;
}

const DevAuthContext = createContext<DevAuthContextType>({
  isDevMode: false,
  devUser: null,
});

export function DevAuthProvider({ children }: { children: ReactNode }) {
  const isDevMode = process.env.NODE_ENV === 'development' && 
                    process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true';

  const devUser = isDevMode ? {
    id: 'dev-user-123',
    email: 'test@aurora50.dev',
    user_metadata: {
      full_name: 'Marie Dupont (Dev)',
    }
  } : null;

  return (
    <DevAuthContext.Provider value={{ isDevMode, devUser }}>
      {children}
    </DevAuthContext.Provider>
  );
}

export const useDevAuth = () => useContext(DevAuthContext);
