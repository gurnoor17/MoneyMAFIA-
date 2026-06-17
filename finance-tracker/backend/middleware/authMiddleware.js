const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Get token from header
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Check if Bearer token
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token format is invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_personal_finance_tracker_key_2026_secure');
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
