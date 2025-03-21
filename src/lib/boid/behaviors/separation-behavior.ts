import type { IFlockingBehavior } from '$interfaces/flocking';
import type { IBoid } from '$interfaces/boid';
import type { IVector2, IVectorFactory } from '$interfaces/vector';
import type { IGameEventBus } from '$events/types';

/**
 * Implements separation behavior - boids steer away from nearby neighbors
 */
export class SeparationBehavior implements IFlockingBehavior {
  constructor(
    private vectorFactory: IVectorFactory,
    private weight: number = 1.0,
    private separationRadius: number = 50
  ) {}

  calculate(boid: IBoid, neighbors: IBoid[], eventBus?: IGameEventBus): IVector2 {
    const steering = this.vectorFactory.create(0, 0);
    let total = 0;
    let nearestDistance = Infinity;

    const boidPos = boid.getBoidPosition();

    for (const other of neighbors) {
      const otherPos = other.getBoidPosition();
      const dx = otherPos.x - boidPos.x;
      const dy = otherPos.y - boidPos.y;
      const distSquared = dx * dx + dy * dy;
      const dist = Math.sqrt(distSquared);

      // Track nearest neighbor for debug info
      nearestDistance = Math.min(nearestDistance, dist);

      // Only separate from neighbors within separation radius
      if (dist < this.separationRadius) {
        // Calculate vector pointing away from neighbor
        const diff = this.vectorFactory.create(-dx, -dy);
        
        // Weight by distance (closer neighbors have more influence)
        diff.scale(1 / distSquared);
        
        steering.add(diff);
        total++;
      }
    }

    if (total > 0) {
      // Calculate average
      steering.scale(1 / total);
      
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
        eventBus.emit('separation-updated', {
          boid,
          avoidance: { x: steering.x, y: steering.y },
          strength: steering.length(),
          nearbyCount: total,
          debug: {
            position: { x: boidPos.x, y: boidPos.y },
            velocity: { x: boidVel.x, y: boidVel.y },
            nearestNeighborDistance: nearestDistance,
            force: { x: steering.x, y: steering.y }
          }
        });
      }
    }

    return steering;
  }
}
