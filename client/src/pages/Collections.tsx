import React, { useState, useEffect, useCallback } from 'react';
import { CollectionCard } from '../components/collections/CollectionCard';
import { CollectionRepository } from '../api/repositories/CollectionRepository';
import { Collection } from '../Domain/models/Collection';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Collections: React.FC = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    const collectionRepository = new CollectionRepository();

    // Funkcija za učitavanje kolekcija
    const fetchCollections = useCallback(async (resetCollections: boolean = false) => {
  if (loading) return;
  setLoading(true);

  try {
    const currentPage = resetCollections ? 1 : page;
    const pageSize = currentPage === 1 ? 40 : 20;

    const res = await collectionRepository.getCollections(currentPage, pageSize);

    // Ako nema uspeha ili nema niza items → tretiraj kao prazno
    if (!res?.success) {
      if (resetCollections) setCollections([]);
      setHasMore(false);
      return;
    }

    const items = Array.isArray(res.data?.items) ? res.data!.items : [];
    const nextHasMore = !!res.data?.hasMore;

    if (resetCollections) {
      setCollections(items);
      setPage(2);
    } else {
      setCollections(prev => [...prev, ...items]);
      setPage(prev => prev + 1);
    }

    setHasMore(nextHasMore && items.length > 0);
  } catch (e) {
    console.error('Error fetching collections:', e);
    if (resetCollections) setCollections([]);
    setHasMore(false);
  } finally {
    setLoading(false);
    if (isInitialLoad) setIsInitialLoad(false);
  }
}, [page, loading, isInitialLoad, collectionRepository]);


    // Initial load
    useEffect(() => {
        fetchCollections(true);
    }, []);

    // Scroll handler
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop >= 
                document.documentElement.offsetHeight - 100) {
                if (hasMore && !loading) {
                    fetchCollections(false);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, loading, fetchCollections]);

    const handleCreateCollection = () => {
        if (user) {
            navigate('/create-collection');
        } else {
            navigate('/auth');
        }
    };

    return (
        <div className="w-full">
            {/* Header - animacija samo na initial load */}
            <div className={`mb-8 ${isInitialLoad ? 'animate-fadeIn' : ''}`}>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Explore Collections</h1>
                <p className="text-gray-600">
                    Discover curated collections from our community
                    {collections.length > 0 && (
                        <span className="ml-2 text-sm text-gray-500">
                            ({collections.length} collections loaded)
                        </span>
                    )}
                </p>
            </div>

            {/* Content */}
            {loading && collections.length === 0 ? (
                // Initial loading state
                <div className="flex justify-center items-center min-h-[60vh]">
                    <LoadingSpinner size="lg" />
                </div>
            ) : collections.length === 0 && !loading ? (
                // Empty state
                <div className={`text-center py-12 ${isInitialLoad ? 'animate-fadeIn' : ''}`}>
                    <p className="text-gray-500 text-lg mb-4">No collections found</p>
                    <button
                        onClick={handleCreateCollection}
                        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all transform hover:scale-105"
                    >
                        Create the first collection
                    </button>
                </div>
            ) : (
                <>
                    {/* Collections Grid - animacija samo na initial load */}
                    <div className={`grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${
                        isInitialLoad ? 'animate-fadeIn animation-delay-100' : ''
                    }`}>
                        {collections.map((collection) => (
                            <CollectionCard key={collection.id} collection={collection} />
                        ))}
                    </div>
                    
                    {/* Loading more indicator */}
                    {loading && collections.length > 0 && (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    )}
                    
                    {/* No more collections message */}
                    {!hasMore && collections.length > 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No more collections to load
                        </div>
                    )}
                </>
            )}
        </div>
    );
};