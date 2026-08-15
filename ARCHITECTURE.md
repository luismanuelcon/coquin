# COQUIN Architecture

## Product Definition

COQUIN is a mobile-first web application for household management. Its goal is to reduce the mental load of running a home by centralizing calendars, tasks, finances, taxes, events, home projects, shopping, inventories, documents, and recurring responsibilities in one calm, organized experience.

The product should feel supportive and practical, not like a heavy enterprise tool. The primary user is a busy household member who needs quick access, reminders, simple tracking, and a clear overview of what needs attention today, this week, and this month.

## Source Design

The initial visual direction comes from the Stitch project:

- Project: `COQUIN Home Management Hub`
- Stitch project id: `projects/4800959827066520170`
- Device target: `MOBILE`
- Main screens:
  - `COQUIN - Inicio (ES)`
  - `COQUIN - Calendario (ES)`
  - `COQUIN - Finanzas (ES)`
  - `COQUIN - Mercado (ES)`
  - Dark Neon variants

The default implementation should follow the `Dark Premium Neon` design system from Stitch.

## Recommended Stack

- Framework: Next.js with App Router
- Language: TypeScript
- UI: React components with Tailwind CSS
- Rendering: mobile-first responsive web app
- Deployment target: Vercel
- App behavior: Progressive Web App support once the core experience exists
- Backend candidate: Supabase or Firebase, to be chosen when authentication and persistent data are implemented

Next.js is preferred because COQUIN will likely need routing, authenticated user data, server-side capabilities, API endpoints, and a clean deployment path. The app starts as a mobile web product, but should be structured so it can later grow into a richer PWA or companion native app if needed.

## Product Modules

### Home

The home screen is the daily command center. It should show a concise overview of:

- Today's appointments, reminders, and tasks
- Upcoming household events
- Urgent payments, taxes, or deadlines
- Shopping needs and low-stock items
- Quick actions for adding an event, task, expense, or shopping item

### Calendar And Appointments

This module manages time-based commitments:

- Medical appointments
- Family events
- Service visits
- School or work reminders
- Tax and payment due dates
- Recurring household routines

The calendar should support clear filtering by category and a quick way to add reminders.

### Finances

This module tracks household money flows:

- Monthly budget
- Bills and recurring payments
- Taxes
- Shared expenses
- Savings goals
- Payment status

The initial version should focus on visibility and reminders, not complex accounting.

### Market And Inventory

This module covers shopping and household supplies:

- Shopping lists
- Pantry or home inventory
- Low-stock reminders
- Categories for food, cleaning, personal care, pets, and maintenance
- Optional budget awareness for grocery trips

### Tasks And Projects

This module manages household work:

- Maintenance tasks
- Home improvement projects
- Cleaning routines
- Assigned responsibilities
- Progress and due dates

Tasks should be lightweight and fast to create.

### Documents

This module can later organize important household files:

- Tax documents
- Service contracts
- Warranties
- Receipts
- Insurance
- Property or rental documents

File storage should wait until authentication and backend selection are clear.

## Design Principles

- Mobile first: every workflow must work comfortably on a phone.
- Calm density: show useful information without overwhelming the screen.
- Fast capture: adding tasks, events, expenses, and shopping items must be quick.
- Clear categories: use module-specific colors and icons to aid scanning.
- Spanish first: labels and primary copy should start in Spanish.
- Household tone: friendly, clear, and practical.

## Visual Direction

The active theme from Stitch is called `Dark Premium Neon`. It uses:

- Deep black and charcoal surfaces
- Neon cyan, pink, purple, and orange accents
- Plus Jakarta Sans typography
- Rounded premium cards and controls
- Luminescent borders instead of traditional shadows
- Dense dashboard hierarchy designed for low-light use

Core color direction:

- Canvas and app background: `#0D0D0D` / `#141313`
- Cards and panels: `#1A1A1A` and `#262626`
- Calendar and primary interactions: neon cyan
- Finance and growth indicators: cyan to purple gradients
- Market and energy indicators: orange
- Urgent tasks and alerts: pink or orange to pink gradients
- Supporting text: muted gray, with white reserved for primary labels and data

Implementation should keep cards, lists, and controls polished on mobile. Avoid marketing-page composition; this is a usable household management app, not a landing page. Neon colors should be functional: active states, data highlights, progress indicators, status chips, and primary actions.

## Initial App Structure

Recommended routes:

- `/` home dashboard
- `/calendar` calendar and appointments
- `/finances` finances
- `/market` shopping and inventory
- `/tasks` tasks and projects
- `/documents` documents, later
- `/settings` household and preferences, later

Recommended source structure:

```text
src/
  app/
    layout.tsx
    page.tsx
    calendar/
    finances/
    market/
    tasks/
  components/
    ui/
    layout/
    modules/
  lib/
    types/
    data/
    utils/
  styles/
```

## Data Model Draft

Core entities likely needed:

- `Household`
- `User`
- `Task`
- `CalendarEvent`
- `Reminder`
- `Expense`
- `Bill`
- `TaxObligation`
- `ShoppingList`
- `ShoppingItem`
- `InventoryItem`
- `Project`
- `Document`

During the prototype phase, use typed mock data. Introduce the real backend only after the core screens and flows are validated.

## Implementation Phases

### Phase 1: Static Prototype

- Create the Next.js project
- Implement the design system tokens
- Build mobile-first screens based on Stitch
- Use local typed mock data
- Validate layout in desktop and mobile viewport widths

### Phase 2: Interaction Layer

- Add navigation
- Add create/edit flows for tasks, events, expenses, and shopping items
- Add filters and status states
- Persist data temporarily in local storage if useful

### Phase 3: Backend Foundation

- Choose Supabase or Firebase
- Add authentication
- Model households and users
- Persist core entities
- Add role and sharing logic

### Phase 4: PWA And Notifications

- Add installable PWA behavior
- Add reminder strategy
- Evaluate push notifications
- Improve offline behavior for shopping lists and daily tasks

## Engineering Guidelines

- Prefer small, focused components.
- Keep business types explicit in TypeScript.
- Use mock data only from a clear `lib/data` area.
- Keep visual tokens centralized.
- Avoid premature abstraction before two or three modules prove the pattern.
- Maintain accessibility basics from the start: semantic buttons, labels, focus states, and readable contrast.
- Every page should be useful on a mobile viewport before expanding desktop behavior.

## Current Decision Log

- Use Next.js, React, TypeScript, and Tailwind CSS.
- Build as a mobile-first web app before considering native apps.
- Start with the Spanish light theme from Stitch.
- Start with mock data and no backend until the first screens and workflows are stable.
- Keep PWA support as an early follow-up, not a blocker for the first static prototype.
