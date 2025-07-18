"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeMiddleware = void 0;
const authorizeMiddleware = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
            return;
        }
        // For now, we don't have roles, so just check if user exists
        // In the future, you can implement role-based access control here
        next();
    };
};
exports.authorizeMiddleware = authorizeMiddleware;
