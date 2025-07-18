import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Collection } from '../../Domain/models/Collection';

interface CollectionCardProps {
  collection: Collection;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/collection/${collection.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className="relative h-48 bg-gradient-to-br from-red-400 to-pink-400 p-6">
        {collection.coverImage ? (
          <img
            src={collection.coverImage}
            alt={collection.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <svg className="w-16 h-16 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
            {collection.name}
          </h3>
          {collection.description && (
            <p className="text-sm text-white/90 line-clamp-2">
              {collection.description}
            </p>
          )}
        </div>
      </div>
      <div className="p-4 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {collection.imagesCount || 0} Pins
        </span>
        <span className="text-sm text-gray-500 capitalize">
          {collection.category}
        </span>
      </div>
    </div>
  );
};
