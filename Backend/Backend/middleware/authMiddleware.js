const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path if needed

// Middleware to protect routes
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ msg: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.status(401).json({ msg: 'Not authorized, user not found' });
        }

        req.user.role = decoded.role;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ msg: 'Not authorized, token failed' });
    }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ msg: `Role (${req.user.role}) is not allowed to access this resource` });
        }
        next();
    };
};

module.exports = {
    protect,
    authorizeRoles
};
