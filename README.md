# Elevate Media - Internal Agency OS (Demo)

This is a prototype web-based internal operating system built for Elevate Media. It serves as the foundation (Version 1) to centralize client performance, payments, sales activity, and team tasks.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Data Storage**: LocalStorage (for demo purposes)

## 🔑 Demo Accounts

The app features role-based access control. You can log in using the following email addresses (any password will work):

- **CEO**: `ceo@elevatemedia.io` (Full access to all modules)
- **Sales**: `sales@elevatemedia.io` (Access to Dashboard, Client Hub, Sales Pipeline)
- **Operations**: `ops@elevatemedia.io` (Access to Dashboard, Client Hub, Operations)

## 📦 Modules

1. **CEO Dashboard**: Business snapshot, client health overview, revenue projections, and auto-generated alerts.
2. **Client Hub**: Client profiles, revenue, payment history, and performance metrics.
3. **Sales Tracker**: Daily outreach log and Kanban lead pipeline.
4. **Finance & Payments**: Payment tracker, expense log, and monthly revenue projections.
5. **Team & Tasks**: Daily standup log, task board, and weekly reports.

## 🛠️ Features

- Role-based Navigation and Route Guards
- LocalStorage-based Database (data persists across reloads)
- Audit Trail for tracking data changes
- Built-in Notifications (Overdue payments, missed standups, etc.)
- CSV and PDF Data Exports

## 💻 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.
