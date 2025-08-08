# PokéBoids

[![CI](https://github.com/anandsharma12/PokeBoids/actions/workflows/ci.yml/badge.svg)](https://github.com/anandsharma12/PokeBoids/actions/workflows/ci.yml)
[![Deploy](https://github.com/anandsharma12/PokeBoids/actions/workflows/deploy.yml/badge.svg)](https://github.com/anandsharma12/PokeBoids/actions/workflows/deploy.yml)
[![Svelte](https://img.shields.io/badge/Svelte-5-orange.svg)](https://svelte.dev)
[![Phaser](https://img.shields.io/badge/Phaser-3.90-blue.svg)](https://phaser.io)

**[Live Demo](https://anandsharma12.github.io/PokeBoids/)**

A flocking simulation that combines Craig Reynolds' Boids algorithm with Pokémon sprites and advanced behavioral features. Autonomous agents follow simple rules to create emergent flocking patterns with complex interactions.

## About Boids

The Boids algorithm demonstrates how complex group behaviors emerge from simple local interactions. Each agent follows three rules:

- **Separation** – Avoid crowding neighbors
- **Alignment** – Steer towards the average direction of neighbors  
- **Cohesion** – Move towards the center of mass of neighbors

These rules create the coordinated movement patterns seen in bird flocks, fish schools, and other natural swarms.

## Advanced Features

This implementation goes beyond basic flocking with several sophisticated behaviors:

- **Predator-Prey Dynamics** – Predators hunt prey while prey flee and form protective flocks
- **Obstacle Avoidance** – Boids navigate around environmental obstacles while maintaining flocking behavior
- **Spatial Partitioning** – Efficient neighbor detection for large flocks using spatial optimization
- **Live Parameter Tweaking** – Real-time adjustment of all behavioral weights and parameters
- **Attack Behaviors** – Predators can attack prey with cooldown periods and visual feedback
- **Boundary Behaviors** – Configurable world boundaries with bounce, wrap, or avoidance options
- **Variable Group Sizes** – Support for small intimate flocks to massive swarms of 1000+ agents
- **Field of View Limitations** – Realistic perception angles affecting neighbor detection
- **Speed Variation** – Different maximum speeds for different agent types
- **Collision Flash Effects** – Visual feedback for predator-prey interactions

## Getting Started

### Requirements

- [Node.js](https://nodejs.org/) >= 24.0.0
- [pnpm](https://pnpm.io/) >= 9.0.0

### Installation

```bash
git clone https://github.com/anandsharma12/PokeBoids.git
cd PokeBoids
pnpm install
pnpm dev
```

Visit `http://localhost:5173` to run the simulation.

### Building

```bash
pnpm build
pnpm preview
```

## Interactive Controls

- **Flocking Parameters** – Adjust separation, alignment, and cohesion weights
- **Perception Settings** – Modify neighbor detection radius and field of view
- **Population Controls** – Change boid counts and predator-to-prey ratios
- **Behavior Modes** – Toggle different behavioral systems on/off
- **Visual Options** – Switch between geometric shapes and animated Pokémon sprites
- **Performance Monitoring** – Real-time FPS and agent count statistics

---

*Based on Craig Reynolds' original Boids research (1986). See the Credits panel in the application for detailed references and asset attributions.*