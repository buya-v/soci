import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';

// Password hash should be set in Vercel environment variables
const PASSWORD_HASH = process.env.PASSWORD_HASH;

// Simple rate limiting using in-memory store (resets on function cold start)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function getClientIP(req: VercelRequest): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
    || (req.headers['x-real-ip'] as string)
    || req.socket?.remoteAddress
    || 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts?: number; resetIn?: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (attempt) {
    if (now > attempt.resetAt) {
      loginAttempts.delete(ip);
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
    }

    if (attempt.count >= MAX_ATTEMPTS) {
      const resetIn = Math.ceil((attempt.resetAt - now) / 1000);
      return { allowed: false, resetIn };
    }

    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - attempt.count };
  }

  return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
}

function recordAttempt(ip: string, success: boolean) {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (success) {
    loginAttempts.delete(ip);
  } else {
    if (attempt) {
      loginAttempts.set(ip, {
        count: attempt.count + 1,
        resetAt: now + LOCKOUT_DURATION,
      });
    } else {
      loginAttempts.set(ip, {
        count: 1,
        resetAt: now + LOCKOUT_DURATION,
      });
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!PASSWORD_HASH) {
      return res.status(500).json({ error: 'Server configuration error: PASSWORD_HASH not set' });
    }

    const { password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (password.length < 1 || password.length > 256) {
      return res.status(400).json({ error: 'Invalid password length' });
    }

    // Rate limiting
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(clientIP);

    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: `Too many login attempts. Please try again in ${rateLimit.resetIn} seconds.`,
        resetIn: rateLimit.resetIn,
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, PASSWORD_HASH);

    // Record attempt
    recordAttempt(clientIP, isValid);

    if (isValid) {
      const sessionToken = Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64');

      return res.status(200).json({
        success: true,
        sessionToken,
      });
    } else {
      const remaining = rateLimit.remainingAttempts! - 1;
      return res.status(401).json({
        error: 'Invalid password',
        remainingAttempts: Math.max(0, remaining),
      });
    }

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
