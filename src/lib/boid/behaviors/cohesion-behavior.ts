import type { IFlockingBehavior } from '$interfaces/flocking';
import type { IBoid } from '$interfaces/boid';
import type { IVector2, IVectorFactory } from '$interfaces/vector';
import type { IGameEventBus } from '$adapters/phaser-events';

/**
 * Implements cohesion behavior - boids steer towards the center of mass of neighbors
 */
export class CohesionBehavior implements IFlockingBehavior {
  constructor(
    private vectorFactory: IVectorFactory,
    private weight: number = 1.0
  ) {}

  calculate(boid: IBoid, neighbors: IBoid[], eventBus?: IGameEventBus): IVector2 {
    const steering = this.vectorFactory.create(0, 0);
    let total = 0;

    // Get same-type neighbors
    const sameTypeNeighbors = neighbors.filter(n => n.getVariant() === boid.getVariant());

    // Calculate center of mass
    const centerOfMass = { x: 0, y: 0 };
    for (const other of sameTypeNeighbors) {
      const pos = other.getBoidPosition();
      centerOfMass.x += pos.x;
      centerOfMass.y += pos.y;
      total++;
    }

    if (total > 0) {
      // Calculate average position
      centerOfMass.x /= total;
      centerOfMass.y /= total;

      // Create desired velocity towards center of mass
      const boidPos = boid.getBoidPosition();
      steering.set(centerOfMass.x - boidPos.x, centerOfMass.y - boidPos.y);

      // Scale to max speed
      steering.setLength(boid.getMaxSpeed());

      // Reynolds steering = desired - current
      steering.subtract(boid.getBoidVelocity());

      // Limit to max force
      steering.limit(boid.getMaxForce());

      // Apply weight
      steering.scale(this.weight);

      // Emit debug event if eventBus is provided
      if (eventBus) {
        const boidVel = boid.getBoidVelocity();
        eventBus.emit('coherence-updated', {
          boid,
          center: centerOfMass,
          strength: steering.length(),
          debug: {
            position: { x: boidPos.x, y: boidPos.y },
            velocity: { x: boidVel.x, y: boidVel.y },
            centerOfMass,
            neighborCount: total,
            force: { x: steering.x, y: steering.y }
          }
        });
      }
    }

    return steering;
  }
}
