// client/src/pages/Popular.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, TrendingUp, Bookmark } from 'lucide-react';
import { ImageGrid } from '../components/images/ImageGrid';
import { ImageRepository } from '../api/repositories/ImageRepository';
import { useAuth } from '../hooks/useAuth';
import { Image } from '../Domain/models/Image';

type SortType = 'likes' | 'trending' | 'saves';

export const Popular: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const imageRepository = new ImageRepository();
  
  // State za slike i paginaciju
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCard, setSelectedCard] = useState<SortType>('likes');
  const [likeLoading, setLikeLoading] = useState<number | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Funkcija za učitavanje slika - PROMENJENO da šalje sort type na backend
  const fetchImages = useCallback(async (resetImages: boolean = false) => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const currentPage = resetImages ? 1 : page;
      
      // NOVO: Pozovi različite endpoint-e ili pošalji sort parametar
      const response = await imageRepository.getPopularImages(
        currentPage, 
        20,
        selectedCard // Proslijedi sort type
      );
      
      if (response.success && response.data) {
        const newImages = response.data.items;
        
        if (resetImages) {
          setImages(newImages);
          setPage(2);
        } else {
          setImages(prev => [...prev, ...newImages]);
          setPage(prev => prev + 1);
        }
        
        setHasMore(response.data.hasMore);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [page, selectedCard, loading, isInitialLoad]);

  // Učitaj slike kad se promeni sortiranje
  useEffect(() => {
    setImages([]);
    setPage(1);
    setHasMore(true);
    fetchImages(true);
  }, [selectedCard]);

  // Funkcija za skrol (za učitavanje više slika)
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

  // Ažurirano handleLike
  const handleLike = useCallback(async (id: number) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    setLikeLoading(id);
    
    // Pronađi sliku
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
        // Ažuriraj state sa novim nizom
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

  // handleSave funkcija
  const handleSave = useCallback(async (id: number) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    alert('Select a collection to save this pin');
  }, [user, navigate]);

  // handleDelete funkcija
  const handleDelete = useCallback(async (id: number) => {
    const response = await imageRepository.deleteImage(id);
    if (response.success) {
      setImages(prevImages => prevImages.filter(img => img.id !== id));
    }
  }, [imageRepository]);

  // handleEdit funkcija
  const handleEdit = useCallback((id: number) => {
    navigate(`/edit/${id}`);
  }, [navigate]);

  const sortCards = [
    {
      type: 'likes' as SortType,
      title: 'Most Liked',
      description: 'Pins with the most hearts',
      icon: Heart,
      gradient: 'from-red-400 to-pink-500',
      activeColor: 'bg-gradient-to-br from-red-500 to-pink-600',
      iconFillColor: 'text-white'
    },
    {
      type: 'trending' as SortType,
      title: 'Rising Fast',
      description: 'Recently popular pins',
      icon: TrendingUp,
      gradient: 'from-purple-400 to-indigo-500',
      activeColor: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      iconFillColor: 'text-white'
    },
    {
      type: 'saves' as SortType,
      title: 'Most Saved',
      description: 'Pins saved to collections',
      icon: Bookmark,
      gradient: 'from-emerald-400 to-teal-500',
      activeColor: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      iconFillColor: 'text-white'
    }
  ];

  return (
    <div className="w-full">
      {/* Naslov - animacija samo na initial load */}
      <div className={`mb-8 ${isInitialLoad ? 'animate-fadeIn' : ''}`}>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Trending Now</h1>
        <p className="text-gray-600 mb-6">
          {selectedCard === 'likes' && 'Showing the most loved pins in our community'}
          {selectedCard === 'trending' && 'Discover what\'s gaining traction right now'}
          {selectedCard === 'saves' && 'Explore the most saved pins across all collections'}
        </p>
      </div>

      {/* Sort Type Cards - animacija samo na initial load */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 ${isInitialLoad ? 'animate-fadeIn animation-delay-100' : ''}`}>
        {sortCards.map((card) => {
          const Icon = card.icon;
          const isSelected = selectedCard === card.type;
          
          return (
            <button
              key={card.type}
              onClick={() => setSelectedCard(card.type)}
              className={`
                relative overflow-hidden rounded-2xl transition-all duration-500 transform
                ${isSelected 
                  ? `${card.activeColor} shadow-2xl scale-105 ring-4 ring-white/30` 
                  : 'bg-white shadow-lg hover:shadow-xl hover:scale-102'
                }
              `}
            >
              <div className={`
                px-6 py-8 
                ${isSelected ? 'text-white' : 'text-gray-800'}
              `}>
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`
                    relative transition-all duration-500
                    ${isSelected ? 'scale-125' : 'scale-100'}
                  `}>
                    <Icon 
                      className={`
                        w-12 h-12 transition-all duration-500
                        ${isSelected 
                          ? card.iconFillColor 
                          : 'text-gray-700'
                        }
                      `} 
                      strokeWidth={isSelected ? 2.5 : 2}
                      fill={isSelected ? 'currentColor' : 'none'}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 animate-ping">
                        <Icon 
                          className="w-12 h-12 text-white/30" 
                          fill="currentColor"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">{card.title}</h3>
                    <p className={`
                      text-sm transition-all duration-300
                      ${isSelected ? 'opacity-90' : 'text-gray-600'}
                    `}>
                      {card.description}
                    </p>
                  </div>
                </div>
                
                {/* Decorative gradient overlay for inactive cards */}
                {!isSelected && (
                  <div className={`
                    absolute inset-0 bg-gradient-to-br ${card.gradient} 
                    opacity-0 hover:opacity-10 transition-opacity duration-300
                  `} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Images Grid - bez animacije osim na initial load */}
      <div className={isInitialLoad ? 'animate-fadeIn animation-delay-200' : ''}>
        {images.length > 0 && (
          <div className="mb-4 px-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
              <span className="text-sm text-gray-600">Sorted by:</span>
              <span className="text-sm font-semibold text-gray-800">
                {sortCards.find(c => c.type === selectedCard)?.title}
              </span>
            </div>
          </div>
        )}
        
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