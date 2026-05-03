import { Injectable, NestMiddleware } from '@nestjs/common';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { TrpcService } from './trpc.service';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TrpcMiddleware implements NestMiddleware {
  constructor(
    private trpcService: TrpcService,
    private jwtService: JwtService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    // tRPC necesita que req.path NO incluya el prefijo /trpc
    // Express pasa el path completo, así que lo normalizamos
    const originalUrl = req.url;
    const originalPath = req.path;

    // Strip /trpc prefix so tRPC sees the procedure name only
    if (req.url.startsWith('/trpc')) {
      req.url = req.url.replace(/^\/trpc/, '') || '/';
    }

    const handler = createExpressMiddleware({
      router: this.trpcService.appRouter(),
      createContext: ({ req: r }) => {
        let user = null;
        const auth = r.headers.authorization;
        if (auth?.startsWith('Bearer ')) {
          try {
            user = this.jwtService.verify(auth.slice(7));
          } catch {}
        }
        return { user };
      },
    });

    handler(req, res, (err) => {
      // Restaurar URL original si tRPC pasa al siguiente middleware
      req.url = originalUrl;
      next(err);
    });
  }
}