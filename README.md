# TetherPOS

Offline-first POS system that can work without internet for retail and restaurants.

Built by Paulo Aunor. Runs on Javascript.

## Tech Stack

- React
- Dexie.js
- Vite
- Javascript

## Features

- POS System: Robust POS system with clear distinctions on categories
- Offline Capability: Doesn't need internet to function.
- Excel Import: Imports Menu Items and Inventory from Excel
- Real-Time Sales Reports: Shows important Sales details to monitor restaurant activity. Helps you make more informed business decisions
- Customization: Setup your POS based on your business needs

## Getting Started

1. Clone the repo

```bash
git clone https://github.com/paulo-aunor/pos-system
```

2. Install dependencies

```bash
npm install
```

3. Run the Dev Server

```bash
npm run dev
```

## Architecture

There is a database installed locally to every machine that syncs with a cloud database. When there is no internet, data is saved . It's designed to sync when connectivity is restored. Cloud sync via Supabase is planned.

## Roadmap

### Milestone 1 (current):

- Tax rate configuration
- Discounts per item and per bill
- Dining type selector
- Customer name field
- Wastage entry
- Simple variants

### Milestone 2:

- Staff/manager login with permissions
- Cash reconciliation
- Receipt printer integration
- Full settings UI screen
- Opening/closing procedures

### Milestone 3:

- Combo items with smart variant logic
- Promotions engine (BOGO, etc.)
- Split payments
- Kitchen printer routing
- Multi-device sync via Supabase
- PWA (installable, works offline)
