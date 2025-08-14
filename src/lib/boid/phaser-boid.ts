import { Physics } from 'phaser';
import { BoidBehavior } from '$boid/boid-behavior';
import type { IBoid, IBoidDependencies } from '$interfaces/boid';
import type { IVector2 } from '$interfaces/vector';
import { BoidVariant } from '$boid/types';
import type { BoidStats } from '$boid/types';
import type { BoundaryDirection } from '$events/types';
import { BoidAnimationController } from '$boid/animation/animation-controller';
import type { BoidSpriteConfig } from '$boid/animation/types';

/**
 * Phaser-specific boid implementation using composition
 */
export class PhaserBoid extends Physics.Arcade.Sprite implements IBoid {
	private behavior: BoidBehavior;
	private dependencies: IBoidDependencies;
	private originalSpriteTint: number;
	private animationController?: BoidAnimationController;
	private groupId: string;
	private spriteConfig?: BoidSpriteConfig;
	private attackRadius: number;
	private lastAttackTime: number = 0;
	private attackCooldown: number = 1000; // 1 second cooldown

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		variant: BoidVariant,
		deps: IBoidDependencies,
		spriteConfig?: BoidSpriteConfig
	) {
		// Initialize sprite based on whether we have animation config
		if (spriteConfig) {
			// Use animated sprite - start with walk animation texture
			super(scene, x, y, `${spriteConfig.id}-walk`);
			this.spriteConfig = spriteConfig;
			this.groupId = spriteConfig.groupId;
			this.attackRadius = spriteConfig.attackRadius;

			// Create animation controller
			this.animationController = new BoidAnimationController(scene, this, spriteConfig);

			// Set scale and origin to center for proper positioning
			this.setScale(spriteConfig.scale);
			this.setOrigin(0.5, 0.5);
		} else {
			// Fallback to static sprites
			const texture = variant === BoidVariant.PREDATOR ? 'predator' : 'prey';
			super(scene, x, y, texture);
			this.groupId = `legacy-${variant}-${this.scene.time.now}`;
			this.attackRadius = variant === BoidVariant.PREDATOR ? 40 : 30;

			// Set legacy display properties
			this.setupLegacyDisplay();
		}

		// Add to physics system
		scene.physics.add.existing(this);

		// Store dependencies for later use
		this.dependencies = deps;

		// Create behavior instance
		this.behavior = new BoidBehavior(deps, x, y, variant);

		// Note: Event translation is handled by EffectsManager through type checking

		// Store original tint for flash effects
		this.originalSpriteTint = this.tint;
	}

	// Identity
	getId(): string {
		return this.behavior.getId();
	}

	getVariant(): BoidVariant {
		return this.behavior.getVariant();
	}

	getGroupId(): string {
		return this.groupId;
	}

	getAttackRadius(): number {
		return this.attackRadius;
	}

	// Position and Movement
	getBoidPosition(): IVector2 {
		return this.behavior.getBoidPosition();
	}

	setBoidPosition(position: IVector2): void {
		this.behavior.setBoidPosition(position);
		super.setPosition(position.x, position.y);
	}

	getBoidVelocity(): IVector2 {
		return this.behavior.getBoidVelocity();
	}

	setBoidVelocity(velocity: IVector2): void {
		this.behavior.setBoidVelocity(velocity);
		super.setVelocity(velocity.x, velocity.y);
	}

	applyForce(force: IVector2): void {
		this.behavior.applyForce(force);
	}

	// Configuration
	getMaxSpeed(): number {
		return this.behavior.getMaxSpeed();
	}

	setMaxSpeed(speed: number): void {
		this.behavior.setMaxSpeed(speed);
	}

	getMaxForce(): number {
		return this.behavior.getMaxForce();
	}

	setMaxForce(force: number): void {
		this.behavior.setMaxForce(force);
	}

	getPerceptionRadius(): number {
		return this.behavior.getPerceptionRadius();
	}

	setPerceptionRadius(radius: number): void {
		this.behavior.setPerceptionRadius(radius);
	}

	getFieldOfViewAngle(): number {
		return this.behavior.getFieldOfViewAngle();
	}

	isInFieldOfView(other: IBoid): boolean {
		return this.behavior.isInFieldOfView(other);
	}

	// Stats and State
	getStats(): BoidStats {
		return this.behavior.getStats();
	}

	takeDamage(amount: number): boolean {
		const wasKilled = this.behavior.takeDamage(amount);

		// Trigger hurt animation and visual effects
		this.playHurtAnimation();

		return wasKilled;
	}

	increaseReproduction(amount: number): boolean {
		return this.behavior.increaseReproduction(amount);
	}

	levelUp(): void {
		this.behavior.levelUp();
	}

	// Lifecycle
	update(deltaTime: number): void {
		// Update behavior only
		this.behavior.update(deltaTime);
	}

	/**
	 * Synchronize Phaser sprite properties with boid behavior state
	 */
	syncWithPhaser(): void {
		// Sync position and rotation from behavior
		const position = this.behavior.getBoidPosition();
		const velocity = this.behavior.getBoidVelocity();

		// Validate position before setting
		if (
			typeof position.x !== 'number' ||
			typeof position.y !== 'number' ||
			!isFinite(position.x) ||
			!isFinite(position.y)
		) {
			console.error(
				`[PhaserBoid] Invalid position for sprite '${this.getId()}': ${position.x}, ${position.y}`
			);
			return;
		}

		// Set position directly since origin is now centered
		this.setPosition(position.x, position.y);

		// Update animation based on velocity if we have an animation controller
		if (this.animationController) {
			try {
				// Validate velocity before updating direction
				if (
					typeof velocity.x !== 'number' ||
					typeof velocity.y !== 'number' ||
					!isFinite(velocity.x) ||
					!isFinite(velocity.y)
				) {
					console.error(
						`[PhaserBoid] Invalid velocity for sprite '${this.getId()}': ${velocity.x}, ${velocity.y}`
					);
					return;
				}

				this.animationController.updateDirection(velocity);

				// Ensure sprite origin and scale are maintained after animation updates
				if (this.originX !== 0.5 || this.originY !== 0.5) {
					console.warn(
						`[PhaserBoid] Correcting sprite origin for '${this.getId()}' from (${this.originX}, ${this.originY}) to (0.5, 0.5)`
					);
					this.setOrigin(0.5, 0.5);
				}

				// Validate sprite scale
				const expectedScale = this.spriteConfig?.scale || 1.0;
				if (
					Math.abs(this.scaleX - expectedScale) > 0.01 ||
					Math.abs(this.scaleY - expectedScale) > 0.01
				) {
					console.warn(
						`[PhaserBoid] Correcting sprite scale for '${this.getId()}' from (${this.scaleX}, ${this.scaleY}) to (${expectedScale}, ${expectedScale})`
					);
					this.setScale(expectedScale);
				}

				// Periodic validation (every ~5 seconds) to catch any issues early
				if (this.scene.time.now % 5000 < 16) {
					// Approximately every 5 seconds
					this.validateAndFixSpriteProperties();
				}
			} catch (error) {
				console.error(`[PhaserBoid] Error updating animation for sprite '${this.getId()}':`, error);
				// Emergency validation on error
				this.validateAndFixSpriteProperties();
			}
		} else {
			// Fallback rotation for static sprites
			if (velocity.x !== 0 || velocity.y !== 0) {
				this.rotation = Math.atan2(velocity.y, velocity.x) + Math.PI / 2;
			}
		}
	}

	// Combat Methods
	canAttack(): boolean {
		const currentTime = this.scene.time.now;
		return currentTime - this.lastAttackTime >= this.attackCooldown;
	}

	playAttack(onComplete?: () => void): void {
		if (this.animationController) {
			this.lastAttackTime = this.scene.time.now;
			this.animationController.playAttack(onComplete);
		} else if (onComplete) {
			onComplete();
		}
	}

	playHurt(onComplete?: () => void): void {
		if (this.animationController) {
			this.animationController.playHurt(onComplete);
		} else if (onComplete) {
			onComplete();
		}
	}

	isAtHitFrame(): boolean {
		if (this.animationController) {
			return this.animationController.isAtHitFrame();
		}
		return false;
	}

	/**
	 * Get the behavior instance for event matching
	 */
	getBehavior() {
		return this.behavior;
	}

	destroy(fromScene?: boolean): void {
		// Clean up animation controller
		if (this.animationController) {
			this.animationController.destroy();
		}

		// Clean up behavior
		this.behavior.destroy();

		// Call parent destroy
		super.destroy(fromScene);
	}

	/**
	 * Check if this boid is close enough to attack another boid
	 */
	checkAttackProximity(target: IBoid): boolean {
		const distance = this.getBoidPosition().distanceTo(target.getBoidPosition());
		return distance <= this.attackRadius;
	}

	/**
	 * Trigger attack animation
	 */
	playAttackAnimation(onHit?: () => void): void {
		if (this.animationController) {
			this.animationController.playAttack(onHit);
		}
	}

	/**
	 * Trigger hurt animation with flash effect
	 */
	playHurtAnimation(): void {
		if (this.animationController) {
			this.animationController.playHurt();
		}

		// Apply flash effect
		this.showCollisionFlash();
	}

	/**
	 * Show collision flash effect (standardized to white)
	 */
	private showCollisionFlash(): void {
		// Flash white for all hit effects (standardized)
		this.setTint(0xffffff);

		// Return to original tint after short delay
		this.scene.time.delayedCall(150, () => {
			this.setTint(this.originalSpriteTint);
		});
	}

	/**
	 * Set up display for legacy static sprites
	 */
	private setupLegacyDisplay(): void {
		// Set scale based on variant
		this.setScale(this.getVariant() === BoidVariant.PREDATOR ? 0.75 : 0.5);
		this.setOrigin(0.5, 0.5);

		// Set tint based on variant
		this.setTint(this.getVariant() === BoidVariant.PREDATOR ? 0xff8c00 : 0x00ff7f);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	showCollisionEffect(boundary: BoundaryDirection): void {
		this.setTint(0xffffff);

		// Restore original tint after delay
		this.scene.time.delayedCall(100, () => {
			// Get the appropriate color based on variant
			this.setTint(this.originalSpriteTint);
		});
	}

	/**
	 * Get animation controller for debug visualization
	 */
	getAnimationController(): BoidAnimationController | undefined {
		return this.animationController;
	}

	/**
	 * Get sprite scale for debug calculations
	 */
	getSpriteScale(): number {
		return this.spriteConfig?.scale || 1.0;
	}

	/**
	 * Validate and fix sprite positioning and properties
	 * Call this if sprite rendering seems incorrect
	 */
	validateAndFixSpriteProperties(): void {
		if (!this.spriteConfig || !this.animationController) {
			return; // Skip validation for static sprites
		}

		try {
			// Check current frame dimensions
			const frameDims = this.animationController.getCurrentFrameDimensions();
			if (frameDims.width <= 0 || frameDims.height <= 0) {
				console.error(
					`[PhaserBoid] Invalid frame dimensions detected for sprite '${this.getId()}': ${frameDims.width}x${frameDims.height}`
				);
				return;
			}

			// Ensure origin is centered
			if (this.originX !== 0.5 || this.originY !== 0.5) {
				console.warn(
					`[PhaserBoid] Fixing origin for sprite '${this.getId()}' from (${this.originX}, ${this.originY}) to (0.5, 0.5)`
				);
				this.setOrigin(0.5, 0.5);
			}

			// Ensure scale is correct
			const expectedScale = this.spriteConfig.scale;
			if (
				Math.abs(this.scaleX - expectedScale) > 0.01 ||
				Math.abs(this.scaleY - expectedScale) > 0.01
			) {
				console.warn(
					`[PhaserBoid] Fixing scale for sprite '${this.getId()}' from (${this.scaleX}, ${this.scaleY}) to (${expectedScale}, ${expectedScale})`
				);
				this.setScale(expectedScale);
			}

			// Validate position is reasonable
			const pos = this.getBoidPosition();
			if (!isFinite(pos.x) || !isFinite(pos.y)) {
				console.error(
					`[PhaserBoid] Invalid position detected for sprite '${this.getId()}': (${pos.x}, ${pos.y})`
				);
				// Reset to scene center as emergency fallback
				const centerX = this.scene.scale.width / 2;
				const centerY = this.scene.scale.height / 2;
				const centerPosition = this.dependencies.vectorFactory.create(centerX, centerY);
				this.setBoidPosition(centerPosition);
				console.warn(
					`[PhaserBoid] Reset sprite '${this.getId()}' position to scene center: (${centerX}, ${centerY})`
				);
			}

			// Validate texture and animation state
			if (!this.texture || this.texture.key === '__MISSING') {
				console.error(
					`[PhaserBoid] Missing or invalid texture for sprite '${this.getId()}': ${this.texture?.key}`
				);
			}

			// Check if current animation exists
			if (this.anims.currentAnim) {
				const currentAnimKey = this.anims.currentAnim.key;
				if (!this.scene.anims.exists(currentAnimKey)) {
					console.error(
						`[PhaserBoid] Current animation '${currentAnimKey}' does not exist for sprite '${this.getId()}'`
					);
					// Try to restart with walk animation
					this.animationController.playWalk();
				}
			}

			console.debug(
				`[PhaserBoid] Sprite validation passed for '${this.getId()}': pos(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}), scale(${this.scaleX}, ${this.scaleY}), origin(${this.originX}, ${this.originY})`
			);
		} catch (error) {
			console.error(`[PhaserBoid] Error during sprite validation for '${this.getId()}':`, error);
		}
	}
}
