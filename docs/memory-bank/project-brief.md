# Product Requirements Document: Boids Simulation

## 1. Overview

### 1.1 Product Description

An interactive artificial life simulation implementing the classic Boids algorithm with predator-prey dynamics. The application simulates flocking behavior with enhanced biological characteristics and advanced steering mechanics using modern web technologies.

### 1.2 Purpose and Scope

This simulation serves as both an educational tool to demonstrate emergent behaviors in complex systems and an interactive playground for users to experiment with various parameters affecting flocking behavior. The scope includes a fully client-side simulation with configurable parameters and real-time visualization.

## 2. Technical Requirements

### 2.1 Technology Stack

- **Frontend Framework**: SvelteKit with Svelte 5 (runes syntax only. DO NOT use stores or older Svelte 4 syntax)
- **Rendering Engine**: Phaser 3 (latest syntax)
- **UI Components**: shadcn-svelte (shadcn-svelte@next version for Svelte 5 compatibility)
- **Styling**: TailwindCSS with tailwindcss-animate for animations
- **Development Tools**: TypeScript, Vite, ESLint, Prettier
- **Additional Libraries**: ModeWatcher, lucide-svelte

### 2.2 Architecture Overview

- Client-side only implementation (no server-side rendering)
- Canvas-based simulation using Phaser 3
- Component-based UI using Svelte 5
- Reactive state management using Svelte runes ONLY! DO NOT use Svelte stores or older Svelte 4 syntax when newer Svelte 5 syntax or paradigms are available.

### 2.3 Performance Requirements

- Support for hundreds of boids simultaneously
- Target 60 FPS on modern browsers
- Utilize GPU acceleration where available
- Optimize collision detection and neighbor calculations
- Efficient rendering using Phaser's latest features
- Memory management to prevent leaks during long simulations

## 3. Simulation Core Features

### 3.1 Boid Base Behavior

Each boid (bird-oid object) must implement the three classic flocking behaviors:

#### 3.1.1 Coherence

- Boids gradually steer toward the average position of neighboring boids
- User-adjustable coherence factor controls steering rate
- Implement smooth interpolation for natural movement

#### 3.1.2 Separation

- Boids avoid collisions with neighbors by steering away
- User-adjustable separation factor controls avoidance strength
- Implement distance-based weighting (closer boids have stronger effect)

#### 3.1.3 Alignment

- Boids adjust their velocity to match neighboring boids' direction and speed
- User-adjustable alignment factor controls matching rate (as specified in original requirements)
- Implement gradual velocity matching for natural transitions

### 3.2 Visual Range and Perception

- Implement a configurable visual range for each boid
- Visual range represented as a swept area in front of the boid
- Configurable field of view angle
- Only consider other boids within visual range when applying behavior rules

### 3.3 Obstacle Avoidance

- Implement boundary avoidance using steering mechanics
- Calculate dot product between velocity vector and boundary normal
- Steer boids away from approaching boundaries
- Use cross product to determine steering direction
- Implement special handling for corner cases (45° approach angles)
- Support for avoiding placed obstacles with the same avoidance mechanics

### 3.4 Boid Types and Behaviors

#### 3.4.1 Prey Boids

- Primary behavior: flock together and avoid obstacles, boundaries, and predators
- Actively detect and avoid predators within visual range and predation radius
- Adjust formation density in response to predator presence
- Implement "loose formation" behavior by adjusting separation radius when predators detected

#### 3.4.2 Predator Boids

- Primary behavior: hunt prey boids
- Support both pack hunting and coordinated solo hunting
- Implement coordinated target selection and pursuit behaviors
- Special handling for predator-predator interactions

## 4. Advanced Biological Features

### 4.1 Boid Statistics System

#### 4.1.1 Base Statistics

All boids must track the following attributes:

- **Sex**: Male or female (binary for reproduction purposes)
- **Health**: Vitality metric, depleted by attacks, death at zero
- **Stamina**: Endurance metric affecting sustained speed
- **Speed**: Base movement rate capability
- **Reproduction**: Progress toward creating offspring
- **Level**: Experience-based stat multiplier

#### 4.1.2 Special Statistics

- **Attack** (Predators only): Determines damage dealt to prey

### 4.2 Health and Damage System

- Health starts at a base value and scales with level
- Predator attacks deplete prey health based on attack stat
- Death and removal when health reaches zero
- No health regeneration (implement if time permits)

### 4.3 Movement and Stamina System

- Speed limited by base speed stat
- Boids can choose to slow down to any speed less than or equal to their speed stat
- Stamina depleted at a rate of current speed multiplied by a factor
- Base speed temporarily halved when stamina is fully depleted
- Automatic stamina recovery after fixed cooldown period
- Gradual speed recovery as stamina recovers until back to default base speed
- Slowing down speed is a good behavior to conserve stamina when there are no predators detected

### 4.4 Reproduction System

#### 4.4.1 Prey Reproduction

- Reproduction stat increments for every second that prey are within very close distance of opposite sex
- 100% reproduction stat (value of 100) triggers reproduction opportunity
- Two new prey clones created with averaged stats from both parents, weighted towards the parent that initiated reproduction
- Limit of 3 reproductions per individual
- Reset reproduction stat to 0 after successful reproduction

