# System Architecture: PokéBoids Simulation

## Architecture Overview

### System Components

- **Core Domain Logic**: Framework-agnostic boid behaviors and flocking algorithms
- **Adapter Layer**: Phaser-specific implementations with clean abstraction
- **Animation System**: 8-directional sprite management with state machines
- **UI Layer**: Svelte 5 components with runes-based reactivity
- **Event System**: Type-safe centralized EventBus for cross-system communication
- **Spatial Partitioning**: QuadTree for efficient neighbor detection
- **CI/CD Pipeline**: Automated testing, building, and deployment

### Data Flow Architecture

```
User Input → FloatingDock/Sidebar → Event Bus → Core Logic → Visual Feedback
Core Logic → Event Bus → UI Components → Statistics Display
Core Logic → Adapter Layer → Phaser Rendering → Animation System
Animation System → Sprite Manager → GPU Rendering
```

### Technology Stack

#### Core Frameworks

- **SvelteKit**: Application framework (v2.27+) with static site generation
- **Svelte 5**: Component framework (v5.38+) using runes syntax exclusively
- **Phaser 3**: Game engine (v3.90+) for simulation rendering
- **TypeScript**: Primary development language (v5.9+) with strict mode

#### UI and Styling

- **shadcn-svelte**: UI component library with Svelte 5 compatibility
- **bits-ui**: Base UI primitives (v1.8+) for component foundation
- **lucide-svelte**: Icon library (v0.539+) for consistent iconography
- **TailwindCSS**: Utility-first CSS framework (v3.4+) with responsive design
- **tailwindcss-animate**: Animation utilities for smooth transitions
- **mode-watcher**: Theme detection and management

#### Development Tools

- **Vite**: Build tool (v7.1+) with hot module replacement
- **pnpm**: Package manager (v9.0+) with workspace support
- **ESLint**: JavaScript/TypeScript linting (v9.32+) with TypeScript ESLint
- **Prettier**: Code formatting (v3.6+) with Svelte plugin
- **Vitest**: Testing framework (v3.2+) with coverage reporting

## Design Patterns

### Core Architectural Patterns

#### Adapter Pattern

Separates framework-specific code from core simulation logic:

```typescript
// Core Logic (Framework Agnostic)
BoidBehavior → IBoid interface

// Adapter Layer (Phaser Specific)
PhaserBoid → BoidBehavior + Phaser.Sprite
PhaserVector → IVector2 + Phaser.Math.Vector2
PhaserEventAdapter → IEventSystem + Phaser.Events
```

#### Strategy Pattern

Modular flocking behaviors with configurable weights:

```typescript
// Individual Behaviors
AlignmentBehavior implements IFlockingBehavior
CohesionBehavior implements IFlockingBehavior
SeparationBehavior implements IFlockingBehavior
BoundaryAvoidanceBehavior implements IFlockingBehavior

// Composition
CompositeBehavior combines all strategies with weights
```

#### State Machine Pattern

Animation state management with proper transitions:

```typescript
// Animation States
WalkState → AttackState → WalkState
WalkState → HurtState → WalkState
// No direct AttackState ↔ HurtState transitions
```

### UI Patterns

#### New Architecture (Post-Refactoring)

Hierarchical component organization with improved separation of concerns:

```
+page.svelte (Main Layout)
├── PhaserGame (Fullscreen Canvas)
├── FloatingDock (Central Control Hub)
│   ├── ThemeSwitcher
│   ├── Controls Button → Opens Sidebar
│   ├── Help Button → Opens WelcomeDialog
│   └── Audio Button (Future)
├── SidebarLayout (Responsive Sidebar System)
│   ├── SidebarContent
│   │   ├── Simulation Panel
│   │   │   ├── PlaybackControls
│   │   │   ├── PopulationControls
│   │   │   ├── SpeedControls
│   │   │   ├── FlavorControls
│   │   │   └── BoundaryModeControls
│   │   ├── Configuration Panel
│   │   │   ├── FlockingTab
│   │   │   ├── MovementTab
│   │   │   └── AvoidanceTab
│   │   ├── Statistics Panel
│   │   │   ├── FpsIndicator
│   │   │   ├── StatItem components
│   │   │   └── EventDebugPanel
│   │   └── Credits Panel
│   └── SidebarFooter
└── WelcomeDialog (Onboarding System)
    ├── Intro Tab (Boids explanation)
    ├── Creatures Tab (Sprite display)
    ├── Controls Tab (UI guide)
    └── Tips Tab (Experiments)
```

#### Component Directory Structure

