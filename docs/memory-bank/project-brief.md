# PokéBoids: Interactive Ecosystem Simulation

## Project Overview

PokéBoids is an educational artificial life simulation implementing Craig Reynolds' classic boids algorithm with enhanced biological characteristics and predator-prey dynamics. Built with SvelteKit and Phaser 3, it visualizes emergent flocking behaviors using animated Pokémon sprites, serving as both an interactive learning tool for AI/ML concepts and a platform for behavioral experimentation.

### Core Purpose & Educational Value

- **Emergent Behavior Demonstration**: Visualizes how simple rules create complex flocking patterns
- **Predator-Prey Dynamics**: Models biological ecosystem interactions (foundation implemented, activation needed)
- **Interactive Learning Platform**: Real-time parameter exploration for AI/ML and complex systems concepts
- **Visual Algorithm Understanding**: Makes abstract computational concepts tangible through animation
- **Research Foundation**: Clean, well-documented codebase suitable for academic reference and extension

## Boids Algorithm Foundation

### The Three Classic Rules

Each boid implements Craig Reynolds' three fundamental flocking behaviors:

#### 1. Alignment ✅ Implemented

- Boids gradually steer toward the average direction of neighboring boids
- User-adjustable alignment factor with real-time slider control
- Smooth velocity matching for natural movement transitions

#### 2. Cohesion ✅ Implemented

- Boids gradually steer toward the average position of neighboring boids
- User-adjustable coherence factor with immediate visual feedback
- Smooth interpolation for natural movement patterns

#### 3. Separation ✅ Implemented

- Boids avoid collisions by steering away from neighbors
- User-adjustable separation factor with real-time parameter control
- Distance-based weighting (closer boids have stronger effect)

### Advanced Behavioral Features

#### Field of View System ✅ Implemented

- **Cone-based Perception**: Configurable vision angles and ranges
- **Type-Specific Vision**:
  - Predators: Narrow FoV (70% of base) with extended range (130%)
  - Prey: Wide FoV (130% of base) with reduced range (80%)
- **Debug Visualization**: Optional FoV cone rendering for development and education
- **Real-time Adjustment**: UI controls for base FoV angle with immediate effect

#### Group-Based Flocking ✅ Implemented

- **Auto-Generated Groups**: Boids assigned unique group IDs for species-specific behavior
- **Selective Interaction**: Boids only flock with same-group members for realistic behavior
- **Visual Distinction**: Different sprites for predator/prey within each environment flavor
- **Performance Benefits**: Reduced computation through group-based neighbor filtering

## Technical Stack & Architecture

### Core Technologies

- **SvelteKit**: Application framework (v2.27+) with static site generation
- **Svelte 5**: Component framework (v5.38+) using runes syntax exclusively
- **Phaser 3**: Game engine (v3.90+) for simulation rendering with GPU acceleration
- **TypeScript**: Primary development language (v5.9+) with strict mode
- **shadcn-svelte**: UI component library with Svelte 5 compatibility
- **bits-ui**: Base UI primitives (v1.8+) for component foundation
- **TailwindCSS**: Utility-first CSS framework (v3.4+) with responsive design

### Architecture Principles

#### Framework-Agnostic Core

- **Clean Separation**: Simulation logic independent of rendering framework
- **Adapter Pattern**: Phaser-specific implementations with clean abstraction
- **Interface-Driven**: Type-safe contracts for all major systems
- **Event-Driven**: Centralized EventBus for cross-system communication

#### Performance Optimization

- **Spatial Partitioning**: QuadTree implementation for O(n log n) neighbor detection
- **GPU Acceleration**: Hardware-accelerated rendering via Phaser 3
- **Animation Caching**: Cached animation keys to avoid string concatenation overhead
- **Memory Management**: Proper cleanup and object pooling to prevent leaks

## Core Features

### Animation System ✅ Completed

- **8-Directional Movement**: Boids animate based on velocity direction with smooth transitions
- **Animation States**: Walk (idle), Attack, Hurt with proper state machine implementation
- **Sprite Management**: Centralized BoidSpriteManager with JSON configuration system
- **Performance Optimization**: Animation key caching to avoid string concatenation overhead
- **Professional Assets**: Licensed Pokémon sprites from PMD Sprite Collab

### Environment Flavors

- **Air Environment**: Flying Pokémon (Zubat/Crobat) with sky backgrounds ✅ Implemented
- **Land Environment**: Ground-based Pokémon with terrestrial backgrounds 📋 Planned
- **Water Environment**: Aquatic Pokémon with underwater backgrounds 📋 Planned
- **Dynamic Switching**: Real-time flavor switching via UI toggle controls ✅ Implemented

