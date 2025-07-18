import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ImageRepository } from '../api/repositories/ImageRepository';
import { CommentRepository } from '../api/repositories/CommentRepository';

export const PinDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const imageRepository = new ImageRepository();
  const commentRepository = new CommentRepository();
  const navigate = useNavigate();

  const [image, setImage] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const imgRes = await imageRepository.getImageById(Number(id));
      if (imgRes.success && imgRes.data) {
        setImage(imgRes.data);
      } else {
        setError('Pin not found.');
        setLoading(false);
        return;
      }

      const comRes = await commentRepository.getCommentsByImage(Number(id));
      if (comRes.success && comRes.data) {
        setComments(comRes.data);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleLike = async () => {
    if (!user || !image) return;
    if (image.isLiked) {
      await imageRepository.unlikeImage(image.id);
      setImage({ ...image, isLiked: false, likes: image.likes - 1 });
    } else {
      await imageRepository.likeImage(image.id);
      setImage({ ...image, isLiked: true, likes: image.likes + 1 });
    }
  };

  const handleSave = async () => {
    if (!user || !image) return;
    // Dodaj modal za biranje kolekcije ako imaš kasnije, za sada alert
    alert('Select a collection to save this pin');
  };

  const handleDelete = async () => {
    if (!user || !image) return;
    if (window.confirm('Are you sure you want to delete this pin?')) {
      const res = await imageRepository.deleteImage(image.id);
      if (res.success) {
        navigate('/');
      } else {
        alert('Failed to delete pin.');
      }
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !image || !commentText.trim()) return;
    setCommentLoading(true);
    const res = await commentRepository.createComment({
      content: commentText,
      userId: user.id,
      imageId: image.id,
    });
    setCommentLoading(false);
    if (res.success && res.data) {
      setComments([res.data, ...comments]);
      setCommentText('');
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[60vh]">
        <span className="text-lg text-gray-600">Loading...</span>
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className="w-full flex justify-center items-center min-h-[60vh] text-red-600">
        {error || 'Pin not found.'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white rounded-2xl shadow-lg overflow-hidden animate-slideIn">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2 bg-gray-100 flex items-center justify-center">
          <img
            src={image.url}
            alt={image.title}
            className="max-h-[500px] w-auto rounded-2xl m-8"
          />
        </div>
        <div className="md:w-1/2 p-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{image.title}</h1>
            {user && user.id === image.userId && (
              <button
                onClick={handleDelete}
                className="ml-3 px-3 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
              >
                Delete
              </button>
            )}
          </div>
          <p className="text-gray-700">{image.description}</p>
          <div className="flex gap-3 items-center">
            <button
              onClick={handleLike}
              className={`px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-2 ${
                image.isLiked
                  ? 'bg-red-500 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
              {image.likes}
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-2 ${
                image.isSaved
                  ? 'bg-green-500 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M5 5v14l7-7 7 7V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
              </svg>
              Save
            </button>
            {image.link && (
              <a
                href={image.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all"
              >
                Visit Link
              </a>
            )}
          </div>
          <div className="flex items-center gap-3 mt-4">
            <img
              src={image.user?.profileImage || '/default-avatar.png'}
              alt={image.user?.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold">{image.user?.username}</div>
              {image.category && (
                <div className="text-xs text-gray-500 capitalize">{image.category}</div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Comments section */}
      <div className="px-8 pb-8 mt-4">
        <h2 className="text-xl font-bold mb-2">Comments</h2>
        {user && (
          <form onSubmit={handleComment} className="flex items-center gap-2 mb-4">
            <input
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-red-400 focus:outline-none"
              placeholder="Write a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              disabled={commentLoading}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all"
              disabled={commentLoading}
            >
              {commentLoading ? 'Posting...' : 'Post'}
            </button>
          </form>
        )}
        <div className="space-y-4">
          {comments.length === 0 && (
            <div className="text-gray-400">No comments yet.</div>
          )}
          {comments.map(comment => (
            <div key={comment.id} className="flex items-start gap-3">
              <img
                src={comment.user?.profileImage || '/default-avatar.png'}
                alt={comment.user?.username}
                className="w-8 h-8 rounded-full object-cover mt-1"
              />
              <div>
                <div className="font-semibold">{comment.user?.username}</div>
                <div className="text-gray-700">{comment.content}</div>
                <div className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
