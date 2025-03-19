import type { IFlockingBehavior } from '$interfaces/flocking';
import type { IBoid } from '$interfaces/boid';
import type { IVector2, IVectorFactory } from '$interfaces/vector';
import type { IGameEventBus } from '$adapters/phaser-events';

/**
 * Implements alignment behavior - boids steer towards the average heading of neighbors
 */
export class AlignmentBehavior implements IFlockingBehavior {
  constructor(
    private vectorFactory: IVectorFactory,
    private weight: number = 1.0
  ) {}

  calculate(boid: IBoid, neighbors: IBoid[], eventBus?: IGameEventBus): IVector2 {
    const steering = this.vectorFactory.create(0, 0);
    let total = 0;

    // Get same-type neighbors
    const sameTypeNeighbors = neighbors.filter(n => n.getVariant() === boid.getVariant());

    // Calculate average velocity
    const avgVelocity = { x: 0, y: 0 };
    for (const other of sameTypeNeighbors) {
      const vel = other.getBoidVelocity();
      avgVelocity.x += vel.x;
      avgVelocity.y += vel.y;
      total++;
    }

    if (total > 0) {
      // Calculate average velocity
      avgVelocity.x /= total;
      avgVelocity.y /= total;
      steering.set(avgVelocity.x, avgVelocity.y);
      
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
        const boidPos = boid.getBoidPosition();
        const boidVel = boid.getBoidVelocity();
        eventBus.emit('alignment-updated', {
          boid,
          neighbors: sameTypeNeighbors,
          strength: steering.length(),
          debug: {
            position: { x: boidPos.x, y: boidPos.y },
            velocity: { x: boidVel.x, y: boidVel.y },
            averageVelocity: avgVelocity,
            neighborCount: total,
            force: { x: steering.x, y: steering.y }
          }
        });
      }
    }

    return steering;
  }
}
