import type { Scene } from 'phaser';
import type { IBoid } from '$interfaces/boid';
import type { BoundaryDirection } from '$events/types';

/**
 * Manages visual effects in the game
 */
export class EffectsManager {
	constructor(private scene: Scene) {}

	/**
	 * Create a collision effect when a boid hits a boundary
	 */
	createCollisionEffect(boid: IBoid, boundary: BoundaryDirection): void {
		boid.showCollisionEffect(boundary);
	}
}
