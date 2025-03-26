import type { Scene } from 'phaser';
import { BoidVariant } from '$boid/types';
import type { IBoid } from '$interfaces/boid';
import type { IFlockingConfig } from '$interfaces/flocking';
import type { IGameEventBus } from '$events/types';
import type { BoidConfig } from '$config/types';

/**
 * Manages debug visualization for boids
 */
export class DebugManager {
	private graphics: Phaser.GameObjects.Graphics;
	private enabled = false;
	private worldWidth: number = 3000;
	private worldHeight: number = 3000;
	private boundaryMargin: number = 150;

	constructor(
		private scene: Scene,
		private eventEmitter: IGameEventBus,
		config: IFlockingConfig
	) {
		this.graphics = scene.add.graphics();
		this.boundaryMargin = config.boundaryMargin;
		this.setupWorldBoundsListeners();
		this.setupConfigListeners();
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
	 * Update debug visualization for boids and world bounds
	 */
	update(boids: IBoid[]): void {
		if (!this.enabled) return;

		this.graphics.clear();

		// Fill the area between world bounds and margin zone
		this.graphics.fillStyle(0xffff33, 0.1);
		// Top area
		this.graphics.fillRect(0, 0, this.worldWidth, this.boundaryMargin);
		// Bottom area
		this.graphics.fillRect(
			0,
			this.worldHeight - this.boundaryMargin,
			this.worldWidth,
			this.boundaryMargin
		);
		// Left area
		this.graphics.fillRect(
			0,
			this.boundaryMargin,
			this.boundaryMargin,
			this.worldHeight - this.boundaryMargin * 2
		);
		// Right area
		this.graphics.fillRect(
			this.worldWidth - this.boundaryMargin,
			this.boundaryMargin,
			this.boundaryMargin,
			this.worldHeight - this.boundaryMargin * 2
		);

		// Draw margin zone boundary
		this.graphics.lineStyle(2, 0xffff33, 0.8);
		this.graphics.strokeRect(
			this.boundaryMargin,
			this.boundaryMargin,
			this.worldWidth - this.boundaryMargin * 2,
			this.worldHeight - this.boundaryMargin * 2
		);

		// Draw world bounds with thicker, brighter lines
		this.graphics.lineStyle(5, 0xff3333, 1.0);
		this.graphics.strokeRect(0, 0, this.worldWidth, this.worldHeight);

		// Draw boids
		for (const boid of boids) {
			this.drawBoidDebug(boid);
		}
	}

	private setupWorldBoundsListeners(): void {
		// Listen for world bounds initialization
		this.eventEmitter.on('world-bounds-initialized', (data: { width: number; height: number }) => {
			this.worldWidth = data.width;
			this.worldHeight = data.height;
		});

		// Listen for world bounds changes
		this.eventEmitter.on('world-bounds-changed', (data: { width: number; height: number }) => {
			this.worldWidth = data.width;
			this.worldHeight = data.height;
		});
	}

	private setupConfigListeners(): void {
		// Listen for boid config changes
		this.eventEmitter.on('boid-config-changed', (data: { config: BoidConfig }) => {
			this.boundaryMargin = data.config.boundaryMargin.default;
		});
	}

	/**
	 * Clean up resources
	 */
	destroy(): void {
		// Remove event listeners
		this.eventEmitter.off('world-bounds-initialized', undefined, this);
		this.eventEmitter.off('world-bounds-changed', undefined, this);
		this.eventEmitter.off('boid-config-changed', undefined, this);

		this.graphics.destroy();
	}

	private drawBoidDebug(boid: IBoid): void {
		const { x, y } = boid.getBoidPosition();
		const velocity = boid.getBoidVelocity();
		const perceptionRadius = boid.getPerceptionRadius();
		const fovAngle = boid.getFieldOfViewAngle();
		const direction = Math.atan2(velocity.y, velocity.x);
		const color = boid.getVariant() === BoidVariant.PREDATOR ? 0xff8c00 : 0x00ff7f;

		// Draw field of view cone
		this.graphics.lineStyle(2, color, 0.5);
		this.graphics.beginPath();
		this.graphics.moveTo(x, y);
		
		// Draw arc for field of view
		const startAngle = direction - fovAngle / 2;
		const endAngle = direction + fovAngle / 2;
		this.graphics.arc(x, y, perceptionRadius, startAngle, endAngle);
		
		// Draw lines back to center
		this.graphics.lineTo(x, y);
		
		// Stroke the path
		this.graphics.strokePath();

		// Draw velocity vector
		const lineLength = velocity.length() * 0.05;
		this.graphics.lineStyle(2, 0xffffff, 0.5);
		this.graphics.lineBetween(x, y, x + velocity.x * lineLength, y + velocity.y * lineLength);
	}
}
