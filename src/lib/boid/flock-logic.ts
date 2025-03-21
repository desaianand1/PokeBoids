import type { IFlockingConfig } from '$interfaces/flocking';
import type { IBoid } from '$interfaces/boid';
import type { IVector2, IVectorFactory } from '$interfaces/vector';
import type { ISpatialPartitioning } from '$interfaces/spatial-partitioning';
import { AlignmentBehavior } from '$boid/behaviors/alignment-behavior';
import { CohesionBehavior } from '$boid/behaviors/cohesion-behavior';
import { SeparationBehavior } from '$boid/behaviors/separation-behavior';
import { CompositeBehavior } from '$boid/behaviors/composite-behavior';
import { QuadTreePartitioning } from '$boid/spatial/quad-tree';
import type { IGameEventBus } from '$adapters/phaser-events';

/**
 * Core flock logic implementation independent of rendering framework
 */
export class FlockLogic {
  private compositeBehavior: CompositeBehavior;
  private spatialPartitioning!: ISpatialPartitioning;
  private worldWidth: number = 3000; // Default value
  private worldHeight: number = 3000; // Default value
  
  constructor(
    private vectorFactory: IVectorFactory,
    private eventBus: IGameEventBus,
    config: IFlockingConfig
  ) {
    this.initializeSpatialPartitioning();
    this.setupWorldBoundsListeners();
    
    // Create individual behaviors
    const alignmentBehavior = new AlignmentBehavior(
      vectorFactory,
      config.alignmentWeight
    );
    
    const cohesionBehavior = new CohesionBehavior(
      vectorFactory,
      config.cohesionWeight
    );
    
    const separationBehavior = new SeparationBehavior(
      vectorFactory,
      config.separationWeight,
      config.separationRadius
    );
    
    // Combine behaviors
    this.compositeBehavior = new CompositeBehavior(
      [alignmentBehavior, cohesionBehavior, separationBehavior],
      vectorFactory
    );
  }
  
  calculateForces(boid: IBoid, neighbors: IBoid[]): IVector2 {
    // Pass eventBus to composite behavior which will pass it to individual behaviors
    const force = this.compositeBehavior.calculate(boid, neighbors, this.eventBus);
    return force;
  }
  
  private initializeSpatialPartitioning(): void {
    this.spatialPartitioning = new QuadTreePartitioning(
      this.worldWidth,
      this.worldHeight
    );
  }
  
  private setupWorldBoundsListeners(): void {
    // Listen for world bounds initialization
    this.eventBus.on('world-bounds-initialized', (data) => {
      this.worldWidth = data.width;
      this.worldHeight = data.height;
      
      // If spatialPartitioning is already initialized, update its bounds
      if (this.spatialPartitioning) {
        this.spatialPartitioning.updateBounds(
          this.worldWidth,
          this.worldHeight
        );
      } else {
        // Otherwise, initialize it
        this.initializeSpatialPartitioning();
      }
    }, this);
    
    // Listen for world bounds changes
    this.eventBus.on('world-bounds-changed', (data) => {
      this.worldWidth = data.width;
      this.worldHeight = data.height;
      
      // Update the bounds of the spatial partitioning
      if (this.spatialPartitioning) {
        this.spatialPartitioning.updateBounds(
          this.worldWidth,
          this.worldHeight
        );
      }
    }, this);
  }
  
  update(boids: IBoid[]): void {
    // Update spatial partitioning with current boids
    this.spatialPartitioning.update(boids);
    
    // For each boid, find neighbors and apply forces
    for (const boid of boids) {
      // Find neighbors within perception radius using spatial partitioning
      const neighbors = this.findNeighbors(boid, boid.getPerceptionRadius());
      
      // Calculate and apply forces
      const force = this.calculateForces(boid, neighbors);
      boid.applyForce(force);
    }
  }
  
  private findNeighbors(boid: IBoid, radius: number): IBoid[] {
    const position = boid.getBoidPosition();
    // Use spatial partitioning to efficiently find nearby boids
    return this.spatialPartitioning.findNearby(position, radius)
      .filter(other => other !== boid); // Filter out the boid itself
  }
  
  destroy(): void {
    // Remove event listeners
    this.eventBus.off('world-bounds-initialized', undefined, this);
    this.eventBus.off('world-bounds-changed', undefined, this);
    
    // Clean up spatial partitioning
    this.spatialPartitioning.clear();
  }
}
