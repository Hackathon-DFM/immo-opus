# IMMO UI Style Guide

## Design System Overview

IMMO uses a GTX-inspired design system with pure black dark mode, optimized typography, and smooth animations. This guide covers all UI standards and patterns.

## Color Palette

### Light Mode
```css
/* Backgrounds */
bg-white                /* Primary background */
bg-gray-50              /* Secondary background */
bg-gray-100             /* Elevated elements */

/* Text */
text-gray-900           /* Primary text */
text-gray-700           /* Secondary text */
text-gray-600           /* Muted text */
text-gray-500           /* Disabled text */

/* Borders */
border-gray-200         /* Primary borders */
border-gray-300         /* Input borders */
```

### Dark Mode (Pure Black)
```css
/* Backgrounds - Pure Black Hierarchy */
dark:bg-black           /* Main background (#000000) */
dark:bg-gray-900        /* Card backgrounds (#111827) */
dark:bg-gray-800        /* Elevated elements (#1f2937) */
dark:bg-gray-700        /* Input backgrounds (#374151) */

/* Text */
dark:text-white         /* Primary text */
dark:text-gray-100      /* High contrast text */
dark:text-gray-300      /* Secondary text */
dark:text-gray-400      /* Muted text */
dark:text-gray-500      /* Disabled text */

/* Borders */
dark:border-gray-800    /* Primary borders */
dark:border-gray-700    /* Secondary borders */
dark:border-gray-600    /* Hover borders */
```

### Brand Colors (Blue Theme)
```css
/* Primary Blue */
blue-50: #eff6ff        /* Light backgrounds */
blue-100: #dbeafe       /* Hover states light */
blue-200: #bfdbfe       /* Borders light */
blue-400: #60a5fa       /* Links, secondary */
blue-500: #3b82f6       /* Primary brand color */
blue-600: #2563eb       /* Primary buttons */
blue-700: #1d4ed8       /* Hover states */

/* Status Colors */
green-600/green-400     /* Success */
yellow-600/yellow-400   /* Warning */
red-600/red-400         /* Error */
purple-600/purple-400   /* Special states */
```

## Typography

### Font Stack
```css
/* Primary UI Font */
font-family: 'Montserrat', sans-serif;

/* Accent Font (Logo, Special Headers) */
font-family: 'Permanent Marker', cursive;

/* Code/Technical Content */
font-family: 'Geist Mono', monospace;
```

### Font Weights
```css
/* Optimized for Pure Black Backgrounds */
font-bold       (700)   /* Main headings */
font-semibold   (600)   /* Sub-headings, important buttons */
font-medium     (500)   /* DEFAULT body text, labels, buttons */
font-normal     (400)   /* Muted text only (with larger size) */
```

### Font Smoothing
Applied globally for better readability:
```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

## Animation System

### Core Animations

#### 1. Fade In Scale (Dashboard Cards)
```css
@keyframes fade-in-scale-center {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in-scale-center {
  animation: fade-in-scale-center 0.2s ease-out;
  animation-fill-mode: backwards; /* Prevents flash before animation */
  transform-origin: center center;
}
```

#### 2. Modal Animations
```css
/* Backdrop fade */
.animate-fade-in-backdrop {
  animation: fade-in-backdrop 0.2s ease-out;
}

/* Modal scale */
.animate-fade-in-scale {
  animation: fade-in-scale 0.3s ease-out;
  animation-fill-mode: backwards;
}
```

#### 3. Loading Shimmer
```css
.animate-shimmer-slide {
  animation: shimmer-slide var(--speed, 2s) ease-in-out infinite alternate;
}
```

#### 4. Gradient Animation
```css
.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 8s ease infinite;
}
```

### Animation Guidelines
- **No staggered delays** - All elements appear instantly
- **Fast animations** - 200-300ms max duration
- **Smooth easing** - Use `ease-out` for most animations
- **Fill mode backwards** - Prevents content flash
- **Scale from center** - More stable than translate animations

## Component Patterns

### Layout Structure
```tsx
/* Main Layout */
<div className="min-h-screen bg-gray-50 dark:bg-black">
  <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
    {/* Navigation */}
  </nav>
  <main className="bg-gray-50 dark:bg-black">
    {/* Content */}
  </main>
</div>
```

### Cards
```tsx
<div className="
  bg-white dark:bg-gray-900 
  border border-gray-200 dark:border-gray-800 
  rounded-lg shadow-sm 
  p-6 
  transition-all duration-300 
  hover:shadow-lg 
  animate-fade-in-scale-center
">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
    Card Title
  </h3>
  <p className="text-gray-600 dark:text-gray-300 font-medium">
    Card content with optimized font weight
  </p>
</div>
```

### Buttons

#### Primary Button
```tsx
<button className="
  px-4 py-2 
  bg-blue-600 hover:bg-blue-700 
  dark:bg-blue-500 dark:hover:bg-blue-600 
  text-white font-medium 
  rounded-md 
  transition-all duration-300 
  hover:scale-105
