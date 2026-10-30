# Design Guidelines: Auto Parts Inventory

## Design Approach

**System Selected**: Material Design (data-dense applications variant)
**Justification**: Material Design provides robust patterns for data-heavy interfaces, clear visual hierarchy for complex inventory systems, and proven components for forms, tables, and search functionality. Its elevation system creates clear functional zones while maintaining readability in challenging workshop environments.

**Design Principles**:
- High contrast for outdoor/workshop visibility
- Industrial, utilitarian aesthetic prioritizing function
- Dense information layout without clutter
- Quick-scan visual hierarchy for fast inventory lookup
- Rugged, durable visual language

## Typography System

**Font Family**: Roboto (primary), Roboto Mono (data/codes)

**Hierarchy**:
- Page Titles: 2xl, font-bold (Dashboard, Inventory List)
- Section Headers: xl, font-semibold (Categories, Recent Items)
- Card/Panel Titles: lg, font-medium
- Body Text: base, font-normal
- Data Labels: sm, font-medium, uppercase tracking
- Item Codes/SKUs: sm, Roboto Mono
- Metadata/Timestamps: xs, font-normal

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8 for consistency
- Component padding: p-4 or p-6
- Section gaps: gap-6 or gap-8
- Card margins: m-4
- Icon spacing: mr-2 or ml-2

**Grid Structure**:
- Dashboard: 3-column stats grid (lg:grid-cols-3)
- Inventory List: Single column with responsive cards
- Item Details: 2-column layout (lg:grid-cols-2) for specs/location
- Category filters: Horizontal scrollable chips (flex overflow-x-auto)

## Component Library

### Navigation
- **Top Bar**: Fixed header with app logo, global search bar (prominent), user menu
- **Sidebar**: Collapsible navigation with Dashboard, Inventory, Categories, Low Stock, Settings
- **Breadcrumbs**: Show current location in hierarchy (Dashboard > Machines > Engines)

### Dashboard Components
- **Stats Cards**: Total items, categories count, low stock alerts with large numbers and icons
- **Quick Actions Bar**: Add Item, Quick Search, Scan Barcode buttons (primary actions)
- **Category Grid**: Visual cards showing category name, item count, representative icon
- **Recent Activity Feed**: List of last added/modified items with timestamps

### Inventory Display
- **Item Cards**: Dense cards with thumbnail, name, SKU, category tag, quantity badge, condition indicator, location
- **Search/Filter Bar**: Sticky search with category dropdown, condition filters, location filters
- **Sort Controls**: Dropdown for sorting (Name, Date Added, Quantity, Location)
- **Pagination**: Bottom pagination with items per page selector

### Forms & Data Entry
- **Add/Edit Item Form**: Two-column form layout with sections for Details, Specifications, Location, Condition
- **Category Selector**: Chip-style multi-select with common categories
- **Location Input**: Three-part input (Row/Section/Bin) with visual layout helper
- **Quantity Input**: Number input with low-stock threshold indicator
- **Condition Selector**: Radio buttons with visual states (Excellent, Good, Fair, Poor, Salvage)
- **Image Upload**: Drag-and-drop zone with thumbnail preview grid

### Data Visualization
- **Quantity Badges**: Color-coded numeric badges (adequate stock, low stock, out of stock)
- **Category Tags**: Colored pills with icons (Engines, Transmissions, Body Parts, Electronics, Tires, Glass)
- **Condition Indicators**: Icon + text combination showing item condition
- **Location Labels**: Structured display "Row A | Section 3 | Bin 12"

### Alerts & Feedback
- **Low Stock Warnings**: Banner alerts for items below threshold
- **Success Toasts**: Confirmation for add/edit/delete operations
- **Empty States**: Helpful illustrations for empty inventory/categories
- **Loading States**: Skeleton screens for data loading

### Tables (Optional Dense View)
- **Inventory Table**: Sortable columns (SKU, Name, Category, Quantity, Location, Condition, Actions)
- **Row Actions**: Inline edit, delete, view details icons
- **Bulk Selection**: Checkboxes for batch operations

## Accessibility Standards
- High contrast text (WCAG AAA for readability in bright workshop conditions)
- Large touch targets (min 44px) for gloved hands
- Clear focus indicators on all interactive elements
- Keyboard navigation throughout
- Screen reader labels for all data fields
- Error messages with clear remediation steps

## Interactions
- Minimal animations (fast, snappy UI for quick operations)
- Instant search filtering (no delays)
- Click-to-edit inline for quick updates
- Swipe actions on mobile for delete/edit

This system prioritizes rapid information access, high visibility, and efficient data entry suitable for an industrial environment.