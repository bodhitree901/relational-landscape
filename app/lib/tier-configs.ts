import { TierConfig } from '../components/ChipPool';
import { MENU_TIER_COLORS, MENU_TIER_LABELS } from './menu-categories';

// Connection tiers (for mapping a specific person)
export const CONNECTION_TIERS: TierConfig[] = [
  { id: 'core', label: 'Core to the Connection', color: '#F4A89A', side: 'right' },
  { id: 'rhythm', label: 'Part of the Rhythm', color: '#89CFF0', side: 'top' },
  { id: 'sometimes', label: 'Happens Sometimes', color: '#F5D06E', side: 'bottom' },
  { id: 'potential', label: 'Potential to Emerge', color: '#C5A3CF', side: 'left' },
];

// Menu tiers (for personal preferences / "My Menu")
export const MENU_TIERS: TierConfig[] = [
  { id: 'must-have', label: MENU_TIER_LABELS['must-have'], color: MENU_TIER_COLORS['must-have'], side: 'right' },
  { id: 'open', label: MENU_TIER_LABELS['open'], color: MENU_TIER_COLORS['open'], side: 'top' },
  { id: 'maybe', label: MENU_TIER_LABELS['maybe'], color: MENU_TIER_COLORS['maybe'], side: 'bottom' },
  { id: 'off-limits', label: MENU_TIER_LABELS['off-limits'], color: MENU_TIER_COLORS['off-limits'], side: 'left' },
];
