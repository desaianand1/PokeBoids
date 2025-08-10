# Technical Context: PokéBoids Simulation

## 1. Technology Stack

### 1.1 Core Frameworks

- **SvelteKit**: Application framework (v2.27+) with static site generation
- **Svelte 5**: Component framework (v5.38+) using runes syntax exclusively
- **Phaser 3**: Game engine (v3.90+) for simulation rendering
- **TypeScript**: Primary development language (v5.9+) with strict mode

### 1.2 UI and Styling

- **shadcn-svelte**: UI component library with Svelte 5 compatibility
- **bits-ui**: Base UI primitives (v1.8+) for component foundation
- **lucide-svelte**: Icon library (v0.539+) for consistent iconography
- **TailwindCSS**: Utility-first CSS framework (v3.4+) with responsive design
- **tailwindcss-animate**: Animation utilities for smooth transitions
- **mode-watcher**: Theme detection and management

### 1.3 Development and Build Tools

- **Vite**: Build tool (v7.1+) with hot module replacement
- **pnpm**: Package manager (v9.0+) with workspace support
- **ESLint**: JavaScript/TypeScript linting (v9.32+) with TypeScript ESLint
- **Prettier**: Code formatting (v3.6+) with Svelte plugin
- **Vitest**: Testing framework (v3.2+) with coverage reporting

### 1.4 CI/CD and Quality Tools

- **GitHub Actions**: Automated CI/CD pipeline
- **Semantic Release**: Automated versioning and changelog generation
- **Husky**: Git hooks for pre-commit validation
- **lint-staged**: Staged file linting for performance
- **Commitlint**: Conventional commit message validation

## 2. Development Environment

### 2.1 Prerequisites

- **Node.js**: v24.0.0+ (specified in engines)
- **pnpm**: v9.0.0+ (specified in engines)
- **TypeScript**: v5.9+ with strict mode enabled
- **Git**: For version control and CI/CD integration

### 2.2 Setup Instructions

