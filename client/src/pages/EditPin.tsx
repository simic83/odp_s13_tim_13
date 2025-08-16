// client/src/pages/EditPin.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Save, X, AlertCircle, ChevronLeft, Link2, FileText, Folder, Tag } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ImageRepository } from '../api/repositories/ImageRepository';
import { CollectionRepository } from '../api/repositories/CollectionRepository';
import { Image } from '../Domain/models/Image';
import { Collection } from '../Domain/models/Collection';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const CATEGORIES = [
  { value: 'interior', label: 'Interior Design' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'recipes', label: 'Recipes' },
  { value: 'travel', label: 'Travel' },
  { value: 'art', label: 'Art' },
  { value: 'nature', label: 'Nature' },
  { value: 'technology', label: 'Technology' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'diy', label: 'DIY' },
  { value: 'photography', label: 'Photography' },
];

export const EditPin: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [image, setImage] = useState<Image | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [link, setLink] = useState('');
  const [collectionId, setCollectionId] = useState<number | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [activeField, setActiveField] = useState('');

  const imageRepository = new ImageRepository();
  const collectionRepository = new CollectionRepository();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchImageData();
  }, [id, user]);

  useEffect(() => {
    if (image) {
      const changed = 
        title !== image.title ||
        description !== (image.description || '') ||
        category !== image.category ||
        link !== (image.link || '') ||
        collectionId !== (image.collectionId || null);
      setHasChanges(changed);
    }
  }, [title, description, category, link, collectionId, image]);

  const fetchImageData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Fetch image details
      const imageRes = await imageRepository.getImageById(Number(id));
      if (!imageRes.success || !imageRes.data) {
        navigate('/404');
        return;
      }
      
      const imageData = imageRes.data;
      
      // Check ownership
      if (imageData.userId !== user?.id) {
        navigate('/');
        return;
      }
      
      setImage(imageData);
      setTitle(imageData.title);
      setDescription(imageData.description || '');
      setCategory(imageData.category);
      setLink(imageData.link || '');
      setCollectionId(imageData.collectionId || null);
      
      // Fetch user's collections
      const collectionsRes = await collectionRepository.getUserCollections(user.id);
      if (collectionsRes.success && collectionsRes.data) {
        setCollections(collectionsRes.data);
      }
    } catch (err) {
      setError('Failed to load pin details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !category) {
      setError('Title and category are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await imageRepository.updateImage(Number(id!), {
        title: title.trim(),
        description: description.trim(),
        category: category.toLowerCase(),
        link: link.trim(),
        collectionId: collectionId
      });

      if (response.success) {
        // Success animation
        const saveBtn = document.getElementById('save-btn');
        saveBtn?.classList.add('animate-bounce');
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideIn flex items-center gap-2';
        successMsg.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Pin updated successfully!
        `;
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
          successMsg.remove();
          navigate('/profile/' + user?.id);
        }, 1500);
      } else {
        setError(response.error || 'Failed to update pin');
        setSaving(false);
      }
    } catch (err) {
      setError('Failed to update pin');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!image) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pin not found</h2>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
          >
            Browse Pins
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8 animate-fadeIn">
        <button
          onClick={() => navigate('/profile/' + user?.id)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Profile
        </button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <ImageIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Pin</h1>
              <p className="text-gray-600 mt-1">Update your pin details</p>
            </div>
          </div>

          {hasChanges && (
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 rounded-full animate-slideIn">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-yellow-700 font-medium">Unsaved changes</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => setError('')}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Image Preview */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-slideIn">
          <div className="relative">
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-auto"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <div className="flex items-center gap-3 text-white">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span className="font-medium">{image.likes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span className="font-medium">{image.saves}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Image Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Uploaded</span>
                <span className="text-gray-700">{new Date(image.createdAt!).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Category</span>
                <span className="text-gray-700 capitalize">{image.category}</span>
              </div>
              {image.collectionId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Collection</span>
                  <span className="text-gray-700">
                    {collections.find(c => c.id === image.collectionId)?.name || 'Unknown'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-slideIn animation-delay-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Pin Details</h2>
          
          <div className="space-y-6">
            {/* Title Field */}
            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Title <span className="text-red-500">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => setActiveField('title')}
                onBlur={() => setActiveField('')}
                className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all ${
                  activeField === 'title' 
                    ? 'border-red-400 ring-4 ring-red-100' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Give your pin a title"
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={() => setActiveField('description')}
                onBlur={() => setActiveField('')}
                rows={3}
                className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all resize-none ${
                  activeField === 'description' 
                    ? 'border-red-400 ring-4 ring-red-100' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Tell everyone what your pin is about"
              />
            </div>

            {/* Category Field */}
            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                <Tag className="w-4 h-4 text-gray-500" />
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onFocus={() => setActiveField('category')}
                onBlur={() => setActiveField('')}
                className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 outline-none transition-all ${
                  activeField === 'category' 
                    ? 'border-red-400 ring-4 ring-red-100' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <option value="" disabled>Choose a category...</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Collection Field */}
            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                <Folder className="w-4 h-4 text-gray-500" />
                Collection
              </label>
              <select
                value={collectionId || ''}
                onChange={(e) => setCollectionId(e.target.value ? Number(e.target.value) : null)}
                onFocus={() => setActiveField('collection')}
                onBlur={() => setActiveField('')}
                className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 outline-none transition-all ${
                  activeField === 'collection' 
                    ? 'border-red-400 ring-4 ring-red-100' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <option value="">No collection</option>
                {collections.map(col => (
                  <option key={col.id} value={col.id}>{col.name}</option>
                ))}
              </select>
            </div>

            {/* Link Field */}
            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                <Link2 className="w-4 h-4 text-gray-500" />
                External Link
              </label>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                onFocus={() => setActiveField('link')}
                onBlur={() => setActiveField('')}
                className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all ${
                  activeField === 'link' 
                    ? 'border-red-400 ring-4 ring-red-100' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="https://example.com"
              />
            </div>

            {/* Save Button */}
            <button
              id="save-btn"
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className={`w-full py-3 rounded-xl font-semibold transition-all transform flex items-center justify-center gap-2 ${
                hasChanges
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:scale-105 shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideIn { animation: slideIn 0.4s ease-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animation-delay-100 { animation-delay: 100ms; }
      `}</style>
    </div>
  );
};