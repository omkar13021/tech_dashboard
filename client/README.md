# ERP Dashboard - Production-Ready Business Management Solution

A comprehensive, role-based ERP dashboard built with Next.js 16, TypeScript, Tailwind CSS, Shadcn UI, Redux Toolkit, and Lucide React. Features dynamic navigation, protected routes, and enterprise-grade UI design.

## 🚀 Features

### Role-Based Access Control
- **5 User Roles**: SUPERADMIN, ADMIN, HOD, LEAD, ASSOCIATE
- **Dynamic Navigation**: Menus and routes automatically render based on user role
- **Permission System**: Centralized role-based permissions without hardcoded checks
- **Route Guards**: Automatic redirection to role-specific dashboards

### Dashboard Components
- **Responsive Sidebar**: Collapsible with nested menu items and mobile drawer mode
- **Top Navbar**: Search, notifications, theme toggle, user profile dropdown
- **Dashboard Tabs**: Role-specific tabs with relevant content
- **Dynamic Widgets**: Stat cards, charts, and lists based on user permissions

### Authentication & Security
- **JWT Authentication**: Secure login with refresh token rotation
- **Protected Routes**: Middleware-based route protection
- **Role Redirection**: Automatic redirect to appropriate dashboard after login
- **Session Validation**: Automatic user session validation

### UI/UX Features
- **Dark Mode**: Built-in theme switching with next-themes
- **Mobile Responsive**: Fully responsive design with mobile drawer
- **Loading States**: Comprehensive loading and error handling
- **Enterprise Design**: Professional UI with Shadcn components

## 🏗️ Architecture

### Project Structure
```
client/
├── app/                    # Next.js App Router
│   ├── superadmin/        # Super Admin dashboard
│   ├── admin/             # Admin dashboard
│   ├── hod/               # Head of Department dashboard
│   ├── lead/              # Team Lead dashboard
│   ├── associate/         # Associate dashboard
│   ├── auth/              # Authentication pages
│   └── unauthorized/      # Access denied page
├── components/
│   ├── layout/            # Layout components (Sidebar, Navbar, DashboardLayout)
│   ├── dashboard/         # Dashboard components (Tabs, Widgets)
│   ├── auth/              # Authentication components (ProtectedRoute)
│   └── ui/                # Shadcn UI components
├── config/
│   └── roleConfig.ts      # Role-based navigation configuration
├── hooks/
│   └── usePermissions.ts  # Permission hooks and utilities
├── store/
│   └── slices/
│       └── authSlice.ts   # Redux Toolkit auth state management
├── types/
│   ├── auth.types.ts      # Authentication types
│   └── permissions.types.ts # Permission and navigation types
└── utils/
    └── permissions.ts     # Permission utility functions
```

### Key Components

#### Role Configuration (`config/roleConfig.ts`)
- Centralized role definitions with permissions
- Navigation items, dashboard tabs, and widgets per role
- Role-based route redirection logic

#### Permission System (`utils/permissions.ts`)
- `AccessControl` class for permission checking
- Route access validation
- Role hierarchy management

#### Permission Hooks (`hooks/usePermissions.ts`)
- `usePermissions()` - Main permission hook
- `useAuth()` - Authentication state hook
- `useNavigation()` - Role-based navigation hook
- `useDashboardTabs()` - Role-specific tabs hook
- `useDashboardWidgets()` - Role-specific widgets hook

#### Protected Routes (`components/auth/ProtectedRoute.tsx`)
- Route protection with role checking
- Unauthorized page handling
- Higher-order components for protection

## 🔐 Role-Based Access

### User Roles & Permissions

#### SUPERADMIN
- Full system access
- User management (all users)
- Department management
- System settings and audit logs
- All reports and analytics

#### ADMIN
- Organization-level access
- User management (organization users)
- Department management
- Project and report access
- Organization settings

#### HOD (Head of Department)
- Department-level access
- Team member management
- Department projects and tasks
- Department reports
- Task assignment

#### LEAD
- Team-level access
- Project management
- Task creation and assignment
- Team reports
- Project progress tracking

#### ASSOCIATE
- Individual contributor access
- Assigned projects view
- Personal task management
- Personal reports
- Task status updates

### Route Redirection
After successful login, users are automatically redirected:
- **SUPERADMIN** → `/superadmin`
- **ADMIN** → `/admin`
- **HOD** → `/hod`
- **LEAD** → `/lead`
- **ASSOCIATE** → `/associate`

## 🛠️ Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI (Radix UI)
- **State Management**: Redux Toolkit
- **Icons**: Lucide React
- **Authentication**: JWT with refresh tokens
- **Theme**: next-themes
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Sonner

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tech-dashboard/client
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME="ERP Dashboard"
```

## 📱 Usage

### Login
1. Navigate to `/auth/login`
2. Enter credentials
3. System automatically redirects to role-specific dashboard

### Navigation
- **Desktop**: Collapsible sidebar with nested menus
- **Mobile**: Hamburger menu with drawer sidebar
- **Active Route**: Automatic highlighting of current page

### Dashboard Features
- **Widgets**: Role-specific stat cards and charts
- **Tabs**: Dynamic tabs based on user role
- **Search**: Global search functionality
- **Notifications**: Real-time notification system
- **Theme**: Dark/light mode toggle

## 🔧 Development

### Adding New Roles

1. Update `UserRole` type in `types/auth.types.ts`
2. Add role configuration in `config/roleConfig.ts`
3. Update middleware route protection
4. Add role-specific dashboard pages

### Adding New Permissions

1. Define permission in role configuration
2. Use permission hooks in components:
```typescript
const { hasPermission } = usePermissions();
if (hasPermission('users.view')) {
  // Show user management
}
```

### Protecting Routes

```typescript
// Using ProtectedRoute component
<ProtectedRoute requiredRoles={['ADMIN', 'SUPERADMIN']}>
  <AdminOnlyComponent />
</ProtectedRoute>

// Using HOC
export default withAdminProtection(MyComponent);

// Using DashboardLayout
<DashboardLayout requiredRoles={['HOD']}>
  <HodDashboard />
</DashboardLayout>
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Setup

1. Set production environment variables
2. Configure backend API endpoints
3. Set up authentication secrets
4. Deploy to Vercel, Netlify, or your preferred platform

## 📊 Future Modules

The system is designed to support additional modules:

- **Users Management**: Complete user CRUD operations
- **Departments**: Department management and organization
- **Projects**: Project lifecycle management
- **Tasks**: Task assignment and tracking
- **Reports**: Advanced reporting and analytics
- **Notifications**: Real-time notification system
- **Settings**: System and user preferences

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
