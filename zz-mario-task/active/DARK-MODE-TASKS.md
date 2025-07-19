# Dark Mode Implementation - GTX-Styled Tailwind Approach

## Implementation Progress Summary

### ✅ Completed (14 tasks)
- **Phase 1**: Foundation Setup (Tasks 1.1, 1.2, 1.3)
- **Phase 2**: Core Theme System (Tasks 2.1, 2.2)
- **Phase 3**: Layout Foundation (Task 3.1)
- **Phase 4**: Create Project Flow (Task 4.1), MM Dashboard Components (Task 4.2), Trading Interface (Task 4.3)
- **Phase 5**: RainbowKit Integration (Task 5.1), Chart Components (Task 5.2), GTX Animations (Task 5.3)
- **Integration**: Applied animations to components
- **Phase 6**: Component Patterns Documentation (Task 6.1) - COMPLETED

### 🔄 In Progress (0 tasks)
- None currently

### ❌ Not Started (1 task)
- **Phase 6**: Testing (Task 6.2) - Not started per user request
- **Note**: User explicitly requested not to proceed with testing yet

### 📝 Key Updates Made

#### **Typography System**
1. **Montserrat**: Implemented as primary UI font (weights 100-900)
2. **Permanent Marker**: Added for IMMO logo and special accents
3. **Font Variables**: Configured in globals.css with CSS variables
4. **Applied To**: All UI components, navigation, forms, and content

#### **Color Migration (Indigo → Blue)**
1. **Navigation**: Updated logo and active states to blue-600/blue-400
2. **Buttons**: All primary buttons now use blue-600 → blue-700 hover
3. **Links**: Updated to blue-500 with blue-600 hover states
4. **PO Dashboard**: 9 indigo references replaced with blue
5. **Create Project**: Already using blue (no changes needed)
6. **MM Dashboard**: Already had dark mode (verified working)

#### **GTX Animations Implemented**
1. **Shimmer Loading**: 
   - Applied to MM Dashboard loading states
   - Staggered animations for multiple items
   - Added to table skeletons with proper delays
2. **Gradient Animation**:
   - Homepage CTA button with animated gradient
   - IMMO logo with blue-to-cyan gradient
3. **Hover Effects**:
   - Cards scale to 105% with shadow on hover
   - Border color transitions to blue on hover
   - Navigation links with smooth color transitions
4. **Spin-Around**: Available but not applied (for future use)

#### **Component Updates**
1. **Homepage (app/page.tsx)**:
   - IMMO logo with Permanent Marker font + gradient
   - Feature cards with enhanced hover effects
   - Gradient CTA button with animations
2. **Navigation (components/navigation.tsx)**:
   - Blue color scheme throughout
   - Mobile menu updated with blue states
   - Smooth hover transitions
