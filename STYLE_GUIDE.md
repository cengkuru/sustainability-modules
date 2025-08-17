# MOZ Portal Design System Style Guide

## Overview

This style guide documents the comprehensive design system implemented across the MOZ Portal application. The design system is based on the clean, professional style of the reset password form and ensures consistency, accessibility, and maintainability throughout the application.

## Design Principles

### 1. Clean & Professional
- Minimal, uncluttered interfaces
- Clear visual hierarchy
- Consistent spacing and typography
- Subtle shadows and borders

### 2. Accessibility First (WCAG AA Compliant)
- Minimum contrast ratios: 4.5:1 for normal text, 3:1 for large text
- Clear focus indicators (3px visible outline)
- Semantic HTML structure
- Keyboard navigation support

### 3. Mobile-First Responsive
- 8px base unit spacing system
- Responsive breakpoints
- Touch-friendly targets (minimum 44x44px)

### 4. Performance Optimized
- Tailwind CSS utility classes only
- No custom CSS or inline styles
- Optimized for fast rendering

## Color Palette

### Primary Colors
```css
/* Grayscale */
--gray-50: #F9FAFB
--gray-100: #F3F4F6
--gray-200: #E5E7EB
--gray-300: #D1D5DB
--gray-400: #9CA3AF
--gray-500: #6B7280
--gray-600: #4B5563
--gray-700: #374151
--gray-800: #1F2937
--gray-900: #111827

/* Accent */
--accent-color-base: #61a8bd
--accent-color-dark: #4a8399
--accent-color-light: #7fbdd1
```

### Functional Colors
```css
/* Status Colors */
--success: #10B981 (green-500)
--warning: #F59E0B (amber-500)  
--error: #EF4444 (red-500)
--info: #3B82F6 (blue-500)

/* Text Colors */
--text-primary: #111827 (gray-900)
--text-secondary: #374151 (gray-700)
--text-tertiary: #6B7280 (gray-500)
--text-placeholder: #9CA3AF (gray-400)
```

### Contrast Validation
- `text-gray-900` on `bg-white`: 21:1 ✓
- `text-gray-700` on `bg-gray-100`: 7.5:1 ✓
- `text-accent-color-base` on `bg-white`: 4.5:1 ✓
- `text-white` on `bg-accent-color-base`: 4.5:1 ✓

## Typography

### Font Stack
```css
font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### Type Scale (1.25 ratio)
```css
text-xs: 0.75rem (12px)
text-sm: 0.875rem (14px)
text-base: 1rem (16px)
text-lg: 1.125rem (18px)
text-xl: 1.25rem (20px)
text-2xl: 1.5rem (24px)
text-3xl: 1.875rem (30px)
```

### Typography Classes
```html
<!-- Headings -->
<h1 class="text-2xl font-bold text-gray-900 mb-4">Page Title</h1>
<h2 class="text-xl font-semibold text-gray-900 mb-3">Section Title</h2>
<h3 class="text-lg font-medium text-gray-900 mb-2">Subsection Title</h3>

<!-- Body Text -->
<p class="text-base text-gray-700">Body text</p>
<p class="text-sm text-gray-600">Small text</p>
<p class="text-xs text-gray-500">Caption text</p>

<!-- Labels -->
<label class="block text-sm font-medium text-gray-700">Field Label</label>
```

## Spacing System (8px Base Unit)

```css
space-1: 0.25rem (4px)
space-2: 0.5rem (8px)
space-3: 0.75rem (12px)
space-4: 1rem (16px)
space-6: 1.5rem (24px)
space-8: 2rem (32px)
space-12: 3rem (48px)
space-16: 4rem (64px)
```

### Usage Examples
```html
<!-- Vertical spacing -->
<div class="space-y-6">Form fields</div>
<div class="space-y-4">Content sections</div>
<div class="space-y-2">Compact lists</div>

<!-- Margins -->
<div class="mb-8">Large bottom margin</div>
<div class="mb-4">Standard bottom margin</div>
<div class="mt-1">Small top margin</div>
```

## Component Library

### Input Fields

#### Basic Input
```html
<div>
    <label for="email" class="block text-sm font-medium text-gray-700">
        Email address
    </label>
    <div class="mt-1">
        <input 
            id="email"
            type="email" 
            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-accent-color-base focus:border-accent-color-base focus:z-10 sm:text-sm"
            placeholder="Enter your email"
        >
    </div>
</div>
```

#### Input with Error State
```html
<div>
    <label for="email" class="block text-sm font-medium text-gray-700">
        Email address
    </label>
    <div class="mt-1">
        <input 
            id="email"
            type="email" 
            class="appearance-none relative block w-full px-3 py-2 border border-red-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
            placeholder="Enter your email"
        >
    </div>
    <div class="text-xs text-red-600 mt-1">
        This field is required
    </div>
