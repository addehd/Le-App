import { afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/supabase';
import { storeResetFns } from './mocks/zustand';
import { vi } from 'vitest';

// Mock Zustand
vi.mock('zustand');

// Mock AsyncStorage for React Native
vi.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock localStorage for web
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Setup MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterAll(() => server.close());

afterEach(() => {
  // Reset MSW handlers
  server.resetHandlers();

  // Cleanup React Testing Library
  cleanup();

  // Reset all Zustand stores to initial state
  storeResetFns.forEach((resetFn) => {
    resetFn();
  });

  // Clear localStorage mocks
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
});
