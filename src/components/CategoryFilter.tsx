'use client'

import React from 'react'
import { Music, Theater, PartyPopper, Frame, Wrench, Trophy, Presentation, Film, Baby, Utensils, Palette, Grid, GraduationCap } from 'lucide-react'

interface Category {
  id: number
  name: string
  displayName: string
  color: string
  icon: string
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

const iconMap: { [key: string]: React.ComponentType<any> } = {
  grid: Grid,
  music: Music,
  mask: Theater,
  party: PartyPopper,
  frame: Frame,
  tools: Wrench,
  trophy: Trophy,
  presentation: Presentation,
  film: Film,
  baby: Baby,
  utensils: Utensils,
  palette: Palette,
  education: GraduationCap,
}

const CategoryFilter = React.memo(({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const allCategory = { id: 0, name: 'all', displayName: 'Tümü', color: '#6B7280', icon: 'grid' }
  const allCategories = [allCategory, ...categories]

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {allCategories.map((category) => {
        const isSelected = selectedCategory === category.name
        const IconComponent = iconMap[category.icon] || Grid

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.name)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200
              ${isSelected 
                ? 'text-white shadow-lg transform scale-105' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            style={{
              backgroundColor: isSelected ? category.color : undefined,
            }}
          >
            <IconComponent className="w-4 h-4" />
            {category.name === 'university' ? (
              <div className="text-sm font-medium text-center leading-tight flex flex-col">
                <div>Trakya Üni</div>
                <div>Etkinlikleri</div>
              </div>
            ) : (
              <div className="text-sm font-medium">{category.displayName}</div>
            )}
          </button>
        )
      })}
    </div>
  )
})

CategoryFilter.displayName = 'CategoryFilter'

export default CategoryFilter