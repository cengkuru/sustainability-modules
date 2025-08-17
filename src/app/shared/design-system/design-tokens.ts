/**
 * MOZ Portal Design System - Design Tokens
 * 
 * Central source of truth for all design values including colors, spacing,
 * typography, and other design constants used throughout the application.
 */

export const DesignTokens = {
  // Colors - Based on reset password form reference design
  colors: {
    // Grayscale palette
    white: '#FFFFFF',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    
    // Accent colors
    accent: {
      base: '#61a8bd',
      dark: '#4a8399',
      light: '#7fbdd1',
    },
    
    // Status colors
    status: {
      success: '#10B981', // green-500
      warning: '#F59E0B', // amber-500
      error: '#EF4444',   // red-500
      info: '#3B82F6',    // blue-500
    },
    
    // Functional colors
    text: {
      primary: '#111827',   // gray-900
      secondary: '#374151', // gray-700
      tertiary: '#6B7280',  // gray-500
      placeholder: '#9CA3AF', // gray-400
      inverse: '#FFFFFF',
    },
    
    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB', // gray-50
      tertiary: '#F3F4F6',  // gray-100
    },
    
    border: {
      primary: '#D1D5DB',   // gray-300
      secondary: '#E5E7EB', // gray-200
      focus: '#61a8bd',     // accent-base
    },
  },

  // Spacing - 8px base unit system
  spacing: {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem',  // 8px
    3: '0.75rem', // 12px
    4: '1rem',    // 16px
    5: '1.25rem', // 20px
    6: '1.5rem',  // 24px
    8: '2rem',    // 32px
    10: '2.5rem', // 40px
    12: '3rem',   // 48px
    16: '4rem',   // 64px
    20: '5rem',   // 80px
    24: '6rem',   // 96px
    32: '8rem',   // 128px
  },

  // Typography
  typography: {
    fontFamily: {
      primary: "'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      heading: "'SF Pro Display', 'Inter', system-ui, sans-serif",
      mono: "'Fira Code', 'Courier New', Courier, monospace",
    },
    
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
    
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
    },
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem', // 2px
    base: '0.25rem', // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    full: '9999px',
  },

  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    none: 'none',
  },

  // Focus ring
  focusRing: {
    width: '2px',
    color: 'rgba(97, 168, 189, 0.5)', // accent-base with opacity
    offset: '2px',
  },

  // Transitions
  transition: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
    },
    timing: {
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Component-specific tokens
  components: {
    button: {
      height: {
        sm: '2rem',    // 32px
        base: '2.5rem', // 40px
        lg: '3rem',     // 48px
      },
      padding: {
        sm: '0.5rem 0.75rem',
        base: '0.5rem 1rem',
        lg: '0.75rem 1.5rem',
      },
    },
    
    input: {
      height: '2.5rem', // 40px - consistent with buttons
      padding: '0.5rem 0.75rem',
    },
    
    card: {
      padding: '1.5rem', // 24px
      borderRadius: '0.5rem', // 8px
    },
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-index scale
  zIndex: {
    behind: '-1',
    auto: 'auto',
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    modal: '1000',
    popover: '1010',
    tooltip: '1020',
    toast: '1030',
  },
} as const;

// Type definitions for better TypeScript support
export type DesignTokensType = typeof DesignTokens;
export type ColorTokens = typeof DesignTokens.colors;
export type SpacingTokens = typeof DesignTokens.spacing;
export type TypographyTokens = typeof DesignTokens.typography;