import type { IFlockingBehavior } from '$interfaces/flocking';
import type { IBoid } from '$interfaces/boid';
import type { IVector2, IVectorFactory } from '$interfaces/vector';

/**
 * Implements alignment behavior - boids steer towards the average heading of neighbors
 */
export class AlignmentBehavior implements IFlockingBehavior {
  constructor(
    private vectorFactory: IVectorFactory,
    private weight: number = 1.0
  ) {}

  calculate(boid: IBoid, neighbors: IBoid[]): IVector2 {
    const steering = this.vectorFactory.create(0, 0);
    let total = 0;

    for (const other of neighbors) {
      // Only align with same type
      if (other.getVariant() === boid.getVariant()) {
        steering.add(other.getBoidVelocity());
        total++;
      }
    }

    if (total > 0) {
      // Calculate average velocity
      steering.scale(1 / total);
      
      // Scale to max speed
      steering.setLength(boid.getMaxSpeed());
      
      // Reynolds steering = desired - current
      steering.subtract(boid.getBoidVelocity());
      
      // Limit to max force
      steering.limit(boid.getMaxForce());
      
      // Apply weight
      steering.scale(this.weight);
    }

    return steering;
  }
}
