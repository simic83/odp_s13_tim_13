import React, { useState } from 'react';
import { Heart, MessageCircle, Bookmark, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Image } from '../../Domain/models/Image';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { PinModal } from './PinModal';

interface ImageCardProps {
  image: Image;
  onLike?: (id: number) => void;
  likeLoading?: boolean;
  onSave?: (id: number) => void;
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  onLike,
  onSave,
  onDelete,
  onEdit,
}) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const isOwner = user?.id === image.userId;

  const handleImageClick = () => {
    setShowModal(true);
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <>
      <div className="relative group cursor-pointer mb-4 break-inside-avoid">
        <div className="relative overflow-hidden rounded-2xl" onClick={handleImageClick}>
          <img
            src={image.url}
            alt={image.title}
            className="w-full object-cover"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* User info - bottom left */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            {image.user?.profileImage ? (
              <img
                src={image.user.profileImage}
                alt={image.user.username}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <Avatar username={image.user?.username || 'U'} size="sm" />
            )}
            <span className="text-white font-medium text-sm">{image.user?.username}</span>
          </div>

          {/* Action buttons - right side */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            {onLike && (
              <button
                onClick={(e) => handleAction(e, () => onLike(image.id))}
                className={`p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 ${image.isLiked
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
                  }`}
              >
                <Heart className="w-5 h-5" fill={image.isLiked ? 'currentColor' : 'none'} />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
              className="p-2.5 rounded-full bg-white/90 text-gray-700 hover:bg-blue-500 hover:text-white backdrop-blur-sm transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5" />
            </button>

            {onSave && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(true);
                }}
                className={`p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 ${image.isSaved
                    ? 'bg-green-500 text-white'
                    : 'bg-white/90 text-gray-700 hover:bg-green-500 hover:text-white'
                  }`}
              >
                <Bookmark className="w-5 h-5" fill={image.isSaved ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>

          {/* Owner menu - top right */}
          {isOwner && (
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-2 rounded-full bg-white/90 hover:bg-white backdrop-blur-sm transition-all duration-300"
                >
                  <MoreVertical className="w-5 h-5 text-gray-700" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10">
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                          onEdit(image.id);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Pin
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                          if (window.confirm('Are you sure you want to delete this pin?')) {
                            onDelete(image.id);
                          }
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Pin
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pin Modal */}
      <PinModal
        image={image}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onLike={onLike}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    </>
  );
};