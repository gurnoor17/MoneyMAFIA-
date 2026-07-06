import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-container">
      <div className="glass-panel auth-card animate-fade">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
