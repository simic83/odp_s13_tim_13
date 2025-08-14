import React, { useState, useEffect } from 'react';
import { CollectionCard } from '../components/collections/CollectionCard';
import { CollectionRepository } from '../api/repositories/CollectionRepository';
import { Collection } from '../Domain/models/Collection';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Collections: React.FC = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const collectionRepository = new CollectionRepository();

    useEffect(() => {
        fetchInitialCollections();
    }, []);

    const fetchInitialCollections = async () => {
        setLoading(true);
        setPage(1);
        
        try {
            const response = await collectionRepository.getCollections(1, 40);
            if (response.success && response.data && Array.isArray(response.data.items)) {
                setCollections(response.data.items);
                setHasMore(response.data.hasMore);
                setPage(2);
            } else {
                setCollections([]);
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching collections:', error);
            setCollections([]);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreCollections = async () => {
        if (loadingMore || !hasMore) return;
        
        setLoadingMore(true);
        
        try {
            const response = await collectionRepository.getCollections(page, 20);
            if (response.success && response.data && Array.isArray(response.data.items)) {
                setCollections(prev => [...prev, ...(response.data!.items)]);
                setHasMore(response.data.hasMore);
                setPage(prev => prev + 1);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading more collections:', error);
            setHasMore(false);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleCreateCollection = () => {
        if (user) {
            navigate('/create-collection');
        } else {
            navigate('/auth');
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop >= 
                document.documentElement.offsetHeight - 100) {
                if (hasMore && !loadingMore) {
                    loadMoreCollections();
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, loadingMore, page]);

    return (
        <div className="w-full animate-slideIn">
            <div className="mb-8 animate-fadeIn">
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

            {loading ? (
                <div className="flex justify-center items-center min-h-[60vh]">
                    <LoadingSpinner size="lg" />
                </div>
            ) : collections.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">No collections found</p>
                    <button
                        onClick={handleCreateCollection}
                        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                    >
                        Create the first collection
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 animate-fadeIn animation-delay-100">
                        {collections.map((collection) => (
                            <CollectionCard key={collection.id} collection={collection} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