#### 4.4.2 Predator Reproduction

- Kill-based reproduction stat accumulation via collision with prey
- Reproduction points gained relative to prey's health multiplied by a factor
- Requires finding opposite sex predator (with any reproduction stat value) to reproduce
- Creates one cloned predator offspring with stats averaged from parents, heavily weighted toward parent with higher reproduction stat
- Limit of 5 reproductions per individual
- Reset reproduction stat to 0 after successful reproduction

### 4.5 Leveling System

#### 4.5.1 Prey Leveling

- Time-based level progression
- One level per fixed time period survived
- Small random stat increases per level

#### 4.5.2 Predator Leveling

- Proximity-based level progression (predation radius)
- Timer pauses when out of predation radius
- One level per fixed duration in proximity
- Small random stat increases per level

## 5. User Interface Requirements

### 5.1 Simulation Controls

- **Start/Reset button**: Initialize or restart the simulation
- **Play/Pause button**: Control simulation execution
- **Initial population controls**: Set starting number of predator and prey boids

### 5.2 Parameter Adjustment

- **Coherence slider**: Adjust flock attraction strength
- **Alignment slider**: Adjust velocity matching strength
- **Separation slider**: Adjust collision avoidance strength
- **Field of View slider**: Adjust boid perception angle
- **Predation Distance slider**: Adjust predator detection range
- **Timer Configuration**: Set default values for leveling and other time-based mechanics

### 5.3 Information Display

- **Boid Inspector**: Hover tooltip showing boid type and all relevant statistics in a pretty yet informative way, following good UI/UX guidelines
- **Population Counter**: Real-time count of predator and prey populations
- **Performance Metrics**: FPS counter and optimization information (optional)

### 5.4 UI/UX Design Requirements

- Clean, minimalist interface using shadcn-svelte components and lucide-svelte icons
- Responsive design for various screen sizes
- Intuitive control placement following common design patterns
- Clear visual distinction between different types of controls
- High-contrast, readable text with appropriate font sizes
- Unobtrusive UI that doesn't interfere with simulation visibility

## 6. Visual Design Requirements

### 6.1 Boid Visualization

- Distinct visual representation for predator and prey boids
- Visual indicators for boid stats (Debug - optional color coding)
- Animation for movement and state changes
- (Debug) visual representation of visual range and field of view

### 6.2 Environment Visualization

- Clear boundary representation
- Obstacle visualization
- (Debug) Grid or reference points for scale

### 6.3 Effects and Feedback

- Visual feedback for interactions (predator attacks, reproduction)
- Particle effects for deaths and births (if performance allows)
- Smooth animation for all state transitions

## 7. Implementation Phases

### 7.1 Phase 1: Core Simulation

- Basic Phaser 3 setup with SvelteKit integration
- Implementation of the three core flocking behaviors (alignment, coherence, separation)
- Basic boid rendering and movement
- Boundary handling and obstacle avoidance

### 7.2 Phase 2: Boid Types and Stats

- Implement predator and prey types
- Add basic stats system (health, speed, etc.)
- Implement predator-prey interactions
- Add basic UI controls for simulation parameters

### 7.3 Phase 3: Advanced Features

- Implement reproduction system
- Add leveling mechanics
- Enhance predator hunting behaviors
- Implement stamina system
- Finalize UI with all parameter controls

### 7.4 Phase 4: Polish and Optimization

- Performance optimization
- UI/UX refinement
- Visual enhancements
- Bug fixes and edge case handling

## 8. Testing Requirements

### 8.1 Performance Testing

- FPS benchmarking with varying numbers of boids
- Memory usage monitoring for long-running simulations
- Load testing with maximum supported boids

### 8.2 Functional Testing

- Verification of all boid behaviors using unit tests
- Validation of stat systems and interactions using unit tests
- UI control testing
- Edge case testing (boundary conditions, extreme parameter values)

### 8.3 Compatibility Testing

- Cross-browser testing
- Device/screen size testing
- GPU vs CPU rendering testing

## 9. Deliverables

### 9.1 Source Code

- Complete SvelteKit project repository
- Well-documented code following TypeScript best practices
- Organized component structure
- Comprehensive README with setup instructions

### 9.2 Application

- Deployed web application (hosting platform TBD)
- Optimized build for production use

### 9.3 Documentation

- User guide explaining all features and controls
- Implementation notes for future reference
- Known limitations and potential future enhancements

## 10. Success Metrics

### 10.1 Technical Metrics

- Maintain 60 FPS with at least 100 active boids
- No memory leaks in long-running simulations
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

### 10.2 User Experience Metrics

- Intuitive control responsiveness
- Clear visual feedback for all interactions
- Minimal learning curve for basic operation

### 10.3 Simulation Quality Metrics

- Realistic-looking flocking behavior
- Natural predator-prey dynamics
- Emergent group behaviors without explicit programming
- Interesting and varied simulation outcomes

## 11. Future Enhancements (Out of Scope)

- Environmental factors (wind, terrain)
- Additional boid types with specialized behaviors
- Food resources and foraging behaviors
- Genetic algorithms for trait evolution
- Export/import of simulation configurations
- Recording and replay functionality
- Add 2D sprites to the boids
