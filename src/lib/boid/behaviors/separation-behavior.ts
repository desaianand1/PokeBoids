import type { IFlockingBehavior } from '$interfaces/flocking';
import type { IBoid } from '$interfaces/boid';
import type { IVector2, IVectorFactory } from '$interfaces/vector';

/**
 * Implements separation behavior - boids steer away from neighbors to avoid collisions
 */
export class SeparationBehavior implements IFlockingBehavior {
  constructor(
    private vectorFactory: IVectorFactory,
    private weight: number = 1.5,
    private separationRadius: number = 30
  ) {}

  calculate(boid: IBoid, neighbors: IBoid[]): IVector2 {
    const steering = this.vectorFactory.create(0, 0);
    let total = 0;
    const avoidance = this.vectorFactory.create(0, 0);

    const boidPos = boid.getBoidPosition();
    const separationRadiusSquared = this.separationRadius * this.separationRadius;

    for (const other of neighbors) {
      const otherPos = other.getBoidPosition();
      
      // Calculate vector from other to boid
      const diff = this.vectorFactory.create(
        boidPos.x - otherPos.x,
        boidPos.y - otherPos.y
      );
      
      const distanceSquared = diff.lengthSquared();
      
      // Check if within separation radius
      if (distanceSquared < separationRadiusSquared) {
        // Weight by distance (closer = stronger)
        const distance = Math.sqrt(distanceSquared);
        diff.normalize().scale(1 / Math.max(0.1, distance));
        avoidance.add(diff);
        total++;
      }
    }

    if (total > 0) {
      // Calculate average avoidance vector
      avoidance.scale(1 / total);
      
      // Scale to max speed
      avoidance.setLength(boid.getMaxSpeed());
      
      // Reynolds steering = desired - current
      steering.add(avoidance).subtract(boid.getBoidVelocity());
      
      // Limit to max force
      steering.limit(boid.getMaxForce());
      
      // Apply weight
      steering.scale(this.weight);
    }

    return steering;
  }
}
