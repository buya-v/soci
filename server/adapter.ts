import type { Request, Response } from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { IncomingMessage } from 'http';

type VercelHandler = (req: VercelRequest, res: VercelResponse) => Promise<VercelResponse | void> | VercelResponse | void;

/**
 * Adapts a Vercel serverless handler to work as an Express route handler.
 * Maps Express req/res to the VercelRequest/VercelResponse interface
 * so existing API handlers can be reused without modification.
 */
export function adaptVercelHandler(handler: VercelHandler) {
  return async (req: Request, res: Response): Promise<void> => {
    // Express Request already has most properties VercelRequest expects
    // since both extend http.IncomingMessage. The main additions Vercel
    // makes are req.body (already parsed by express.json()) and req.query.
    const vercelReq = req as unknown as VercelRequest;

    // VercelResponse extends http.ServerResponse with convenience methods.
    // Express Response already provides status(), json(), send(), setHeader(),
    // and end() with compatible signatures.
    const vercelRes = res as unknown as VercelResponse;

    try {
      await handler(vercelReq, vercelRes);
    } catch (error) {
      console.error('Handler error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}
