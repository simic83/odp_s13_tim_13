import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
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

    // Initial load
    useEffect(() => {
        fetchInitialCollections();
    }, []);

    const fetchInitialCollections = async () => {
        setLoading(true);
        setPage(1);
        
        try {
            // Fetch first page with larger pageSize to get more collections initially
            const response = await collectionRepository.getCollections(1, 40);
            
            if (response.success && response.data && Array.isArray(response.data.items)) {
                setCollections(response.data.items);
                setHasMore(response.data.hasMore);
                setPage(2); // Set next page to 2
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

    // Auto-load more collections when scrolling near bottom
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
            <div className="mb-8 animate-fadeIn flex items-center justify-between">
                <div>
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
                <button
                    onClick={handleCreateCollection}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Create Collection</span>
                </button>
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
                        className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
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

                    {/* Load More Button or Loading Indicator */}
                    {hasMore && (
                        <div className="flex justify-center mt-12">
                            {loadingMore ? (
                                <LoadingSpinner size="md" />
                            ) : (
                                <button
                                    onClick={loadMoreCollections}
                                    className="px-8 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all duration-300 font-medium"
                                >
                                    Load More Collections
                                </button>
                            )}
                        </div>
                    )}
                    
                    {!hasMore && collections.length > 0 && (
                        <div className="text-center mt-8 text-gray-500">
                            All collections loaded
                        </div>
                    )}
                </>
            )}
        </div>
    );
};