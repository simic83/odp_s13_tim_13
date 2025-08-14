import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ImageGrid } from '../components/images/ImageGrid';
import { CollectionCard } from '../components/collections/CollectionCard';
import { UserRepository } from '../api/repositories/UserRepository';
import { ImageRepository } from '../api/repositories/ImageRepository';
import { CollectionRepository } from '../api/repositories/CollectionRepository';
import { useAuth } from '../hooks/useAuth';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { Image } from '../Domain/models/Image';
import { Collection } from '../Domain/models/Collection';
import { Avatar } from '../components/common/Avatar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [userNotFound, setUserNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<'pins' | 'collections'>('pins');
  const [likeLoading, setLikeLoading] = useState<number | null>(null);

  const imageRepository = new ImageRepository();
  const userRepository = new UserRepository();
  const collectionRepository = new CollectionRepository();

  // Check if trying to access /profile without ID (own profile)
  useEffect(() => {
    // If no userId in params and not logged in, redirect to auth
    if (!userId && !authUser) {
      navigate('/auth');
      return;
    }
    
    // If no userId but logged in, redirect to own profile
    if (!userId && authUser) {
      navigate(`/profile/${authUser.id}`);
      return;
    }
  }, [userId, authUser, navigate]);

  const fetchUserImages = async (page: number) => {
    if (!userId || userNotFound) return { items: [], hasMore: false };
    const response = await imageRepository.getUserImages(Number(userId), page, 20);
    if (response.success && response.data) {
      return { items: response.data.items, hasMore: response.data.hasMore };
    }
    return { items: [], hasMore: false };
  };

  const { items: images, loading: imagesLoading, setLastElement, reset } =
    useInfiniteScroll<Image>(fetchUserImages);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setUserNotFound(false);

      if (!userId || isNaN(Number(userId))) {
        setUserNotFound(true);
        setLoading(false);
        return;
      }

      const userRes = await userRepository.getUserById(Number(userId));
      if (!userRes.success || !userRes.data || userRes.data.id === 0) {
        setUserNotFound(true);
        setLoading(false);
        return;
      }

      setUser(userRes.data);

      const colRes = await collectionRepository.getUserCollections(Number(userId));
      if (colRes.success && colRes.data) {
        setCollections(colRes.data);
      }

      setLoading(false);
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  useEffect(() => {
    reset();
  }, [userId, reset]);

  const handleLike = async (imageId: number) => {
    if (!authUser) {
      navigate('/auth');
      return;
    }

    setLikeLoading(imageId);
    const image = images.find(img => img.id === imageId);
    if (!image) {
      setLikeLoading(null);
      return;
    }

    if (image.isLiked) {
      const response = await imageRepository.unlikeImage(imageId);
      if (response.success) {
        image.isLiked = false;
        image.likes = Math.max(0, image.likes - 1);
      }
    } else {
      const response = await imageRepository.likeImage(imageId);
      if (response.success) {
        image.isLiked = true;
        image.likes++;
      }
    }

    setLikeLoading(null);
  };

  const handleSave = async () => {
    if (!authUser) {
      navigate('/auth');
      return;
    }
    alert('Select a collection to save this pin');
  };

  const handleDelete = async (imageId: number) => {
    const response = await imageRepository.deleteImage(imageId);
    if (response.success) {
      reset();
    }
  };

  const handleEdit = (imageId: number) => {
    navigate(`/edit/${imageId}`);
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (userNotFound || !user) {
    return (
      <div className="w-full flex justify-center items-center min-h-[60vh]">
        <div className="text-center animate-fadeIn">
          <div className="mb-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">User not found</h2>
            <p className="text-gray-600 mb-6">The user you're looking for doesn't exist or has been deleted.</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
            >
              Go to Home
            </button>
            <button
              onClick={() => navigate('/popular')}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all duration-300"
            >
              Explore Popular
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = authUser?.id === user.id;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Header with larger avatar */}
      <div className="flex flex-col items-center mb-12">
        <div className="relative group mb-6">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.username}
              className="w-32 h-32 rounded-full shadow-lg object-cover ring-4 ring-white"
            />
          ) : (
            <div className="w-32 h-32 rounded-full shadow-lg ring-4 ring-white">
              <Avatar
                username={user.username}
                size="lg"
                className="w-full h-full text-4xl"
              />
            </div>
          )}

          {isOwner && (
            <button
              onClick={() => navigate('/settings')}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
            >
              <span className="text-white font-medium">Edit Profile</span>
            </button>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-800">{user.username}</h1>
        {user.bio && (
          <p className="text-gray-600 mt-2 text-center max-w-xl">{user.bio}</p>
        )}

        <div className="mt-6 flex items-center gap-8 text-gray-600">
          <div className="text-center">
            <span className="block text-2xl font-bold text-gray-800">{images.length}</span>
            <span className="text-sm">Pins</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-bold text-gray-800">{collections.length}</span>
            <span className="text-sm">Collections</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8">
          {/* Light grey rounded background behind tabs */}
          <div className="inline-flex items-center gap-2 p-1 bg-gray-100 rounded-lg shadow-sm">
            <button
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'pins'
                  ? 'bg-gray-900 text-white shadow'
                  : 'bg-transparent text-gray-700 hover:bg-white'
              }`}
              onClick={() => setActiveTab('pins')}
            >
              Pins
            </button>
            <button
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'collections'
                  ? 'bg-gray-900 text-white shadow'
                  : 'bg-transparent text-gray-700 hover:bg-white'
              }`}
              onClick={() => setActiveTab('collections')}
            >
              Collections
            </button>
          </div>
        </div>
      </div>

      {/* Content with same image grid as Home/Popular */}
      <div className="animate-fadeIn animation-delay-300">
        {activeTab === 'pins' ? (
          images.length === 0 && !imagesLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg mb-2">No pins yet</p>
            </div>
          ) : (
            <ImageGrid
              images={images}
              loading={imagesLoading}
              onLike={handleLike}
              likeLoading={likeLoading}
              onSave={handleSave}
              onDelete={isOwner ? handleDelete : undefined}
              onEdit={isOwner ? handleEdit : undefined}
              onLastElement={setLastElement}
            />
          )
        ) : (
          collections.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg mb-2">No collections yet</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {collections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};