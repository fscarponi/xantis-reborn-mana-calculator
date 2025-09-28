import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 shadow-lg ${className}`}>
    {children}
  </div>
);

export default Card;
