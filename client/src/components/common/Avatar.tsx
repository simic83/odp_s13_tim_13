import React from 'react';

interface AvatarProps {
  username: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const getColorFromUsername = (username: string): string => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-indigo-500',
    'bg-gray-700',
    'bg-teal-500',
  ];
  
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export const Avatar: React.FC<AvatarProps> = ({ username, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-32 h-32 text-4xl'
  };

  const colorClass = getColorFromUsername(username);
  const firstLetter = username.charAt(0).toUpperCase();

  return (
    <div className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center text-white font-semibold ${className}`}>
      {firstLetter}
    </div>
  );
};