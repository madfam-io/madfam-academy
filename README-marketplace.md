# MADFAM Academy Marketplace Frontend

A modern, responsive Next.js marketplace application for educational courses with advanced search, filtering, and SEO optimization.

## 🚀 Features

### 🎯 Core Marketplace Features
- **Course Catalog**: Browse thousands of courses with rich metadata
- **Advanced Search**: Full-text search with autocomplete and suggestions
- **Smart Filtering**: Filter by category, level, price, rating, features, and more
- **Multiple Views**: Grid and list views for different user preferences
- **Real-time Updates**: Live search results and filter updates

### 🎨 Modern UI/UX
- **Magic Components**: Beautiful animations and hover effects
- **Responsive Design**: Mobile-first approach with perfect desktop experience
- **Dark Mode**: Complete light/dark theme support with system detection
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation
- **Performance**: Optimized loading with skeleton states and lazy loading

### 🔍 SEO Optimization
- **Dynamic Metadata**: Auto-generated titles, descriptions, and Open Graph tags
- **Structured Data**: Rich snippets for better search engine visibility
- **Sitemap Generation**: Automatic sitemap for all courses and categories
- **URL Structure**: SEO-friendly URLs with proper canonical links
- **Page Speed**: Optimized Core Web Vitals and performance metrics

### 👥 Persona-Based Features
- **Role-Based UI**: Different interfaces for learners, instructors, and admins
- **Personalized Experience**: Customized content based on user persona
- **Permission System**: Granular access control for different user types
- **Adaptive Navigation**: Context-aware navigation menus

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand + React Query
- **UI Components**: Headless UI + Custom components
- **Icons**: Heroicons
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Search**: Fuse.js for client-side search
- **HTTP Client**: Axios with interceptors

## 📁 Project Structure

```
marketplace/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Homepage
│   │   ├── marketplace/       # Marketplace pages
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── layout/           # Layout components (header, footer)
│   │   ├── marketplace/      # Marketplace-specific components
│   │   ├── providers/        # Context providers
│   │   ├── search/           # Search components
│   │   ├── sections/         # Homepage sections
│   │   └── ui/              # Reusable UI components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and API client
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
├── tailwind.config.js       # Tailwind configuration
├── next.config.js           # Next.js configuration
└── package.json             # Dependencies and scripts
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- Backend API running (see main project README)

### Installation

1. **Install dependencies**:
   ```bash
   cd marketplace
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env.local
   ```
   
   Configure environment variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NEXT_PUBLIC_SITE_URL=http://localhost:3001
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**: http://localhost:3001

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#0ea5e9 to #0284c7)
- **Secondary**: Slate tones (#64748b variations)
- **Success**: Emerald (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- **Font Family**: Inter (sans-serif)
- **Font Weights**: 300, 400, 500, 600, 700, 800
- **Scale**: 12px to 60px with consistent line heights

### Components
- **Magic Cards**: Floating cards with hover animations
- **Gradient Buttons**: Primary actions with gradient backgrounds
- **Glass Effects**: Backdrop blur for overlays
- **Smooth Animations**: 300ms transitions with easing curves

## 🔍 Search & Filtering

### Search Features
- **Real-time Search**: Instant results as you type
- **Fuzzy Matching**: Find courses even with typos
- **Search Suggestions**: Autocomplete with popular searches
- **Search History**: Remember recent searches
- **Advanced Filters**: Combine multiple filters for precise results

### Filter Options
- **Categories**: Web Development, Data Science, Design, etc.
- **Skill Level**: Beginner, Intermediate, Advanced
- **Price Range**: Free, Under $50, $50-$100, $100+
- **Features**: Certificate, Lifetime Access, Mobile Access
- **Rating**: 4.5+, 4.0+, 3.5+, 3.0+
- **Language**: English, Spanish, French, German
- **Duration**: Short (< 5h), Medium (5-20h), Long (20h+)

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1439px
- **Large Desktop**: 1440px+

### Features
- **Mobile-First**: Designed for mobile, enhanced for desktop
- **Touch-Friendly**: Large tap targets and gesture support
- **Adaptive Layout**: Components reflow based on screen size
- **Performance**: Optimized images and lazy loading

## 🚀 Performance Optimizations

### Core Web Vitals
- **LCP**: < 2.5s through image optimization and lazy loading
- **FID**: < 100ms with code splitting and tree shaking
- **CLS**: < 0.1 with proper image dimensions and skeleton loading

### Optimization Techniques
- **Image Optimization**: Next.js Image component with WebP/AVIF
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Components and images load on demand
- **Caching**: HTTP caching with stale-while-revalidate
- **Bundle Analysis**: Webpack Bundle Analyzer for optimization

## 🔐 Security Features

### Data Protection
- **XSS Prevention**: Sanitized user inputs and CSP headers
- **CSRF Protection**: Token-based CSRF protection
- **Input Validation**: Client and server-side validation
- **Secure Headers**: Security headers for all responses

### Privacy
- **GDPR Compliant**: Cookie consent and data processing notices
- **Analytics**: Privacy-focused analytics implementation
- **Consent Management**: Granular consent for different data uses

## 🧪 Testing Strategy

### Test Types
- **Unit Tests**: Component and utility function tests
- **Integration Tests**: API integration and user flows
- **E2E Tests**: Complete user journey testing
- **Visual Tests**: Screenshot comparison tests
- **Performance Tests**: Core Web Vitals monitoring

### Testing Tools
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **Playwright**: End-to-end testing
- **Lighthouse CI**: Performance monitoring

## 📈 Analytics & Monitoring

### Metrics Tracked
- **User Engagement**: Page views, session duration, bounce rate
- **Search Analytics**: Popular searches, filter usage, conversion rates
- **Performance**: Core Web Vitals, error rates, API response times
- **Business Metrics**: Course views, enrollment conversions, revenue

### Monitoring Tools
- **Error Tracking**: Sentry for error monitoring and alerting
- **Performance**: Web Vitals and custom performance metrics
- **User Analytics**: Privacy-focused user behavior tracking
- **A/B Testing**: Feature flag system for testing variations

## 🌐 Internationalization

### Supported Languages
- **English** (default)
- **Spanish**
- **French**
- **German**
- **Portuguese**

### Features
- **Dynamic Language Switching**: Change language without reload
- **Localized Content**: Course titles, descriptions, and metadata
- **RTL Support**: Right-to-left language support
- **Currency Localization**: Local currency display and conversion
- **Date/Time Formatting**: Locale-appropriate formatting

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://api.madfamacademy.com
NEXT_PUBLIC_SITE_URL=https://madfamacademy.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Deployment Platforms
- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative with edge functions
- **AWS**: S3 + CloudFront for static deployment
- **Docker**: Containerized deployment for any platform

### Performance Monitoring
- **Core Web Vitals**: Continuous monitoring and alerting
- **Error Tracking**: Real-time error notifications
- **Uptime Monitoring**: 24/7 availability checks
- **Performance Budgets**: Automatic alerts for performance regressions

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and type checks
6. Submit a pull request

### Code Style
- **ESLint**: Enforced code style rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict type checking
- **Conventional Commits**: Structured commit messages

### Review Process
- **Code Review**: Required for all changes
- **Automated Tests**: All tests must pass
- **Performance Review**: No performance regressions
- **Design Review**: UI changes reviewed by design team

---

Built with ❤️ by the MADFAM Academy team