```bash
# Clone repository
git clone <repository-url>
cd PokeBoids

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### 2.3 Development Scripts

```json
{
	"dev": "vite dev",
	"build": "vite build",
	"preview": "vite preview",
	"version:patch": "pnpm version patch",
	"version:minor": "pnpm version minor",
	"version:major": "pnpm version major",
	"postversion": "pnpm exec node scripts/update-version.js",
	"prepare": "svelte-kit sync && node .husky/install.mjs",
	"check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
	"format": "prettier --write .",
	"lint": "eslint .",
	"test": "vitest",
	"test:run": "vitest run",
	"test:coverage": "vitest run --coverage"
}
```

### 2.4 Configuration Files

- **svelte.config.js**: SvelteKit configuration with adapter-static
- **vite.config.ts**: Vite configuration with path aliases and plugins
- **tailwind.config.js**: Tailwind configuration with custom theme
- **tsconfig.json**: TypeScript strict mode configuration
- **eslint.config.js**: ESLint configuration with TypeScript and Svelte rules
- **.prettierrc**: Code formatting rules
- **vitest.config.ts**: Test configuration with JSDOM environment

## 3. Dependencies

### 3.1 Runtime Dependencies

```json
{
	"phaser": "^3.90.0",
	"uuid": "^11.1.0"
}
```

### 3.2 Core Development Dependencies

```json
{
	"@sveltejs/kit": "^2.27.3",
	"@sveltejs/vite-plugin-svelte": "^5.1.1",
	"svelte": "^5.38.0",
	"typescript": "^5.9.2",
	"vite": "^7.1.1",
	"vitest": "^3.2.4"
}
```

### 3.3 UI and Styling Dependencies

```json
{
	"bits-ui": "^1.8.0",
	"lucide-svelte": "^0.539.0",
	"mode-watcher": "^1.1.0",
	"svelte-sonner": "^1.0.5",
	"tailwindcss": "^3.4.17",
	"tailwindcss-animate": "^1.0.7",
	"tailwind-merge": "^2.6.0",
	"tailwind-variants": "^0.2.1",
	"clsx": "^2.1.1"
}
```

### 3.4 Testing Dependencies

```json
{
	"@vitest/coverage-v8": "^3.2.4",
	"@vitest/ui": "^3.2.4",
	"jsdom": "^26.1.0",
	"canvas": "^3.1.2"
}
```

### 3.5 CI/CD Dependencies

```json
{
	"semantic-release": "^24.2.7",
	"@semantic-release/changelog": "^6.0.3",
	"@semantic-release/commit-analyzer": "^13.0.1",
	"@semantic-release/exec": "^7.1.0",
	"@semantic-release/git": "^10.0.1",
	"@semantic-release/github": "^11.0.3",
	"@semantic-release/npm": "^12.0.2",
	"@semantic-release/release-notes-generator": "^14.0.3"
}
```

### 3.6 Code Quality Dependencies

```json
{
	"eslint": "^9.32.0",
	"typescript-eslint": "^8.39.0",
	"eslint-plugin-svelte": "^3.11.0",
	"eslint-config-prettier": "^10.1.8",
	"prettier": "^3.6.2",
	"prettier-plugin-svelte": "^3.4.0",
	"prettier-plugin-tailwindcss": "^0.6.14",
	"husky": "^9.1.7",
	"lint-staged": "^16.1.4",
	"@commitlint/cli": "^19.8.1",
	"@commitlint/config-conventional": "^19.8.1"
}
```

## 4. Technical Constraints

### 4.1 Framework Constraints

- **Svelte 5 Only**: Exclusive use of runes syntax (`$state`, `$derived`, `$effect`)
- **No Legacy Patterns**: Complete elimination of Svelte stores and Svelte 4 syntax
- **Phaser 3 Modern**: Latest syntax and features only (v3.90+)
- **TypeScript Strict**: Strict mode enabled with no implicit any
- **Static Generation**: SvelteKit adapter-static for GitHub Pages deployment

### 4.2 Performance Constraints

- **60 FPS Target**: Maintain smooth animation with 100+ boids
- **Memory Limits**: Prevent leaks in long-running simulations
- **GPU Acceleration**: Leverage hardware acceleration via Phaser 3
- **Spatial Partitioning**: QuadTree for O(n log n) neighbor detection
- **Animation Optimization**: Cached keys and efficient sprite management

### 4.3 Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **WebGL Support**: Required for Phaser 3 hardware acceleration
- **ES2022 Features**: Modern JavaScript features with Vite transpilation
- **Mobile Support**: Responsive design with touch interaction

## 5. Build and Deployment

### 5.1 Build Configuration

#### Vite Configuration

```typescript
// Path aliases for clean imports
'$components': './src/lib/components',
'$boid': './src/lib/boid',
'$game': './src/lib/game',
'$config': './src/lib/config',
'$events': './src/lib/events',
'$interfaces': './src/lib/interfaces',
'$adapters': './src/lib/adapters',
'$utils': './src/lib/utils',
'$ui': './src/lib/components/ui'
```

#### SvelteKit Configuration

```javascript
// Static site generation for GitHub Pages
adapter: adapter_static({
	pages: 'build',
	assets: 'build',
	fallback: undefined,
	precompress: false,
	strict: true
});
```

### 5.2 CI/CD Pipeline

#### GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    - ESLint validation
    - Prettier check
    - TypeScript compilation
    - Vitest unit tests
    - Coverage reporting

  build:
    - Production build
    - Asset optimization
    - Static site generation

  release:
    - Semantic release
    - Version bumping
    - Changelog generation
    - GitHub Pages deployment
```

#### Semantic Release Configuration

```json
{
	"branches": ["main"],
	"plugins": [
		"@semantic-release/commit-analyzer",
		"@semantic-release/release-notes-generator",
		"@semantic-release/changelog",
		"@semantic-release/npm",
		"@semantic-release/git",
		"@semantic-release/github"
	]
}
```

### 5.3 Version Management

#### Automated Versioning

```bash
# Version bump commands
pnpm version:patch  # Bug fixes (1.3.0 → 1.3.1)
pnpm version:minor  # New features (1.3.0 → 1.4.0)
pnpm version:major  # Breaking changes (1.3.0 → 2.0.0)

# Automatic synchronization
postversion hook → scripts/update-version.js → src/lib/utils/version.ts
```

#### Version Display

```typescript
// Environment-aware version display
export const gameVersion = '1.3.0';
export function formatVersion(prefix = 'v') {
	return `${prefix}${gameVersion}${isDev ? '-dev' : ''}`;
}
```

