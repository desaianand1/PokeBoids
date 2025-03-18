import type { IFlockingBehavior } from '$lib/interfaces/flocking';
import type { IBoid } from '$lib/interfaces/boid';
import type { IVector2, IVectorFactory } from '$lib/interfaces/vector';

/**
 * Implements cohesion behavior - boids steer towards the average position of neighbors
 */
export class CohesionBehavior implements IFlockingBehavior {
  constructor(
    private vectorFactory: IVectorFactory,
    private weight: number = 1.0
  ) {}

  calculate(boid: IBoid, neighbors: IBoid[]): IVector2 {
    const steering = this.vectorFactory.create(0, 0);
    let total = 0;
    const center = this.vectorFactory.create(0, 0);

    for (const other of neighbors) {
      // Only cohere with same type
      if (other.getVariant() === boid.getVariant()) {
        center.add(other.getBoidPosition());
        total++;
      }
    }

    if (total > 0) {
      // Calculate average position
      center.scale(1 / total);
      
      // Get vector toward center
      const towardCenter = center.subtract(boid.getBoidPosition());
      
      // Scale to max speed
      towardCenter.setLength(boid.getMaxSpeed());
      
      // Reynolds steering = desired - current
      steering.add(towardCenter).subtract(boid.getBoidVelocity());
      
      // Limit to max force
      steering.limit(boid.getMaxForce());
      
      // Apply weight
      steering.scale(this.weight);
    }

    return steering;
  }
}
