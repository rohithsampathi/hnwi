# HNWI Chronicles Project Guidelines

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run lint` - Run ESLint

## Code Style Guidelines
- **Imports**: React/Next imports first, third-party libraries second, local modules last (using @/ paths)
- **Components**: PascalCase for components/interfaces, camelCase for hooks/functions, kebab-case for filenames
- **TypeScript**: Use strong typing for props, interfaces for object types, avoid `any`
- **Formatting**: 2-space indentation, double quotes, semicolons, trailing commas
- **Error Handling**: Try/catch for async operations, meaningful error messages
- **State Management**: Context API for global state, useState/useReducer for local state
- **UI Components**: Self-contained, using Radix UI primitives and Tailwind for styling
- **Framework**: Next.js 14 app router with TypeScript, TailwindCSS
- **Data Viz**: D3.js, react-globe.gl, recharts, react-simple-maps

## Project Structure
- `/app` - App router pages and layouts
- `/components` - Reusable React components
- `/lib` - Utility functions and data
- `/public` - Static assets
- `/styles` - Global CSS and theme variables

## Application Features
- **Invest Scan**: Interactive global investment map with region-based opportunity discovery
- **Privé Exchange**: Premium marketplace for exclusive investment opportunities
- **Social Hub**: Networking platform with elite events calendar and management
- **Strategy Tools**: Investment planning engine, HNWI World, and playbooks
- **Authentication**: JWT-based auth with session management for HNWI users