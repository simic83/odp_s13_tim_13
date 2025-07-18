import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ImageGrid } from '../components/images/ImageGrid';
import { CollectionCard } from '../components/collections/CollectionCard';
import { UserRepository } from '../api/repositories/UserRepository';
import { ImageRepository } from '../api/repositories/ImageRepository';
import { CollectionRepository } from '../api/repositories/CollectionRepository';
import { useAuth } from '../hooks/useAuth';
import { Image } from '../Domain/models/Image';
import { Collection } from '../Domain/models/Collection';

export const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: authUser } = useAuth();
  
  const [user, setUser] = useState<any>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pins' | 'collections'>('pins');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
    
      const userRepo = new UserRepository();
      const imgRepo = new ImageRepository();
      const colRepo = new CollectionRepository();
    
      const userRes = await userRepo.getUserById(Number(userId));
      if (userRes.success && userRes.data) {
        setUser(userRes.data);
      }
    
      const imgRes = await imgRepo.getUserImages(Number(userId), 1, 100);
      if (imgRes.success && imgRes.data) {
        setImages(imgRes.data.items);
      }
    
      const colRes = await colRepo.getUserCollections(Number(userId));
      if (colRes.success && colRes.data) {
        setCollections(colRes.data);
      }
    
      setLoading(false);
    };
    fetchAll();
  }, [userId]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">User not found</h2>
          <p className="text-gray-600">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-12">
        <div className="relative group mb-6">
          <img
            src={user.profileImage || '/default-avatar.png'}
            alt={user.username}
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg group-hover:scale-105 transition-transform duration-300"
          />
          {authUser?.id === user.id && (
            <button className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-110">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{user.username}</h1>
        {user.bio && (
          <p className="text-gray-600 text-center max-w-md mb-4">{user.bio}</p>
        )}
        
        <div className="flex gap-8 text-center">
          <div className="group cursor-pointer">
            <p className="text-3xl font-bold text-gray-900 group-hover:scale-110 transition-transform">{images.length}</p>
            <p className="text-gray-600">Pins</p>
          </div>
          <div className="group cursor-pointer">
            <p className="text-3xl font-bold text-gray-900 group-hover:scale-110 transition-transform">{collections.length}</p>
            <p className="text-gray-600">Collections</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-full p-1 flex gap-1">
          <button
            onClick={() => setActiveTab('pins')}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              activeTab === 'pins'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Pins
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              activeTab === 'collections'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Collections
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="transition-all duration-300">
        {activeTab === 'pins' ? (
          images.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No pins yet</p>
            </div>
          ) : (
            <ImageGrid images={images} />
          )
        ) : (
          collections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No collections yet</p>
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