# WhatsApp Modern Theme Standards

## Colors

### Brand Colors
- **Teal (Primary)**: `bg-wa-teal` (#008069)
- **Dark Teal (Hover)**: `bg-wa-dark` (#075E54)
- **Light Green (Accents)**: `bg-wa-light` (#25D366)
- **Background**: `bg-wa-bg` (#F0F2F5)
- **Chat Bubble**: `bg-wa-chat` (#E7FCE3)

### Grays
- **Gray 50**: `bg-wa-gray-50` (#F0F2F5) - Section headers, hover states
- **Gray 100**: `bg-wa-gray-100` (#E9EDEF) - Borders, dividers
- **Gray 200**: `bg-wa-gray-200` (#D1D7DB) - Disabled states, subtle borders
- **Gray 300**: `text-wa-gray-300` (#8696A0) - Placeholders
- **Gray 400**: `text-wa-gray-400` (#667781) - Secondary text, labels
- **Gray 500**: `text-wa-gray-500` (#3B4A54) - Primary text body
- **Gray 600**: `text-wa-gray-600` (#111B21) - Headings, strong text

## Components

### Buttons
- **Primary**: `.btn-primary` (Solid Teal, White Text, Rounded)
  - Usage: Main actions (Create, Send, Save)
- **Secondary**: `.btn-secondary` (Transparent, Border Gray 200, Teal Text)
  - Usage: Cancel, Back, Secondary Actions
- **Danger**: `.btn-danger` (White, Border Red, Red Text)
  - Usage: Delete, destructive actions

### Inputs
- Class: `.input`
- Style: White background, Border Gray 200, Focus Teal Ring.
- Labels: `.label` (Teal, medium font)

### Cards
- Class: `.card`
- Style: White background, rounded-lg, `shadow-wa`, Border Gray 100.
- Usage: content containers, form containers.

### Badges
- Base: `.badge`
- Variants:
  - Success: `badge-success` or custom `bg-wa-light text-wa-teal`
  - Warning: `badge-warning`
  - Error: `badge-error`
  - Info: `badge-info`
  - Gray: `badge-gray`

## Layout usage
- **Main Background**: `min-h-screen bg-wa-bg`
- **Page Headers**: `text-2xl font-bold text-wa-gray-600` + `text-wa-gray-400` subtitle.
- **Section Headers**: `text-lg font-bold text-wa-gray-600`
