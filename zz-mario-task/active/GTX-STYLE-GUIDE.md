# GTX Style Guide - IMMO Interface

This guide documents the GTX-inspired design system implemented in the IMMO interface.

## Quick Reference

### Colors
- **Primary**: Blue-500 (#3b82f6) - Replaces all indigo colors
- **Gradient**: `from-blue-500 to-cyan-500` - For special elements
- **Dark backgrounds**: gray-800/gray-900
- **Light backgrounds**: white/gray-50

### Fonts
- **Primary**: Montserrat (all UI text)
- **Accent**: Permanent Marker (logo, special headings)
- **Mono**: Geist Mono (code, technical values)

### Animations
- **Shimmer**: Loading states with `animate-shimmer-slide`
- **Gradient**: Animated gradients with `animate-gradient`
- **Hover**: Scale 105% + shadow on interactive elements

## Component Examples

### Primary Button
```tsx
<button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
  Action
</button>
```

### Card with Hover
```tsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-blue-300 dark:hover:border-blue-600">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Title</h3>
  <p className="text-gray-600 dark:text-gray-300">Content</p>
</div>
```

### IMMO Logo
```tsx
<span className="font-permanent-marker bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent animate-gradient">
  IMMO
</span>
```

### Loading Skeleton
```tsx
<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 overflow-hidden relative">
  <div className="absolute inset-0 -translate-x-full animate-shimmer-slide bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
</div>
```

### Form Input
```tsx
<input 
  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
/>
```

## Usage Guidelines

1. **Always use blue instead of indigo** - This is the primary brand color
2. **Apply hover effects to interactive elements** - Use scale and shadow
3. **Use Montserrat for all UI text** - Permanent Marker only for special accents
4. **Implement loading states with shimmer** - Provides better UX feedback
5. **Maintain consistent spacing** - Use Tailwind's spacing scale
6. **Dark mode is class-based** - Use `dark:` prefix for all dark variants

## Animation Timing
- **Transitions**: 300ms for most interactions
- **Shimmer**: 2s slide duration
- **Gradient**: 3s animation cycle
- **Hover scale**: 105% maximum

## Files Updated
- `/app/layout.tsx` - Font configuration
- `/app/globals.css` - Animations and utilities
- `/app/page.tsx` - Homepage with GTX styling
- `/components/navigation.tsx` - Blue theme
- `/components/providers.tsx` - RainbowKit integration
- `/components/bonding-curve/price-chart.tsx` - Theme-aware charts
- `/app/po-dashboard/page.tsx` - Blue color updates
- All MM Dashboard components - Shimmer animations

## Testing Checklist
- [ ] Toggle between light/dark modes
- [ ] Verify all blues replaced indigos
- [ ] Check hover states work properly
- [ ] Confirm animations are smooth
- [ ] Test on mobile devices
- [ ] Verify contrast ratios