## 6. Coding Standards

### 6.1 TypeScript Standards

- **Strict Mode**: All strict TypeScript checks enabled
- **No Implicit Any**: Explicit type annotations required
- **Interface-Driven**: Type-safe contracts for all major systems
- **Consistent Naming**: PascalCase for types, camelCase for variables

### 6.2 Svelte Standards

- **Runes Only**: Exclusive use of `$state`, `$derived`, `$effect`
- **Component Scoping**: Localized state management where appropriate
- **Type-Safe Props**: Explicit prop type definitions
- **Reactive Patterns**: Proper use of reactive declarations

### 6.3 Code Organization

- **Path Aliases**: Clean import statements using configured aliases
- **Atomic Design**: Hierarchical component organization
- **Separation of Concerns**: Framework-agnostic core with adapters
- **Single Responsibility**: Focused, testable modules

### 6.4 Styling Standards

- **Tailwind Utilities**: Utility-first CSS approach
- **Consistent Spacing**: Tailwind spacing scale (4px base)
- **Responsive Design**: Mobile-first responsive patterns
- **Theme Integration**: Consistent light/dark theme support

## 7. Testing Strategy

### 7.1 Test Environment

#### Vitest Configuration

```typescript
// vitest.config.ts
environment: 'jsdom',
globals: true,
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  exclude: ['node_modules/', 'tests/']
}
```

#### Test Utilities

```typescript
// Mock implementations for framework-agnostic testing
MockVector implements IVector2
MockEventSystem implements IEventSystem
MockRandom implements IRandom
MockSpatialPartitioning implements ISpatialPartitioning
```

### 7.2 Testing Patterns

#### Unit Testing

- **Core Logic**: Framework-agnostic behavior testing
- **Component Testing**: Svelte component isolation with JSDOM
- **Utility Testing**: Pure function validation
- **Interface Compliance**: Adapter layer contract validation

#### Integration Testing

- **Event System**: Cross-component communication testing
- **State Management**: UI synchronization validation
- **Performance**: Spatial partitioning benchmarks

### 7.3 Test Coverage

- **Target**: 80%+ coverage for core simulation logic
- **Focus Areas**: Boid behaviors, spatial partitioning, event system
- **Exclusions**: UI components, Phaser integration, external libraries

## 8. Performance Monitoring

### 8.1 Runtime Metrics

- **FPS Monitoring**: Real-time frame rate display with color coding
- **Memory Usage**: Browser DevTools integration for leak detection
- **Boid Count**: Population tracking with performance correlation
- **Spatial Queries**: QuadTree efficiency monitoring

### 8.2 Build Metrics

- **Bundle Size**: Vite bundle analysis for optimization opportunities
- **Asset Optimization**: Image compression and sprite sheet efficiency
- **Load Time**: Initial page load and asset loading performance
- **Cache Efficiency**: Browser caching strategy effectiveness

## 9. Security Considerations

### 9.1 Client-Side Security

- **Input Validation**: Parameter bounds checking and sanitization
- **XSS Prevention**: Proper HTML escaping in dynamic content
- **CSP Headers**: Content Security Policy for GitHub Pages
- **Dependency Scanning**: Automated vulnerability detection

### 9.2 Development Security

- **Git Hooks**: Pre-commit validation and secret scanning
- **Dependency Updates**: Regular security updates via Dependabot
- **Code Review**: Pull request validation and approval process
- **Access Control**: Repository permissions and branch protection

## 10. Future Technical Considerations

### 10.1 Scalability

- **Web Workers**: Offload computation for better performance
- **WebAssembly**: High-performance simulation core
- **Progressive Loading**: Lazy loading for faster startup
- **CDN Integration**: Asset delivery optimization

### 10.2 Accessibility

- **Screen Reader**: ARIA labels and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG compliance for visual elements
- **Reduced Motion**: Respect user motion preferences

### 10.3 Browser Evolution

- **WebGPU**: Next-generation graphics API adoption
- **ES2024 Features**: Modern JavaScript feature adoption
- **PWA Capabilities**: Progressive Web App enhancements
- **Performance APIs**: Advanced performance monitoring

This technical foundation provides a robust, maintainable, and scalable platform for continued development while ensuring code quality, performance, and user experience excellence.
