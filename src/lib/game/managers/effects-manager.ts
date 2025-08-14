import type { Scene } from 'phaser';
import type { IBoid } from '$interfaces/boid';
import type { BoundaryDirection, IGameEventBus } from '$events/types';

// Interface for game scene with flock access
interface GameScene extends Scene {
	flock?: {
		getBoids(): IBoid[];
	};
}

/**
 * Effect type enumeration with priority ordering
 */
export enum EffectType {
	OTHER = 1,
	BOUNDARY_COLLISION = 2,
	HURT = 3
}

/**
 * Effect data structure for queue management
 */
interface EffectData {
	type: EffectType;
	tintColor: number;
	duration: number;
	timestamp: number;
	boundary?: BoundaryDirection;
	timerEvent?: Phaser.Time.TimerEvent;
}

/**
 * Manages all visual effects in the game with proper priority and queuing
 */
export class EffectsManager {
	private effectQueue: Map<string, EffectData> = new Map();
	private readonly WHITE_FLASH_COLOR = 0xffffff;
	private readonly DEFAULT_FLASH_DURATION = 150; // Slightly longer for better visibility

	constructor(
		private scene: Scene,
		private eventBus?: IGameEventBus
	) {
		this.setupEventListeners();
	}

	/**
	 * Set up event listeners for visual effects
	 */
	private setupEventListeners(): void {
		if (!this.eventBus) return;

		// Listen for hurt events to trigger visual effects
		this.eventBus.on('boid-damaged', ({ boid }) => {
			const phaserBoid = this.ensurePhaserBoid(boid);
			if (phaserBoid) {
				this.createHurtEffect(phaserBoid);
			}
		});

		// Listen for boundary collision events
		this.eventBus.on('boundary-collision', ({ boid, boundary }) => {
			const phaserBoid = this.ensurePhaserBoid(boid);
			if (phaserBoid) {
				this.createCollisionEffect(phaserBoid, boundary);
			}
		});
	}

	/**
	 * Ensure we have a PhaserBoid instance for visual effects
	 * If boid is a BoidBehavior, find the corresponding PhaserBoid
	 */
	private ensurePhaserBoid(boid: unknown): IBoid | null {
		// Type guard for PhaserBoid
		if (this.isPhaserBoid(boid)) {
			return boid;
		}

		// If it's a BoidBehavior, find the corresponding PhaserBoid in the scene's flock
		if (this.isBoidBehavior(boid)) {
			// Access the scene's flock to find the matching PhaserBoid
			const gameScene = this.scene as GameScene;
			if (gameScene.flock?.getBoids) {
				const phaserBoids = gameScene.flock.getBoids();
				const matchingBoid = phaserBoids.find(
					(phaserBoid: IBoid) =>
						this.isPhaserBoidWithBehavior(phaserBoid) && phaserBoid.getBehavior() === boid
				);
				if (matchingBoid) {
					return matchingBoid;
				}
			}
		}

		console.warn(
			'[EffectsManager] Could not find corresponding PhaserBoid for behavior, visual effects may not work'
		);
		return null;
	}

	/**
	 * Type guard to check if object is a PhaserBoid
	 */
	private isPhaserBoid(obj: unknown): obj is IBoid {
		return (
			obj !== null &&
			typeof obj === 'object' &&
			'scene' in obj &&
			'getBehavior' in obj &&
			'getId' in obj &&
			'showCollisionEffect' in obj
		);
	}

	/**
	 * Type guard to check if object is a BoidBehavior
	 */
	private isBoidBehavior(obj: unknown): obj is { getId(): string } {
		return (
			obj !== null && typeof obj === 'object' && 'getId' in obj && !('scene' in obj) // Distinguishes from PhaserBoid
		);
	}

	/**
	 * Type guard to check if PhaserBoid has getBehavior method
	 */
	private isPhaserBoidWithBehavior(obj: IBoid): obj is IBoid & { getBehavior(): unknown } {
		return (
			'getBehavior' in obj &&
			typeof (obj as unknown as { getBehavior?: unknown }).getBehavior === 'function'
		);
	}

