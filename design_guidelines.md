# MindFlow - Design Guidelines

## Design Approach
**Preserve Existing Design**: The current frontend design must be maintained exactly as-is. This is a backend rebuild project with the same visual design.

## Core Design System (From Existing CSS)

### Typography
- **Primary Font**: Inter, with Poppins for headings
- **Scale**: 11px (xs) → 14px (base) → 30px (4xl)
- **Weights**: Normal (400), Medium (500), Semibold (550), Bold (600)
- **Line Heights**: Tight (1.2) for headlines, Normal (1.5) for body

### Color System
**Light Mode:**
- Background: Cream (#FCFCF9)
- Surface: Off-white (#FFFFFD)
- Primary: Teal (#21808D)
- Text: Dark slate (#13343B)

**Dark Mode:**
- Background: Charcoal (#1F2121)
- Surface: Dark gray (#262828)
- Primary: Light teal (#32B8C6)
- Text: Light gray (#F5F5F5)

### Spacing Scale
Use Tailwind-style spacing: 4px, 8px, 12px, 16px, 20px, 24px, 32px

### Border Radius
- Small: 6px
- Base: 8px
- Medium: 10px
- Large: 12px
- Full: 9999px (pills)

## Page-Specific Layouts

### Homepage
- **Hero Section**: Centered content, large heading, subtitle, prominent CTA button with emoji
- **Features Grid**: 4-column grid (responsive to 2-col mobile), feature cards with large emoji icons
- **About Section**: Single column, centered text, max-width container
- **Footer**: Simple centered copyright text

### Authentication Pages (Login/Signup)
- Gradient background (Blue to Purple)
- Centered white card with shadow
- Logo emoji at top (🧠)
- Clean form fields with 2px borders
- Full-width primary buttons
- Error/success message banners

### Brain Dump Form
- Single-column layout, max-width container
- Form sections with clear labels
- Textarea for tasks (8 rows)
- Radio buttons for hours selection (horizontal)
- Checkbox groups for challenges
- Subject dropdown with conditional custom input
- Large submit button at bottom
- Loading state with spinner animation

### Dashboard/Results
- Statistics cards grid
- Task list with status indicators
- Emotion tracker buttons
- Progress bars and celebration confetti
- Wellness tips rotation
- Action buttons (primary/secondary variants)

## Component Patterns

### Buttons
- **Primary**: Teal background, white text, 8px radius, hover lift effect
- **Secondary**: Transparent with border, hover background fill
- **Sizes**: Consistent 12px vertical padding, 24px horizontal

### Cards
- White/surface background
- Subtle border (rgba brown/gray)
- 8-12px border radius
- Light shadow on hover
- 16-24px internal padding

### Form Elements
- 12-14px padding
- 2px border, rounded corners
- Focus: Teal border + ring shadow
- White backgrounds for inputs (even in dark mode for contrast)

## Responsive Behavior
- **Mobile**: Single column, reduced padding, stacked navigation
- **Tablet (768px+)**: 2-column grids, increased spacing
- **Desktop (1024px+)**: Full layouts, 3-4 column grids, max-width containers

## Accessibility
- Proper focus states on all interactive elements
- Semantic HTML structure maintained
- Sufficient color contrast ratios
- Form labels properly associated
- Keyboard navigation support

## Images
**None required** - The design uses emoji icons (📝, ⚡, 😊, 🎉, 🧠) throughout instead of images, maintaining a lightweight, accessible approach.