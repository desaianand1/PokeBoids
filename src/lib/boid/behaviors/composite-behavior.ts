import type { IFlockingBehavior } from '$interfaces/flocking';
import type { IBoid } from '$interfaces/boid';
import type { IVector2, IVectorFactory } from '$interfaces/vector';

/**
 * Combines multiple flocking behaviors into a single behavior
 */
export class CompositeBehavior implements IFlockingBehavior {
  constructor(
    private behaviors: IFlockingBehavior[],
    private vectorFactory: IVectorFactory
  ) {}

  calculate(boid: IBoid, neighbors: IBoid[]): IVector2 {
    // Create zero vector to accumulate forces
    const totalForce = this.vectorFactory.create(0, 0);
    
    // Calculate and sum forces from all behaviors
    for (const behavior of this.behaviors) {
      const force = behavior.calculate(boid, neighbors);
      totalForce.add(force);
    }
    
    // Limit combined force to max force
    totalForce.limit(boid.getMaxForce());
    
    return totalForce;
  }
}
