export * from './mock-data';
export * from './mock-hooks';

// Environment flag to enable mock mode
export const MOCK_MODE = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_MOCK_MODE === 'true';