/**
 * MOZ Portal Design System - Main Export
 * 
 * Central export point for the design system providing easy access
 * to design tokens and component classes throughout the application.
 */

export { DesignTokens } from './design-tokens';
export { ComponentClasses } from './component-classes';

export type { 
  DesignTokensType, 
  ColorTokens, 
  SpacingTokens, 
  TypographyTokens 
} from './design-tokens';

export type { ComponentClassesType } from './component-classes';

// Convenience re-exports for commonly used items
export const { colors, spacing, typography, components } = DesignTokens;
export const { input, button, card, typography: typographyClasses, form, alert } = ComponentClasses;