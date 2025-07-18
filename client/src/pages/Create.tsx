import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ImageRepository } from '../api/repositories/ImageRepository';
import { CollectionRepository } from '../api/repositories/CollectionRepository';

export const Create: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const imageRepository = new ImageRepository();
  const collectionRepository = new CollectionRepository();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [collectionId, setCollectionId] = useState<number | undefined>(undefined);
  const [link, setLink] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchCollections = async () => {
      if (!user) return;
      const response = await collectionRepository.getUserCollections(user.id);
      if (response.success && response.data) {
        setCollections(response.data);
      }
    };
    fetchCollections();
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      setError('You must be logged in to create a pin.');
      return;
    }
    if (!title || !imageFile || !category) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category.toLowerCase());
    formData.append('link', link);
    formData.append('userId', user.id);
    if (collectionId) formData.append('collectionId', collectionId.toString());
    formData.append('image', imageFile);

    const response = await imageRepository.createImage(formData);
    setLoading(false);

    if (response.success && response.data) {
      navigate(`/pin/${response.data.id}`);
    } else {
      setError(response.error || 'Failed to create pin.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-2xl border border-gray-200 animate-slideIn">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 text-center tracking-tight animate-fadeIn">Create Pin</h1>
      {error && (
        <div className="mb-4 text-red-600 bg-red-50 rounded-lg px-4 py-2 border border-red-200 font-semibold text-center">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-7">
        <div>
          <label className="block font-semibold text-gray-800 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition duration-200"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="e.g. Cozy Living Room Decor"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-800 mb-2">Description</label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition duration-200 resize-none"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder="Write a short description..."
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-800 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition duration-200"
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
            placeholder="e.g. travel, recipes, fashion..."
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-800 mb-2">Collection</label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition duration-200"
            value={collectionId || ''}
            onChange={e => setCollectionId(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">None</option>
            {collections.map((col) => (
              <option key={col.id} value={col.id}>{col.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold text-gray-800 mb-2">External Link</label>
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition duration-200"
            value={link}
            onChange={e => setLink(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-800 mb-2">
            Image <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept="image/*"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition duration-200"
            onChange={handleImageChange}
            required
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-4 rounded-xl max-h-64 mx-auto shadow border border-gray-300"
            />
          )}
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-all text-lg tracking-wider shadow-sm"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Pin'}
        </button>
      </form>
    </div>
  );
};
