import type { Scene } from 'phaser';
import { BoidVariant } from '$lib/boid/types';
import type { IBoid } from '$lib/interfaces/boid';

/**
 * Manages visual effects in the game
 */
export class EffectsManager {
	constructor(private scene: Scene) {}

	/**
	 * Create a collision effect when a boid hits a boundary
	 */
	createCollisionEffect(boid: IBoid, boundary: 'left' | 'right' | 'top' | 'bottom'): void {
		const { x: posX, y: posY } = boid.getBoidPosition();
		// Get collision position based on boundary
		const x = boundary === 'left' ? 0 : boundary === 'right' ? this.scene.scale.width : posX;
		const y = boundary === 'top' ? 0 : boundary === 'bottom' ? this.scene.scale.height : posY;

		// Calculate emission angle based on boundary
		const angle =
			boundary === 'left' ? 0 : boundary === 'right' ? 180 : boundary === 'top' ? 90 : 270;

		// Create particle texture
		const textureKey = this.createParticleTexture(boid);

		// Create particle emitter
		const emitter = this.scene.add.particles(x, y, textureKey, {
			lifespan: 300,
			gravityY: 0,
			scale: { start: 1, end: 0 },
			alpha: { start: 0.5, end: 0 },
			speed: 100,
			angle: { min: angle - 30, max: angle + 30 },
			quantity: 10,
			emitting: false
		});

		// Emit particles and clean up
		emitter.explode();
		this.scene.time.delayedCall(300, () => {
			emitter.destroy();
			this.scene.textures.remove(textureKey);
		});
	}

	private createParticleTexture(boid: IBoid): string {
		const textureKey = `collision-particle-${Date.now()}`;
		const graphics = this.scene.add.graphics();
		graphics.fillStyle(boid.getVariant() === BoidVariant.PREDATOR ? 0xff8c00 : 0x00ff7f, 1);
		graphics.fillCircle(4, 4, 4);
		graphics.generateTexture(textureKey, 8, 8);
		graphics.destroy();
		return textureKey;
	}
}
