import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ImageGrid } from '../components/images/ImageGrid';
import { CategoryFilter } from '../components/common/CategoryFilter';
import { ImageRepository } from '../api/repositories/ImageRepository';
import { useAuth } from '../hooks/useAuth';
import { Image } from '../Domain/models/Image';

export const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const imageRepository = new ImageRepository();

  // State
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [category, setCategory] = useState<string | undefined>();
  const [likeLoading, setLikeLoading] = useState<number | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const searchQuery = searchParams.get('search') || '';

  // Funkcija za učitavanje slika
  const fetchImages = useCallback(async (resetImages: boolean = false) => {
    if (loading) return;

    setLoading(true);

    try {
      const currentPage = resetImages ? 1 : page;
      const res = await imageRepository.getImages(
        currentPage,
        20,
        category ? category.toLowerCase() : undefined,
        searchQuery
      );

      // Guard provere – TS sigurno zna da posle ovoga 'res.data' postoji
      if (!res || !res.success || !res.data || !res.data.items) {
        setHasMore(false);
        return;
      }

      const { items, hasMore } = res.data;

      if (resetImages) {
        setImages(items);
        setPage(2);
      } else {
        setImages(prev => [...prev, ...items]);
        setPage(prev => prev + 1);
      }

      setHasMore(!!hasMore);
    }
    catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
      // Označava da više nije initial load nakon prvog učitavanja
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [page, category, searchQuery, loading, isInitialLoad]);

  // Reset i učitaj kad se promeni kategorija ili search
  useEffect(() => {
    setImages([]);
    setPage(1);
    setHasMore(true);
    fetchImages(true);
  }, [category, searchQuery]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 100) {
        if (hasMore && !loading) {
          fetchImages(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, fetchImages]);

  // handleLike sa pravilnim ažuriranjem
  const handleLike = useCallback(async (id: number) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLikeLoading(id);

    const imageToUpdate = images.find(img => img.id === id);
    if (!imageToUpdate) {
      setLikeLoading(null);
      return;
    }

    try {
      let response;
      if (imageToUpdate.isLiked) {
        response = await imageRepository.unlikeImage(id);
      } else {
        response = await imageRepository.likeImage(id);
      }

      if (response.success) {
        setImages(prevImages =>
          prevImages.map(img =>
            img.id === id
              ? {
                ...img,
                isLiked: !img.isLiked,
                likes: img.isLiked ? Math.max(0, img.likes - 1) : img.likes + 1
              }
              : img
          )
        );
      }
    } catch (error) {
      console.error('Error liking image:', error);
    } finally {
      setLikeLoading(null);
    }
  }, [images, user, navigate, imageRepository]);

  const handleSave = async (id: number) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    alert('Select a collection to save this pin');
  };

  const handleDelete = async (id: number) => {
    const response = await imageRepository.deleteImage(id);
    if (response.success) {
      setImages(prevImages => prevImages.filter(img => img.id !== id));
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/edit/${id}`);
  };

  return (
    <div className="w-full">
      {/* Naslov - animacija samo na initial load */}
      <div className={`mb-8 ${isInitialLoad ? 'animate-fadeIn' : ''}`}>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Latest Pins</h1>
        <p className="text-gray-600 mb-6">Discover fresh ideas from our community</p>
      </div>

      {/* Filter - animacija samo na initial load */}
      <div className={isInitialLoad ? 'animate-fadeIn animation-delay-100' : ''}>
        <CategoryFilter
          selectedCategory={category}
          onCategoryChange={cat => setCategory(cat ? cat.toLowerCase() : undefined)}
          className="mb-8 -mx-4 px-4"
        />
      </div>

      {searchQuery && (
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Search results for "{searchQuery}"
        </h2>
      )}

      {/* Grid - bez animacije osim na initial load */}
      <div className={isInitialLoad ? 'animate-fadeIn animation-delay-200' : ''}>
        <ImageGrid
          images={images}
          loading={loading && images.length === 0}
          onLike={handleLike}
          likeLoading={likeLoading}
          onSave={handleSave}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />

        {/* Loading indicator za još slika */}
        {loading && images.length > 0 && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}

        {/* Poruka kad nema više slika */}
        {!hasMore && images.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            No more images to load
          </div>
        )}
      </div>
    </div>
  );
};