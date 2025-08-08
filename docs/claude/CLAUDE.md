# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PokéBoids is an educational artificial life simulation implementing Craig Reynolds' classic boids algorithm with enhanced biological characteristics and predator-prey dynamics. Built with SvelteKit and Phaser 3, it visualizes emergent flocking behaviors using Pokémon sprites, serving as both an interactive learning tool for AI/ML concepts and a platform for behavioral experimentation.

### Key Goals

- Demonstrate emergent behaviors in complex systems through interactive visualization
- Model biological systems with realistic predator-prey dynamics
- Provide educational value for students learning about AI and complex systems
- Maintain 60 FPS performance with hundreds of active boids

## Development Commands

### Essential Commands

- `pnpm dev` - Start development server with hot module replacement
- `pnpm build` - Build production bundle
- `pnpm preview` - Preview production build locally
- `pnpm test` - Run test suite with Vitest in watch mode
- `pnpm test:run` - Run tests once (CI mode)
- `pnpm lint` - Run Prettier and ESLint checks
- `pnpm format` - Auto-format code with Prettier
- `pnpm check` - Run SvelteKit sync and type checking

### Version Management

- `pnpm version:patch` - Bump patch version
- `pnpm version:minor` - Bump minor version
- `pnpm version:major` - Bump major version
- After version bump, `scripts/update-version.js` auto-updates version across the codebase

## Architecture

### Design Philosophy

The codebase follows a **separation of concerns** principle with framework-agnostic core logic. This allows the simulation algorithms to be independent of rendering frameworks, making the code more testable and maintainable.

### Core Systems

1. **Boid System** (`src/lib/boid/`)
   - `FlockLogic` - Framework-agnostic core flocking implementation with group-based filtering
   - `PhaserFlock` - Phaser-specific wrapper managing boid lifecycle
   - `PhaserBoid` - Individual boid implementation with animation support and group IDs
   - Behaviors (`behaviors/`) - Modular behavior system using Strategy pattern:
     - `AlignmentBehavior` - Align velocity with neighbors
     - `CohesionBehavior` - Move toward center of neighbors
     - `SeparationBehavior` - Avoid crowding
     - `BoundaryAvoidanceBehavior` - Handle world boundaries (supports multiple modes)
     - `CompositeBehavior` - Combines all behaviors with configurable weights

2. **Animation System** (`src/lib/boid/animation/`)
   - `BoidAnimationController` - 8-directional sprite animation management
   - `BoidSpriteManager` - Singleton for sprite database and flavor management
   - `types.ts` - TypeScript interfaces for animation configuration
   - JSON-based sprite configuration (`src/assets/sprites/sprite-config.json`)
   - Support for 3 animation states: walk (idle), attack, hurt

3. **Spatial Partitioning** (`src/lib/boid/spatial/`)
   - `QuadTreePartitioning` - Efficient neighbor queries for O(n log n) performance
   - Critical for maintaining 60 FPS with large boid populations

4. **Game Management** (`src/lib/game/`)
   - `scenes/game.ts` - Main game scene coordinating all managers
   - Managers:
     - `BackgroundManager` - Day/night cycle and backgrounds
     - `DebugManager` - Debug visualization (FoV cones, statistics)
     - `EffectsManager` - Visual effects (collision flashes, etc.)
     - `ObstacleManager` - World boundary management

5. **Event System** (`src/lib/events/`)
   - `EventBus` - Central event bus for decoupled communication
   - Type-safe events for simulation control, boid updates, flavor changes, and UI interactions
   - Enables loose coupling between UI and game logic

6. **UI Components** (`src/lib/components/`)
   - `PhaserGame.svelte` - Phaser canvas wrapper
   - `SidebarLayout.svelte` - Collapsible sidebar system
   - Config panels for real-time parameter adjustment
   - `FlavorControls.svelte` - Environment flavor switching using shadcn ToggleGroup
   - Event debug panel for monitoring system events
   - Credits panel with proper attributions

### Adapter Pattern

The project uses dependency injection via adapters (`src/lib/adapters/`) to decouple core logic from Phaser:

- `phaser-vector.ts` - Vector math implementation
- `phaser-system.ts` - System services (random, time, physics)
- `phaser-events.ts` - Event emitter wrapper

### State Management

