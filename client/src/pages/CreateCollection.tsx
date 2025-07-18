import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CollectionRepository } from '../api/repositories/CollectionRepository';

export const CreateCollection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const collectionRepository = new CollectionRepository();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!user) {
      setError('You must be logged in to create a collection.');
      return;
    }

    if (!name || !category) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    const response = await collectionRepository.createCollection({
      name,
      description,
      category: category.toLowerCase(),
      userId: user.id
    });

    setLoading(false);

    if (response.success && response.data) {
      navigate(`/collection/${response.data.id}`);
    } else {
      setError(response.error || 'Failed to create collection.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-2xl border border-gray-200 animate-slideIn">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 text-center tracking-tight animate-fadeIn">
        Create Collection
      </h1>
      
      {error && (
        <div className="mb-4 text-red-600 bg-red-50 rounded-lg px-4 py-2 border border-red-200 font-semibold text-center">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-7">
        <div>
          <label className="block font-semibold text-gray-800 mb-2">
            Collection Name <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition duration-200"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="e.g. Summer Inspiration"
          />
        </div>
        
        <div>
          <label className="block font-semibold text-gray-800 mb-2">Description</label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition duration-200 resize-none"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="What's this collection about?"
          />
        </div>
        
        <div>
          <label className="block font-semibold text-gray-800 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition duration-200"
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
            placeholder="e.g. travel, fashion, recipes..."
          />
        </div>
        
        <button
          type="submit"
          className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-all text-lg tracking-wider shadow-sm"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Collection'}
        </button>
      </form>
    </div>
  );
};