// client/src/components/images/PinModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Heart, MessageCircle, Bookmark, MoreVertical, Edit, Trash2, Send, Plus, Folder, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

// (Opciono) Zadržana RippleEffect komponenta
const RippleEffect: React.FC<{ color: string }> = ({ color }) => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="absolute inset-0 rounded-full animate-ripple"
                    style={{
                        background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
                        animationDelay: `${i * 0.15}s`
                    }}
                />
            ))}
        </div>
    );
};

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
    const [likesCount, setLikesCount] = useState(image.likes);
    const [showLikeAnimation, setShowLikeAnimation] = useState(false);
    const [showSaveAnimation, setShowSaveAnimation] = useState(false);
    const [likeButtonScale, setLikeButtonScale] = useState(false);
    const [saveButtonScale, setSaveButtonScale] = useState(false);

    // NOVO: state-ovi za animacije komentara
    const [sendButtonAnimation, setSendButtonAnimation] = useState(false);
    const [newCommentId, setNewCommentId] = useState<number | null>(null);

    // NOVO: state za brisanje (ispravno, unutar komponente)
    const [deletingPin, setDeletingPin] = useState(false);

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

    // NOVO: handleDelete pokreće animacije i tek onda briše
    const handleDelete = async () => {
        if (!onDelete) return;
        if (!window.confirm('Are you sure you want to delete this pin?')) return;

        setDeletingPin(true);

        // Sačekaj da se animacija završi
        setTimeout(() => {
            onDelete(image.id);
            onClose();
        }, 800);
    };

    // IZMENJENO: handleComment sa animacijama
    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            onClose();
            navigate('/auth');
            return;
        }

        if (!newComment.trim()) return;

        // Pokreni animaciju dugmeta
        setSendButtonAnimation(true);
        setLoadingComment(true);

        const response = await commentRepository.createComment({
            content: newComment,
            userId: user.id,
            imageId: image.id,
        });

        if (response.success && response.data) {
            // Označi novi komentar za animaciju
            setNewCommentId(response.data.id);
            setComments([response.data, ...comments]);
            setNewComment('');

            // Ukloni oznaku nakon animacije
            setTimeout(() => {
                setNewCommentId(null);
            }, 1000);
        }

        setLoadingComment(false);
        setSendButtonAnimation(false);
    };

    const formatCommentDate = (date: Date) => {
        const now = new Date();
        const commentDate = new Date(date);
        const diffMs = now.getTime() - commentDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return commentDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: commentDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    const handleLike = async () => {
        if (!user) {
            onClose();
            navigate('/auth');
            return;
        }

        // Scale animacija
        setLikeButtonScale(true);
        setTimeout(() => setLikeButtonScale(false), 300);

        if (isLiked) {
            await imageRepository.unlikeImage(image.id);
            setIsLiked(false);
            setLikesCount(prev => Math.max(0, prev - 1));
            if (onLike) onLike(image.id);
        } else {
            // Pokaži floating hearts samo na like
            setShowLikeAnimation(true);
            setTimeout(() => setShowLikeAnimation(false), 1000);

            await imageRepository.likeImage(image.id);
            setIsLiked(true);
            setLikesCount(prev => prev + 1);
            if (onLike) onLike(image.id);
        }
    };

    const handleSaveClick = () => {
        if (!user) {
            onClose();
            navigate('/auth');
            return;
        }
        setShowCollectionMenu(!showCollectionMenu);
    };

    const handleSaveToCollection = async (collectionId: number) => {
        if (!user) {
            onClose();
            navigate('/auth');
            return;
        }

        // Scale + floating bookmarks
        setSaveButtonScale(true);
        setShowSaveAnimation(true);
        setTimeout(() => {
            setSaveButtonScale(false);
            setShowSaveAnimation(false);
        }, 1000);

        const response = await imageRepository.saveImage(image.id, collectionId);
        if (response.success) {
            setIsSaved(true);
            setShowCollectionMenu(false);
        }
    };

    const handleCreateCollection = () => {
        if (!user) {
            onClose();
            navigate('/auth');
            return;
        }
        setShowCollectionMenu(false);
        onClose();
        navigate('/create-collection');
    };

    const handleProfileClick = (userId: number) => {
        onClose();
        navigate(`/profile/${userId}`);
    };

    const normalizedLink = useMemo(() => {
        if (!image.link) return '';
        const l = image.link.trim();
        return l.startsWith('http://') || l.startsWith('https://') ? l : `https://${l}`;
    }, [image.link]);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
                <div
                    className={`relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden ${deletingPin ? 'animate-delete-shake' : 'animate-slideIn'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                        {/* Left side - Image */}
                        <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-4 relative">
                            <img
                                src={image.url}
                                alt={image.title}
                                className={`max-w-full max-h-full object-contain rounded-lg transition-all duration-500 ${deletingPin ? 'animate-burn-away' : ''}`}
                            />

                            {/* Floating hearts animation overlay for like */}
                            {showLikeAnimation && (
                                <div className="absolute inset-0 pointer-events-none">
                                    {[...Array(8)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute animate-float-up"
                                            style={{
                                                left: `${20 + Math.random() * 60}%`,
                                                bottom: '10%',
                                                animationDelay: `${i * 0.1}s`,
                                                animationDuration: '2s'
                                            }}
                                        >
                                            <Heart
                                                className="w-8 h-8 text-red-500 fill-red-500 animate-pulse-scale"
                                                style={{
                                                    filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))'
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Floating bookmarks animation overlay for save - NOVO */}
                            {showSaveAnimation && (
                                <div className="absolute inset-0 pointer-events-none">
                                    {[...Array(8)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute animate-float-up"
                                            style={{
                                                left: `${20 + Math.random() * 60}%`,
                                                bottom: '10%',
                                                animationDelay: `${i * 0.1}s`,
                                                animationDuration: '2s'
                                            }}
                                        >
                                            <Bookmark
                                                className="w-8 h-8 text-green-500 fill-green-500 animate-pulse-scale"
                                                style={{
                                                    filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))'
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Fire effect overlay za brisanje */}
                            {deletingPin && (
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute inset-0 bg-gradient-to-t from-orange-600 via-red-500 to-transparent opacity-0 animate-fire-up" />
                                    <div className="absolute bottom-0 left-0 right-0 h-20">
                                        {[...Array(12)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="absolute bottom-0 w-8 h-8 animate-flame"
                                                style={{
                                                    left: `${i * 8.33}%`,
                                                    animationDelay: `${i * 0.1}s`
                                                }}
                                            >
                                                🔥
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right side - Details */}
                        <div className="md:w-1/2 flex flex-col h-full">
                            {/* Header with user info - Fixed */}
                            <div className="p-6 border-b flex items-center justify-between bg-white">
                                <div className="flex items-center gap-3">
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
                                                            handleDelete(); // Pozovite handleDelete umesto direktno onDelete!
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

                            {/* Content - Scrollable Container */}
                            <div className="flex-1 overflow-hidden flex flex-col">
                                <div className="flex-1 overflow-y-auto">
                                    {/* Title and Description */}
                                    <div className="p-6">
                                        <h2 className="text-2xl font-bold mb-2 text-gray-900">{image.title}</h2>
                                        {image.description && (
                                            <p className="text-gray-700 mb-4">{image.description}</p>
                                        )}

                                        {/* Action buttons */}
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {/* LIKE */}
                                            <button
                                                onClick={handleLike}
                                                className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all transform ${isLiked
                                                    ? 'bg-red-500 text-white shadow-lg'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                                                    } ${likeButtonScale ? 'scale-125' : 'scale-100'}`}
                                                style={{
                                                    transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                                                }}
                                            >
                                                <Heart
                                                    className={`w-5 h-5 ${isLiked ? 'animate-heartbeat' : ''}`}
                                                    fill={isLiked ? 'currentColor' : 'none'}
                                                />
                                                <span className="font-medium">{likesCount}</span>
                                                {isLiked && <RippleEffect color="rgba(255, 255, 255, 1)" />}
                                            </button>

                                            {/* COMMENTS */}
                                            <button
                                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                                <span>{comments.length}</span>
                                            </button>

                                            {/* SAVE */}
                                            <div className="relative">
                                                <button
                                                    onClick={handleSaveClick}
                                                    className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all transform ${isSaved
                                                        ? 'bg-green-500 text-white shadow-lg'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                                                        } ${saveButtonScale ? 'scale-125' : 'scale-100'}`}
                                                    style={{
                                                        transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                                                    }}
                                                >
                                                    <Bookmark
                                                        className={`w-5 h-5 ${isSaved ? 'animate-heartbeat' : ''}`}
                                                        fill={isSaved ? 'currentColor' : 'none'}
                                                    />
                                                    <span className="font-medium">{isSaved ? 'Saved' : 'Save'}</span>
                                                    {isSaved && <RippleEffect color="rgba(255, 255, 255, 1)" />}
                                                </button>

                                                {showCollectionMenu && (
                                                    <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10 max-h-80 overflow-y-auto animate-slideDown">
                                                        <p className="px-4 py-2 text-sm font-semibold text-gray-700 border-b">Save to collection</p>

                                                        <button
                                                            onClick={handleCreateCollection}
                                                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700 transition-all"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                            Create new collection
                                                        </button>

                                                        {collections.map((collection) => (
                                                            <button
                                                                key={collection.id}
                                                                onClick={() => handleSaveToCollection(collection.id)}
                                                                className="w-full flex items-start gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700 transition-all group"
                                                            >
                                                                <Folder className="w-4 h-4 mt-0.5 group-hover:text-green-500 transition-colors" />
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
                                            <h3 className="font-semibold mb-4 text-gray-900 flex items-center gap-2">
                                                Comments
                                                {comments.length > 0 && (
                                                    <span className="text-sm font-normal text-gray-500">({comments.length})</span>
                                                )}
                                            </h3>

                                            {/* Add comment form - IZMENJENO */}
                                            <form onSubmit={handleComment} className="flex gap-2 mb-4">
                                                {user ? (
                                                    <>
                                                        <Avatar username={user.username} size="sm" />
                                                        <div className="flex-1 relative">
                                                            <input
                                                                type="text"
                                                                value={newComment}
                                                                onChange={(e) => setNewComment(e.target.value)}
                                                                placeholder="Add a comment..."
                                                                className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:border-gray-500 focus:outline-none transition-all"
                                                            />
                                                            <button
                                                                type="submit"
                                                                disabled={!newComment.trim() || loadingComment}
                                                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-all ${sendButtonAnimation ? 'animate-send-pulse' : ''
                                                                    }`}
                                                            >
                                                                {loadingComment ? (
                                                                    <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                                                                ) : (
                                                                    <Send className={`w-4 h-4 ${sendButtonAnimation ? 'animate-send-fly' : ''}`} />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                onClose();
                                                                navigate('/auth');
                                                            }}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-full text-gray-500 hover:bg-gray-50 transition-all"
                                                        >
                                                            Log in to comment
                                                        </button>
                                                    </div>
                                                )}
                                            </form>

                                            {/* Comments list */}
                                            <div className="space-y-3 max-h-[430px] overflow-y-auto pr-2 pl-2 custom-scrollbar">
                                                {comments.length === 0 && (
                                                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                                                        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                        <p className="text-gray-500">
                                                            No comments yet. {user ? 'Be the first to comment!' : 'Log in to be the first to comment!'}
                                                        </p>
                                                    </div>
                                                )}

                                                {comments.map((comment, index) => (
                                                    <div
                                                        key={comment.id}
                                                        className={`
                relative bg-white border border-gray-100 rounded-xl p-4 
                hover:shadow-md transition-all duration-300 hover:border-gray-200
                ${newCommentId === comment.id
                                                                ? 'animate-comment-slide-in ring-2 ring-green-400 ring-opacity-50'
                                                                : index === 0 && !newCommentId
                                                                    ? 'animate-fadeIn'
                                                                    : ''
                                                            }
            `}
                                                        style={{
                                                            animationDelay: newCommentId === comment.id ? '0ms' : `${index * 50}ms`,
                                                            marginLeft: '8px',
                                                            marginRight: '8px'
                                                        }}
                                                    >
                                                        {/* Green glow for new comment */}
                                                        {newCommentId === comment.id && (
                                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-blue-400 rounded-xl opacity-30 blur animate-pulse" />
                                                        )}

                                                        <div className="relative flex gap-3">
                                                            <div
                                                                onClick={() => handleProfileClick(comment.userId)}
                                                                className="cursor-pointer flex-shrink-0"
                                                            >
                                                                {comment.user?.profileImage ? (
                                                                    <img
                                                                        src={comment.user.profileImage}
                                                                        alt={comment.user.username}
                                                                        className={`w-10 h-10 rounded-full hover:ring-2 hover:ring-gray-300 transition-all ${newCommentId === comment.id ? 'animate-avatar-pop ring-2 ring-green-400' : ''
                                                                            }`}
                                                                    />
                                                                ) : (
                                                                    <div className={`hover:scale-105 transition-transform ${newCommentId === comment.id ? 'animate-avatar-pop' : ''
                                                                        }`}>
                                                                        <Avatar username={comment.user?.username || 'U'} size="md" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className={`flex-1 min-w-0 ${newCommentId === comment.id ? 'animate-content-fade' : ''
                                                                }`}>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <p
                                                                        onClick={() => handleProfileClick(comment.userId)}
                                                                        className="font-semibold text-sm text-gray-900 hover:text-gray-700 cursor-pointer transition-colors"
                                                                    >
                                                                        {comment.user?.username}
                                                                    </p>
                                                                    <span className="text-gray-300">•</span>
                                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        <span>
                                                                            {newCommentId === comment.id ? (
                                                                                <span className="text-green-500 font-medium animate-pulse">Just now</span>
                                                                            ) : (
                                                                                formatCommentDate(comment.createdAt)
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                                                            </div>
                                                        </div>

                                                        {/* Decorative corner for new comments */}
                                                        {newCommentId === comment.id && (
                                                            <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-t-green-400 border-l-[20px] border-l-transparent animate-corner-fold" />
                                                        )}
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
            </div>

            {/* Custom CSS for animations */}
            <style>{`
                @keyframes float-up {
                    0% { transform: translateY(0) scale(0); opacity: 0; }
                    15% { transform: translateY(-20px) scale(1.2); opacity: 1; }
                    100% { transform: translateY(-150px) scale(0.3); opacity: 0; }
                }
                @keyframes heartbeat {
                    0%, 100% { transform: scale(1); }
                    25% { transform: scale(1.3); }
                    50% { transform: scale(1); }
                    75% { transform: scale(1.2); }
                }
                @keyframes bounce-once {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes pulse-scale {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.5); }
                }
                @keyframes ripple {
                    0% { transform: scale(0); opacity: 1; }
                    100% { transform: scale(4); opacity: 0; }
                }
                @keyframes slideDown {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                /* NOVE animacije za komentare */
                @keyframes send-pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }
                @keyframes send-fly {
                    0% { transform: translateX(0) rotate(0deg); }
                    50% { transform: translateX(3px) rotate(-15deg); }
                    100% { transform: translateX(0) rotate(0deg); }
                }
                @keyframes comment-slide-in {
                    0% { opacity: 0; transform: translateY(-20px) scale(0.95); }
                    50% { transform: translateY(5px) scale(1.02); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes avatar-pop {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
                @keyframes content-fade {
                    0% { opacity: 0; transform: translateX(-10px); }
                    100% { opacity: 1; transform: translateX(0); }
                }
                @keyframes highlight-bar {
                    0% { height: 0; opacity: 1; }
                    50% { height: 100%; opacity: 1; }
                    100% { height: 100%; opacity: 0; }
                }

@keyframes delete-shake {
    0%, 100% { transform: rotate(0deg) scale(1); }
    10% { transform: rotate(-1deg) scale(0.99); }
    20% { transform: rotate(1deg) scale(0.98); }
    30% { transform: rotate(-2deg) scale(0.97); }
    40% { transform: rotate(2deg) scale(0.96); }
    50% { transform: rotate(-3deg) scale(0.95); }
    60% { transform: rotate(3deg) scale(0.94); }
    70% { transform: rotate(-5deg) scale(0.92); opacity: 0.8; }
    80% { transform: rotate(5deg) scale(0.9); opacity: 0.6; }
    90% { transform: rotate(-8deg) scale(0.85); opacity: 0.3; }
    100% { transform: rotate(0deg) scale(0.5); opacity: 0; }
}

@keyframes burn-away {
    0% { 
        filter: brightness(1) contrast(1);
        transform: scale(1);
    }
    25% {
        filter: brightness(1.2) contrast(1.1) sepia(0.5);
    }
    50% {
        filter: brightness(1.5) contrast(1.3) sepia(1) hue-rotate(-20deg);
        transform: scale(1.05);
    }
    75% {
        filter: brightness(0.5) contrast(2) sepia(1) hue-rotate(-40deg);
        transform: scale(0.95);
        opacity: 0.5;
    }
    100% {
        filter: brightness(0) contrast(3) sepia(1) hue-rotate(-60deg);
        transform: scale(0.8);
        opacity: 0;
    }
}

@keyframes fire-up {
    0% {
        transform: translateY(100%);
        opacity: 0;
    }
    50% {
        opacity: 0.8;
    }
    100% {
        transform: translateY(0);
        opacity: 0;
    }
}

@keyframes flame {
    0%, 100% {
        transform: translateY(0) scale(1) rotate(-5deg);
        opacity: 0.8;
    }
    25% {
        transform: translateY(-20px) scale(1.2) rotate(5deg);
        opacity: 1;
    }
    50% {
        transform: translateY(-40px) scale(0.8) rotate(-3deg);
        opacity: 0.6;
    }
    75% {
        transform: translateY(-60px) scale(0.5) rotate(3deg);
        opacity: 0.3;
    }
    100% {
        transform: translateY(-80px) scale(0.2) rotate(0deg);
        opacity: 0;
    }
}

@keyframes corner-fold {
    0% {
        border-top-width: 0;
        border-left-width: 0;
    }
    100% {
        border-top-width: 20px;
        border-left-width: 20px;
    }
}

.animate-delete-shake {
    animation: delete-shake 0.8s ease-in-out forwards;
}

.animate-burn-away {
    animation: burn-away 0.8s ease-in-out forwards;
}

.animate-fire-up {
    animation: fire-up 0.8s ease-out forwards;
}

.animate-flame {
    animation: flame 1s ease-out infinite;
}

.animate-corner-fold {
    animation: corner-fold 0.3s ease-out forwards;
}

/* Dodajte ove animacije u style tag na kraju PinModal komponente */

@keyframes delete-shake {
    0% { transform: rotate(0deg) scale(1); opacity: 1; }
    10% { transform: rotate(-1deg) scale(0.99); }
    20% { transform: rotate(1deg) scale(0.98); }
    30% { transform: rotate(-2deg) scale(0.97); }
    40% { transform: rotate(2deg) scale(0.96); }
    50% { transform: rotate(-3deg) scale(0.95); }
    60% { transform: rotate(3deg) scale(0.94); }
    70% { transform: rotate(-5deg) scale(0.92); opacity: 0.8; }
    80% { transform: rotate(5deg) scale(0.9); opacity: 0.6; }
    90% { transform: rotate(-8deg) scale(0.85); opacity: 0.3; }
    100% { transform: rotate(0deg) scale(0.5); opacity: 0; }
}

@keyframes burn-away {
    0% { 
        filter: brightness(1) contrast(1);
        transform: scale(1);
    }
    25% {
        filter: brightness(1.2) contrast(1.1) sepia(0.5);
    }
    50% {
        filter: brightness(1.5) contrast(1.3) sepia(1) hue-rotate(-20deg);
        transform: scale(1.05);
    }
    75% {
        filter: brightness(0.5) contrast(2) sepia(1) hue-rotate(-40deg);
        transform: scale(0.95);
        opacity: 0.5;
    }
    100% {
        filter: brightness(0) contrast(3) sepia(1) hue-rotate(-60deg);
        transform: scale(0.8);
        opacity: 0;
    }
}

@keyframes fire-up {
    0% {
        transform: translateY(100%);
        opacity: 0;
    }
    50% {
        opacity: 0.8;
    }
    100% {
        transform: translateY(0);
        opacity: 0;
    }
}

@keyframes flame {
    0%, 100% {
        transform: translateY(0) scale(1) rotate(-5deg);
        opacity: 0.8;
    }
    25% {
        transform: translateY(-20px) scale(1.2) rotate(5deg);
        opacity: 1;
    }
    50% {
        transform: translateY(-40px) scale(0.8) rotate(-3deg);
        opacity: 0.6;
    }
    75% {
        transform: translateY(-60px) scale(0.5) rotate(3deg);
        opacity: 0.3;
    }
    100% {
        transform: translateY(-80px) scale(0.2) rotate(0deg);
        opacity: 0;
    }
}

/* Klase za animacije */
.animate-delete-shake {
    animation: delete-shake 0.8s ease-in-out forwards;
}

.animate-burn-away {
    animation: burn-away 0.8s ease-in-out forwards;
}

.animate-fire-up {
    animation: fire-up 0.8s ease-out forwards;
}

.animate-flame {
    animation: flame 1s ease-out infinite;
}

                .animate-float-up { animation: float-up 2s ease-out forwards; }
                .animate-heartbeat { animation: heartbeat 0.8s ease-in-out; }
                .animate-bounce-once { animation: bounce-once 0.5s ease-out; }
                .animate-pulse-scale { animation: pulse-scale 0.6s ease-out infinite; }
                .animate-ripple { animation: ripple 0.6s ease-out forwards; }
                .animate-slideDown { animation: slideDown 0.3s ease-out; }

                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }

                .animate-send-pulse { animation: send-pulse 0.3s ease-out; }
                .animate-send-fly { animation: send-fly 0.3s ease-out; }
                .animate-comment-slide-in { animation: comment-slide-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
                .animate-avatar-pop { animation: avatar-pop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
                .animate-content-fade { animation: content-fade 0.5s ease-out; }
                .animate-highlight-bar { animation: highlight-bar 1s ease-out forwards; }
            `}</style>
        </>
    );
};
