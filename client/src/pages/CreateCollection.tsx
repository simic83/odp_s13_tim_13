import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CollectionRepository } from '../api/repositories/CollectionRepository';

// Usklađene kategorije (isto kao u CategoryFilter)
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

export const CreateCollection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const collectionRepository = new CollectionRepository();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(''); // dropdown value
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (!user) {
      setError('You must be logged in to create a collection.');
      return;
    }

    if (!name.trim() || !category.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    const response = await collectionRepository.createCollection({
      name: name.trim(),
      description: description.trim(),
      category: category.trim().toLowerCase(),
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

        {/* Category kao dropdown */}
        <div>
          <label className="block font-semibold text-gray-800 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition duration-200"
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
          >
            <option value="" disabled>Choose a category…</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Crveno outline→fill dugme (isti stil kao Create Pin/LoginForm) */}
        {/* Crveno outline→fill dugme (punjenje iz sredine ka levo/desno) */}
        <button
          type="submit"
          disabled={loading}
          className="
    w-full relative overflow-hidden border-2 border-red-500 bg-transparent text-red-500 py-3 rounded-lg font-semibold
    transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group
  "
        >
          <span
            className="
      absolute left-0 top-0 w-full h-full bg-red-500 scale-x-0 origin-center
      transition-transform duration-300 group-hover:scale-x-100 z-0
    "
          ></span>
          <span
            className="
      relative z-10 transition-colors duration-300 group-hover:text-white w-full flex justify-center
    "
          >
            {loading ? 'Creating...' : 'Create Collection'}
          </span>
        </button>

      </form>
    </div>
  );
};