	/**
	 * Create a hurt effect when a boid takes damage
	 */
	createHurtEffect(boid: IBoid): void {
		this.applyEffect(boid, {
			type: EffectType.HURT,
			tintColor: this.WHITE_FLASH_COLOR,
			duration: this.DEFAULT_FLASH_DURATION,
			timestamp: this.scene.time.now
		});
	}

	/**
	 * Create a collision effect when a boid hits a boundary
	 */
	createCollisionEffect(boid: IBoid, boundary: BoundaryDirection): void {
		// Use the IBoid interface method for backward compatibility
		// but also apply our enhanced effect system
		this.applyEffect(boid, {
			type: EffectType.BOUNDARY_COLLISION,
			tintColor: this.WHITE_FLASH_COLOR,
			duration: 100, // Shorter duration for boundary collisions
			timestamp: this.scene.time.now,
			boundary
		});
	}

	/**
	 * Apply a visual effect with proper priority management
	 */
	private applyEffect(boid: IBoid, newEffect: EffectData): void {
		const boidId = boid.getId();
		const existingEffect = this.effectQueue.get(boidId);

		// Check if new effect has higher priority or no effect is active
		if (!existingEffect || newEffect.type >= existingEffect.type) {
			// Cancel existing effect if present
			if (existingEffect && existingEffect.timerEvent) {
				existingEffect.timerEvent.destroy();
			}

			// Store the effect in queue
			this.effectQueue.set(boidId, newEffect);

			// Apply the tint effect through the boid interface
			this.applyTintEffect(boid, newEffect);
		}
	}

	/**
	 * Apply tint effect to boid using existing interface methods
	 */
	private applyTintEffect(boid: IBoid, effect: EffectData): void {
		const boidId = boid.getId();

		// For boundary collisions, use the existing interface method
		if (effect.type === EffectType.BOUNDARY_COLLISION) {
			const boundary = effect.boundary || 'left';
			boid.showCollisionEffect(boundary);
		} else {
			// For hurt effects, we need to trigger both animation and visual effect
			// This will be handled in the PhaserBoid integration
			if (this.hasPhaserBoidMethods(boid)) {
				boid.playHurtAnimation();
			} else {
				// Fallback to direct tint application
				boid.showCollisionEffect('left');
			}
		}

		// Set up cleanup callback
		const cleanupCallback = () => {
			this.effectQueue.delete(boidId);
		};

		// Schedule cleanup and store the timer event for potential cancellation
		effect.timerEvent = this.scene.time.delayedCall(effect.duration, cleanupCallback);
	}

	/**
	 * Type guard to check if boid has PhaserBoid-specific methods
	 */
	private hasPhaserBoidMethods(boid: IBoid): boid is IBoid & { playHurtAnimation(): void } {
		return (
			'playHurtAnimation' in boid &&
			typeof (boid as unknown as { playHurtAnimation?: unknown }).playHurtAnimation === 'function'
		);
	}

	/**
	 * Check if a boid currently has an active effect
	 */
	hasActiveEffect(boid: IBoid): boolean {
		return this.effectQueue.has(boid.getId());
	}

	/**
	 * Get the current effect type for a boid
	 */
	getCurrentEffectType(boid: IBoid): EffectType | null {
		const effect = this.effectQueue.get(boid.getId());
		return effect ? effect.type : null;
	}

	/**
	 * Clear all active effects (useful for scene cleanup)
	 */
	clearAllEffects(): void {
		// Cancel all pending timers
		this.effectQueue.forEach((effect) => {
			if (effect.timerEvent) {
				effect.timerEvent.destroy();
			}
		});

		this.effectQueue.clear();
	}

	/**
	 * Clean up the effects manager
	 */
	destroy(): void {
		this.clearAllEffects();

		if (this.eventBus) {
			this.eventBus.off('boid-damaged', undefined, this);
			this.eventBus.off('boundary-collision', undefined, this);
		}
	}
}
