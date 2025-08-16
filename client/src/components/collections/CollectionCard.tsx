import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Collection } from '../../Domain/models/Collection';
import { Folder, Image as ImageIcon, ArrowUpRight } from 'lucide-react';
import { Avatar } from '../common/Avatar';

interface CollectionCardProps {
  collection: Collection;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleClick = () => {
    navigate(`/collection/${collection.id}`);
  };

  // Generate gradient based on collection name
  const getGradient = () => {
    const gradients = [
      'from-purple-400 via-pink-500 to-red-500',
      'from-green-400 via-blue-500 to-purple-500',
      'from-yellow-400 via-red-500 to-pink-500',
      'from-blue-400 via-indigo-500 to-purple-500',
      'from-pink-400 via-red-500 to-yellow-500',
      'from-teal-400 via-blue-500 to-indigo-500',
    ];
    
    let hash = 0;
    for (let i = 0; i < collection.name.length; i++) {
      hash = collection.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return gradients[Math.abs(hash) % gradients.length];
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative cursor-pointer transform transition-all duration-500 hover:scale-105"
    >
      {/* Main Card Container */}
      <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
        
        {/* Image Section with Overlay Effects */}
        <div className="relative h-64 overflow-hidden">
          {collection.coverImage ? (
            <>
              {/* Actual Image */}
              <img
                src={collection.coverImage}
                alt={collection.name}
                onLoad={() => setImageLoaded(true)}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                } ${isHovered ? 'scale-110 blur-sm' : 'scale-100'}`}
              />
              
              {/* Loading Skeleton */}
              {!imageLoaded && (
                <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()} animate-pulse`} />
              )}
            </>
          ) : (
            /* Fallback Gradient when no image */
            <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()}`}>
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Folder className={`w-20 h-20 text-white/50 transition-all duration-500 ${
                  isHovered ? 'scale-125 rotate-12' : 'scale-100 rotate-0'
                }`} />
              </div>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 transition-opacity duration-500 ${
            isHovered ? 'opacity-90' : ''
          }`} />

          {/* Floating Elements on Hover */}
          <div className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            {/* Animated Circles */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/20 rounded-full blur-xl animate-float-slow" />
            <div className="absolute bottom-8 left-8 w-16 h-16 bg-white/15 rounded-full blur-lg animate-float-medium" />
            <div className="absolute top-1/2 right-1/3 w-12 h-12 bg-white/10 rounded-full blur-md animate-float-fast" />
          </div>

          {/* Category Badge - Now shows on hover */}
          <div className={`absolute top-4 left-4 transition-all duration-500 ${
            isHovered ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
          }`}>
            <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg border border-white/30">
              <span className="text-xs font-medium text-white capitalize">{collection.category}</span>
            </div>
          </div>

          {/* View Collection Button - Shows on hover */}
          <div className={`absolute top-4 right-4 transition-all duration-500 ${
            isHovered ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
          }`}>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Title - Always visible at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-all duration-500">
            <h3 className={`text-2xl font-bold text-white transition-all duration-500 ${
              isHovered ? '-translate-y-6' : 'translate-y-0'
            }`}>
              {collection.name}
            </h3>
            
            {/* Description - Shows on hover */}
            {collection.description && (
              <p className={`text-sm text-white/90 line-clamp-2 mt-2 transition-all duration-500 ${
                isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                {collection.description}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Info Bar - Shows on hover */}
        <div className={`relative bg-white transition-all duration-500 ${
          isHovered ? 'h-16 opacity-100' : 'h-0 opacity-0'
        } overflow-hidden`}>
          {/* Animated Background on Hover */}
          <div className={`absolute inset-0 bg-gradient-to-r ${getGradient()} opacity-5`} />
          
          <div className="relative flex items-center justify-between h-full px-4">
            {/* User Info */}
            <div className="flex items-center gap-3">
              {collection.user?.profileImage ? (
                <img
                  src={collection.user.profileImage}
                  alt={collection.user.username}
                  className="w-8 h-8 rounded-full ring-2 ring-gray-200"
                />
              ) : (
                <Avatar username={collection.user?.username || 'U'} size="sm" />
              )}
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Created by</span>
                <span className="text-sm font-medium text-gray-900">
                  {collection.user?.username || 'Unknown'}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              <ImageIcon className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">
                {collection.imagesCount || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Shine Effect on Hover */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full animate-shine" />
        </div>
      </div>

      {/* 3D Shadow Effect */}
      <div className={`absolute -bottom-4 left-4 right-4 h-16 bg-gradient-to-b from-gray-200/20 to-transparent rounded-3xl blur-xl transition-all duration-500 ${
        isHovered ? 'opacity-60 -bottom-6' : 'opacity-30'
      }`} />

      {/* Custom Animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes float-medium {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, -20px) scale(1.2); }
        }
        
        @keyframes float-fast {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-10px, -15px) scale(1.1); }
          75% { transform: translate(15px, 10px) scale(0.95); }
        }
        
        @keyframes shine {
          to { transform: translateX(200%) skewX(-12deg); }
        }
        
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
        .animate-shine { animation: shine 1.5s ease-out; }
      `}</style>
    </div>
  );
};