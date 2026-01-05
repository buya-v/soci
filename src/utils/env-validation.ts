/**
 * Environment variable validation
 */

interface EnvConfig {
  VITE_API_BASE_URL?: string;
}

const requiredClientVars: (keyof EnvConfig)[] = [];

const optionalClientVars: (keyof EnvConfig)[] = [
  'VITE_API_BASE_URL',
];

/**
 * Validate client-side environment variables
 */
export function validateClientEnv(): EnvConfig {
  const env: EnvConfig = {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  };

  const missing: string[] = [];

  for (const key of requiredClientVars) {
    if (!env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}`;
    console.error(errorMessage);
    throw new Error(`Environment validation failed: ${missing.join(', ')}`);
  }

  if (import.meta.env.DEV) {
    console.log('Environment configuration:');
    for (const key of optionalClientVars) {
      console.log(`  ${key}:`, env[key] ? '✓ Set' : '✗ Not set (using default)');
    }
  }

  return env;
}

export function getEnv(): EnvConfig {
  return {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  };
}
