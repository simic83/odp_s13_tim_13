import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Folder, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { CollectionRepository } from '../api/repositories/CollectionRepository';
import { ImageRepository } from '../api/repositories/ImageRepository';
import { Collection } from '../Domain/models/Collection';
import { Image } from '../Domain/models/Image';
import { ImageGrid } from '../components/images/ImageGrid';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from '../components/common/Avatar';

export const CollectionView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [collection, setCollection] = useState<Collection | null>(null);
    const [images, setImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMenu, setShowMenu] = useState(false);

    const collectionRepository = new CollectionRepository();
    const imageRepository = new ImageRepository();

    useEffect(() => {
        fetchCollectionData();
    }, [id]);

    const fetchCollectionData = async () => {
        if (!id) return;

        setLoading(true);

        // Fetch collection details
        const collectionRes = await collectionRepository.getCollectionById(Number(id));
        if (collectionRes.success && collectionRes.data) {
            setCollection(collectionRes.data);

            // Fetch images in this collection
            const imagesRes = await imageRepository.getImagesByCollection(Number(id));
            if (imagesRes.success && imagesRes.data) {
                setImages(imagesRes.data);
            }
        } else {
            navigate('/404');
        }

        setLoading(false);
    };

    const handleDelete = async () => {
        if (!collection || !user || collection.userId !== user.id) return;

        if (window.confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
            const response = await collectionRepository.deleteCollection(collection.id);
            if (response.success) {
                navigate(`/profile/${user.id}`);
            }
        }
    };

    const handleEdit = () => {
        if (!collection) return;
        navigate(`/collection/${collection.id}/edit`); // Promeniti sa `/collection/${collection.id}/edit`
    };

    const handleImageLike = async (imageId: number) => {
        if (!user) return;
        const image = images.find(img => img.id === imageId);
        if (!image) return;

        if (image.isLiked) {
            await imageRepository.unlikeImage(imageId);
            image.isLiked = false;
            image.likes--;
        } else {
            await imageRepository.likeImage(imageId);
            image.isLiked = true;
            image.likes++;
        }

        setImages([...images]);
    };

    const handleImageDelete = async (imageId: number) => {
        const success = await imageRepository.deleteImage(imageId);
        if (success) {
            setImages(images.filter(img => img.id !== imageId));
        }
    };

    const handleImageEdit = (imageId: number) => {
        navigate(`/edit/${imageId}`);
    };

    if (loading) {
        return (
            <div className="w-full flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="w-full flex justify-center items-center min-h-[60vh]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Collection not found</h2>
                    <p className="text-gray-600">The collection you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    const isOwner = user?.id === collection.userId;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-slideIn">
            {/* Collection Header */}
            <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center text-white">
                            <Folder className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{collection.name}</h1>
                            {collection.description && (
                                <p className="text-gray-600 mt-1">{collection.description}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-2 capitalize">
                                {collection.category} • {images.length} Pins
                            </p>
                        </div>
                    </div>

                    {isOwner && (
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-all"
                            >
                                <MoreVertical className="w-5 h-5 text-gray-700" />
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10">
                                    <button
                                        onClick={handleEdit}
                                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit Collection
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Collection
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Collection Owner */}
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Created by</span>
                    {collection.user?.profileImage ? (
                        <img
                            src={collection.user.profileImage}
                            alt={collection.user.username}
                            className="w-8 h-8 rounded-full"
                        />
                    ) : (
                        <Avatar username={collection.user?.username || 'U'} size="sm" />
                    )}
                    <span className="font-medium text-gray-900">{collection.user?.username}</span>
                </div>
            </div>

            {/* Images Grid */}
            {images.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No pins in this collection yet</p>
                    {isOwner && (
                        <button
                            onClick={() => navigate('/')}
                            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                        >
                            Browse Pins to Save
                        </button>
                    )}
                </div>
            ) : (
                <ImageGrid
                    images={images}
                    onLike={handleImageLike}
                    onDelete={isOwner ? handleImageDelete : undefined}
                    onEdit={isOwner ? handleImageEdit : undefined}
                />
            )}
        </div>
    );
};