### User Interface System

#### New Architecture (Recent Major Refactoring)

- **FloatingDock**: Central control hub at bottom of screen with theme switcher, controls, help, and audio buttons
- **WelcomeDialog**: Comprehensive onboarding system with tabbed tutorial (Intro, Creatures, Controls, Tips)
- **SidebarLayout**: Responsive sidebar system with organized panels
- **Component Organization**: New directory structure with `dock/`, `onboarding/`, `shared/`, and `sidebar/` subdirectories

#### Sidebar Panel System

- **Simulation Panel**: Start/pause/reset, population controls, speed controls, environment flavors, boundary modes
- **Configuration Panel**: Real-time flocking parameter adjustment (alignment, cohesion, separation, FoV, movement)
- **Statistics Panel**: Real-time population counts, FPS monitoring, event debug panel
- **Credits Panel**: Proper attribution for sprites, research references, and acknowledgments

### Spatial Partitioning ✅ Implemented

- **QuadTree Implementation**: Hierarchical space partitioning for efficient neighbor queries
- **Dynamic Bounds**: Automatic world boundary detection and handling
- **Performance Critical**: Enables 60 FPS with hundreds of boids (O(n log n) complexity)
- **Memory Efficient**: Optimized tree structure with proper cleanup

### Boundary Management ✅ Implemented

- **Multiple Modes**: Wrap, bounce, and containment boundary behaviors
- **Smooth Avoidance**: Steering-based boundary avoidance using vector mathematics
- **Corner Handling**: Special logic for 45° approach angles and edge cases
- **Real-time Switching**: Dynamic boundary mode changes via UI controls

## Biological Features - Implementation Status

### Foundation Complete ✅ Implemented

All biological system infrastructure is implemented in code:

#### Stats System

- **Health, Stamina, Speed**: Core biological attributes with proper scaling
- **Reproduction Progress**: Tracking toward reproduction thresholds with limits
- **Level System**: Experience-based progression with random stat improvements
- **Sex Determination**: Binary system for reproduction mechanics

#### Predator-Specific Features

- **Attack Stat**: Damage calculation system fully implemented
- **Attack Radius**: Proximity-based interaction detection
- **Attack Animations**: Animation states ready for combat triggers

### Critical Gap - Activation Required ⚠️

**All biological features exist in code but are NOT connected to gameplay:**

#### Missing Implementations

- **Predator-Prey Interactions**: No actual hunting or combat occurs in simulation
- **Health/Damage Visualization**: No visual feedback for biological states
- **Death Mechanics**: Boids don't die when health reaches zero
- **Reproduction Implementation**: No new boids created when thresholds met
- **Animation Triggers**: Attack/hurt animations not triggered by combat events

## Development Infrastructure ✅ Completed

### CI/CD Pipeline

- **GitHub Actions**: Automated testing, building, and deployment workflow
- **Semantic Release**: Automated versioning following SemVer 2.0.0 specification
- **GitHub Pages**: Static site deployment with custom domain support
- **Quality Gates**: ESLint, Prettier, TypeScript checks, and comprehensive test coverage

### Code Quality

- **TypeScript Strict Mode**: 100% type safety throughout codebase
- **Svelte 5 Runes**: Exclusive use of modern reactive patterns (no legacy stores)
- **Testing Strategy**: Vitest with JSDOM environment for comprehensive coverage
- **Framework-Agnostic Testing**: Core logic testing with mock implementations

## Target Audience & Applications

### Primary Users

#### Students and Educators

- **Computer Science Students**: Learning AI, algorithms, and complex systems
- **Biology Students**: Understanding predator-prey dynamics and ecosystem modeling
- **Educators**: Interactive teaching tool for demonstrating emergent behavior
- **Researchers**: Reference implementation for boids algorithm variations

#### Developers and Technologists

- **Game Developers**: Learning flocking algorithms and spatial optimization
- **Web Developers**: Modern framework integration and performance optimization
- **AI/ML Practitioners**: Understanding swarm intelligence and collective behavior

### Educational Applications

#### Academic Institutions

- **Curriculum Integration**: Supplement for computer science and biology courses
- **Research Platform**: Foundation for more complex ecosystem simulations
- **Student Projects**: Codebase example for software engineering practices

#### Professional Training

- **Algorithm Education**: Practical demonstration of optimization techniques
- **Performance Analysis**: Real-world example of spatial partitioning benefits
- **Modern Development**: Showcase of current web development best practices

## Future Enhancements

### High Priority - Biological System Activation 🔥

