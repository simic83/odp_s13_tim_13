import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, TrendingUp, Clock, Calendar, CalendarDays } from 'lucide-react';
import { ImageGrid } from '../components/images/ImageGrid';
import { ImageRepository } from '../api/repositories/ImageRepository';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useAuth } from '../hooks/useAuth';
import { Image } from '../Domain/models/Image';

type SortPeriod = 'today' | 'week' | 'month' | 'year';
type SortType = 'likes' | 'comments' | 'saves' | null;

export const Popular: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const imageRepository = new ImageRepository();
  const [sortPeriod, setSortPeriod] = useState<SortPeriod>('week');
  const [selectedCard, setSelectedCard] = useState<SortType>(null);
  const [likeLoading, setLikeLoading] = useState<number | null>(null);

  const fetchPopularImages = async (page: number) => {
    const response = await imageRepository.getPopularImages(page, 20);
    if (response.success && response.data) {
      let items = response.data.items;
      
      // Apply client-side sorting based on selected filter
      if (selectedCard && items.length > 0) {
        items = [...items].sort((a, b) => {
          switch (selectedCard) {
            case 'likes':
              return b.likes - a.likes;
            case 'saves':
              return b.saves - a.saves;
            case 'comments':
              // Since we don't have comment count in the model, we'll use a combination
              // For now, sort by likes + saves as a proxy for engagement
              return (b.likes + b.saves) - (a.likes + a.saves);
            default:
              return 0;
          }
        });
      }
      
      return {
        items,
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
  } = useInfiniteScroll<Image>(fetchPopularImages);

  useEffect(() => {
    reset();
  }, [sortPeriod, selectedCard]);

  const handleLike = async (id: number) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
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
        image.likes = Math.max(0, image.likes - 1);
      }
    } else {
      const response = await imageRepository.likeImage(id);
      if (response.success) {
        image.isLiked = true;
        image.likes++;
      }
    }
    setLikeLoading(null);
  };

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
      reset();
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/edit/${id}`);
  };

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
      type: 'comments' as SortType,
      title: 'Rising Fast',
      description: 'Trending and engaging pins',
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

  const periodIcons = {
    today: Clock,
    week: Calendar,
    month: CalendarDays,
    year: CalendarDays
  };

  return (
    <div className="w-full animate-slideIn">
      <div className="mb-8 animate-fadeIn">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Trending Now</h1>
        <p className="text-gray-600 mb-6">
          {selectedCard 
            ? `Showing pins sorted by ${selectedCard === 'comments' ? 'engagement' : selectedCard}`
            : 'Discover what everyone\'s talking about'}
        </p>
      </div>

      {/* Sort Period Buttons */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 animate-fadeIn animation-delay-100">
        {[
          { value: 'today', label: 'Today' },
          { value: 'week', label: 'This Week' },
          { value: 'month', label: 'This Month' },
          { value: 'year', label: 'This Year' }
        ].map(({ value, label }) => {
          const Icon = periodIcons[value as SortPeriod];
          return (
            <button
              key={value}
              onClick={() => setSortPeriod(value as SortPeriod)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl whitespace-nowrap font-medium transition-all duration-300 transform hover:scale-105 ${
                sortPeriod === value
                  ? 'bg-gray-900 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Sort Type Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 animate-fadeIn animation-delay-200">
        {sortCards.map((card) => {
          const Icon = card.icon;
          const isSelected = selectedCard === card.type;
          
          return (
            <button
              key={card.type}
              onClick={() => setSelectedCard(isSelected ? null : card.type)}
              className={`
                relative overflow-hidden rounded-2xl transition-all duration-500 transform
                ${isSelected 
                  ? `${card.activeColor} shadow-2xl scale-105 ring-4 ring-white/30` 
                  : selectedCard && !isSelected
                    ? 'bg-white shadow-md opacity-60 hover:opacity-80 scale-95'
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

      {/* Images Grid */}
      <div className="animate-fadeIn animation-delay-300">
        {selectedCard && images.length > 0 && (
          <div className="mb-4 px-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
              <span className="text-sm text-gray-600">Sorted by:</span>
              <span className="text-sm font-semibold text-gray-800">
                {sortCards.find(c => c.type === selectedCard)?.title}
              </span>
              <button
                onClick={() => setSelectedCard(null)}
                className="ml-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        <ImageGrid
          images={images}
          loading={loading}
          onLike={handleLike}
          likeLoading={likeLoading}
          onSave={handleSave}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onLastElement={setLastElement}
        />
      </div>
    </div>
  );
};