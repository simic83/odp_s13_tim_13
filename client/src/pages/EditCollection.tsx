import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Folder, Save, X, Trash2, AlertCircle, ChevronLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { CollectionRepository } from '../api/repositories/CollectionRepository';
import { ImageRepository } from '../api/repositories/ImageRepository';
import { Collection } from '../Domain/models/Collection';
import { Image } from '../Domain/models/Image';
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

export const EditCollection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingImages, setDeletingImages] = useState<Set<number>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  const collectionRepository = new CollectionRepository();
  const imageRepository = new ImageRepository();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchCollection();
  }, [id, user]);

  useEffect(() => {
    if (collection) {
      const changed = 
        name !== collection.name ||
        description !== (collection.description || '') ||
        category !== collection.category ||
        images.length !== (collection.images?.length || 0);
      setHasChanges(changed);
    }
  }, [name, description, category, images, collection]);

  const fetchCollection = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Fetch collection details
      const collectionRes = await collectionRepository.getCollectionById(Number(id));
      if (!collectionRes.success || !collectionRes.data) {
        navigate('/404');
        return;
      }
      
      const collectionData = collectionRes.data;
      
      // Check ownership
      if (collectionData.userId !== user?.id) {
        navigate(`/collection/${id}`);
        return;
      }
      
      setCollection(collectionData);
      setName(collectionData.name);
      setDescription(collectionData.description || '');
      setCategory(collectionData.category);
      
      // Fetch images in collection
      const imagesRes = await imageRepository.getImagesByCollection(Number(id));
      if (imagesRes.success && imagesRes.data) {
        setImages(imagesRes.data);
      }
    } catch (err) {
      setError('Failed to load collection');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !category) {
      setError('Name and category are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await collectionRepository.updateCollection(Number(id!), {
        name: name.trim(),
        description: description.trim(),
        category
      });

      if (response.success) {
        // Animacija uspešnog čuvanja
        const saveBtn = document.getElementById('save-btn');
        saveBtn?.classList.add('animate-bounce');
        setTimeout(() => {
          navigate(`/collection/${id}`);
        }, 500);
      } else {
        setError(response.error || 'Failed to update collection');
        setSaving(false);
      }
    } catch (err) {
      setError('Failed to update collection');
      setSaving(false);
    }
  };

  const toggleImageSelection = (imageId: number) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const handleRemoveSelected = async () => {
  if (selectedImages.size === 0) return;

  setShowDeleteConfirm(false);
  const imagesToDelete = Array.from(selectedImages);
  
  // Pokreni animacije brisanja
  setDeletingImages(new Set(imagesToDelete));

  // Sačekaj animaciju
  setTimeout(async () => {
    try {
      // Pozovi API za svaku sliku
      const promises = imagesToDelete.map(imageId => 
        fetch(`/api/collections/${id}/images/${imageId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('pinterest_token')}`
          }
        })
      );

      await Promise.all(promises);

      // Ukloni iz lokalnog state-a
      setImages(prev => prev.filter(img => !selectedImages.has(img.id)));
      setSelectedImages(new Set());
      setDeletingImages(new Set());
      setHasChanges(true); // Označi da postoje promene
    } catch (err) {
      setError('Failed to remove some images');
      setDeletingImages(new Set());
    }
  }, 600);
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Collection not found</h2>
          <button
            onClick={() => navigate('/collections')}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
          >
            Browse Collections
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
          onClick={() => navigate(`/collection/${id}`)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Collection
        </button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Folder className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Collection</h1>
              <p className="text-gray-600 mt-1">Update your collection details and manage pins</p>
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
        {/* Left Column - Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-slideIn">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Collection Details</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block font-semibold text-gray-800 mb-2">
                Collection Name <span className="text-red-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-red-400 focus:ring-4 focus:ring-red-100 outline-none transition-all"
                placeholder="e.g. Summer Inspiration"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-red-400 focus:ring-4 focus:ring-red-100 outline-none transition-all resize-none"
                placeholder="What's this collection about?"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-red-400 focus:ring-4 focus:ring-red-100 outline-none transition-all"
              >
                <option value="" disabled>Choose a category...</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

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

        {/* Right Column - Images */}
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-slideIn animation-delay-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Pins in Collection ({images.length})
            </h2>
            
            {selectedImages.size > 0 && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove ({selectedImages.size})
              </button>
            )}
          </div>

          {images.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No pins in this collection yet</p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
              >
                Browse Pins
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {images.map((image) => (
                <div
                  key={image.id}
                  className={`relative group cursor-pointer transition-all duration-500 ${
                    deletingImages.has(image.id) ? 'animate-burn-away' : ''
                  }`}
                  onClick={() => toggleImageSelection(image.id)}
                >
                  <div className="relative overflow-hidden rounded-xl aspect-[3/4]">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    
                    {/* Overlay */}
                    <div className={`absolute inset-0 transition-all duration-300 ${
                      selectedImages.has(image.id)
                        ? 'bg-red-500/50'
                        : 'bg-black/0 group-hover:bg-black/40'
                    }`} />
                    
                    {/* Selection checkbox */}
                    <div className={`absolute top-3 right-3 transition-all duration-300 ${
                      selectedImages.has(image.id) || deletingImages.has(image.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      {deletingImages.has(image.id) ? (
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                          <Trash2 className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedImages.has(image.id)
                            ? 'bg-red-500 border-red-500'
                            : 'bg-white/20 backdrop-blur-sm border-white'
                        }`}>
                          {selectedImages.has(image.id) && (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-white text-sm font-medium truncate">{image.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slideUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Remove pins from collection?</h3>
                <p className="text-sm text-gray-600">This will remove {selectedImages.size} pin(s) from this collection</p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveSelected}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all transform hover:scale-105"
              >
                Remove Pins
              </button>
            </div>
          </div>
        </div>
      )}

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
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        @keyframes burn-away {
          0% { 
            transform: scale(1) rotate(0deg);
            opacity: 1;
            filter: brightness(1);
          }
          50% {
            transform: scale(0.95) rotate(-2deg);
            filter: brightness(1.5) contrast(1.5) hue-rotate(-20deg);
          }
          100% {
            transform: scale(0.8) rotate(-5deg) translateY(20px);
            opacity: 0;
            filter: brightness(0) contrast(2) hue-rotate(-40deg);
          }
        }
        
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideIn { animation: slideIn 0.4s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-burn-away { animation: burn-away 0.6s ease-in-out forwards; }
        .animation-delay-100 { animation-delay: 100ms; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>
    </div>
  );
};