import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import { ImageGrid } from '../components/images/ImageGrid';
import { ImageRepository } from '../api/repositories/ImageRepository';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useAuth } from '../hooks/useAuth';
import { Image } from '../Domain/models/Image';

type SortPeriod = 'today' | 'week' | 'month' | 'year';
type SortType = 'likes' | 'comments' | 'saves';

export const Popular: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const imageRepository = new ImageRepository();
  const [sortPeriod, setSortPeriod] = useState<SortPeriod>('week');
  const [selectedCard, setSelectedCard] = useState<SortType>('likes');

  const fetchPopularImages = async (page: number) => {
    const response = await imageRepository.getPopularImages(page, 20);
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
  } = useInfiniteScroll<Image>(fetchPopularImages);

  useEffect(() => {
    reset();
  }, [sortPeriod, selectedCard]);

  const handleLike = async (id: number) => {
    if (!user) {
      // Redirect to auth page if not logged in
      navigate('/auth');
      return;
    }
    
    const image = images.find(img => img.id === id);
    if (!image) return;

    if (image.isLiked) {
      await imageRepository.unlikeImage(id);
      image.isLiked = false;
      image.likes--;
    } else {
      await imageRepository.likeImage(id);
      image.isLiked = true;
      image.likes++;
    }
  };

  const handleSave = async (id: number) => {
    if (!user) {
      // Redirect to auth page if not logged in
      navigate('/auth');
      return;
    }
    alert('Select a collection to save this pin');
  };

  const sortCards = [
    {
      type: 'likes' as SortType,
      title: 'Most Liked',
      description: 'Pins that are most liked',
      icon: Heart,
      gradient: 'from-red-500 via-rose-500 to-pink-500'
    },
    {
      type: 'comments' as SortType,
      title: 'Rising Fast',
      description: 'Pins with most comments',
      icon: MessageCircle,
      gradient: 'from-blue-500 via-indigo-500 via-fuchsia-500 to-pink-500'
    },
    {
      type: 'saves' as SortType,
      title: 'Most Saved',
      description: 'Pins that are most saved',
      icon: Bookmark,
      gradient: 'from-green-400 via-emerald-500 via-teal-400 to-cyan-400'
    }
  ];

  return (
    <div className="w-full animate-slideIn">
      <div className="mb-8 animate-fadeIn">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Trending Now</h1>
        <p className="text-gray-600 mb-6">Discover what everyone's talking about</p>
      </div>

      {/* Sort Period Buttons */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 animate-fadeIn animation-delay-100">
        {[
          { value: 'today', label: 'Today' },
          { value: 'week', label: 'This Week' },
          { value: 'month', label: 'This Month' },
          { value: 'year', label: 'This Year' }
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setSortPeriod(value as SortPeriod)}
            className={`px-6 py-2 rounded-lg whitespace-nowrap font-medium transition-all duration-300 transform hover:scale-105 ${
              sortPeriod === value
                ? 'bg-gray-900 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sort Type Cards */}
      <div className="flex flex-wrap gap-5 mb-8 animate-fadeIn animation-delay-200 justify-start">
        {sortCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.type}
              onClick={() => setSelectedCard(card.type)}
              className={`relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-105
          ${selectedCard === card.type
                  ? 'shadow-xl scale-105 ring-2 ring-white/40'
                  : 'shadow hover:shadow-lg'}
          `}
              style={{ width: 360, minWidth: 0, maxWidth: '95vw' }}
            >
              <div className={`h-full bg-gradient-to-br ${card.gradient} px-5 py-4 text-white`}>
                <div className="flex flex-col items-start">
                  <Icon className="w-9 h-9 mb-2" strokeWidth={2} />
                  <h3 className="text-lg font-bold mb-1">{card.title}</h3>
                  <p className="text-sm opacity-90">{card.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="animate-fadeIn animation-delay-300">
        <ImageGrid
          images={images}
          loading={loading}
          onLike={handleLike}
          onSave={handleSave}
          onLastElement={setLastElement}
        />
      </div>
    </div>
  );
};