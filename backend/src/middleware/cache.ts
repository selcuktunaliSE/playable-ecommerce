import { Request, Response, NextFunction } from "express";

type CacheEntry = {
  expiresAt: number;
  data: any;
};

const store = new Map<string, CacheEntry>();

export function cacheGet(ttlMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {

    if (req.method !== "GET") return next();

    const key = req.originalUrl;
    const now = Date.now();
    const cached = store.get(key);

    if (cached && cached.expiresAt > now) {
      return res.json(cached.data);
    }

    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      store.set(key, { data: body, expiresAt: now + ttlMs });
      return originalJson(body);
    };

    return next();
  };
}
