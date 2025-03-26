# System Patterns: Boids Simulation

## 1. Architecture Overview

### 1.1 System Components

- **Core Domain Logic**: Framework-agnostic boid behaviors
- **Adapter Layer**: Phaser-specific implementations
- **UI Layer**: Svelte 5 components
- **State Management**: Svelte runes
- **Event System**: Type-safe event bus

### 1.2 Data Flow

- User Input → UI Layer → Event Bus → Core Logic → Visual Feedback
- Core Logic → Event Bus → UI Layer → Statistics Display
- Core Logic → Adapter Layer → Phaser Rendering

## 2. Key Technical Decisions

### 2.1 Framework Choices

- SvelteKit for application structure
- Phaser 3 for simulation rendering
- shadcn-svelte for UI components
- TypeScript for type safety
- TailwindCSS for styling

### 2.2 State Management

- Svelte 5 runes for reactive state
- No Svelte stores (legacy pattern)
- Component-scoped state where appropriate
- Interface-driven state definitions

### 2.3 Performance Optimization

- Spatial partitioning for neighbor detection
- GPU-accelerated rendering
- Efficient collision detection algorithms
- Memory pooling for boid instances

## 3. Design Patterns

### 3.1 Core Patterns

- **Adapter Pattern**: Separates core logic from framework specifics
  - PhaserVector adapts Phaser.Math.Vector2
  - PhaserEventAdapter bridges event systems
  - PhaserBoid adapts core behavior to Phaser sprites

- **Strategy Pattern**: Modular flocking behaviors
  - AlignmentBehavior
  - CohesionBehavior
  - SeparationBehavior
  - CompositeBehavior for combining strategies

- **Composition Pattern**: Boid implementation
  - PhaserBoid composes BoidBehavior
  - Favors composition over inheritance
  - Enables framework independence

### 3.2 UI Patterns

- Atomic design for component structure
- Unidirectional data flow
- Container-presenter pattern
- Compound components for complex UI

## 4. Component Relationships

### 4.1 Core Simulation

- **Behavior Layer**:
  - BoidBehavior (core logic)
  - FlockLogic (behavior coordination)
  - Individual behaviors (alignment, cohesion, separation)

- **Adapter Layer**:
  - PhaserBoid → BoidBehavior
  - PhaserFlock → FlockLogic
  - PhaserVector → Core vector operations

- **Integration Layer**:
  - Game scene coordinates adapters
  - Event bus handles cross-layer communication

### 4.2 UI Layer

- MainLayout → SimulationView
- ControlPanel → ParameterControls
- StatsDisplay → Event Bus → Core State

## 5. Data Patterns

### 5.1 Interface Definitions

- IBoid defines core boid behavior
- IFlockingBehavior for steering behaviors
- IVector2 for framework-agnostic vectors
- IEventSystem for type-safe events

### 5.2 Data Flow

- Core logic operates on interfaces
- Adapters translate between systems
- Event-driven updates for loose coupling
- Type-safe event definitions

## 6. Performance Patterns

### 6.1 Rendering

- Canvas-based rendering
- GPU acceleration
- Efficient draw calls
- Adapter-based sprite management

### 6.2 Simulation

- Framework-independent core logic
- Efficient neighbor detection
- Memory pooling
- Optimized vector operations

### 6.3 Event System

- Type-safe event definitions
- Centralized event bus
- Efficient event propagation
- Clear event hierarchies

### 6.4 Versioning Pattern

- **Semantic Versioning**: Following SemVer 2.0.0 specification
  - MAJOR: Breaking changes
  - MINOR: New features
  - PATCH: Bug fixes

- **Version Management**:
  - Single source of truth in package.json
  - Automated sync to application code
  - Consistent display in UI
  - Standardized bump commands

## 7. Testing Patterns

### 7.1 Core Logic Testing

- Pure behavior testing
- Mock vector operations
- Simulated flocking scenarios
- Interface compliance tests

### 7.2 Adapter Testing

- Integration test coverage
- Framework boundary testing
- Event system validation
- Performance benchmarking

### 7.3 UI Testing

- Component isolation tests
- Event handling tests
- State management validation
- User interaction testing
