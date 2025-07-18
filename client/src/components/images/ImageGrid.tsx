import React from 'react';
import { Image } from '../../Domain/models/Image';
import { ImageCard } from './ImageCard';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface ImageGridProps {
  images: Image[];
  loading?: boolean;
  onLike?: (id: number) => void;
  likeLoading?: number | null;                // <-- dodaj ovo
  onSave?: (id: number) => void;
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
  onLastElement?: (element: HTMLDivElement) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  loading = false,
  onLike,
  likeLoading,                               // <-- primi prop
  onSave,
  onDelete,
  onEdit,
  onLastElement,
}) => {
  if (loading && images.length === 0) {
    return <LoadingSpinner size="lg" className="mt-20" />;
  }

  if (images.length === 0 && !loading) {
    return (
      <div className="w-full flex justify-center items-center text-gray-500 py-12 text-xl">
        No images found.
      </div>
    );
  }

  return (
    <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4">
      {images.map((image, idx) => (
        <div
          key={image.id}
          ref={onLastElement && idx === images.length - 1 ? onLastElement : undefined}
        >
          <ImageCard
            image={image}
            onLike={onLike}
            likeLoading={likeLoading === image.id}      // <-- pošalji kao boolean za ovaj image
            onSave={onSave}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      ))}
    </div>
  );
};
