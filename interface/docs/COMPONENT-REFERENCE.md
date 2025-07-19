# IMMO Component Reference

Quick reference for common component patterns and class combinations.

## Navigation

### Main Navigation Bar
```tsx
<nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between h-16">
      {/* Logo */}
      <span className="font-permanent-marker text-2xl bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
        IMMO
      </span>
      
      {/* Nav Links */}
      <Link className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">
        Dashboard
      </Link>
      
      {/* Active Link */}
      <Link className="text-gray-900 dark:text-white border-b-2 border-blue-500 px-3 py-2 text-sm font-medium">
        Active Page
      </Link>
    </div>
  </div>
</nav>
```

### Theme Toggle
```tsx
<button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
  {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
</button>
```

## Cards & Containers

### Basic Card
```tsx
<div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 animate-fade-in-scale-center">
  {/* Content */}
</div>
```

### Hover Card
```tsx
<div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fade-in-scale-center">
  {/* Content */}
</div>
```

### Dashboard Stat Card
```tsx
<div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow transition-all duration-300 hover:shadow-md animate-fade-in-scale-center">
  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Label</p>
  <p className="text-2xl font-bold text-gray-900 dark:text-white">$1,234</p>
</div>
```

### Project Card
```tsx
<div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 transition-all duration-300 hover:shadow-lg animate-fade-in-scale-center">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Name</h3>
    <StatusBadge status="Active" />
  </div>
  
  {/* Stats Grid */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Metric</p>
      <p className="text-lg font-semibold text-gray-900 dark:text-white">$1,234</p>
    </div>
  </div>
  
  {/* Actions */}
  <div className="flex gap-2">
    <button className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300">
      Action
    </button>
  </div>
</div>
```

## Forms

### Text Input
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Label
  </label>
  <input
    type="text"
    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    placeholder="Enter value"
  />
</div>
```

### Select Dropdown
```tsx
<select className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
  <option value="">Select option</option>
  <option value="1">Option 1</option>
</select>
```

### Radio Group
```tsx
<div className="space-y-2">
  <label className="flex items-center p-3 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
    <input type="radio" name="option" className="mr-3" />
    <div>
      <p className="font-medium text-gray-900 dark:text-white">Option Label</p>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</p>
    </div>
  </label>
</div>
```

### Form Section
```tsx
<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
  <h3 className="font-medium text-gray-900 dark:text-gray-100">Section Title</h3>
  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
    Section description or help text
  </p>
  {/* Form fields */}
</div>
```

## Buttons

### Primary Button
```tsx
<button className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300">
  Primary Action
</button>
```

### Secondary Button
```tsx
<button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300">
  Secondary Action
</button>
```

### Danger Button
```tsx
<button className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white font-medium rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-300">
  Delete
</button>
```

### Text Button
```tsx
<button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
  Text Action
</button>
```

### Disabled Button
```tsx
<button className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium rounded-md cursor-not-allowed opacity-50" disabled>
  Disabled
</button>
```

## Tables

### Basic Table
```tsx
<div className="bg-white dark:bg-gray-900 shadow rounded-lg overflow-hidden animate-fade-in-scale-center">
  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
    <thead className="bg-gray-50 dark:bg-gray-800">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Column
        </th>
      </tr>
    </thead>
    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 animate-fade-in-scale-center">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
          Cell Content
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Table with Actions
```tsx
<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium transition-colors">
    Edit
  </button>
</td>
```

## Modals

### Modal Structure
```tsx
{isOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in-backdrop">
    <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6 animate-fade-in-scale">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Modal Title</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <XIcon className="w-5 h-5" />
        </button>
      </div>
      
      {/* Content */}
      <div className="space-y-4">
        {/* Modal content */}
      </div>
      
      {/* Footer */}
      <div className="flex space-x-3 mt-6">
        <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
          Confirm
        </button>
      </div>
    </div>
  </div>
)}
```

## Status & Feedback

### Status Badges
```tsx
/* Success */
<span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400 rounded-full">
  Active
</span>

/* Warning */
<span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400 rounded-full">
  Pending
</span>

/* Error */
<span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400 rounded-full">
  Failed
</span>

/* Info */
<span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-400 rounded-full">
  Info
</span>
```

### Alert Messages
```tsx
/* Success Alert */
<div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg p-4">
  <p className="text-sm font-medium text-green-800 dark:text-green-300">Success message</p>
</div>

/* Warning Alert */
<div className="bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Warning message</p>
</div>

/* Error Alert */
<div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg p-4">
  <p className="text-sm font-medium text-red-800 dark:text-red-300">Error message</p>
</div>
```

## Loading States

### Loading Skeleton
```tsx
<div className="space-y-4">
  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4 overflow-hidden relative">
    <div className="absolute inset-0 -translate-x-full animate-shimmer-slide bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent"></div>
  </div>
  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2 overflow-hidden relative">
    <div className="absolute inset-0 -translate-x-full animate-shimmer-slide bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent"></div>
  </div>
</div>
```

### Spinner
```tsx
<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
```

## Empty States

### Basic Empty State
```tsx
<div className="text-center py-12">
  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No data</h3>
  <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">Get started by creating a new item.</p>
  <div className="mt-6">
    <button className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300">
      Create New
    </button>
  </div>
</div>
```

## Utility Patterns

### Gradient Text
```tsx
<span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
  Gradient Text
</span>
```

### Hover Scale Effect
```tsx
<div className="transition-all duration-300 hover:scale-105">
  {/* Content */}
</div>
```

### Focus Ring
```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
  Focusable Element
</button>
```

### Truncate Text
```tsx
<p className="truncate max-w-xs">
  Very long text that will be truncated with ellipsis
</p>
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* Grid items */}
</div>
```

## Common Combinations

### Card with Table
```tsx
<div className="bg-white dark:bg-gray-900 shadow rounded-lg animate-fade-in-scale-center">
  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Table Title</h2>
  </div>
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      {/* Table content */}
    </table>
  </div>
  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Footer information</p>
  </div>
</div>
```

### Form with Sections
```tsx
<form className="space-y-6">
  {/* Section 1 */}
  <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 animate-fade-in-scale-center">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Section Title</h3>
    <div className="space-y-4">
      {/* Form fields */}
    </div>
  </div>
  
  {/* Section 2 */}
  <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 animate-fade-in-scale-center">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Another Section</h3>
    <div className="space-y-4">
      {/* Form fields */}
    </div>
  </div>
  
  {/* Actions */}
  <div className="flex justify-end space-x-3">
    <button type="button" className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      Cancel
    </button>
    <button type="submit" className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300">
      Save
    </button>
  </div>
</form>
```