#### Immediate Requirements

- **Combat Implementation**: Connect existing attack/damage systems to actual gameplay
- **Visual Health Indicators**: Display health/stamina status in UI or on boids
- **Death and Removal**: Remove boids when health reaches zero
- **Reproduction Mechanics**: Create new boids when reproduction thresholds are met
- **Animation Integration**: Trigger attack/hurt animations during predator-prey encounters

#### Advanced Biological Features 📋 Planned

- **Pack Hunting**: Coordinated predator behaviors with group tactics
- **Territorial Behavior**: Environmental factors and resource competition
- **Genetic Inheritance**: Stat inheritance in reproduction system
- **Adaptive Behaviors**: Learning and behavioral evolution over time

### Medium Priority

#### Performance Scaling

- **Large Population Support**: Optimize for 200+ boids while maintaining 60 FPS
- **Memory Management**: Prevent leaks in long-running simulations
- **GPU Utilization**: Better leverage hardware acceleration capabilities

#### Educational Enhancements

- **Guided Tutorials**: Interactive learning experiences with step-by-step guidance
- **Scenario Presets**: Pre-configured interesting scenarios for exploration
- **Data Export**: Export simulation data for analysis and research
- **Recording/Replay**: Save and replay interesting simulation moments

### Long-term Vision

#### Research Platform Evolution

- **Multiple Species**: Additional Pokémon with unique behavioral characteristics
- **Environmental Factors**: Weather, terrain, seasonal changes affecting behavior
- **Machine Learning Integration**: AI-driven behavior evolution and optimization
- **Community Features**: Shareable configurations and collaborative scenarios

#### Educational Ecosystem

- **Curriculum Integration**: Formal educational program partnerships
- **Assessment Tools**: Built-in evaluation and progress tracking
- **Multilingual Support**: Internationalization for global educational use
- **Accessibility Excellence**: Full WCAG compliance and inclusive design

## Success Metrics

### Technical Performance ✅ Achieved

- **Frame Rate**: Maintains 60 FPS with 100+ active boids
- **Memory Management**: No memory leaks in long-running simulations
- **Cross-browser Compatibility**: Consistent experience across Chrome, Firefox, Safari, Edge
- **Mobile Responsiveness**: Optimized layout and touch interaction support

### Code Quality ✅ Achieved

- **TypeScript Strict Mode**: 100% type safety throughout codebase
- **Test Coverage**: Comprehensive unit tests for core behaviors and integration tests
- **Clean Architecture**: Framework-agnostic core with clear separation of concerns
- **Professional Development**: Automated CI/CD, semantic versioning, code quality tools

### User Experience ✅ Mostly Achieved

- **Professional Presentation**: Custom branding, splash screen, polished interactions
- **Real-time Responsiveness**: Immediate parameter adjustment with visual feedback
- **Educational Value**: Interactive exploration of flocking parameters and algorithms
- **Engagement**: Pokémon theme creates immediate connection and sustained interest

### Educational Impact ⚠️ Pending Biological Activation

- **Complete Ecosystem**: Requires activation of predator-prey dynamics for full educational value
- **Biological Understanding**: Visual demonstration of ecosystem balance and survival strategies
- **Interactive Learning**: Hands-on exploration of complex systems and emergent behavior

## Unique Achievements

### Technical Innovation

- **Framework-Agnostic Architecture**: Testable, maintainable simulation core independent of rendering
- **Modern Web Standards**: Showcase of Svelte 5, TypeScript strict mode, and professional CI/CD
- **Performance Excellence**: Spatial partitioning and GPU acceleration for smooth real-time simulation
- **Professional Quality**: Production-ready deployment with automated versioning and quality gates

### Educational Value

- **Interactive Algorithm Demonstration**: Real-time parameter exploration makes abstract concepts tangible
- **Engaging Presentation**: Pokémon sprites create immediate connection while maintaining scientific rigor
- **Research Foundation**: Clean, well-documented codebase suitable for academic reference and extension
- **Cross-disciplinary Appeal**: Bridges computer science, biology, and interactive media

## Critical Path Forward

The project has achieved exceptional technical and presentation quality, with all foundational systems complete and professional-grade deployment. The highest priority is **activating the biological systems** that are fully implemented in code but not connected to gameplay.

**Success Definition**: Transform the current flocking demonstration into a complete ecosystem simulation where predators hunt prey, boids reproduce, and populations self-regulate - leveraging the robust foundation already in place.

This activation will complete the educational value proposition and fulfill the original vision of predator-prey dynamics while maintaining the technical excellence and professional presentation already achieved.
