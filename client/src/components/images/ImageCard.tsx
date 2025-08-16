import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
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
  onDelete,
  onEdit,
}) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isOwner = user?.id === image.userId;

  const handleImageClick = () => {
    setShowModal(true);
  };

  return (
    <>
      <div
        className={`relative group cursor-pointer mb-4 break-inside-avoid transition-all duration-500 ${isDeleting ? 'animate-card-delete' : ''
          }`}
      >
        <div className="relative overflow-hidden rounded-2xl" onClick={handleImageClick}>
          <img
            src={image.url}
            alt={image.title}
            className={`w-full object-cover transition-all duration-500 ${isDeleting ? 'animate-image-burn' : ''
              }`}
          />

          {/* Fire effect overlay */}
          {isDeleting && (
            <div className="absolute inset-0 pointer-events-none z-20">
              <div className="absolute inset-0 bg-gradient-to-t from-orange-600 via-red-500 to-transparent opacity-0 animate-fire-sweep" />
              <div className="absolute bottom-0 left-0 right-0 flex justify-around">
                {[...Array(6)].map((_, i) => (
                  <span
                    key={i}
                    className="text-2xl animate-flame-small"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    🔥
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Owner menu - top right */}
          {isOwner && (
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-2 rounded-full bg-transparent hover:bg-black/10 transition-all duration-300"
                >
                  <MoreVertical className="w-5 h-5 text-white" />
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
                            setIsDeleting(true);
                            // Sačekaj animaciju pa obriši
                            setTimeout(() => {
                              onDelete(image.id);
                            }, 800);
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
        </div>
      </div>

      {/* Animacije za brisanje */}
      <style>{`
        @keyframes card-delete {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          20% {
            transform: scale(1.02) rotate(-1deg);
          }
          40% {
            transform: scale(0.98) rotate(1deg);
          }
          60% {
            transform: scale(0.95) rotate(-2deg);
            opacity: 0.8;
          }
          80% {
            transform: scale(0.9) rotate(3deg);
            opacity: 0.4;
          }
          100% {
            transform: scale(0.7) rotate(-5deg) translateY(20px);
            opacity: 0;
          }
        }

        @keyframes image-burn {
          0% {
            filter: brightness(1) contrast(1);
          }
          30% {
            filter: brightness(1.3) contrast(1.2) sepia(0.3);
          }
          60% {
            filter: brightness(1.5) contrast(1.5) sepia(0.8) hue-rotate(-20deg);
          }
          100% {
            filter: brightness(0.3) contrast(2) sepia(1) hue-rotate(-50deg) grayscale(1);
          }
        }

        @keyframes fire-sweep {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          50% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(-20%);
            opacity: 0.3;
          }
        }

        @keyframes flame-small {
          0%,
          100% {
            transform: translateY(0) scale(0.8);
            opacity: 0.7;
          }
          25% {
            transform: translateY(-10px) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-20px) scale(0.9);
            opacity: 0.8;
          }
          75% {
            transform: translateY(-30px) scale(0.6);
            opacity: 0.4;
          }
          100% {
            transform: translateY(-40px) scale(0.3);
            opacity: 0;
          }
        }

        .animate-card-delete {
          animation: card-delete 0.8s ease-in-out forwards;
        }

        .animate-image-burn {
          animation: image-burn 0.8s ease-in-out forwards;
        }

        .animate-fire-sweep {
          animation: fire-sweep 0.8s ease-out forwards;
        }

        .animate-flame-small {
          animation: flame-small 0.8s ease-out infinite;
        }
      `}</style>

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
