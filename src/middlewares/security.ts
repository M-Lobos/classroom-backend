import { Request, Response, NextFunction } from "express";
import aj from "../config/arcjet";
import { ArcjetNodeRequest, slidingWindow } from "@arcjet/node";


const securityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'test') return next();

    try {
        const role: RateLimitRole = req.user?.role ?? 'guest'; //we set this rateLimitRole, to place ratelimit per rol

        let limit: number;
        let message: string;

        switch (role) {
            case 'admin':
                limit = 20;
                message = 'Admin request limit exceeded (20 per minute). Slow down';
                break;
            case 'teacher':
            case 'student':
                limit = 10;
                message = 'User request limit exceeded (10 per minute). Please wait';
                break;
            default:
                limit = 3;
                message = 'Guest request limit exceeded (3 per minute). Please sigh up for higher limits';
                break;
        }

        const client = aj.withRule(
            slidingWindow({
                mode: 'LIVE',
                interval: '60s',
                max: limit, // this way is dynamic depending on the user role.
            })
        )

        //now intercept the request.
        const ArcjetRequest: ArcjetNodeRequest = {
            headers: req.headers,
            method: req.method,
            url: req.originalUrl ?? req.url,
            socket: {
                remoteAddress: req.socket.remoteAddress ?? req.ip ?? '0.0.0.0' //0.0.0.0 is default
            },
        }

        //now with the client and the arcjetRequest, comes the decision from Arcjet based on the parameters defined above.
        const decision = await client.protect(ArcjetRequest);

        //clauses depending on the decision outcome
        if (decision.isDenied() && decision.reason.isBot()) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Automated request are not allowed. '
            });
        }

        if (decision.isDenied() && decision.reason.isShield()) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Request blocked by security policy. '
            });
        }

        if (decision.isDenied() && decision.reason.isRateLimit()) {
            return res.status(403).json({
                error: 'To many requests',
                message //this message comes from the top, from RatelimitRate, dependint on wich role the user is authenticated with
            });
        }

        next()
    } catch (error) {
        console.error('Arcjet middleware error: ', error)
        res.status(500).json({ error: 'Internal server error', message: 'Something went wrong with security middleware' })
    }
}

export default securityMiddleware;