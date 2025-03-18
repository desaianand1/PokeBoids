import type { Scene } from 'phaser';
import { BoidVariant } from '$lib/boid/types';
import type { IBoid } from '$lib/interfaces/boid';

/**
 * Manages debug visualization for boids
 */
export class DebugManager {
	private graphics: Phaser.GameObjects.Graphics;
	private enabled = false;

	constructor(private scene: Scene) {
		this.graphics = scene.add.graphics();
	}

	/**
	 * Enable or disable debug visualization
	 */
	setEnabled(enabled: boolean): void {
		this.enabled = enabled;
		if (!enabled) {
			this.graphics.clear();
		}
	}

	/**
	 * Update debug visualization for boids
	 */
	update(boids: IBoid[]): void {
		if (!this.enabled) return;

		this.graphics.clear();

		for (const boid of boids) {
			this.drawBoidDebug(boid);
		}
	}

	/**
	 * Clean up resources
	 */
	destroy(): void {
		this.graphics.destroy();
	}

	private drawBoidDebug(boid: IBoid): void {
		// Draw perception radius
		const perceptionRadius = boid.getPerceptionRadius();
		this.graphics.lineStyle(
			2,
			boid.getVariant() === BoidVariant.PREDATOR ? 0xff8c00 : 0x00ff7f,
			0.5
		);
		const { x, y } = boid.getBoidPosition();
		this.graphics.strokeCircle(x, y, perceptionRadius);

		// Draw velocity vector
		const velocity = boid.getBoidVelocity();
		const lineLength = velocity.length() * 0.5;
		this.graphics.lineStyle(2, 0xffffff, 0.5);
		this.graphics.lineBetween(x, y, x + velocity.x * lineLength, y + velocity.y * lineLength);
	}
}