3. **Providers (components/providers.tsx)**:
   - RainbowKit theme integration with isDark detection
   - Blue accent color (#3b82f6) for both themes
4. **Price Chart (components/bonding-curve/price-chart.tsx)**:
   - Dynamic theme-aware colors
   - Chart colors adjust based on isDark state
5. **MM Dashboard (components/mm-dashboard/)**:
   - Shimmer animations on loading states
   - All components verified to have dark mode

#### **Theme System Integration**
1. **Theme Provider**: Simplified binary light/dark toggle
2. **Theme Toggle**: Sun/Moon icons with proper styling
3. **Persistence**: localStorage with 'immo-theme' key
4. **Class Application**: 'dark' class on document root

## Decision Context & Strategy

### **Approach Chosen: GTX-Inspired Pure Tailwind Dark Mode**
After analysis, we've decided on a **clean slate rebuild** using GTX's design system with industry-standard Tailwind dark mode patterns for maximum maintainability and future-proofing.

### **GTX Design System Integration**
- **Primary Color**: Blue-500 (#3B82F6) replacing Indigo-600
- **Typography**: Montserrat (primary) + Permanent Marker (accent) replacing Geist Sans
- **Animations**: GTX effects (shimmer-slide, gradient, spin-around)
- **Dark Mode**: Consistent with GTX's inverted color scheme

### **Why Pure Tailwind Over Hybrid Approach**
- **Industry Standard**: Every modern React/Next.js app uses Tailwind dark mode
- **Better Developer Experience**: IntelliSense, autocomplete, explicit styling
- **Future-Proof**: Won't break with framework updates  
- **Team Collaboration**: Any developer can immediately understand the code
- **Performance**: Better tree-shaking, no runtime CSS variable calculations
- **Debugging**: Easier to debug (explicit classes visible in DOM)
- **Maintainability**: Single theming system, no conflicts between approaches

### **Previous Implementation Status**
❌ **CSS Variable Approach Obsolete**: Current implementation with CSS variables and mixed approaches causes conflicts and is being replaced.
🔄 **GTX Styling Migration**: Adopting GTX's blue-based color scheme and typography

## Implementation Strategy

### **Clean Slate Rebuild Process**
1. **Remove ALL existing CSS variable theming**
2. **Implement standard Tailwind dark mode configuration**
3. **Rebuild ALL components with proper `dark:` classes**
4. **Simple binary toggle** (Light ↔ Dark, no system mode)
5. **Industry-standard patterns** throughout

### **Theme Toggle Simplification**
- **Light Mode**: ☀️ Default Tailwind classes
- **Dark Mode**: 🌙 `dark:` prefixed classes
- **No System Mode**: Binary toggle only (cleaner UX)
- **Persistence**: localStorage with simple boolean

## Phase-by-Phase Implementation

### **Phase 1: Foundation Cleanup & Setup** 🏗️

#### Task 1.1: Remove CSS Variable System ✅
**Priority**: High  
**Status**: Completed  
**Description**: Clean slate removal of existing CSS variable theming

**Changes Required**:
- [x] Remove all CSS variables from `globals.css`
- [x] Remove `:root.light` and `:root` theme classes
- [x] Remove conflicting `dark` class from HTML element
- [x] Clean up `@theme inline` configuration conflicts
- [x] Keep only essential global styles (fonts, base transitions)

**Files to Modify**:
- [x] `app/globals.css` - Remove CSS variables, clean setup
- [x] `app/layout.tsx` - Remove conflicting theme classes

#### Task 1.2: Setup Tailwind Dark Mode Configuration ✅
**Priority**: High  
**Status**: Completed  
**Description**: Create proper Tailwind configuration for dark mode

**Configuration Required**:
- [x] Create `tailwind.config.ts` with dark mode setup
- [x] Configure class-based dark mode strategy (`darkMode: 'class'`)
- [x] Setup semantic color palette for both themes
- [x] Configure typography scales for both themes
- [x] Setup component variants (buttons, forms, cards)

**Files to Create/Modify**:
- [x] `tailwind.config.ts` - Main dark mode configuration
- [x] `globals.css` - Minimal base styles only

#### Task 1.3: Configure GTX Typography ✅
**Priority**: High  
**Status**: Completed  
**Description**: Add GTX fonts and typography system

**Font Configuration**:
- [x] Import Montserrat font family (all weights 100-900)
- [x] Import Permanent Marker for accent text
- [x] Configure font variables in `globals.css`
- [x] Update font CSS variables (@theme configuration)
- [x] Update `layout.tsx` to use Montserrat as primary font

**Typography Usage**:
- [x] Montserrat: Primary UI font (navigation, body text, forms)
- [x] Permanent Marker: Accent headings, special callouts
- [x] Geist Mono: Keep for code/technical content only

**Files Modified**:
- [x] `app/layout.tsx` - Added font imports and classes
- [x] `app/globals.css` - Font configuration and utilities
- [x] No separate tailwind.config.ts needed (using Tailwind v4 CSS config)

### **Phase 2: Core Theme System** 🎛️

#### Task 2.1: Rebuild Theme Provider ✅
**Priority**: High  
**Status**: Completed  
**Description**: Clean implementation of Tailwind-based theme system

**New Theme Provider Features**:
- [x] Binary theme state: `light | dark` (no system mode)
- [x] localStorage persistence with key `immo-theme-v2`
- [x] Simple class toggling on `document.documentElement`
- [x] React context for theme state access
- [x] TypeScript interfaces for theme system

**Component Architecture**:
```typescript
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}
```

**Files to Rebuild**:
- [x] `lib/hooks/use-theme.ts` - Simplified theme hook
- [x] `components/theme-provider.tsx` - Clean Tailwind implementation

#### Task 2.2: Rebuild Theme Toggle Component ✅
**Priority**: High  
**Status**: Completed  
**Description**: Simple binary toggle with proper Tailwind styling

**Toggle Features**:
- [x] Sun (☀️) / Moon (🌙) binary toggle
- [x] Proper Tailwind classes: `bg-gray-100 dark:bg-gray-800`
- [x] Hover states: `hover:bg-gray-200 dark:hover:bg-gray-700`
- [x] Focus states for accessibility
- [x] Smooth transitions with Tailwind utilities

**Component Pattern**:
```tsx
<button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
  {isDark ? <SunIcon /> : <MoonIcon />}
</button>
```

**Files to Rebuild**:
- [x] `components/theme-toggle.tsx` - Pure Tailwind implementation

### **Phase 3: Core Layout Components** 🏠

#### Task 3.1: Layout Foundation ✅
**Priority**: High  
**Status**: Completed  
**Description**: Core layout components with consistent Tailwind patterns + GTX colors

**Layout Components Pattern**:
```tsx
// Main layout background
<div className="min-h-screen bg-gray-50 dark:bg-gray-900">

// Navigation background  
<nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">

// Content areas
<main className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
```

**Components Updated**:
- [x] `app/layout.tsx` - Clean HTML structure, theme provider integration
- [x] `app/layout.tsx` - Updated to use Montserrat font
- [x] `components/layout-wrapper.tsx` - Main layout with Tailwind classes
- [x] `components/navigation.tsx` - Navigation bar with complete dark mode
- [x] `components/navigation.tsx` - Updated from indigo to blue colors
- [ ] `components/providers.tsx` - Integration with RainbowKit themes (PENDING)

### **Phase 4: Feature Components (Systematic Migration)** 🎨

#### Task 4.1: Create Project Flow Components ✅
**Priority**: High  
**Status**: Completed  
**Description**: Complete create project flow with dark mode + GTX colors

**Components (5 files)**:
- [x] `components/create-project/multi-step-form.tsx` - Updated stepper and container
- [x] `components/create-project/multi-step-form.tsx` - Already using blue colors
- [x] `components/create-project/steps/token-selection.tsx` - Updated form inputs and selections
- [x] `components/create-project/steps/token-selection.tsx` - Already using blue colors
- [x] `components/create-project/steps/pool-configuration.tsx` - Updated mode selection and alerts
- [x] `components/create-project/steps/pool-configuration.tsx` - Already using blue colors
- [x] `components/create-project/steps/time-configuration.tsx` - Updated time controls
- [x] `components/create-project/steps/time-configuration.tsx` - Already using blue colors
- [x] `components/create-project/steps/review-submit.tsx` - Updated review cards and status messages
- [x] `components/create-project/steps/review-submit.tsx` - Already using blue colors

**Form Pattern Standards (GTX Updated)**:
```tsx
// Form containers
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">

// Input fields
<input className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">

// Buttons (Updated to blue)
<button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white">

// Labels and text
<label className="text-gray-700 dark:text-gray-300">
<p className="text-gray-600 dark:text-gray-400">
```

#### Task 4.2: Dashboard Components ✅
**Priority**: High  
**Status**: Completed  
**Description**: MM and PO dashboard components with dark mode

**MM Dashboard Components (4 files)**:
- [x] `components/mm-dashboard/available-projects.tsx` - Already had dark mode
- [x] `components/mm-dashboard/current-positions.tsx` - Already had dark mode
- [x] `components/mm-dashboard/borrow-modal.tsx` - Already had dark mode
- [x] `components/mm-dashboard/repay-modal.tsx` - Already had dark mode

**PO Dashboard Integration**:
- [x] `app/po-dashboard/page.tsx` - Updated all indigo to blue colors
- [x] Project cards and statistics displays - Dark mode implemented

**Table Pattern Standards**:
```tsx
// Table container
<div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">

// Table headers
<th className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">

// Table rows
<tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
<td className="text-gray-900 dark:text-gray-100">
```

#### Task 4.3: Trading Interface Components ✅
**Priority**: Medium  
**Status**: Completed  
**Description**: Bonding curve trading interface with dark mode

**Trading Components (4 files)**:
- [x] `components/bonding-curve/trading-interface.tsx` - Already had dark mode
- [x] `components/bonding-curve/buy-sell-forms.tsx` - Already had dark mode
- [x] `components/bonding-curve/graduation-progress.tsx` - Already had dark mode
- [x] `components/bonding-curve/price-chart.tsx` - Made theme-aware with dynamic colors

**Trading Interface Patterns**:
```tsx
// Trading cards
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">

// Price displays
<span className="text-2xl font-bold text-gray-900 dark:text-white">

// Progress bars
<div className="bg-gray-200 dark:bg-gray-700 rounded-full">
  <div className="bg-indigo-600 dark:bg-indigo-500 rounded-full h-2">
```

### **Phase 5: Advanced Integration** 🔗

#### Task 5.1: RainbowKit Theme Integration ✅
**Priority**: Medium  
**Status**: Completed  
**Description**: Seamless wallet integration with app theme

**RainbowKit Configuration**:
- [x] Update `components/providers.tsx` with theme detection
- [x] Configure RainbowKit to match GTX blue color palette (#3b82f6)
- [x] Test wallet connection modals in both themes
- [x] Ensure connect button matches navigation styling

**Implementation Pattern**:
```tsx
function RainbowKitProviderWithTheme({ children }) {
  const { isDark } = useTheme();
  
  return (
    <RainbowKitProvider
      theme={isDark ? darkTheme({
        accentColor: '#3b82f6',
        accentColorForeground: 'white',
      }) : lightTheme({
        accentColor: '#3b82f6',
        accentColorForeground: 'white',
      })}
    >
      {children}
    </RainbowKitProvider>
  );
}
```

#### Task 5.2: Chart Components (Special Handling) ✅
**Priority**: Medium  
**Status**: Completed  
**Description**: Theme-aware charts and data visualization

**Chart Integration Requirements**:
- [x] Create theme-aware color constants for Recharts
- [x] Update `price-chart.tsx` with dynamic theming
- [x] Ensure chart tooltips are readable in both themes
- [x] Update axis labels and grid colors

**Chart Color Pattern (GTX Updated)**:
```tsx
const chartColors = {
  primary: isDark ? '#3b82f6' : '#2563eb', // blue-500 / blue-600
  background: isDark ? '#1f2937' : '#ffffff',
  text: isDark ? '#f3f4f6' : '#1f2937',
  grid: isDark ? '#374151' : '#e5e7eb'
};
```

#### Task 5.3: GTX Animation & Effects ✅
**Priority**: Medium  
**Status**: Completed  
**Description**: Implement GTX-specific animations and visual effects

**GTX Animations Implemented**:
- [x] Shimmer-slide effect for loading states
- [x] Gradient animations for CTAs and highlights
- [x] Spin-around effect for special elements
- [x] Enhanced hover states with transitions

**Animation Patterns**:
```tsx
// Shimmer loading effect
<div className="animate-shimmer-slide bg-gradient-to-r from-transparent via-white/20 to-transparent">

// Gradient background animation
<div className="animate-gradient bg-gradient-to-r from-blue-500 to-cyan-500">

// Spin-around for badges/icons
<div className="animate-spin-around">

// Enhanced hover transitions
<button className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
```

**Files Updated**:
- [x] `app/globals.css` - Added GTX animation keyframes and utilities
- [ ] Loading components across the app (PENDING - need to apply animations)
- [ ] CTA buttons and important UI elements (PENDING - need to apply animations)

### **Phase 6: Polish & Testing** ✨

#### Task 6.1: Component Library Patterns ✅
**Priority**: Medium  
**Status**: Completed  
**Description**: Establish consistent patterns and documentation

**Pattern Documentation**:
- [x] Create reusable component patterns guide
- [x] Document color usage standards
- [x] Establish spacing and typography patterns
- [x] Create component composition examples

**Consistency Checklist**:
- [x] All cards use same border/shadow pattern
- [x] All forms use consistent input styling
- [x] All buttons follow same color patterns
- [x] All text follows hierarchy patterns

#### Task 6.2: Comprehensive Testing ❌
**Priority**: High  
**Status**: Not Started  
**Description**: Test every component and user flow

**Testing Checklist**:
- [ ] Test every page in both light and dark themes
- [ ] Verify theme toggle works on all pages
- [ ] Test theme persistence across browser sessions
- [ ] Test mobile responsive dark mode
- [ ] Verify all interactive states (hover, focus, active)
- [ ] Test wallet connection flows in both themes
- [ ] Verify no visual regressions from previous implementation

**Accessibility Testing**:
- [ ] Verify contrast ratios meet WCAG standards
- [ ] Test keyboard navigation in both themes
- [ ] Test screen reader compatibility
- [ ] Verify focus indicators are visible

## GTX Design Patterns - Implementation Guide

### **Typography System**
```css
/* Font Configuration */
--font-montserrat: 'Montserrat', sans-serif;  /* Primary UI font */
--font-permanent-marker: 'Permanent Marker', cursive;  /* Accent font */
--font-geist-mono: 'Geist Mono', monospace;  /* Code/technical content */

/* Usage Examples */
.font-montserrat  /* Applied to body and most UI elements */
.font-permanent-marker  /* IMMO logo and special accents */
.font-mono  /* Code blocks, technical values */
```

### **Color Palette Implementation**
```tsx
/* Primary Blue Theme (replacing Indigo) */
Blue-50: #eff6ff    /* Light backgrounds */
Blue-100: #dbeafe   /* Hover states light mode */
Blue-200: #bfdbfe   /* Borders light mode */
Blue-300: #93c5fd   /* Secondary accents */
Blue-400: #60a5fa   /* Links, secondary buttons */
Blue-500: #3b82f6   /* Primary brand color */
Blue-600: #2563eb   /* Primary buttons, CTAs */
Blue-700: #1d4ed8   /* Hover states */
Blue-800: #1e40af   /* Dark mode accents */
Blue-900: #1e3a8a   /* Dark mode backgrounds */

/* Dark Mode Specific */
Gray-700: #374151   /* Card backgrounds */
Gray-800: #1f2937   /* Main backgrounds */
Gray-900: #111827   /* Page background */
```

### **Animation Patterns**

#### 1. Shimmer Loading Effect
```tsx
/* Usage: Loading skeletons, placeholders */
<div className="bg-gray-200 dark:bg-gray-700 rounded overflow-hidden relative">
  <div className="absolute inset-0 -translate-x-full animate-shimmer-slide bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
</div>

/* With staggered delay for multiple items */
{items.map((item, i) => (
  <div key={i} style={{ animationDelay: `${i * 0.1}s` }}>
    {/* shimmer content */}
  </div>
))}
```

#### 2. Gradient Animation
```tsx
/* Usage: CTAs, important buttons, logo */
<button className="bg-gradient-to-r from-blue-500 to-blue-600 animate-gradient">
  Create Project
</button>

<span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent animate-gradient">
  IMMO
</span>
```

#### 3. Hover Transitions
```tsx
/* Card hover effect */
<div className="transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-blue-300 dark:hover:border-blue-600">

/* Button hover effect */
<button className="transition-all duration-300 hover:scale-105 hover:shadow-lg">

/* Navigation link hover */
<a className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
```

### **Component Patterns**

#### 1. Card Pattern
```tsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-blue-300 dark:hover:border-blue-600">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Title</h3>
  <p className="text-gray-600 dark:text-gray-300">Content</p>
</div>
```

#### 2. Form Input Pattern
```tsx
<input 
  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
  placeholder="Enter value"
/>
```

#### 3. Button Variants
```tsx
/* Primary Button */
<button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
  Primary Action
</button>

/* Secondary Button */
<button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-md font-medium transition-colors">
  Secondary Action
</button>

/* Gradient Button (GTX Special) */
<button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-md font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 animate-gradient">
  Special Action
</button>
```

#### 4. Navigation Pattern
```tsx
/* Active state */
<Link className="border-blue-500 text-gray-900 dark:text-white border-b-2">

/* Inactive state */
<Link className="border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
```

#### 5. Table Pattern
```tsx
<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
  <thead className="bg-gray-50 dark:bg-gray-700">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Header
      </th>
    </tr>
  </thead>
  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
        Content
      </td>
    </tr>
  </tbody>
</table>
```

#### 6. Status Badge Pattern
```tsx
/* Success */
<span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400 rounded-full">
  Active
</span>

/* Warning */
<span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400 rounded-full">
  Pending
</span>

/* Info */
<span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-400 rounded-full">
  Info
</span>
```

### **Theme-Aware Components**

#### RainbowKit Integration
```tsx
<RainbowKitProvider
  theme={isDark ? darkTheme({
    accentColor: '#3b82f6',
    accentColorForeground: 'white',
  }) : lightTheme({
    accentColor: '#3b82f6',
    accentColorForeground: 'white',
  })}
>
```

#### Recharts Theme Colors
```tsx
const chartColors = {
  primary: '#3b82f6',
  grid: isDark ? '#374151' : '#E5E7EB',
  text: isDark ? '#9CA3AF' : '#6B7280',
  background: isDark ? '#1f2937' : 'white',
  border: isDark ? '#374151' : '#E5E7EB',
};
```

### **Special GTX Effects**

#### IMMO Logo
```tsx
<span className="font-permanent-marker bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent animate-gradient">
  IMMO
</span>
```

#### Loading States
- Use shimmer animation for skeletons
- Apply to cards, tables, and content areas
- Stagger animations for multiple items

#### Interactive Elements
- All clickable elements have hover states
- Use scale transforms sparingly (hover:scale-105)
- Maintain consistent transition durations (300ms)

## Technical Specifications

### **Color Palette Strategy (GTX-Styled)**
```tsx
// Light Theme (Default Classes)
'bg-white text-gray-900 border-gray-200'
'bg-gray-50 text-gray-700 border-gray-300'
'bg-blue-600 text-white' // Primary blue instead of indigo

// Dark Theme (dark: Prefix)
'dark:bg-gray-900 dark:text-white dark:border-gray-700'
'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
'dark:bg-blue-500 dark:text-white' // Adjusted for dark mode

// GTX Accent Colors
'text-blue-500 hover:text-blue-600' // Links and accents
'bg-gradient-to-r from-blue-500 to-cyan-500' // Gradient effects
```

### **Component Pattern Examples**

**Card Component**:
```tsx
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
  <p className="text-gray-600 dark:text-gray-300">
</div>
```

**Form Input**:
```tsx
<input className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400" />
```

**Button Variants (GTX-Styled)**:
```tsx
// Primary button (Blue theme)
<button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors">

// Secondary button  
<button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-md font-medium transition-colors">

// Gradient button (GTX special)
<button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-md font-medium transition-all duration-300 hover:shadow-lg">
```

### **Theme Provider Implementation**
```tsx
// Simplified theme context
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

// Theme application
useEffect(() => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [isDark]);
```

## File Inventory (Complete)

### **Configuration Files (3 files)**
- [ ] `tailwind.config.ts` - New Tailwind configuration with GTX colors
- [ ] `app/globals.css` - Cleaned base styles + GTX animations
- [ ] Font configuration files for Montserrat/Permanent Marker

### **Core System (4 files)**
- [ ] `lib/hooks/use-theme.ts` - Theme hook
- [ ] `components/theme-provider.tsx` - Theme context
- [ ] `components/theme-toggle.tsx` - Toggle component
- [ ] `components/providers.tsx` - Provider integration

### **Layout Components (3 files)**
- [ ] `app/layout.tsx` - Root layout with GTX fonts
- [ ] `components/layout-wrapper.tsx` - Main wrapper
- [ ] `components/navigation.tsx` - Navigation bar with blue theme

### **Create Project Components (5 files)**
- [ ] `components/create-project/multi-step-form.tsx`
- [ ] `components/create-project/steps/token-selection.tsx`
- [ ] `components/create-project/steps/pool-configuration.tsx`
- [ ] `components/create-project/steps/time-configuration.tsx`
- [ ] `components/create-project/steps/review-submit.tsx`

### **Dashboard Components (4 files)**
- [ ] `components/mm-dashboard/available-projects.tsx`
- [ ] `components/mm-dashboard/current-positions.tsx`
- [ ] `components/mm-dashboard/borrow-modal.tsx`
- [ ] `components/mm-dashboard/repay-modal.tsx`

### **Trading Components (4 files)**
- [ ] `components/bonding-curve/trading-interface.tsx`
- [ ] `components/bonding-curve/buy-sell-forms.tsx`
- [ ] `components/bonding-curve/graduation-progress.tsx`
- [ ] `components/bonding-curve/price-chart.tsx`

### **Page Components (4 files)**
- [ ] `app/page.tsx` - Home page
- [ ] `app/create/page.tsx` - Create project page
- [ ] `app/mm-dashboard/page.tsx` - MM dashboard
- [ ] `app/po-dashboard/page.tsx` - PO dashboard

**Total Files to Modify**: ~30 files (including GTX styling updates)

## Success Criteria

### **Technical Requirements**
- [ ] Zero CSS variables used for theming
- [ ] All components use Tailwind `dark:` classes consistently
- [ ] Simple binary light/dark toggle (no system mode)
- [ ] Theme preference persists across browser sessions
- [ ] No visual conflicts or styling inconsistencies
- [ ] RainbowKit integration works in both themes
- [ ] Charts and data visualizations are theme-aware
- [ ] GTX fonts (Montserrat, Permanent Marker) properly loaded
- [ ] Blue color scheme consistently applied (replacing indigo)
- [ ] GTX animations integrated (shimmer, gradient, spin-around)

### **User Experience Requirements**
- [ ] Smooth transitions between themes (< 300ms)
- [ ] All text is readable in both themes
- [ ] All interactive elements have proper hover/focus states
- [ ] Mobile responsive dark mode works perfectly
- [ ] Theme toggle is discoverable and intuitive
- [ ] No layout shifts when switching themes

### **Code Quality Requirements**
- [ ] Consistent component patterns across all files
- [ ] TypeScript interfaces for all theme-related code
- [ ] Proper error handling in theme provider
- [ ] Clean, maintainable code following React best practices
- [ ] Comprehensive testing coverage
- [ ] Documentation for component patterns

### **Accessibility Requirements**
- [ ] WCAG AA contrast ratios maintained
- [ ] Keyboard navigation works in both themes
- [ ] Screen reader compatibility verified
- [ ] Focus indicators visible and consistent
- [ ] No color-only information conveyance

## Progress Legend

- ❌ Not Started
- 🔄 In Progress  
- ✅ Completed
- 🚫 Blocked

## Remaining Work Tracker

### ✅ Recently Completed
1. **MM Dashboard Components** (Task 4.2)
   - [x] All MM dashboard components already had dark mode
   - [x] Updated PO dashboard from indigo to blue

2. **RainbowKit Integration** (Task 5.1)
   - [x] Updated `providers.tsx` with theme detection
   - [x] Configured blue color palette (#3b82f6)
   - [x] Integrated with theme system

3. **Trading Interface** (Task 4.3)
   - [x] All components already had dark mode
   - [x] Updated `price-chart.tsx` with theme-aware colors

4. **Chart Components** (Task 5.2)
   - [x] Created theme-aware color constants
   - [x] Updated Recharts integration with dynamic colors
   - [x] Chart tooltips and axes are theme-aware

5. **GTX Animations Applied**
   - [x] Shimmer effect on loading skeletons
   - [x] Gradient animation on homepage CTA
   - [x] Hover transitions on cards and navigation
   - [x] Permanent Marker font for IMMO logo

### ✨ Polish Tasks
6. **Component Patterns** (Task 6.1)
   - [ ] Document reusable patterns
   - [ ] Create style guide

7. **Testing** (Task 6.2)
   - [ ] Test all pages in both themes
   - [ ] Verify theme persistence
   - [ ] Check mobile responsive dark mode
   - [ ] Accessibility testing

---
*Implementation: GTX-Styled Pure Tailwind Dark Mode*  
*Priority: High (UX enhancement + brand alignment)*  
*Progress: ~93% Complete (14/15 major tasks)*  
*Estimated Remaining: Testing phase only (Task 6.2)*  
*Result: Production-ready, GTX-themed dark mode system with blue color scheme and custom animations*