- **Svelte 5 Runes** (`src/lib/config/simulation-signals.svelte.ts`) - Reactive state for UI controls
  - CRITICAL: Only use Svelte 5 runes syntax - NEVER use Svelte stores or Svelte 4 patterns
  - Use `$state`, `$derived`, `$effect` for reactive state management
- **Phaser Signals** (`src/lib/game/phaser-signals.svelte.ts`) - Game state synchronization

## Testing Strategy

Tests use Vitest with JSDOM environment. Key patterns:

- Mock implementations in `tests/implementations/` for framework-agnostic testing
- Unit tests alongside source files (`*.test.ts`)
- Test utilities in `tests/utils/` for common setup

Run specific test:

```bash
pnpm test -- alignment-behavior
```

## Path Aliases

The project uses path aliases for clean imports:

- `$components` → `src/lib/components`
- `$boid` → `src/lib/boid`
- `$game` → `src/lib/game`
- `$config` → `src/lib/config`
- `$events` → `src/lib/events`
- `$interfaces` → `src/lib/interfaces`
- `$adapters` → `src/lib/adapters`
- `$utils` → `src/lib/utils`
- `$ui` → `src/lib/components/ui`
- `$tests` → `tests`

## Key Implementation Details

### Boid Behavior Flow

1. `PhaserFlock.update()` called each frame
2. `FlockLogic.update()` processes all boids:
   - Updates spatial partitioning (QuadTree)
   - Finds neighbors for each boid (considering field of view and group IDs)
   - Calculates forces via `CompositeBehavior`
   - Applies forces to boids
3. `PhaserBoid.syncWithPhaser()` updates sprite positions and animations

### Field of View System

The simulation implements biologically-inspired vision patterns:

- **Predators**: Narrow FoV (70% of base) with extended perception range (130%)
- **Prey**: Wide FoV (130% of base) with reduced perception range (80%)
- Visual debugging available with FoV cone visualization
- Configurable base FoV angle via UI controls

### Event-Driven Architecture

- UI controls emit events → Game scene listens and updates
- Game state changes emit events → UI components react
- Decouples UI from game logic for maintainability
- Type-safe event definitions prevent runtime errors

### Animation System

The boids support 8-directional sprite animations with multiple states:

- **Animation Controller**: Manages direction mapping from velocity vectors
- **Sprite States**: walk (idle), attack, hurt with proper state machine
- **Group-based Flocking**: Boids only flock with same-group members
- **JSON Configuration**: Sprite sheets and timing data in `src/assets/sprites/sprite-config.json`
- **Flavor Support**: Air, land, water environments with different sprite sets

### Performance Optimizations

- QuadTree spatial partitioning for efficient neighbor queries (O(n log n) vs O(n²))
- Animation key caching to avoid string concatenation in update loops
- Group-based neighbor filtering reduces flocking calculations
- Configurable perception/separation radii to limit calculations
- GPU-accelerated rendering via Phaser 3

## Current Development Status

### Completed Features

- Core flocking behaviors (alignment, cohesion, separation)
- Framework-agnostic architecture with adapter pattern
- Spatial partitioning for performance
- Field of view perception system
- **Animation system with 8-directional sprite support**
- **Group-based flocking with auto-generated group IDs**
- **Environment flavor system (air/land/water) with UI controls**
- **JSON-based sprite configuration system**
- Event-driven state management
- UI with real-time parameter controls
- Theme switching with day/night backgrounds
- Credits panel with proper attributions
- Semantic versioning system

### In Progress

- Performance optimization for 60 FPS target
- Attack/hurt animation triggers in predator-prey interactions
- Advanced predator-prey dynamics with animation integration
- Biological features (health, stamina, reproduction)
- Leveling system implementation

### Known Issues

- Frame rate drops with very large boid populations
- Memory usage spikes during reproduction events
- Some boundary collision edge cases

## Important Constraints

1. **Framework Requirements**
   - MUST use Svelte 5 runes syntax exclusively (no stores)
   - Use latest Phaser 3 syntax only
   - Strict TypeScript with no implicit any
   - shadcn-svelte@next for Svelte 5 compatibility

2. **Performance Targets**
   - Maintain 60 FPS with 100+ boids
   - Efficient memory management
   - GPU acceleration where possible

3. **Code Quality**
   - Interface-driven development
   - Comprehensive test coverage
   - Clean separation of concerns
   - Type-safe event system

4. **Commit Guidelines**
   - NEVER add Claude as a contributor to commits
   - NO mentions of Claude in commit messages or footers
   - Use clean, conventional commit format only