```
src/lib/components/
├── dock/
│   └── FloatingDock.svelte
├── onboarding/
│   ├── onboarding-store.svelte.ts
│   └── WelcomeDialog.svelte
├── shared/
│   ├── ParameterSlider.svelte
│   ├── TabInfoPopover.svelte
│   └── ThemeSwitcher.svelte
├── sidebar/
│   ├── SidebarContent.svelte
│   ├── SidebarFooter.svelte
│   ├── SidebarLayout.svelte
│   ├── boid-config-panel/
│   ├── credits-panel/
│   ├── sim-panel/
│   └── stats-panel/
└── ui/ (shadcn-svelte components)
```

#### Container-Presenter Pattern

Separation of logic and presentation:

```typescript
// Container (Logic)
SimulationPanel.svelte → manages state and events
BoidConfigPanel.svelte → parameter management

// Presenter (UI)
PlaybackControls.svelte → pure UI components
ParameterSlider.svelte → reusable parameter display
```

## Component Relationships

### Core Simulation Architecture

#### Behavior Layer (Framework Agnostic)

```
BoidBehavior (core logic)
├── FlockLogic (behavior coordination)
├── CompositeBehavior (strategy combination)
└── Individual Behaviors
    ├── AlignmentBehavior
    ├── CohesionBehavior
    ├── SeparationBehavior
    └── BoundaryAvoidanceBehavior
```

#### Adapter Layer (Phaser Integration)

```
PhaserBoid → BoidBehavior + Phaser.Sprite
├── BoidAnimationController (8-directional animation)
├── PhaserVector (vector operations)
└── PhaserEventAdapter (event bridging)

PhaserFlock → FlockLogic + Phaser.Group
├── Spatial partitioning coordination
├── Boid lifecycle management
└── Performance optimization
```

#### Animation System

```
BoidSpriteManager (Singleton)
├── Sprite database management
├── JSON configuration loading
├── Flavor-based sprite selection
└── Performance optimization

BoidAnimationController (Per Boid)
├── Direction calculation (8-directional)
├── State machine management
├── Animation key caching
└── Frame timing control
```

### UI Event Flow

```
FloatingDock → Controls Click → SidebarLayout.visible = true
FloatingDock → Help Click → WelcomeDialog.open = true
Sidebar Components → Event Bus → Game Scene → Core Logic
Core Logic → Event Bus → UI Components → Visual Updates
Animation System → Sprite Updates → GPU Rendering
```

## Data Patterns

### Interface-Driven Architecture

#### Core Interfaces

```typescript
IBoid - Core boid behavior contract
IFlockingBehavior - Strategy pattern interface
IVector2 - Framework-agnostic vector operations
IEventSystem - Type-safe event communication
ISpatialPartitioning - Neighbor detection abstraction
```

#### Configuration Interfaces

```typescript
BoidConfig - Simulation parameter definitions
SimulationConfig - Runtime configuration
FlockingConfig - Behavior weight configuration
BoidSpriteConfig - Animation configuration
```

### Event-Driven Data Flow

#### Event Categories

```typescript
// Simulation Control
'simulation-paused' | 'simulation-resumed' | 'simulation-restart';

// Configuration Changes
'boid-config-changed' | 'simulation-config-changed';

// Biological Events
'boid-damaged' | 'boid-leveled-up' | 'boid-stamina-depleted';

// UI Events
'theme-changed' | 'debug-toggle' | 'flavor-changed';
```

#### Type Safety

All events use strongly-typed payloads with compile-time validation.

### State Management Philosophy

- **Svelte 5 Runes**: `$state`, `$derived`, `$effect` for reactive programming
- **No Legacy Patterns**: Complete elimination of Svelte stores
- **Component-Scoped State**: Localized state management where appropriate
- **Event-Driven Updates**: Cross-component communication via EventBus
- **Interface-Driven Design**: Type-safe state definitions and contracts

## Performance Patterns

### Spatial Optimization

#### QuadTree Implementation

```typescript
// Hierarchical space partitioning
QuadTree
├── Boundary detection
├── Dynamic subdivision
├── Efficient range queries
└── Memory optimization
```

#### Neighbor Detection

```
O(n²) naive approach → O(n log n) with QuadTree
Field of view filtering → Cone-based perception
Distance culling → Early rejection optimization
```

### Rendering Optimization

#### Animation Performance

```typescript
// Cached animation keys (avoid string concatenation)
const animKey = `${spriteId}-${state}-${direction}`;
animationKeyCache.set(boidId, animKey);

// Efficient sprite management
BoidSpriteManager.getInstance().getSprite(config);
```

#### GPU Acceleration

```
Phaser 3 WebGL renderer → Hardware acceleration
Sprite batching → Reduced draw calls
Texture atlasing → Memory efficiency
```

