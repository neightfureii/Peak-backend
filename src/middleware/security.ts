import type { Request, Response, NextFunction } from "express";
import aj from "../config/arcjet.ts";
import { ArcjetNodeRequest, slidingWindow } from "@arcjet/node";

const securityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if(process.env.NODE_ENV === "test") return next();

    try {
        const role: RateLimitRole = req.user?.role ?? 'guest';

        let limit: number;
        let message: string;

        switch(role) {
            case "admin":
                limit = 20;
                message = 'Admin request limit exceeded (20 perminute). Slow down.';
                break;
            case "pedIncharge":
                limit = 15;
                message = 'PedIncharge request limit exceeded (15 perminute). Please wait.';
                break;
            case "student":
                limit = 10;
                message = 'Student request limit exceeded (10 perminute). Please wait.';
                break;
            default:
                limit = 500; // fix this back to 5 after implementing authentication and authorization
                message = 'Guest request limit exceeded (5 perminute). Please sign up for higher limits.';
                break;
        }

        const client = aj.withRule(
            slidingWindow({
                mode: 'LIVE',
                interval: '1m',
                max: limit,
            })
        )

        const arcjetRequest: ArcjetNodeRequest = {
            headers: req.headers,
            method: req.method,
            url: req.originalUrl ?? req.url,
            socket: { remoteAddress: req.socket.remoteAddress ?? req.ip ?? '0.0.0.0' },
        }

        const decision = await client.protect(arcjetRequest);

        if(decision.isDenied() && decision.reason.isBot()) {
            return res.status(403).json({ error: 'Forbidden', message: 'Automated requests are not allowed.' })
        }

        if(decision.isDenied() && decision.reason.isShield()) {
            return res.status(403).json({ error: 'Forbidden', message: 'Request blocked by security policy.' })
        }

        if(decision.isDenied() && decision.reason.isRateLimit()) {
            return res.status(429).json({ error: 'Too many requests.', message })
        }

        next();
    } catch (error) {
        console.error("Arcjet middleware error:", error);
        res.status(500).json({ error: "Internal error", message: "Something went wrong with security middleware" });
    }
}

export default securityMiddleware;