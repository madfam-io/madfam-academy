# MADFAM Academy - Frontend

A modern, responsive educational marketplace frontend built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### ✅ Course Catalog
- **Grid & List Views**: Toggle between grid and list layouts
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Course Cards**: Rich preview with ratings, duration, price, and enrollment stats
- **Pagination**: Efficient browsing of large course collections

### 🔍 Advanced Search & Filtering
- **Real-time Search**: Debounced search with 300ms delay
- **Multi-criteria Filters**:
  - Categories (hierarchical)
  - Skill levels (beginner, intermediate, advanced)
  - Price type (free/paid)
  - Minimum ratings (4+ stars, 3+ stars, etc.)
  - Instructors
- **Active Filter Pills**: Visual feedback with easy removal
- **Sort Options**: By date, popularity, rating, price, or title

### 👥 Persona-Based UI
- **Dynamic Navigation**: Role-specific menu items
- **Learner Features**: Browse, enroll, track progress
- **Instructor Tools**: Course management, analytics, revenue
- **Admin Controls**: Platform management, user administration
- **Responsive Sidebar**: Collapsible navigation for mobile

### 🎨 Design System
- **Tailwind CSS**: Utility-first styling
- **Custom Theme**: Primary/secondary colors with variants
- **Loading States**: Skeleton screens for better UX
- **Error Handling**: Graceful error states
- **Animations**: Smooth transitions and hover effects

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **State Management**: Zustand with persistence
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **UI Components**: Radix UI primitives

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── courses/       # Course-related components
│   │   ├── filters/       # Filter sidebar and bar
│   │   └── layout/        # Layout components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── pages/             # Page components
│   ├── store/             # Zustand stores
│   ├── types/             # TypeScript types
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── public/                # Static assets
└── index.html             # HTML template
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
```
Visit http://localhost:5173

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🧪 Demo Mode

The app includes a mock authentication system for testing different personas:

1. Visit `/login`
2. Choose a persona:
   - **Learner**: Browse and enroll in courses
   - **Instructor**: Manage courses and view analytics
   - **Admin**: Full platform administration

## 🎯 Key Components

### CourseCard
Displays course information in grid or list format with:
- Thumbnail with fallback
- Price and level badges
- Instructor info
- Rating, duration, and enrollment stats

### FilterSidebar
Collapsible sidebar with:
- Category checkboxes
- Level filters
- Price type selection
- Rating filters
- Clear all functionality

### PersonaNavigation
Dynamic navigation based on user role:
- Persona-specific menu items
- User profile display
- Mobile-responsive design
- Quick actions (e.g., Create Course for instructors)

## 🔧 Configuration

### API Endpoint
Set the API URL in `.env`:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### Tailwind Theme
Customize colors in `tailwind.config.js`:
```js
colors: {
  primary: { /* shades */ },
  secondary: { /* shades */ }
}
```

## 📱 Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔄 State Management

### Course Filters (Zustand)
```typescript
- filters: Search, categories, levels, etc.
- viewMode: Grid or list view
- Persistence: View mode saved to localStorage
```

### Authentication (Zustand)
```typescript
- user: Current user info
- token: Auth token
- Persistence: Full state saved
```

## 🚧 Coming Soon
- Course detail pages
- Enrollment flow
- Progress tracking
- Certificate viewer
- Instructor dashboard
- Real API integration

---

Built with ❤️ using modern React best practices and a focus on user experience.