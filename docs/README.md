# PokéBoids

[![CI](https://github.com/desaianand1/PokeBoids/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/desaianand1/PokeBoids/actions/workflows/ci-cd.yml)
[![Svelte](https://img.shields.io/badge/Svelte-%23f1413d.svg?logo=svelte&logoColor=white)](https://svelte.dev)
[![Phaser](https://img.shields.io/badge/Phaser.js-000?logo=gamemaker&logoColor=fff)](https://phaser.io)

**[Live Demo](https://desaianand1.github.io/PokeBoids/)**

A flocking simulation that combines the Boids algorithm with Pokémon sprites and advanced behavioral features. Autonomous boids follow simple rules to create emergent flocking patterns with complex interactions. Pretty neat stuff!

> [!NOTE]
> Boids is an artificial life program, developed by Craig Reynolds[^1] in 1986, which simulates the flocking behaviour of birds, and related group motion.
> The name "boid" corresponds to a shortened version of "bird-oid object", which refers to a bird-like object

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
git clone https://github.com/desaianand1/PokeBoids.git
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

## Credits

This work would not be possible without the teachings of my Evolutionary Computation professor, Dr. Jason Yoder (Rose-Hulman Institute of Technology)[^2], original research by Craig Reynolds presented at the 1987 ACM SIGGRAPH conference[^1] and cool demos I found across the Internet[^3].[^4].[^5].[^6].[^7]

Artwork & assets are credited to the PMD Sprite Collab project and its contributors[^8] as well as Crusenho's Complete UI Essentials Pack[^9]

[^1]: Reynolds, Craig. _Boids_. 1986. <https://www.red3d.com/cwr/boids/>.

[^2]: Yoder, Jason. _Google Scholar Profile_. Accessed April 3, 2025. <https://scholar.google.com/citations?user=pC0cZWsAAAAJ&hl=en>.

[^3]: Lague, Sebastian. “Coding Adventure: Boids.” YouTube video, August 26, 2019. <https://www.youtube.com/watch?v=bqtqltqcQhw>.

[^4]: Eater, Ben. _Boids Demo_. April 27, 2020. <https://eater.net/boids>.

[^5]: Adams, Van Hunter. “Boids Algorithm.” Accessed April 3, 2025. <https://vanhunteradams.com/Pico/Animal_Movement/Boids-algorithm.html>.

[^6]: Martin, Brett M., Ryan D. Winz, Luke J. McFadden, and Tor J. Langehaug. _Distributed Boids Simulation: Performance Analysis and Implementation Challenges_. Air Force Institute of Technology. In _Proceedings of the 2023 International Conference on Computational Science and Computational Intelligence (CSCI)_, 780–785. 2023. Accessed August 8, 2025. <https://www.american-cse.org/csce2023-ieee/pdfs/CSCE2023-5LlpKs7cpb4k2UysbLCuOx/275900a780/275900a780.pdf>.

[^7]: Roberts, Eric. “Stanford: Modeling Natural Systems - Boids Algorithm.” Accessed April 3, 2025. <https://cs.stanford.edu/people/eroberts/courses/soco/projects/2008-09/modeling-natural-systems/boids.html>.

[^8]: Köpcke, Marco, audinowho et al. _PMD Sprite Collab_. GitHub.com. Accessed April 3, 2025. <https://github.com/PMDCollab/SpriteCollab>

[^9]: Crusenho. _Crusenho's Complete UI Essentials Pack_. itch.io. Accessed April 3, 2025. <https://crusenho.itch.io/complete-ui-essential-pack>

---

> Made with ✨ whimsy by Anand Desai
