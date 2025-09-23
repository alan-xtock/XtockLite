# XtockLite Mobile App Design Guidelines

## Design Approach
**Selected Approach:** Reference-Based (Productivity Apps)
Drawing inspiration from Notion and Linear for clean, minimal interfaces with strong data visualization capabilities.

**Key Design Principles:**
- Mobile-first minimalism
- Data-driven hierarchy
- Efficient workflow focus
- Trust-building through clarity

## Core Design Elements

### A. Color Palette

**Landing Page Colors:**
- Primary: 225 85% 25% (dark blue)
- Orange Accent: 25 85% 55% (call-to-action buttons)
- Green Highlight: 142 70% 45% (trust indicators, success states)
- Background: 0 0% 100% (white)
- Text Primary: 220 15% 15% (dark gray)
- Text Secondary: 220 10% 40% (medium gray)

**App Interface Colors (Dark Mode):**
- Dark Blue: 225 85% 25% (primary brand)
- Dark Blue Light: 225 75% 35% (secondary)
- Dark Blue Dark: 225 90% 15% (deep accents)

**Accent Colors:**
- Green: 142 70% 45% (success, savings indicators)
- Green Light: 142 60% 55% (positive feedback)

**Neutrals:**
- Background: 220 15% 8% (dark mode primary)
- Surface: 220 12% 12% (cards, modals)
- Text Primary: 220 5% 95%
- Text Secondary: 220 5% 70%

### B. Typography
**Font:** Inter via Google Fonts CDN
- Headings: 600 weight, sizes 24px/20px/18px
- Body: 400 weight, 16px/14px
- Labels: 500 weight, 14px/12px
- Captions: 400 weight, 12px

### C. Layout System
**Spacing Units:** Tailwind 2, 4, 6, 8, 12, 16
- Container padding: p-4
- Card spacing: p-6
- Element margins: m-2, m-4
- Section gaps: gap-8

### D. Component Library

**Navigation:**
- Bottom tab bar with 4 icons (Dashboard, Orders, Analytics, Settings)
- Fixed header with app logo and notification bell
- Dark blue background with green active states

**Core Components:**
- Upload card with dashed border for CSV files
- Forecast cards showing percentage savings in green
- WhatsApp integration button (green with WhatsApp icon)
- Approval workflow cards with swipe actions
- Data visualization cards with blue/green charts

**Forms:**
- Dark surface inputs with blue focus states
- Green submit buttons
- Error states in red (345 85% 50%)
- Success confirmations in accent green

**Data Display:**
- Savings counter prominently displayed
- 30-day forecast timeline
- Purchase order list with status indicators
- CSV upload progress with blue progress bars

### E. Animations
Minimal motion design:
- Subtle fade-in for data loading (200ms)
- Gentle slide transitions between screens (300ms)
- Success checkmark animation on order approval

## Key Screens Structure

**Dashboard:**
- Hero section: Daily savings counter with green percentage
- Quick actions: Upload CSV, Generate PO, View Analytics
- Recent activity feed

**Upload Flow:**
- CSV drag-drop zone with upload icon
- Processing indicator with blue progress
- Success confirmation with forecast preview

**Order Management:**
- Generated WhatsApp PO preview
- Approve/Edit workflow cards
- Send confirmation with green success state

**Analytics:**
- 30-day trend visualization
- Cost savings breakdown
- Forecast accuracy metrics

## Images Section
**No large hero images required** - this is a data-focused utility app prioritizing information density over marketing visuals.

**Required Icons:**
- Upload/cloud icon for CSV upload
- WhatsApp logo (official green)
- Analytics/chart icons
- Notification bell
- Navigation icons (dashboard, orders, analytics, settings)

All icons via Heroicons CDN, maintaining 24px/20px sizes for consistency.