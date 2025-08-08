import type { Scene } from 'phaser';
import { BoidVariant } from '$boid/types';
import type { IBoid } from '$interfaces/boid';
import { hasSpriteAnimation } from '$interfaces/boid';
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

		// Draw sprite frame border if boid has animation controller
		this.drawSpriteFrameBorder(boid, x, y);

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

	/**
	 * Draw comprehensive sprite frame debugging information
	 */
	private drawSpriteFrameBorder(boid: IBoid, x: number, y: number): void {
		// Check if this boid has sprite animation capabilities
		if (hasSpriteAnimation(boid)) {
			const animController = boid.getAnimationController();
			const spriteScale = boid.getSpriteScale();
			
			if (animController && typeof animController.getCurrentFrameDimensions === 'function') {
				try {
					const frameDimensions = animController.getCurrentFrameDimensions();
					
					// Validate frame dimensions
					if (frameDimensions.width <= 0 || frameDimensions.height <= 0) {
						console.error(`[DebugManager] Invalid frame dimensions for sprite: ${frameDimensions.width}x${frameDimensions.height}`);
						return;
					}
					
					// Calculate actual frame bounds on screen
					const frameWidth = frameDimensions.width * spriteScale;
					const frameHeight = frameDimensions.height * spriteScale;
					
					// Draw main frame border (red for easy visibility)
					this.graphics.lineStyle(2, 0xff0000, 0.9);
					this.graphics.strokeRect(
						x - frameWidth / 2,
						y - frameHeight / 2,
						frameWidth,
						frameHeight
					);
					
					// Draw inner grid to show sprite center alignment
					this.graphics.lineStyle(1, 0xff0000, 0.4);
					// Vertical center line
					this.graphics.lineBetween(x, y - frameHeight / 2, x, y + frameHeight / 2);
					// Horizontal center line  
					this.graphics.lineBetween(x - frameWidth / 2, y, x + frameWidth / 2, y);
					
					// Draw center cross for precise positioning
					this.graphics.lineStyle(2, 0xff0000, 0.8);
					const crossSize = 10;
					this.graphics.lineBetween(x - crossSize, y, x + crossSize, y);
					this.graphics.lineBetween(x, y - crossSize, x, y + crossSize);
					
					// Draw corner markers for easier frame boundary identification
					const cornerSize = 6;
					const left = x - frameWidth / 2;
					const right = x + frameWidth / 2;
					const top = y - frameHeight / 2;
					const bottom = y + frameHeight / 2;
					
					this.graphics.lineStyle(2, 0xffff00, 0.8);
					// Top-left corner
					this.graphics.lineBetween(left, top, left + cornerSize, top);
					this.graphics.lineBetween(left, top, left, top + cornerSize);
					// Top-right corner
					this.graphics.lineBetween(right, top, right - cornerSize, top);
					this.graphics.lineBetween(right, top, right, top + cornerSize);
					// Bottom-left corner
					this.graphics.lineBetween(left, bottom, left + cornerSize, bottom);
					this.graphics.lineBetween(left, bottom, left, bottom - cornerSize);
					// Bottom-right corner
					this.graphics.lineBetween(right, bottom, right - cornerSize, bottom);
					this.graphics.lineBetween(right, bottom, right, bottom - cornerSize);
					
					// Draw animation state indicator with more information
					const animState = animController.getAnimationState();
					if (animState) {
						// Draw colored circle to indicate animation type
						let stateColor = 0x00ff00; // green for walk
						if (animState.current === 'attack') {
							stateColor = 0xff0000; // red for attack
						}
						if (animState.current === 'hurt') {
							stateColor = 0xffff00; // yellow for hurt
						}
						
						// State indicator circle
						this.graphics.fillStyle(stateColor, 0.9);
						this.graphics.fillCircle(x + frameWidth / 2 - 12, y - frameHeight / 2 + 12, 6);
						
						// Interruptible status indicator
						if (!animState.isInterruptible) {
							this.graphics.fillStyle(0xff8800, 0.7);
							this.graphics.fillCircle(x + frameWidth / 2 - 12, y - frameHeight / 2 + 24, 4);
						}
					}
					
					// Display frame dimensions as text overlay
					if (this.scene.add && this.scene.add.text) {
						const dimensionText = `${frameDimensions.width}x${frameDimensions.height}`;
						const debugText = this.scene.add.text(
							x - frameWidth / 2,
							y + frameHeight / 2 + 5,
							dimensionText,
							{
								fontSize: '12px',
								color: '#ff0000',
								backgroundColor: '#000000',
								padding: { x: 2, y: 1 }
							}
						);
						
						// Clean up text after a short time to avoid clutter
						this.scene.time.delayedCall(100, () => {
							if (debugText && debugText.active) {
								debugText.destroy();
							}
						});
					}
					
				} catch (error) {
					console.error(`[DebugManager] Error drawing sprite frame debug info:`, error);
				}
			}
		}
	}
}
