// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

// Jest DOM matchers
import '@testing-library/jest-dom/vitest'

// Mock framer-motion for tests
import { vi } from 'vitest'

vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    span: 'span',
  },
  AnimatePresence: ({ children }: any) => children,
  useMotionValue: () => ({ set: vi.fn(), get: vi.fn(() => 0) }),
  useTransform: () => 0,
  useSpring: () => 0,
}))

// Mock PayloadCMS hooks
vi.mock('@payloadcms/ui', () => ({
  useFormFields: vi.fn(() => ({})),
  useField: vi.fn(() => ({ value: [], setValue: vi.fn() })),
  useDocumentInfo: vi.fn(() => ({
    id: 'test-id',
    lastUpdateTime: Date.now(),
    savedDocumentData: null,
  })),
  useFormModified: vi.fn(() => false),
  useFormSubmitted: vi.fn(() => false),
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
    success: vi.fn(),
  },
}))

// Mock language hook
vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: vi.fn(() => 'en'),
}))

// Mock intersection observer
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
