import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    typecheck: {
      tsconfig: './tsconfig.vitest.json',
    },
  },
});
