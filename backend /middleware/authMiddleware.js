// /middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

/**
 * Protect routes by verifying the JSON Web Token
 */
exports.protect = (req, res, next) => {
  let token;

  // Check for token in the Authorization header (Format: Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing.' });
  }

  try {
    // Verify token identity and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach decoded user info payload to the request object
    req.user = {
      id: decoded.id,
      role: decoded.role
    };
    
    return next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return res.status(401).json({ message: 'Not authorized, token invalid or expired.' });
  }
};

/**
 * Restrict route access to specific roles (e.g., 'client' or 'freelancer')
 * @param {...string} roles - Permitted roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: User role '${req.user?.role || 'unknown'}' does not have permission to access this route.` 
      });
    }
    return next();
  };
};