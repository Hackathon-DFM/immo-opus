'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi';
import { ThemeProvider } from './theme-provider';
import { useTheme } from '@/lib/hooks/use-theme';

const queryClient = new QueryClient();

function RainbowKitProviderWithTheme({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  
  return (
    <RainbowKitProvider
      theme={isDark ? darkTheme({
        accentColor: '#3b82f6', // blue-500
        accentColorForeground: 'white',
        borderRadius: 'medium',
        fontStack: 'system',
        overlayBlur: 'small',
      }) : lightTheme({
        accentColor: '#3b82f6', // blue-500
        accentColorForeground: 'white',
        borderRadius: 'medium',
        fontStack: 'system',
        overlayBlur: 'small',
      })}
    >
      {children}
    </RainbowKitProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProviderWithTheme>
            {children}
          </RainbowKitProviderWithTheme>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}