import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ImageGrid } from '../components/images/ImageGrid';
import { CategoryFilter } from '../components/common/CategoryFilter';
import { ImageRepository } from '../api/repositories/ImageRepository';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useAuth } from '../hooks/useAuth';
import { Image } from '../Domain/models/Image';

export const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [likeLoading, setLikeLoading] = useState<number | null>(null);
  const [category, setCategory] = useState<string | undefined>();
  const { user } = useAuth();
  const imageRepository = new ImageRepository();
  const navigate = useNavigate();

  const searchQuery = searchParams.get('search') || '';

  const fetchImages = async (page: number) => {
    const response = await imageRepository.getImages(
      page,
      20,
      category ? category.toLowerCase() : undefined,
      searchQuery
    );

    if (response.success && response.data) {
      return {
        items: response.data.items,
        hasMore: response.data.hasMore,
      };
    }

    return { items: [], hasMore: false };
  };

  const {
    items: images,
    loading,
    setLastElement,
    reset,
  } = useInfiniteScroll<Image>(fetchImages);

  useEffect(() => {
    reset();
  }, [category, searchQuery]);

  // Ispravno handleLike sa loading i optimistic update
  const handleLike = useCallback(async (id: number) => {
    if (!user) return;
    setLikeLoading(id);

    const image = images.find(img => img.id === id);
    if (!image) {
      setLikeLoading(null);
      return;
    }

    if (image.isLiked) {
      const response = await imageRepository.unlikeImage(id);
      if (response.success) {
        image.isLiked = false;
        image.likes = image.likes > 0 ? image.likes - 1 : 0;
      }
    } else {
      const response = await imageRepository.likeImage(id);
      if (response.success) {
        image.isLiked = true;
        image.likes = image.likes + 1;
      }
    }
    setLikeLoading(null);
  }, [images, user]);

  const handleSave = async (_id: number) => {
    if (!user) return;
    alert('Select a collection to save this pin');
  };

  const handleDelete = async (id: number) => {
    const success = await imageRepository.deleteImage(id);
    if (success) {
      reset();
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/edit/${id}`);
  };

  return (
    <div className="w-full animate-slideIn">
      <div className="mb-8 animate-fadeIn">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Latest Pins</h1>
        <p className="text-gray-600 mb-6">Discover fresh ideas from our community</p>
      </div>

      <CategoryFilter
        selectedCategory={category}
        onCategoryChange={cat => setCategory(cat ? cat.toLowerCase() : undefined)}
        className="mb-8 -mx-4 px-4 animate-fadeIn animation-delay-100"
      />

      {searchQuery && (
        <h2 className="text-2xl font-bold text-gray-800 mb-6 animate-fadeIn">
          Search results for "{searchQuery}"
        </h2>
      )}

      <div className="animate-fadeIn animation-delay-200">
        <ImageGrid
          images={images}
          loading={loading}
          onLike={handleLike}
          likeLoading={likeLoading} // Dodaj i u props komponentu ImageGridProps!
          onSave={handleSave}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onLastElement={setLastElement}
        />
      </div>
    </div>
  );
};
