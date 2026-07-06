module.exports = (err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
};
