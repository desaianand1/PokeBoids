import type { IFlockingConfig } from '$interfaces/flocking';
import type { IBoid } from '$interfaces/boid';
import type { IVector2, IVectorFactory } from '$interfaces/vector';
import { AlignmentBehavior } from '$boid/behaviors/alignment-behavior';
import { CohesionBehavior } from '$boid/behaviors/cohesion-behavior';
import { SeparationBehavior } from '$boid/behaviors/separation-behavior';
import { CompositeBehavior } from '$boid/behaviors/composite-behavior';
import type { IGameEventBus } from '$adapters/phaser-events';

/**
 * Core flock logic implementation independent of rendering framework
 */
export class FlockLogic {
  private compositeBehavior: CompositeBehavior;
  
  constructor(
    private vectorFactory: IVectorFactory,
    private eventBus: IGameEventBus,
    config: IFlockingConfig
  ) {
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
  
  update(boids: IBoid[]): void {
    // For each boid, find neighbors and apply forces
    for (const boid of boids) {
      // Find neighbors within perception radius
      const neighbors = this.findNeighbors(boid, boids, boid.getPerceptionRadius());
      
      // Calculate and apply forces
      const force = this.calculateForces(boid, neighbors);
      boid.applyForce(force);
    }
  }
  
  private findNeighbors(boid: IBoid, allBoids: IBoid[], radius: number): IBoid[] {
    const neighbors: IBoid[] = [];
    const radiusSquared = radius * radius;
    
    for (const other of allBoids) {
      if (other === boid) continue;
      
      const boidPos = boid.getBoidPosition();
      const otherPos = other.getBoidPosition();
      
      const dx = otherPos.x - boidPos.x;
      const dy = otherPos.y - boidPos.y;
      const distSquared = dx * dx + dy * dy;
      
      if (distSquared < radiusSquared) {
        neighbors.push(other);
      }
    }
    
    return neighbors;
  }
}
