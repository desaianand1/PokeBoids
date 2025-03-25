# Technical Context: Boids Simulation

## 1. Technology Stack

### 1.1 Core Frameworks

- **SvelteKit**: Application framework (v2.0+)
- **Svelte 5**: Component framework (runes syntax only)
- **Phaser 3**: Game engine (v3.60+)
- **TypeScript**: Primary development language

### 1.2 UI Components

- **shadcn-svelte**: UI component library (@next version)
- **lucide-svelte**: Icon library
- **TailwindCSS**: Utility-first CSS framework
- **tailwindcss-animate**: Animation utilities

### 1.3 Development Tools

- **Vite**: Build tool
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **pnpm**: Package manager

## 2. Development Environment

### 2.1 Prerequisites

- Node.js v18+
- pnpm v8+
- TypeScript v5+

### 2.2 Setup Instructions

1. Clone repository
2. Run `pnpm install`
3. Start development server: `pnpm dev`
4. Build production version: `pnpm build`
5. Run tests: `pnpm test`

### 2.3 Configuration Files

- **svelte.config.js**: SvelteKit configuration
- **vite.config.ts**: Vite configuration
- **tailwind.config.js**: Tailwind configuration
- **tsconfig.json**: TypeScript configuration
- **eslint.config.js**: ESLint configuration

## 3. Technical Constraints

### 3.1 Framework Constraints

- Svelte 5 runes syntax only
- No Svelte stores (legacy pattern)
- Phaser 3 latest syntax only
- TypeScript strict mode enabled

### 3.2 Performance Constraints

- 60 FPS target
- Memory usage limits
- GPU acceleration requirements
- Efficient collision detection

## 4. Dependencies

### 4.1 Core Dependencies

- **@sveltejs/kit**: SvelteKit framework
- **phaser**: Game engine
- **typescript**: Type checking
- **vite**: Build tool

### 4.2 UI Dependencies

- **shadcn-svelte**: UI components
- **lucide-svelte**: Icons
- **tailwindcss**: Styling
- **tailwindcss-animate**: Animations

### 4.3 Development Dependencies

- **eslint**: Linting
- **prettier**: Formatting
- **svelte-check**: Type checking
- **vitest**: Testing

## 5. Coding Standards

### 5.1 TypeScript

- Strict type checking
- No implicit any
- Consistent type definitions
- Type-safe components

### 5.2 Svelte

- Runes syntax only
- Component-scoped state
- Reactive declarations
- Type-safe props

### 5.3 Styling

- Tailwind utility classes
- Consistent spacing scale
- Themed components
- Responsive design

## 6. Testing Strategy

### 6.1 Unit Testing

- Component tests
- Utility function tests
- Simulation logic tests

### 6.2 Integration Testing

- UI component integration
- Simulation integration
- State management tests

### 6.3 Performance Testing

- FPS benchmarks
- Memory usage tests
- Load testing