">
  Primary Action
</button>
```

#### Secondary Button
```tsx
<button className="
  px-4 py-2 
  bg-gray-100 hover:bg-gray-200 
  dark:bg-gray-800 dark:hover:bg-gray-700 
  text-gray-900 dark:text-white 
  font-medium 
  rounded-md 
  transition-colors duration-300
">
  Secondary Action
</button>
```

### Form Inputs
```tsx
<input 
  type="text"
  className="
    w-full px-3 py-2 
    bg-white dark:bg-gray-800 
    border border-gray-300 dark:border-gray-700 
    rounded-md 
    text-gray-900 dark:text-white 
    placeholder-gray-500 dark:placeholder-gray-400 
    focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
    focus:border-blue-500 dark:focus:border-blue-400 
    transition-colors
  "
  placeholder="Enter value"
/>
```

### Tables
```tsx
<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
  <thead className="bg-gray-50 dark:bg-gray-800">
    <tr>
      <th className="
        px-6 py-3 
        text-left text-xs font-medium 
        text-gray-500 dark:text-gray-400 
        uppercase tracking-wider
      ">
        Header
      </th>
    </tr>
  </thead>
  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 animate-fade-in-scale-center">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
        Content
      </td>
    </tr>
  </tbody>
</table>
```

### Modals
```tsx
/* Backdrop */
<div className="
  fixed inset-0 
  bg-black bg-opacity-50 
  flex items-center justify-center 
  p-4 z-50 
  animate-fade-in-backdrop
">
  /* Modal Content */
  <div className="
    bg-white dark:bg-gray-900 
    rounded-lg 
    max-w-md w-full 
    p-6 
    animate-fade-in-scale
  ">
    {/* Modal content */}
  </div>
</div>
```

### Status Badges
```tsx
/* Success */
<span className="
  px-2 py-1 
  text-xs font-medium 
  bg-green-100 dark:bg-green-900/50 
  text-green-800 dark:text-green-400 
  rounded-full
">
  Active
</span>

/* Warning */
<span className="
  px-2 py-1 
  text-xs font-medium 
  bg-yellow-100 dark:bg-yellow-900/50 
  text-yellow-800 dark:text-yellow-400 
  rounded-full
">
  Pending
</span>
```

## Special Effects

### IMMO Logo
```tsx
<span className="
  font-permanent-marker 
  bg-gradient-to-r from-blue-500 to-cyan-500 
  bg-clip-text text-transparent 
  animate-gradient
">
  IMMO
</span>
```

### Loading States
```tsx
<div className="bg-gray-200 dark:bg-gray-800 rounded overflow-hidden relative">
  <div className="
    absolute inset-0 
    -translate-x-full 
    animate-shimmer-slide 
    bg-gradient-to-r 
    from-transparent 
    via-white/20 dark:via-white/10 
    to-transparent
  "></div>
</div>
```

## Responsive Design

### Breakpoints
- Mobile: < 640px (default)
- Tablet: sm: 640px+
- Desktop: md: 768px+
- Large: lg: 1024px+

### Mobile-First Approach
```tsx
<div className="
  text-sm sm:text-base
  p-4 sm:p-6
  grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4
">
```

## Accessibility

### Focus States
All interactive elements must have visible focus indicators:
```css
focus:ring-2 focus:ring-blue-500 focus:outline-none
```

### Color Contrast
- Maintain WCAG AA standards
- Test all text against backgrounds
- Never rely on color alone for information

### Keyboard Navigation
- All interactive elements accessible via Tab
- Escape key closes modals
- Enter/Space activate buttons

## Performance

### Animation Performance
- Use CSS transforms over position changes
- Prefer `opacity` and `transform` for animations
- Use `will-change` sparingly
- Keep animations under 300ms

### Image Optimization
- Use Next.js Image component
- Provide proper width/height
- Use appropriate formats (WebP when possible)

## Theme Integration

### RainbowKit
```tsx
theme={isDark ? darkTheme({
  accentColor: '#3b82f6',
  accentColorForeground: 'white',
}) : lightTheme({
  accentColor: '#3b82f6',
  accentColorForeground: 'white',
})}
```

### Chart Colors
```tsx
const chartColors = {
  primary: '#3b82f6',
  grid: isDark ? '#374151' : '#E5E7EB',
  text: isDark ? '#9CA3AF' : '#6B7280',
  background: isDark ? '#1f2937' : 'white',
};
```

## Best Practices

1. **Consistency**: Use the same patterns throughout the app
2. **Performance**: Keep bundle size small, optimize animations
3. **Accessibility**: Always test with keyboard and screen readers
4. **Maintainability**: Use utility classes, avoid custom CSS
5. **Documentation**: Comment complex patterns