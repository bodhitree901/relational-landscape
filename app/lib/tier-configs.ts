import { TierConfig } from '../components/ChipPool';
import { MENU_TIER_COLORS, MENU_TIER_LABELS } from './menu-categories';

// Same tiers for both My Menu and Connection flows
export const TIERS: TierConfig[] = [
  { id: 'must-have', label: MENU_TIER_LABELS['must-have'], color: MENU_TIER_COLORS['must-have'], side: 'right' },
  { id: 'open', label: MENU_TIER_LABELS['open'], color: MENU_TIER_COLORS['open'], side: 'top' },
  { id: 'maybe', label: MENU_TIER_LABELS['maybe'], color: MENU_TIER_COLORS['maybe'], side: 'left' },
  { id: 'off-limits', label: MENU_TIER_LABELS['off-limits'], color: MENU_TIER_COLORS['off-limits'], side: 'bottom' },
];

// Keep these aliases for backward compat with imports
export const CONNECTION_TIERS = TIERS;
export const MENU_TIERS = TIERS;
