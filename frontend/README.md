# Keja Yangu Kenya - Real Estate Platform

![Keja Yangu Kenya Banner](public/placeholder.svg)

## 🏠 Overview

Keja Yangu Kenya is a cutting-edge real estate platform designed to revolutionize property transactions in Kenya. The platform serves as a comprehensive marketplace connecting property buyers, renters, landlords, and real estate agents across the country. With a focus on user experience and cutting-edge technology, we provide a seamless property search, listing, and management experience.

### 🌟 Key Objectives
- Simplify property discovery with intelligent search
- Connect buyers and renters with verified property listings
- Empower agents with powerful property management tools
- Provide market insights and analytics
- Ensure secure and transparent transactions

## ✨ Core Features

### 🔍 Advanced Property Search
- Geo-location based property discovery
- Advanced filtering by price, location, property type, and amenities
- Save search preferences and get notified of new listings
- Interactive map view with property clusters

### 🏡 Property Listings
- High-quality property images and virtual tours
- Detailed property descriptions and specifications
- Neighborhood information and amenities
- Mortgage calculator and affordability tools

### 👤 User Accounts
- Role-based access (Buyers, Sellers, Agents, Admins)
- Secure authentication with JWT
- Profile management and verification
- Saved properties and search history

### 🤝 Agent Tools
- Property listing management
- Lead generation and tracking
- Performance analytics
- Client communication system

### 📱 Mobile Experience
- Progressive Web App (PWA) support
- Offline access to saved properties
- Push notifications
- Camera integration for property uploads

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ (LTS recommended)
- npm (v7+) or yarn (v1.22+)
- Git
- Mapbox API key (for map functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Moses-Githinji/keja-yangu-kenya.git
   cd keja-yangu-kenya/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   VITE_GOOGLE_ANALYTICS_ID=your_ga_id
   VITE_SENTRY_DSN=your_sentry_dsn
   ```

4. **Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The application will be available at `http://localhost:5173`

## 🏗️ Project Architecture

### Tech Stack
- **Frontend Framework**: React 18 with TypeScript
- **State Management**: React Query + Context API
- **Styling**: Tailwind CSS with CSS Modules
- **Routing**: React Router v6
- **Maps**: Mapbox GL JS
- **Forms**: React Hook Form with Zod validation
- **Testing**: Jest + React Testing Library
- **Linting/Formatting**: ESLint + Prettier

### Directory Structure
```
frontend/
├── public/               # Static assets
├── src/
│   ├── assets/           # Images, fonts, icons
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Common components (buttons, inputs, etc.)
│   │   ├── layout/       # Layout components
│   │   ├── properties/   # Property-related components
│   │   └── ui/           # Shadcn/ui components
│   ├── config/           # App configuration
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Third-party library initializations
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── stores/           # State management
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── App.tsx           # Main app component
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate test coverage
npm run test:coverage
```

### Testing Strategy
- Unit tests for utility functions and hooks
- Component tests with React Testing Library
- Integration tests for critical user flows
- E2E tests with Cypress (coming soon)

## 🛠️ Development Workflow

### Git Branching
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Commit Message Convention
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build process or tooling changes

## 🌐 Deployment

### Production Build
```bash
npm run build
```

### Deployment Options
1. **Vercel** (Recommended)
   - Automatic deployments from `main` branch
   - Preview deployments for PRs

2. **Netlify**
   - CI/CD pipeline
   - Serverless functions

3. **Self-hosted**
   - Nginx configuration included
   - Docker support

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Setting Up for Development
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- All the amazing open-source projects that made this possible
- Our dedicated team of developers and contributors
- Early adopters and beta testers

## 📧 Contact

For inquiries, please contact:
- **Email**: [contact@kejayanugkenya.com](mailto:contact@kejayanugkenya.com)
- **Twitter**: [@KejaYanguKE](https://twitter.com/KejaYanguKE)
- **Website**: [https://kejayanugkenya.com](https://kejayanugkenya.com)

## 📈 Project Status

**Current Version**: 1.0.0-beta  
**Next Milestone**: v1.0.0 Release  
**Active Development**: Yes