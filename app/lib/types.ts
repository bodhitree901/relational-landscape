export type Tier = 'potential' | 'sometimes' | 'rhythm' | 'core';

export const TIER_LABELS: Record<Tier, string> = {
  potential: 'Potential to Emerge',
  sometimes: 'Happens Sometimes',
  rhythm: 'Part of the Rhythm',
  core: 'Core to the Connection',
};

export const TIER_ORDER: Tier[] = ['potential', 'sometimes', 'rhythm', 'core'];

export interface SubcategoryRating {
  subcategory: string;
  tier: Tier;
}

export interface CategoryRatings {
  categoryId: string;
  ratings: SubcategoryRating[];
}

export interface TimeRhythm {
  communication: string[];
  inPerson: string[];
  custom: string[];
}

export interface Connection {
  id: string;
  name: string;
  emoji: string;
  createdAt: string;
  updatedAt: string;
  categories: CategoryRatings[];
  timeRhythm: TimeRhythm;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  watercolorClass: string;
  subcategories: string[];
}
