# MindFlow - Design Guidelines

## Design Approach
**Reference-Based with Gamification**: Drawing inspiration from Duolingo's playful engagement + Notion's clean productivity aesthetic + Linear's modern polish. Focus on vibrant energy that motivates students while maintaining professional usability.

## Color System

### Primary Palette
- **Electric Blue**: #3B82F6 (primary actions, XP bars)
- **Vivid Purple**: #8B5CF6 (achievements, premium features)
- **Success Green**: #10B981 (completed tasks, streaks)
- **Energetic Orange**: #F97316 (urgent tasks, focus mode)
- **Warm Pink**: #EC4899 (social features, celebrations)

### Backgrounds
- **Light Mode**: Soft gradient from #F8FAFC to #EEF2FF
- **Dark Mode**: Deep gradient from #0F172A to #1E1B4B
- **Cards**: Glassmorphism with backdrop-blur, rgba(255,255,255,0.7) light / rgba(30,27,75,0.5) dark
- **Elevation**: Multi-layer shadows with colored glows matching context

### Semantic Colors
- XP Progress: Blue → Purple gradient
- Achievements: Gold #FBBF24, Silver #E5E7EB, Bronze #F59E0B
- Stats Cards: Each category gets unique gradient (Study Time: blue, Tasks: purple, Streak: orange)

## Typography
- **Headings**: Poppins (600-800 weight), 24px-48px
- **Body**: Inter (400-500 weight), 14px-16px
- **Stats/Numbers**: Poppins (700 weight), oversized for impact
- **Badges**: Inter (600 weight), uppercase, letter-spacing tight

## Layout System
**Spacing**: Consistent use of 4, 8, 12, 16, 24, 32, 48px units

### Homepage
- **Hero**: Full-width gradient background with glassmorphic card overlay, large hero image showing students studying with app interface, oversized heading with gradient text effect, dual CTA buttons (primary gradient, secondary glass)
- **Features Grid**: 3-column layout with interactive hover cards, gradient borders, emoji + icon combinations
- **Gamification Showcase**: Animated XP bar demonstration, achievement badge gallery, leaderboard preview
- **Social Proof**: Rotating student testimonials with profile images, star ratings
- **CTA Section**: Vibrant gradient background with elevated white card

### Dashboard
- **Header**: Level badge, XP progress bar (gradient fill), current streak flame icon, notification bell
- **Stats Row**: 4 colorful cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-4), each with gradient background, large number, icon, mini chart
- **Main Content**: 2-column layout (70/30 split) - Task list with drag handles, status badges, XP rewards | Sidebar with daily goals, power-ups, quick actions
- **Bottom**: Achievement toast notifications, confetti animations on milestones

### Brain Dump / Task Entry
- **Layout**: Centered max-width container with glassmorphic card
- **Progressive Form**: Step indicators with gradient progress line, animated transitions between steps
- **Input Fields**: Elevated with subtle shadows, focus states with colored glow
- **AI Suggestions**: Floating cards with shimmer effect, quick-add buttons

### Profile / Progress
- **Hero Card**: Large level badge, XP bar, stats overview with radial progress rings
- **Achievement Wall**: Masonry grid of earned badges (colored + glowing), locked badges (grayscale)
- **History Graph**: Colorful line chart showing study patterns, hoverable data points
- **Customization**: Theme toggles, avatar selection, notification preferences

## Component Library

### Gamification Elements
- **XP Progress Bar**: Gradient fill (blue→purple), animated on gain, shows current/next level numbers, subtle pulse animation
- **Level Badge**: Circular design, gradient border, number + icon, glowing effect for recent level-up
- **Achievement Cards**: 120px square, gradient background matching category, icon, title, description, unlock date, lock icon for unavailable
- **Streak Counter**: Flame icon with days count, pulse animation, warning state below 3 days

### Interactive Cards
- **Task Cards**: White/glass background, colored left border matching priority, checkbox with satisfying animation, XP badge in corner, drag handle
- **Stats Cards**: Gradient background, white text, large number (48px), icon, sparkline chart, comparison indicator (↑↓)
- **Power-Up Cards**: Glowing border, timer countdown, activation button, description tooltip

### Buttons
- **Primary**: Gradient background (blue→purple), white text, 10px radius, scale on hover, shadow with colored glow
- **Secondary**: Glass background with blur, colored border, hover fill with gradient
- **Icon Buttons**: Circular, glass background, colored icon, hover lift

### Form Elements
- **Inputs**: Glass background, colored focus ring (2px), floating label animation, icon prefix support
- **Dropdowns**: Custom styled with gradient selected state, smooth open animation
- **Checkboxes/Radio**: Custom design with gradient check, smooth toggle animation
- **Sliders**: Gradient track fill, large thumb with shadow

### Modals & Overlays
- **Backdrop**: Blurred background (backdrop-blur-md), rgba overlay
- **Modal**: Glassmorphic card, colored top border, close button with hover effect, slide-in animation
- **Tooltips**: Small glass cards, colored accent border, arrow pointer

## Images
**Hero Image**: Vibrant photo of diverse students collaborating with laptops/tablets in modern study space (bright, energetic lighting). Position: Hero section right side (60% width on desktop), full-width on mobile below text.

**Feature Images**: Icon illustrations (not photos) - brain with circuit patterns, rocket launch, trophy celebration - used as decorative elements in feature cards.

**Profile Avatars**: Circular user photos with gradient border rings, fallback to gradient backgrounds with initials.

## Responsive Behavior
- **Mobile**: Single column, bottom navigation bar, swipeable cards, reduced padding (p-4)
- **Tablet**: 2-column grids, side drawer navigation, medium padding (p-6)
- **Desktop**: Full layouts, 3-4 column grids, max-width containers (max-w-7xl), generous padding (p-8)

## Animations
- **Micro-interactions**: Button scale, card lift on hover, checkbox check animation, progress bar fill
- **Celebrations**: Confetti burst on achievements, sparkle effect on XP gain, level-up modal with particles
- **Transitions**: Smooth 200-300ms easing for all state changes, slide animations for modals

## Accessibility
- Color-blind friendly: Icons + text labels, patterns in addition to color
- Focus indicators: Visible colored rings, skip links
- Screen reader: ARIA labels for gamification elements, live regions for XP updates
- Keyboard navigation: All interactive elements accessible, modal trap focus