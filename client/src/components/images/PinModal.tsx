import React, { useState, useEffect, useMemo } from 'react';
import { X, Heart, MessageCircle, Bookmark, MoreVertical, Edit, Trash2, Send, Plus, Folder, ArrowUpRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Image } from '../../Domain/models/Image';
import { Comment } from '../../Domain/models/Comment';
import { Collection } from '../../Domain/models/Collection';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { ImageRepository } from '../../api/repositories/ImageRepository';
import { CommentRepository } from '../../api/repositories/CommentRepository';
import { CollectionRepository } from '../../api/repositories/CollectionRepository';

interface PinModalProps {
    image: Image;
    isOpen: boolean;
    onClose: () => void;
    onLike?: (id: number) => void;
    onDelete?: (id: number) => void;
    onEdit?: (id: number) => void;
}

export const PinModal: React.FC<PinModalProps> = ({
    image,
    isOpen,
    onClose,
    onLike,
    onDelete,
    onEdit,
}) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [showOwnerMenu, setShowOwnerMenu] = useState(false);
    const [showCollectionMenu, setShowCollectionMenu] = useState(false);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loadingComment, setLoadingComment] = useState(false);
    const [isSaved, setIsSaved] = useState(image.isSaved || false);
    const [isLiked, setIsLiked] = useState(image.isLiked || false);

    const imageRepository = new ImageRepository();
    const commentRepository = new CommentRepository();
    const collectionRepository = new CollectionRepository();

    const isOwner = user?.id === image.userId;

    useEffect(() => {
        if (isOpen) {
            fetchComments();
            if (user) {
                fetchCollections();
            }
        }
        // eslint-disable-next-line
    }, [isOpen, user]);

    const fetchComments = async () => {
        const response = await commentRepository.getCommentsByImage(image.id);
        if (response.success && response.data) {
            setComments(response.data);
        }
    };

    const fetchCollections = async () => {
        if (!user) return;
        const response = await collectionRepository.getUserCollections(user.id);
        if (response.success && response.data) {
            setCollections(response.data);
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;

        setLoadingComment(true);
        const response = await commentRepository.createComment({
            content: newComment,
            userId: user.id,
            imageId: image.id,
        });

        if (response.success && response.data) {
            setComments([response.data, ...comments]);
            setNewComment('');
        }
        setLoadingComment(false);
    };

    const handleLike = async () => {
        if (!user) return;

        if (isLiked) {
            await imageRepository.unlikeImage(image.id);
            setIsLiked(false);
            if (onLike) onLike(image.id);
        } else {
            await imageRepository.likeImage(image.id);
            setIsLiked(true);
            if (onLike) onLike(image.id);
        }
    };

    const handleSaveToCollection = async (collectionId: number) => {
        if (!user) return;

        const response = await imageRepository.saveImage(image.id, collectionId);
        if (response.success) {
            setIsSaved(true);
            setShowCollectionMenu(false);
        }
    };

    const handleCreateCollection = () => {
        setShowCollectionMenu(false);
        navigate('/create-collection');
    };

    const handleProfileClick = (userId: number) => {
        onClose();
        navigate(`/profile/${userId}`);
    };

    // ✅ normalizuj link (dodaj https:// ako fali)
    const normalizedLink = useMemo(() => {
        if (!image.link) return '';
        const l = image.link.trim();
        return l.startsWith('http://') || l.startsWith('https://') ? l : `https://${l}`;
    }, [image.link]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
            <div
                className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideIn"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                    {/* Left side - Image */}
                    <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-4">
                        <img
                            src={image.url}
                            alt={image.title}
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                    </div>

                    {/* Right side - Details */}
                    <div className="md:w-1/2 flex flex-col h-full">
                        {/* Header with user info */}
                        <div className="p-6 border-b flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Avatar - clickable */}
                                <div 
                                    onClick={() => handleProfileClick(image.userId)}
                                    className="cursor-pointer"
                                >
                                    {image.user?.profileImage ? (
                                        <img
                                            src={image.user.profileImage}
                                            alt={image.user.username}
                                            className="w-12 h-12 rounded-full hover:ring-2 hover:ring-gray-300 transition-all"
                                        />
                                    ) : (
                                        <div className="hover:scale-105 transition-transform">
                                            <Avatar username={image.user?.username || 'U'} size="lg" />
                                        </div>
                                    )}
                                </div>
                                {/* Username and category */}
                                <div>
                                    <p 
                                        onClick={() => handleProfileClick(image.userId)}
                                        className="font-semibold text-lg text-gray-900 hover:text-gray-700 cursor-pointer transition-colors"
                                    >
                                        {image.user?.username}
                                    </p>
                                    <p className="text-sm text-gray-500 capitalize">{image.category}</p>
                                </div>
                            </div>

                            {/* Owner menu - moved to the right */}
                            {isOwner && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowOwnerMenu(!showOwnerMenu)}
                                        className="p-2 rounded-full hover:bg-gray-100 transition-all duration-300"
                                    >
                                        <MoreVertical className="w-5 h-5 text-gray-700" />
                                    </button>
                                    {showOwnerMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10">
                                            {onEdit && (
                                                <button
                                                    onClick={() => {
                                                        setShowOwnerMenu(false);
                                                        onEdit(image.id);
                                                        onClose();
                                                    }}
                                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Edit Pin
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => {
                                                        setShowOwnerMenu(false);
                                                        if (window.confirm('Are you sure you want to delete this pin?')) {
                                                            onDelete(image.id);
                                                            onClose();
                                                        }
                                                    }}
                                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete Pin
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            {/* Title and Description */}
                            <div className="p-6">
                                <h2 className="text-2xl font-bold mb-2 text-gray-900">{image.title}</h2>
                                {image.description && (
                                    <p className="text-gray-700 mb-4">{image.description}</p>
                                )}

                                {/* Action buttons */}
                                <div className="flex gap-2 mb-6">
                                    <button
                                        onClick={handleLike}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isLiked
                                            ? 'bg-red-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                                            }`}
                                    >
                                        <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
                                        <span>{image.likes + (isLiked && !image.isLiked ? 1 : !isLiked && image.isLiked ? -1 : 0)}</span>
                                    </button>

                                    <button
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        <span>{comments.length}</span>
                                    </button>

                                    <div className="relative">
                                        <button
                                            onClick={() => user ? setShowCollectionMenu(!showCollectionMenu) : navigate('/auth')}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isSaved
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                                                }`}
                                        >
                                            <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
                                            <span>{isSaved ? 'Saved' : 'Save'}</span>
                                        </button>

                                        {showCollectionMenu && (
                                            <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10 max-h-80 overflow-y-auto">
                                                <p className="px-4 py-2 text-sm font-semibold text-gray-700 border-b">Save to collection</p>

                                                <button
                                                    onClick={handleCreateCollection}
                                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Create new collection
                                                </button>

                                                {collections.map((collection) => (
                                                    <button
                                                        key={collection.id}
                                                        onClick={() => handleSaveToCollection(collection.id)}
                                                        className="w-full flex items-start gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
                                                    >
                                                        <Folder className="w-4 h-4 mt-0.5" />
                                                        <div className="text-left">
                                                            <p className="font-medium">{collection.name}</p>
                                                            {collection.description && (
                                                                <p className="text-xs text-gray-500">{collection.description}</p>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* ✅ Visit Link — odmah desno od Save; koristi image.link */}
                                    {normalizedLink && (
                                        <a
                                            href={normalizedLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
                                        >
                                            <ArrowUpRight className="w-5 h-5" />
                                            <span>Visit Link</span>
                                        </a>
                                    )}
                                </div>

                                {/* Comments Section */}
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-4 text-gray-900">Comments</h3>

                                    {/* Add comment form */}
                                    {user && (
                                        <form onSubmit={handleComment} className="flex gap-2 mb-4">
                                            <Avatar username={user.username} size="sm" />
                                            <div className="flex-1 relative">
                                                <input
                                                    type="text"
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="Add a comment..."
                                                    className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-full text-gray-700 placeholder-gray-400 focus:border-gray-500 focus:outline-none"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!newComment.trim() || loadingComment}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    {/* Comments list */}
                                    <div className="space-y-4">
                                        {comments.length === 0 && (
                                            <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                                        )}

                                        {comments.map((comment) => (
                                            <div key={comment.id} className="flex gap-3">
                                                {/* Comment avatar - clickable */}
                                                <div 
                                                    onClick={() => handleProfileClick(comment.userId)}
                                                    className="cursor-pointer flex-shrink-0"
                                                >
                                                    {comment.user?.profileImage ? (
                                                        <img
                                                            src={comment.user.profileImage}
                                                            alt={comment.user.username}
                                                            className="w-8 h-8 rounded-full hover:ring-2 hover:ring-gray-300 transition-all"
                                                        />
                                                    ) : (
                                                        <div className="hover:scale-105 transition-transform">
                                                            <Avatar username={comment.user?.username || 'U'} size="sm" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p 
                                                        onClick={() => handleProfileClick(comment.userId)}
                                                        className="font-medium text-sm text-gray-900 hover:text-gray-700 cursor-pointer transition-colors inline-block"
                                                    >
                                                        {comment.user?.username}
                                                    </p>
                                                    <p className="text-gray-700">{comment.content}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
