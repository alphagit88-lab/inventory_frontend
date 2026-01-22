# Inventory Management System - Frontend

Multi-Tenant SaaS Inventory Management Web Application Frontend built with Next.js.

## Features

- **Authentication**: Session-based login and registration
- **Role-Based Access Control**: 
  - Super Admin: Manage tenants and system overview
  - Store Admin: Manage branches, products, inventory, users
  - Branch User: Stock management and POS (Point of Sale)
- **Product Management**: Create products with variants (Brand + Size)
- **Inventory Management**: Stock-in, view inventory, check stock levels
- **Invoicing (POS)**: Create invoices, view invoice history
- **Reporting**: Profit reports, daily sales, stock status
- **User Management**: Create and manage branch users

## Getting Started

### Prerequisites

- Node.js 18+ 
- Backend API running on `http://localhost:5000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── dashboard/          # Dashboard pages for each role
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── tenants/            # Tenant management (Super Admin)
│   ├── branches/           # Branch management
│   ├── products/           # Product management
│   ├── inventory/          # Inventory management
│   ├── invoices/            # Invoice management
│   ├── users/              # User management
│   ├── reports/            # Reporting pages
│   └── system/             # System overview (Super Admin)
├── components/             # Reusable components
│   ├── Layout.tsx          # Main layout with navigation
│   └── ProtectedRoute.tsx # Route protection component
├── contexts/               # React contexts
│   └── AuthContext.tsx     # Authentication context
└── lib/                    # Utilities
    └── api.ts              # API client
```

## API Integration

The frontend communicates with the backend API using session-based authentication. All API calls are handled through the `api` client in `src/lib/api.ts`.

### Authentication Flow

1. User logs in via `/login`
2. Session cookie is automatically set by the backend
3. All subsequent requests include the session cookie
4. User profile is stored in `AuthContext`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL (default: `http://localhost:5000/api`)

## Features by Role

### Super Admin
- View system overview
- Manage tenants (create, view, delete)
- Access all system statistics

### Store Admin
- Manage branches
- Manage products and variants
- View inventory across all branches
- Create branch users
- View invoices and reports

### Branch User
- Stock-in items
- Create invoices (POS)
- View local inventory
- View local reports

## Notes

- Session cookies are automatically handled by the browser
- All API requests include `credentials: 'include'` to send cookies
- Protected routes automatically redirect to login if not authenticated
- Role-based access control is enforced on both frontend and backend
