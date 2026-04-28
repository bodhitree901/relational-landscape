import { Category } from './types';
import { MENU_CATEGORIES } from './menu-categories';

// Connection categories now match My Menu categories exactly
export const DEFAULT_CATEGORIES: Category[] = MENU_CATEGORIES.map((mc) => ({
  id: mc.id,
  name: mc.name,
  color: mc.color,
  watercolorClass: mc.watercolorClass,
  subcategories: mc.items,
}));