### Memory Management

#### Object Pooling

```typescript
// Reuse vector instances
vectorFactory.create() → pooled vectors
vectorFactory.release() → return to pool
```

#### Event Cleanup

```typescript
// Automatic cleanup on destroy
boid.destroy() → removes all event listeners
scene.shutdown() → cleans up all resources
```

## Build and Deployment

### Build Configuration

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
'$ui': './src/lib/components/ui',
'$sidebar': './src/lib/components/sidebar'
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

### CI/CD Pipeline

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

### Version Management

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
export const gameVersion = '1.4.0';
export function formatVersion(prefix = 'v') {
	return `${prefix}${gameVersion}${isDev ? '-dev' : ''}`;
}
```

## Testing Patterns

### Framework-Agnostic Testing

#### Core Logic Tests

```typescript
// Pure behavior testing with mocks
MockVector implements IVector2
MockEventSystem implements IEventSystem
MockRandom implements IRandom

// Isolated behavior validation
AlignmentBehavior.test.ts → pure algorithm testing
BoidBehavior.test.ts → lifecycle and state testing
```

#### Integration Testing

```typescript
// Adapter layer validation
PhaserBoid integration with BoidBehavior
Event system communication testing
Spatial partitioning performance benchmarks
```

### UI Testing Strategy

#### Component Testing

```typescript
// Svelte component isolation
render(Component, { props }) → JSDOM testing
fireEvent.click() → user interaction simulation
expect(screen.getByText()) → assertion validation
```

#### Event System Testing

```typescript
// Cross-component communication
EventBus.emit() → component reaction testing
State synchronization → UI update validation
```

## Coding Standards

### TypeScript Standards

- **Strict Mode**: All strict TypeScript checks enabled
- **No Implicit Any**: Explicit type annotations required
- **Interface-Driven**: Type-safe contracts for all major systems
- **Consistent Naming**: PascalCase for types, camelCase for variables

### Svelte Standards

- **Runes Only**: Exclusive use of `$state`, `$derived`, `$effect`
- **Component Scoping**: Localized state management where appropriate
- **Type-Safe Props**: Explicit prop type definitions
- **Reactive Patterns**: Proper use of reactive declarations

### Code Organization

- **Path Aliases**: Clean import statements using configured aliases
- **Atomic Design**: Hierarchical component organization
- **Separation of Concerns**: Framework-agnostic core with adapters
- **Single Responsibility**: Focused, testable modules

### Styling Standards

- **Tailwind Utilities**: Utility-first CSS approach
- **Consistent Spacing**: Tailwind spacing scale (4px base)
- **Responsive Design**: Mobile-first responsive patterns
- **Theme Integration**: Consistent light/dark theme support

## Extensibility Patterns

### Plugin Architecture

#### Modular Behaviors

```typescript
// Easy behavior addition
class NewBehavior implements IFlockingBehavior {
	calculate(boid: IBoid, neighbors: IBoid[]): IVector2;
}

// Automatic integration
CompositeBehavior.addBehavior(new NewBehavior(), weight);
```

#### Manager System

```typescript
// Extensible game managers
BackgroundManager → theme and flavor handling
DebugManager → visualization and monitoring
EffectsManager → visual feedback systems
ObstacleManager → environmental elements
```

### Configuration Extensibility

#### Dynamic Configuration

```typescript
// Runtime parameter adjustment
EventBus.emit('parameter-changed', { key, value })
→ Automatic propagation to all systems
→ UI synchronization
→ Persistent state management
```

#### Flavor System

```typescript
// Easy environment addition
SimulationFlavor: 'air' | 'land' | 'water' | 'custom';
BoidSpriteManager.addFlavor(config);
BackgroundManager.addTheme(flavor, backgrounds);
```

## Security and Quality

### Type Safety

#### Strict TypeScript

```typescript
// No implicit any, strict null checks
"strict": true in tsconfig.json
Interface-driven development
Compile-time error prevention
```

#### Runtime Validation

```typescript
// Input sanitization
clamp(value, min, max) → bounded parameters
isFinite(position.x) → NaN prevention
hasSignificantLength() → zero-vector handling
```

### Code Quality

#### Automated Formatting

```
Prettier → consistent code style
ESLint → error prevention and best practices
lint-staged → pre-commit validation
Husky → git hook automation
```

#### Documentation Standards

```
TSDoc comments → API documentation
Memory bank → architectural decisions
Claude documentation → AI assistant context
README → user and developer guidance
```

This architecture provides a solid foundation for continued development while maintaining clean separation of concerns, type safety, and performance optimization. The recent UI refactoring has significantly improved the user experience while preserving the robust technical foundation.
