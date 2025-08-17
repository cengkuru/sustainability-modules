/**
 * MOZ Portal Design System - Component Classes
 * 
 * Reusable Tailwind CSS class combinations for consistent component styling
 * based on the reset password form reference design.
 */

export const ComponentClasses = {
  // Input field classes - based on reset password form
  input: {
    base: 'appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-accent-color-base focus:border-accent-color-base focus:z-10 sm:text-sm',
    withIcon: 'appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-accent-color-base focus:border-accent-color-base focus:z-10 sm:text-sm',
    error: 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500',
    success: 'border-green-300 text-green-900 placeholder-green-300 focus:ring-green-500 focus:border-green-500',
    disabled: 'bg-gray-50 text-gray-500 cursor-not-allowed',
  },

  // Button classes - based on reset password form  
  button: {
    primary: 'group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent-color-base hover:bg-accent-color-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-color-base disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors',
    secondary: 'group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-color-base disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors',
    tertiary: 'group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-accent-color-base bg-transparent hover:bg-accent-color-base hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-color-base disabled:text-gray-400 disabled:cursor-not-allowed transition-colors',
    danger: 'group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors',
    
    // Size variants
    small: 'py-1 px-3 text-xs',
    medium: 'py-2 px-4 text-sm', // default
    large: 'py-3 px-6 text-base',
    
    // Width variants
    auto: 'w-auto',
    full: 'w-full',
    
    // Icon button variants
    iconOnly: 'p-2 flex items-center justify-center',
    iconLeft: 'flex items-center space-x-2',
    iconRight: 'flex items-center space-x-2 flex-row-reverse space-x-reverse',
  },

  // Card/Container classes - based on reset password form
  card: {
    base: 'bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10',
    simple: 'bg-white p-6 rounded-lg shadow-sm border border-gray-200',
    flat: 'bg-white p-6 border border-gray-200 rounded-md',
    elevated: 'bg-white p-8 rounded-xl shadow-xl border border-gray-100',
    
    // Content sections
    header: 'mb-6',
    body: 'space-y-4',
    footer: 'mt-6 pt-6 border-t border-gray-200',
  },

  // Typography classes
  typography: {
    // Headings
    h1: 'text-2xl font-bold text-gray-900 mb-4 md:text-3xl',
    h2: 'text-xl font-semibold text-gray-900 mb-3 md:text-2xl',
    h3: 'text-lg font-medium text-gray-900 mb-2 md:text-xl',
    h4: 'text-base font-medium text-gray-900 mb-2 md:text-lg',
    h5: 'text-sm font-medium text-gray-900 mb-2 md:text-base',
    h6: 'text-sm font-medium text-gray-900 mb-1',
    
    // Body text
    body: 'text-base text-gray-700',
    bodySmall: 'text-sm text-gray-600',
    caption: 'text-xs text-gray-500',
    
    // Labels
    label: 'block text-sm font-medium text-gray-700',
    labelRequired: 'block text-sm font-medium text-gray-700 after:content-["*"] after:text-red-500 after:ml-1',
    
    // Links
    link: 'text-accent-color-base hover:text-accent-color-dark underline transition-colors',
    linkSubtle: 'text-gray-600 hover:text-gray-900 transition-colors',
  },

  // Form classes
  form: {
    container: 'space-y-6',
    group: 'space-y-1',
    row: 'grid grid-cols-1 gap-4 sm:grid-cols-2',
    
    // Field containers
    field: 'space-y-1',
    fieldWithIcon: 'relative',
    
    // Helper text
    helpText: 'text-xs text-gray-500 mt-1',
    errorText: 'text-xs text-red-600 mt-1',
    successText: 'text-xs text-green-600 mt-1',
  },

  // Alert/Message classes
  alert: {
    base: 'p-3 rounded-md border',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    
    // With icons
    withIcon: 'flex items-start space-x-3',
    icon: 'flex-shrink-0 w-5 h-5 mt-0.5',
    content: 'flex-1',
  },

  // Layout classes
  layout: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    containerSmall: 'max-w-md mx-auto px-4',
    containerMedium: 'max-w-2xl mx-auto px-4',
    
    // Centered layouts
    centerScreen: 'min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8',
    centerContent: 'flex items-center justify-center',
    
    // Grid layouts
    grid: 'grid gap-6',
    gridCols1: 'grid-cols-1',
    gridCols2: 'grid-cols-1 md:grid-cols-2',
    gridCols3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    gridCols4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  },

  // Loading states
  loading: {
    spinner: 'animate-spin h-5 w-5',
    pulse: 'animate-pulse bg-gray-200 rounded',
    skeleton: 'animate-pulse bg-gray-200 rounded h-4',
    skeletonLine: 'animate-pulse bg-gray-200 rounded h-4 w-3/4',
    skeletonCircle: 'animate-pulse bg-gray-200 rounded-full',
  },

  // Focus states
  focus: {
    ring: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-color-base',
    ringDanger: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500',
    ringSuccess: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500',
  },

  // Interactive states
  interactive: {
    hover: 'hover:bg-gray-50 transition-colors',
    hoverAccent: 'hover:bg-accent-color-base hover:text-white transition-colors',
    active: 'active:bg-gray-100',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
  },

  // Utility classes
  utility: {
    // Spacing
    spacingY: 'space-y-4',
    spacingYSmall: 'space-y-2',
    spacingYLarge: 'space-y-6',
    
    // Flex utilities
    flexCenter: 'flex items-center justify-center',
    flexBetween: 'flex items-center justify-between',
    flexStart: 'flex items-center justify-start',
    flexEnd: 'flex items-center justify-end',
    
    // Responsive utilities
    hiddenMobile: 'hidden sm:block',
    hiddenDesktop: 'block sm:hidden',
    
    // Transitions
    transition: 'transition-colors duration-200 ease-in-out',
    transitionAll: 'transition-all duration-200 ease-in-out',
  },

  // Password field specific (from reset password form)
  passwordField: {
    container: 'relative',
    input: 'appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-accent-color-base focus:border-accent-color-base focus:z-10 sm:text-sm',
    toggleButton: 'absolute inset-y-0 right-0 pr-3 flex items-center',
    toggleIcon: 'bi text-gray-400 hover:text-gray-600',
  },

  // Password requirements (from reset password form)
  passwordRequirements: {
    container: 'text-xs text-gray-600',
    title: 'font-medium mb-1',
    list: 'space-y-1',
    requirement: 'flex items-center space-x-2',
    requirementMet: 'text-green-600',
    requirementUnmet: 'text-gray-600',
    icon: 'bi w-3 h-3',
    iconMet: 'bi-check-circle-fill text-green-600',
    iconUnmet: 'bi-circle text-gray-400',
  },
} as const;

// Type definition for TypeScript support
export type ComponentClassesType = typeof ComponentClasses;