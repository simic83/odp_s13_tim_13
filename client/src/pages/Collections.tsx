import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { CollectionCard } from '../components/collections/CollectionCard';
import { CollectionRepository } from '../api/repositories/CollectionRepository';
import { Collection } from '../Domain/models/Collection';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Collections: React.FC = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    const collectionRepository = new CollectionRepository();

    useEffect(() => {
        fetchCollections();
        // eslint-disable-next-line
    }, [page]);

    const fetchCollections = async () => {
        setLoading(true);
        const response = await collectionRepository.getCollections(page, 20);

        // Dodata provera da li postoji data i items
        if (response.success && response.data && Array.isArray(response.data.items)) {
            if (page === 1) {
                setCollections(response.data.items);
            } else {
                setCollections(prev => [...prev, ...(response.data?.items ?? [])]);
            }
            setHasMore(!!response.data.hasMore);
        } else {
            if (page === 1) setCollections([]);
            setHasMore(false);
        }

        setLoading(false);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    const handleCreateCollection = () => {
        if (user) {
            navigate('/create-collection');
        } else {
            navigate('/auth');
        }
    };

    return (
        <div className="w-full animate-slideIn">
            <div className="mb-8 animate-fadeIn flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Explore Collections</h1>
                    <p className="text-gray-600">Discover curated collections from our community</p>
                </div>
                <button
                    onClick={handleCreateCollection}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Create Collection</span>
                </button>
            </div>

            {loading && collections.length === 0 ? (
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500"></div>
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

                    {hasMore && (
                        <div className="flex justify-center mt-12">
                            <button
                                onClick={handleLoadMore}
                                disabled={loading}
                                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all duration-300 font-medium disabled:opacity-50"
                            >
                                {loading ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
