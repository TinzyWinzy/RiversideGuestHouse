import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';
import * as matchers from 'vitest-axe/matchers';
import type { AxeMatchers } from 'vitest-axe';
import 'fake-indexeddb/auto';

declare module 'vitest' {
  interface Assertion<T = any> extends AxeMatchers {}
}

expect.extend(matchers);

afterEach(() => cleanup());