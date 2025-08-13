# System Patterns: PokéBoids Simulation

## 1. Architecture Overview

### 1.1 System Components

- **Core Domain Logic**: Framework-agnostic boid behaviors and flocking algorithms
- **Adapter Layer**: Phaser-specific implementations with clean abstraction
- **Animation System**: 8-directional sprite management with state machines
- **UI Layer**: Svelte 5 components with runes-based reactivity
- **Event System**: Type-safe centralized EventBus for cross-system communication
- **Spatial Partitioning**: QuadTree for efficient neighbor detection
- **CI/CD Pipeline**: Automated testing, building, and deployment

### 1.2 Data Flow Architecture

```
User Input → UI Layer → Event Bus → Core Logic → Visual Feedback
Core Logic → Event Bus → UI Layer → Statistics Display
Core Logic → Adapter Layer → Phaser Rendering → Animation System
Animation System → Sprite Manager → GPU Rendering
```

### 1.3 Deployment Flow

```
Code Changes → GitHub → CI Pipeline → Tests → Build → GitHub Pages
Semantic Release → Version Bump → Changelog → Asset Optimization
```

## 2. Key Technical Decisions

### 2.1 Framework Choices

- **SvelteKit**: Application structure with static site generation
- **Svelte 5**: Component framework using runes syntax exclusively
- **Phaser 3**: Game engine for simulation rendering (v3.90+)
- **shadcn-svelte**: UI component library with bits-ui integration
- **TypeScript**: Strict mode for complete type safety
- **TailwindCSS**: Utility-first styling with responsive design

### 2.2 State Management Philosophy

- **Svelte 5 Runes**: `$state`, `$derived`, `$effect` for reactive programming
- **No Legacy Patterns**: Complete elimination of Svelte stores
- **Component-Scoped State**: Localized state management where appropriate
- **Event-Driven Updates**: Cross-component communication via EventBus
- **Interface-Driven Design**: Type-safe state definitions and contracts

### 2.3 Performance Architecture

- **Spatial Partitioning**: QuadTree for O(n log n) neighbor detection
- **GPU Acceleration**: Hardware-accelerated rendering via Phaser 3
- **Animation Caching**: Cached animation keys to avoid string concatenation
- **Memory Pooling**: Efficient object reuse for boid instances
- **Event Debouncing**: Optimized event handling for UI responsiveness

## 3. Design Patterns

### 3.1 Core Architectural Patterns

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

### 3.2 UI Patterns

#### Atomic Design

Hierarchical component organization:

```
Atoms: Button, Slider, Badge, Toggle
Molecules: ParameterSlider, StatItem, TabInfoPopover
Organisms: BoidConfigPanel, SimulationPanel, EventDebugPanel
Templates: SidebarLayout, PhaserGame
Pages: Main application layout
```

#### Container-Presenter Pattern

Separation of logic and presentation:

```typescript
// Container (Logic)
SimulationPanel.svelte → manages state and events

// Presenter (UI)
PlaybackControls.svelte → pure UI components
PopulationControls.svelte → parameter display
```

## 4. Component Relationships

### 4.1 Core Simulation Architecture

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

### 4.2 UI Layer Architecture

#### Layout Structure

```
MainLayout
├── SidebarLayout (responsive)
│   ├── SimulationPanel
│   │   ├── PlaybackControls
│   │   ├── PopulationControls
│   │   ├── SpeedControls
│   │   ├── FlavorControls
│   │   └── BoundaryModeControls
│   ├── BoidConfigPanel
│   │   ├── FlockingTab
│   │   ├── MovementTab
│   │   └── AvoidanceTab
│   ├── StatisticsPanel
│   ├── EventDebugPanel
│   └── CreditsPanel
└── PhaserGame (canvas container)
```

#### Event Flow

```
UI Components → Event Bus → Game Scene → Core Logic
Core Logic → Event Bus → UI Components → Visual Updates
Animation System → Sprite Updates → GPU Rendering
```

## 5. Data Patterns

### 5.1 Interface-Driven Architecture

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

### 5.2 Event-Driven Data Flow

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

## 6. Performance Patterns

### 6.1 Spatial Optimization

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

### 6.2 Rendering Optimization

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

### 6.3 Memory Management

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

## 7. CI/CD and Deployment Patterns

### 7.1 Automated Pipeline

#### GitHub Actions Workflow

```yaml
# Trigger: Push to main branch
Code Push → Tests → Build → Deploy
├── ESLint + Prettier validation
├── TypeScript compilation
├── Vitest unit tests
├── Production build
└── GitHub Pages deployment
```

#### Semantic Release

```
Conventional Commits → Semantic Versioning → Automated Changelog
feat: → Minor version bump
fix: → Patch version bump
BREAKING CHANGE: → Major version bump
```

### 7.2 Version Management Pattern

#### Automated Synchronization

```typescript
// package.json (source of truth)
"version": "1.3.0"

// Automatic sync via postversion hook
scripts/update-version.js → src/lib/utils/version.ts

// UI display with environment detection
formatVersion() → "v1.3.0" | "v1.3.0-dev"
```

### 7.3 Asset Processing

#### Static Asset Pipeline

```
src/assets/ → static/assets/ (migration completed)
├── Sprite sheets with JSON configuration
├── Background images (theme-responsive)
├── Favicon and branding assets
└── Optimized for production builds
```

## 8. Testing Patterns

### 8.1 Framework-Agnostic Testing

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

### 8.2 UI Testing Strategy

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

## 9. Security and Quality Patterns

### 9.1 Type Safety

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

### 9.2 Code Quality

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

## 10. Extensibility Patterns

### 10.1 Plugin Architecture

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

### 10.2 Configuration Extensibility

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

This architecture provides a solid foundation for continued development while maintaining clean separation of concerns, type safety, and performance optimization.
