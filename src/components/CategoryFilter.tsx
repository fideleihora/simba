import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './CategoryFilter.css';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const { t } = useLanguage();

  return (
    <div className="category-filter-section">
      <div className="container">
        <h2 className="section-title">{t('shopByCategory')}</h2>
        <div className="category-list">
          <button
            className={`category-item ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => onSelectCategory(null)}
          >
            {t('allProducts')}
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={`category-item ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => onSelectCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
