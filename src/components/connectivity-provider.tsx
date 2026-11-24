import { useNetInfo } from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { createContext, use, useEffect, type ReactNode } from 'react';

type Connectivity = {
  isOnline: boolean;
  isOffline: boolean;
};

const ConnectivityContext = createContext<Connectivity>({ isOnline: true, isOffline: false });

/** Subscribes to network state once and keeps React Query in sync with it. */
export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const netInfo = useNetInfo();
  const isOnline = netInfo.isConnected !== false;

  useEffect(() => {
    onlineManager.setOnline(isOnline);
  }, [isOnline]);

  return (
    <ConnectivityContext.Provider value={{ isOnline, isOffline: !isOnline }}>
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity(): Connectivity {
  return use(ConnectivityContext);
}
