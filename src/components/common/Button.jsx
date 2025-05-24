// Common Button component
import React from 'react';

const Button = React.memo(React.forwardRef(({ children, className = '', ...props }, ref) => (
  <button
    ref={ref}
    className={`focus:outline-none focus:ring-2 focus:ring-blue-300 font-semibold transition ${className}`}
    {...props}
  >
    {children}
  </button>
)));

export default Button;
