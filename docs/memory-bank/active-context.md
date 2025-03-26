# Active Context: Boids Simulation

## Current Work Focus

### 1. Simulation Core Development

- [x] Completed separation of boid and flocking behavior from Phaser rendering
- [x] Implemented adapter pattern for framework-agnostic core logic
- [x] Centralized event system implementation
- [x] Addressed configuration management TODOs
- [x] Refactored update method redundancy
- [] Improving performance metrics with focus on 60 FPS target

### 2. UI Improvements

- Refactoring control panel components to use Svelte 5 runes
- Adding simulation parameters for biological features
- Implementing responsive design with shadcn-svelte components
- Enhancing theme switching with day/night backgrounds

### 3. Testing Infrastructure

- Expanding unit test coverage for boid behaviors
- Adding integration tests for predator-prey interactions
- Implementing performance benchmarks for FPS and memory usage
- Setting up CI/CD pipeline with Vitest

## Recent Changes

### 1. Codebase Updates

- Fully migrated to Svelte 5 runes syntax (no stores)
- Implemented strict TypeScript types throughout
- Updated Phaser to latest version with modern syntax
- Integrated shadcn-svelte components with TailwindCSS
- Completed core behavior separation with adapter pattern
- Implemented field of view (FoV) system:
  - Predators: Narrower FoV (70%) with larger perception radius (130%)
  - Prey: Wider FoV (130%) with shorter perception radius (80%)
  - Added UI controls for base FoV angle
  - Visual debugging with FoV cones

### 2. Architecture Changes

- Implemented component-scoped state with runes
- Centralized event system with unified event bus
- Optimized rendering with GPU acceleration
- Enhanced component structure using atomic design
- Separated core boid logic from rendering concerns
- Simplified event handling with type-safe adapters
- Added event debugging and monitoring capabilities
- Enhanced boid perception system:
  - Field of view cone-based perception
  - Type-specific perception multipliers
  - Biologically inspired vision patterns

### 3. Dependency Updates

- Updated all dependencies to latest versions
- Removed deprecated packages
- Added new development tools
- Improved build process

## Next Steps

### 1. Immediate Priorities

- [x] Centralized event bus implementation
- [x] Simplified event system architecture
- [x] Refactored PhaserBoid update method
- [x] Added event debugging capabilities
- [x] Add spatial partioning to flocking logic to improve performance significantly
  - Implemented quad tree spatial partitioning
  - Added event-based world bounds handling
  - Created comprehensive tests and benchmarks
- [ ] Document separation architecture and patterns
- [ ] Implement performance benchmarks

### 2. Upcoming Features

- Implement leveling system for both predator and prey
- Add reproduction mechanics with stat inheritance
- Create advanced parameter controls for biological features
- Add debug visualization modes for development
- Implement spatial partitioning to improve performance with a large number of boids

### 3. Technical Debt

- Remove any remaining non-runes patterns
- Document biological system implementations
- Optimize collision detection algorithms
- Enhance error handling for edge cases
- Implement performance benchmarks for FPS and memory usage

## Active Decisions

### 1. Technical Choices

- Using Svelte 5 runes exclusively
- Maintaining strict TypeScript types
- Following atomic design principles
- Implementing performance-first approach

### 2. Architectural Decisions

- Complete separation of core logic from rendering
- Framework-agnostic boid and flocking behavior
- Adapter pattern for Phaser integration
- Centralized event system with type-safe communication
- Composition over inheritance in boid implementation
- Single source of truth for event handling
- Comprehensive event debugging and monitoring

### 3. Development Practices

- Strict code reviews
- Comprehensive testing
- Continuous integration
- Performance monitoring
- Interface-driven development

### 4. Versioning System

- Implemented semantic versioning system following SemVer 2.0.0
- Version maintained in package.json as source of truth
- Automatic sync to src/lib/utils/version.ts via postversion script
- Enhanced version display in UI with development indicator
- Version bumping commands:
  - `pnpm version:patch` for bug fixes
  - `pnpm version:minor` for new features
  - `pnpm version:major` for breaking changes
