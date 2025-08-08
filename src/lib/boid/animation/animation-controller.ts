import type { Scene, GameObjects } from 'phaser';
import type { IVector2 } from '$interfaces/vector';
import type { BoidSpriteConfig, AnimationType, AnimationState } from '$boid/animation/types';

/**
 * Controls 8-directional animations for boid sprites
 */
export class BoidAnimationController {
	private animationKeys = new Map<string, string>();
	private animationState: AnimationState = {
		current: 'walk',
		isInterruptible: true
	};
	private sprite: GameObjects.Sprite;
	private config: BoidSpriteConfig;
	private currentDirection: number = 0; // 0-7 for 8 directions

	constructor(scene: Scene, sprite: GameObjects.Sprite, config: BoidSpriteConfig) {
		this.sprite = sprite;
		this.config = config;
		this.cacheAnimationKeys();
		// Note: Animations are created in the Preloader, not here
	}

	/**
	 * Cache animation keys for efficient lookups
	 */
	private cacheAnimationKeys(): void {
		const animTypes: AnimationType[] = ['walk', 'attack', 'hurt'];

		// For each animation type and direction, create a key
		animTypes.forEach((animType) => {
			for (let dir = 0; dir < 8; dir++) {
				const key = `${this.config.id}-${animType}-${dir}`;
				this.animationKeys.set(`${animType}-${dir}`, key);
			}
		});
	}

	/**
	 * Update animation based on velocity vector
	 */
	updateDirection(velocity: IVector2): void {
		// Calculate direction from velocity vector
		const angle = Math.atan2(velocity.y, velocity.x);

		// PMD sprite direction order (rows 0-7): down, down-right, right, up-right, up, up-left, left, down-left
		// Map angles directly to these directions
		let direction: number;

		// Convert angle to degrees for easier calculation
		const degrees = ((angle * 180) / Math.PI + 360) % 360;

		// Map angle ranges to PMD sprite directions
		if (degrees >= 337.5 || degrees < 22.5) {
			direction = 2; // right
		} else if (degrees >= 22.5 && degrees < 67.5) {
			direction = 1; // down-right
		} else if (degrees >= 67.5 && degrees < 112.5) {
			direction = 0; // down
		} else if (degrees >= 112.5 && degrees < 157.5) {
			direction = 7; // down-left
		} else if (degrees >= 157.5 && degrees < 202.5) {
			direction = 6; // left
		} else if (degrees >= 202.5 && degrees < 247.5) {
			direction = 5; // up-left
		} else if (degrees >= 247.5 && degrees < 292.5) {
			direction = 4; // up
		} else {
			// 292.5 to 337.5
			direction = 3; // up-right
		}

		this.currentDirection = direction;

		// Always update direction immediately to match velocity
		// Only animation TYPE (walk/attack/hurt) should respect interruptibility, not direction
		this.playAnimation(this.animationState.current);
	}

	/**
	 * Play a specific animation type
	 */
	private playAnimation(animType: AnimationType): void {
		const animKey = this.animationKeys.get(`${animType}-${this.currentDirection}`);
		if (!animKey) return;

		// Check if animation exists before trying to play
		if (!this.sprite.scene.anims.exists(animKey)) {
			console.warn(`Animation ${animKey} does not exist`);
			return;
		}

		// Only play if not already playing this exact animation
		if (this.sprite.anims.currentAnim?.key !== animKey) {
			try {
				// Store current scale before changing animation
				const currentScale = this.sprite.scale;

				this.sprite.play(animKey);

				// Ensure consistent origin and scale after animation change
				this.sprite.setOrigin(0, 0);
				this.sprite.setScale(currentScale);
			} catch (error) {
				console.warn(`Failed to play animation ${animKey}:`, error);
			}
		}
	}

	/**
	 * Play walk animation (default state)
	 */
	playWalk(): void {
		// Can only switch to walk if current animation is interruptible
		if (!this.animationState.isInterruptible) {
			this.animationState.queuedAnimation = 'walk';
			return;
		}

		this.animationState = {
			current: 'walk',
			isInterruptible: true
		};
		this.playAnimation('walk');
	}

	/**
	 * Play attack animation
	 */
	playAttack(onComplete?: () => void): void {
		// Attack can interrupt walk but not hurt
		if (this.animationState.current === 'hurt' && !this.animationState.isInterruptible) {
			return;
		}

		this.animationState = {
			current: 'attack',
			isInterruptible: false
		};

		const animKey = this.animationKeys.get(`attack-${this.currentDirection}`);
		if (!animKey || !this.sprite.scene.anims.exists(animKey)) {
			console.warn(`Attack animation ${animKey} not available`);
			if (onComplete) onComplete();
			this.handleAnimationComplete();
			return;
		}

		try {
			this.sprite.play(animKey);

			// Set up completion handler
			this.sprite.once('animationcomplete', () => {
				if (onComplete) onComplete();
				this.handleAnimationComplete();
			});
		} catch (error) {
			console.warn(`Failed to play attack animation:`, error);
			if (onComplete) onComplete();
			this.handleAnimationComplete();
		}
	}

	/**
	 * Play hurt animation
	 */
	playHurt(onComplete?: () => void): void {
		// Hurt has highest priority
		this.animationState = {
			current: 'hurt',
			isInterruptible: false
		};

		const animKey = this.animationKeys.get(`hurt-${this.currentDirection}`);
		if (!animKey || !this.sprite.scene.anims.exists(animKey)) {
			console.warn(`Hurt animation ${animKey} not available`);
			if (onComplete) onComplete();
			this.handleAnimationComplete();
			return;
		}

		try {
			this.sprite.play(animKey);

			// Set up completion handler
			this.sprite.once('animationcomplete', () => {
				if (onComplete) onComplete();
				this.handleAnimationComplete();
			});
		} catch (error) {
			console.warn(`Failed to play hurt animation:`, error);
			if (onComplete) onComplete();
			this.handleAnimationComplete();
		}
	}

	/**
	 * Handle animation completion
	 */
	private handleAnimationComplete(): void {
		// Check if there's a queued animation
		if (this.animationState.queuedAnimation) {
			const queued = this.animationState.queuedAnimation;
			this.animationState.queuedAnimation = undefined;

			if (queued === 'walk') {
				this.playWalk();
			}
		} else {
			// Default back to walk
			this.playWalk();
		}
	}

	/**
	 * Get the current animation state
	 */
	getAnimationState(): AnimationState {
		return this.animationState;
	}

	/**
	 * Check if boid is in attack animation at hit frame
	 */
	isAtHitFrame(): boolean {
		if (this.animationState.current !== 'attack') return false;

		const currentFrame = this.sprite.anims.currentFrame;
		if (!currentFrame) return false;

		const hitFrame = this.config.animations.attack.hitFrame;
		return hitFrame !== undefined && currentFrame.index === hitFrame;
	}

	/**
	 * Get current frame dimensions for centering calculations
	 */
	getCurrentFrameDimensions(): { width: number; height: number } {
		const currentAnim = this.animationState.current;
		const animConfig = this.config.animations[currentAnim];
		return {
			width: animConfig.frameWidth,
			height: animConfig.frameHeight
		};
	}

	/**
	 * Clean up animations
	 */
	destroy(): void {
		this.sprite.off('animationcomplete');
	}
}
