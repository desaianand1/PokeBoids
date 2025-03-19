import type { IFlockingBehavior } from '$interfaces/flocking';
import type { IBoid } from '$interfaces/boid';
import type { IVector2, IVectorFactory } from '$interfaces/vector';
import type { IGameEventBus } from '$adapters/phaser-events';

/**
 * Combines multiple flocking behaviors into a single behavior
 */
export class CompositeBehavior implements IFlockingBehavior {
  constructor(
    private behaviors: IFlockingBehavior[],
    private vectorFactory: IVectorFactory
  ) {}

  calculate(boid: IBoid, neighbors: IBoid[], eventBus?: IGameEventBus): IVector2 {
    const totalForce = this.vectorFactory.create(0, 0);

    // Calculate and sum forces from all behaviors
    for (const behavior of this.behaviors) {
      const force = behavior.calculate(boid, neighbors, eventBus);
      totalForce.add(force);
    }

    return totalForce;
  }
}
