import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Track addError calls
const mockAddError = vi.fn();

vi.mock('@/store/useAppStore', () => ({
  useAppStore: Object.assign(
    () => ({}),
    {
      getState: () => ({
        addError: mockAddError,
      }),
    }
  ),
}));

// A component that throws on demand
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test render error');
  }
  return <div>Content rendered successfully</div>;
}

// Suppress console.error for expected errors in tests
beforeEach(() => {
  mockAddError.mockClear();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Hello World</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Hello World')).toBeDefined();
  });

  it('renders fallback UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('System Boundary Triggered')).toBeDefined();
    expect(screen.getByText('Graceful Reset')).toBeDefined();
  });

  it('displays custom fallback title', () => {
    render(
      <ErrorBoundary fallbackTitle="Content Lab encountered an issue">
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Content Lab encountered an issue')).toBeDefined();
  });

  it('displays the error message', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Test render error')).toBeDefined();
  });

  it('resets internal state when Graceful Reset is clicked', () => {
    // Use a controllable throw mechanism via external flag
    let shouldThrow = true;

    function ConditionalThrower() {
      if (shouldThrow) {
        throw new Error('Test render error');
      }
      return <div>Content rendered successfully</div>;
    }

    render(
      <ErrorBoundary>
        <ConditionalThrower />
      </ErrorBoundary>
    );

    expect(screen.getByText('Graceful Reset')).toBeDefined();

    // Stop throwing before reset
    shouldThrow = false;
    fireEvent.click(screen.getByText('Graceful Reset'));

    expect(screen.getByText('Content rendered successfully')).toBeDefined();
  });

  it('calls onReset callback when reset is clicked', () => {
    const onReset = vi.fn();
    render(
      <ErrorBoundary onReset={onReset}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText('Graceful Reset'));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it('reports error to store via addError', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(mockAddError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test render error',
        source: 'ErrorBoundary',
      })
    );
  });
});