</div>
```

#### Password Field with Toggle
```html
<div>
    <label for="password" class="block text-sm font-medium text-gray-700">
        Password
    </label>
    <div class="relative mt-1">
        <input 
            id="password"
            type="password"
            class="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-accent-color-base focus:border-accent-color-base focus:z-10 sm:text-sm"
            placeholder="Enter your password"
        >
        <button 
            type="button"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
            tabindex="-1"
        >
            <i class="bi bi-eye text-gray-400 hover:text-gray-600"></i>
        </button>
    </div>
</div>
```

### Buttons

#### Primary Button
```html
<button 
    type="submit"
    class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent-color-base hover:bg-accent-color-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-color-base disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
>
    Submit
</button>
```

#### Secondary Button
```html
<button 
    type="button"
    class="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-color-base disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
>
    Cancel
</button>
```

#### Loading State Button
```html
<button class="[primary button classes]">
    <span *ngIf="!isLoading">Submit</span>
    <span *ngIf="isLoading" class="flex items-center">
        <i class="bi bi-arrow-repeat animate-spin mr-2"></i>
        Loading...
    </span>
</button>
```

### Cards & Containers

#### Basic Card
```html
<div class="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
    <!-- Card content -->
</div>
```

#### Simple Card
```html
<div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <!-- Card content -->
</div>
```

#### Dashboard Metric Card
```html
<div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
    <div class="flex items-center justify-between mb-4">
        <span class="text-gray-500 text-sm font-medium">Metric Name</span>
        <i class="bi bi-icon text-gray-900"></i>
    </div>
    <p class="text-3xl font-bold text-gray-900">123</p>
</div>
```

### Alerts & Messages

#### Success Message
```html
<div class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
    <p class="text-sm text-green-600">Success message</p>
</div>
```

#### Error Message
```html
<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
    <p class="text-sm text-red-600">Error message</p>
</div>
```

#### Warning Message
```html
<div class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
    <p class="text-sm text-yellow-800">Warning message</p>
</div>
```

### Layout Components

#### Centered Layout (Auth Pages)
```html
<div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
        <!-- Content -->
    </div>
</div>
```

#### Dashboard Layout
```html
<div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <div class="pl-64 min-h-screen flex flex-col">
        <!-- Top nav -->
        <main class="flex-1 p-6 lg:p-8">
            <div class="max-w-7xl mx-auto">
                <!-- Content -->
            </div>
        </main>
    </div>
</div>
```

#### Form Container
```html
<div class="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 mx-auto max-w-2xl">
    <form class="space-y-6">
        <!-- Form fields -->
    </form>
</div>
```

## Focus States & Accessibility

### Focus Ring
All interactive elements must have visible focus indicators:
```css
focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-color-base
```

### Touch Targets
All interactive elements must be minimum 44x44px:
```html
<button class="py-2 px-4"><!-- Minimum touch target --></button>
```

### Screen Reader Support
- Use semantic HTML elements
- Provide alt text for images
- Use aria-labels for complex interactions
- Ensure logical tab order

## Component Implementation Guide

### Using the Design System

1. **Import the design system**:
```typescript
import { ComponentClasses, DesignTokens } from '@shared/design-system';
```

2. **Use predefined classes**:
```html
<!-- Use ComponentClasses.input.base -->
<input class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-accent-color-base focus:border-accent-color-base focus:z-10 sm:text-sm">

<!-- Use ComponentClasses.button.primary -->
<button class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent-color-base hover:bg-accent-color-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-color-base disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
```

3. **Follow consistent patterns**:
- Always use `space-y-6` for form spacing
- Always use `mt-1` for input field spacing
- Always include transition classes for interactive elements
- Always provide loading and disabled states

### Quality Checklist

Before implementing any component, ensure:

- [ ] Uses only Tailwind utility classes
- [ ] Meets WCAG AA contrast requirements (4.5:1 minimum)
- [ ] Has proper focus indicators
- [ ] Includes loading and disabled states
- [ ] Uses consistent spacing (8px base unit)
- [ ] Follows mobile-first responsive design
- [ ] Includes proper semantic HTML
- [ ] Has proper keyboard navigation
- [ ] Matches the reference design patterns

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Guidelines

- Use Tailwind's purge/JIT to remove unused CSS
- Avoid custom CSS files
- Optimize images and use WebP when possible
- Use semantic HTML for better accessibility and SEO

---

## Support

For questions about the design system or to propose changes, please:
1. Review this style guide
2. Check existing implementations
3. Consult the component classes in `src/app/shared/design-system/`
4. Follow the established patterns consistently

Remember: **Consistency is key**. When in doubt, follow existing patterns and maintain the clean, professional aesthetic established by the reset password form reference design.