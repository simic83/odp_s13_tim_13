import React from 'react';

interface CategoryFilterProps {
  selectedCategory?: string;
  onCategoryChange: (category?: string) => void;
  className?: string;
}

const categories: { value: string; label: string }[] = [
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

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  className = '',
}) => {
  const current = selectedCategory ? selectedCategory.toLowerCase() : undefined;
  return (
    <div className={`flex gap-2 overflow-x-auto pb-2 ${className}`}>
      <button
        onClick={() => onCategoryChange(undefined)}
        className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 ${
          !current
            ? 'bg-gray-900 text-white shadow-lg transform scale-105'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All
      </button>
      {categories.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onCategoryChange(value.toLowerCase())}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 ${
            current === value.toLowerCase()
              ? 'bg-gray-900 text-white shadow-lg transform scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
