import React from 'react';

export default function Button({ children, className = '', type = 'button', onClick, disabled, style, ...props }) {
  return (
    <button
      type={type}
      className={`btn ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}
