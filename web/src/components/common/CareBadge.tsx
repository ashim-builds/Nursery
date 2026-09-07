import React from 'react';
import { Sun, Droplets, ShieldCheck, Wind, Sparkles } from 'lucide-react';
import { SunlightLevel, WateringFrequency } from '../../types/product';

interface CareBadgeProps {
  type: 'sunlight' | 'watering' | 'petFriendly' | 'airPurifying' | 'difficulty';
  value?: SunlightLevel | WateringFrequency | string | boolean;
  size?: 'sm' | 'md';
}

export const CareBadge: React.FC<CareBadgeProps> = ({ type, value, size = 'sm' }) => {
  const isSmall = size === 'sm';
  const sizeClasses = isSmall ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  const iconSize = isSmall ? 13 : 16;

  if (type === 'sunlight' && value) {
    const labels: Record<string, string> = {
      FULL_SUN: 'Full Sun',
      BRIGHT_INDIRECT: 'Bright Light',
      MEDIUM_LIGHT: 'Medium Light',
      LOW_LIGHT: 'Low Light',
    };
    return (
      <span className={`inline-flex items-center gap-1 font-medium bg-amber-50 text-amber-800 border border-amber-200/60 rounded-full ${sizeClasses}`}>
        <Sun size={iconSize} className="text-amber-600" />
        {labels[value as string] || value}
      </span>
    );
  }

  if (type === 'watering' && value) {
    const labels: Record<string, string> = {
      DAILY: 'Daily Water',
      WEEKLY_TWICE: '2x / Week',
      WEEKLY_ONCE: '1x / Week',
      BIWEEKLY: 'Every 2 Wks',
      WHEN_DRY: 'When Dry',
    };
    return (
      <span className={`inline-flex items-center gap-1 font-medium bg-sky-50 text-sky-800 border border-sky-200/60 rounded-full ${sizeClasses}`}>
        <Droplets size={iconSize} className="text-sky-600" />
        {labels[value as string] || value}
      </span>
    );
  }

  if (type === 'petFriendly') {
    return value ? (
      <span className={`inline-flex items-center gap-1 font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-full ${sizeClasses}`}>
        <ShieldCheck size={iconSize} className="text-emerald-600" />
        Pet Safe
      </span>
    ) : null;
  }

  if (type === 'airPurifying' && value) {
    return (
      <span className={`inline-flex items-center gap-1 font-medium bg-teal-50 text-teal-800 border border-teal-200/60 rounded-full ${sizeClasses}`}>
        <Wind size={iconSize} className="text-teal-600" />
        Air Purifier
      </span>
    );
  }

  if (type === 'difficulty' && value) {
    return (
      <span className={`inline-flex items-center gap-1 font-medium bg-forest-50 text-forest-800 border border-forest-200/60 rounded-full ${sizeClasses}`}>
        <Sparkles size={iconSize} className="text-forest-600" />
        {value === 'EASY' ? 'Easy Care' : value === 'MODERATE' ? 'Moderate' : 'Experienced'}
      </span>
    );
  }

  return null;
};
