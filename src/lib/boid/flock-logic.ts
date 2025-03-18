import type { IFlockingConfig } from '$lib/interfaces/flocking';
import type { IBoid } from '$lib/interfaces/boid';
import type { IVector2, IVectorFactory } from '$lib/interfaces/vector';
import { AlignmentBehavior } from './behaviors/alignment-behavior';
import { CohesionBehavior } from './behaviors/cohesion-behavior';
import { SeparationBehavior } from './behaviors/separation-behavior';
import { CompositeBehavior } from './behaviors/composite-behavior';
import type { IGameEventBus } from '$lib/adapters/phaser-events';

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
    const force = this.compositeBehavior.calculate(boid, neighbors);
    
    // Emit behavior events
    this.eventBus.emit('alignment-updated', {
      boid,
      neighbors: neighbors.filter(n => n.getVariant() === boid.getVariant()),
      strength: force.length()
    });
    
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
