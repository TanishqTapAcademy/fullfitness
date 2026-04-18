import React from 'react';
import * as LucideIcons from 'lucide-react-native';
import {
  BodyIcon,
  GymIcon,
  QuestionIcon,
  type IconProps,
} from './index';

// Aliases: old seed data names → Lucide PascalCase names
const ALIASES: Record<string, string> = {
  fire: 'Flame',
  bolt: 'Zap',
};

// Custom SVG icons that don't exist in Lucide
const CUSTOM_ICONS: Record<string, React.FC<IconProps>> = {
  body: BodyIcon,
  gym: GymIcon,
  question: QuestionIcon,
};

/**
 * Convert kebab-case icon name to PascalCase for Lucide lookup.
 * e.g. "arrow-up-down" → "ArrowUpDown", "flame" → "Flame"
 */
function kebabToPascal(name: string): string {
  return name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

/**
 * Look up an icon by name. Supports:
 * 1. Custom icons (body, gym, question)
 * 2. Aliases from old names (fire→Flame, bolt→Zap)
 * 3. Any Lucide icon by kebab-case name (flame, dumbbell, heart, trophy, etc.)
 */
export function getIcon(name: string): React.FC<any> | null {
  if (!name) return null;

  // Check custom icons first
  if (CUSTOM_ICONS[name]) return CUSTOM_ICONS[name];

  // Check aliases
  const aliased = ALIASES[name];
  if (aliased && (LucideIcons as any)[aliased]) {
    return (LucideIcons as any)[aliased];
  }

  // Direct Lucide lookup (convert kebab-case to PascalCase)
  const pascalName = kebabToPascal(name);
  if ((LucideIcons as any)[pascalName]) {
    return (LucideIcons as any)[pascalName];
  }

  return null;
}
