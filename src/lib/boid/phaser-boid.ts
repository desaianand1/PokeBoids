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
			
			// Set scale and origin to top-left to prevent clipping between animation frames
			this.setScale(spriteConfig.scale);
			this.setOrigin(0, 0);
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
		
		// Create behavior instance
		this.behavior = new BoidBehavior(deps, x, y, variant);
		
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
		return this.behavior.takeDamage(amount);
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

		// Apply centering offset since origin is (0,0) but we want sprite centered on logical position
		if (this.animationController && this.spriteConfig) {
			const frameDims = this.animationController.getCurrentFrameDimensions();
			const offsetX = (frameDims.width * this.spriteConfig.scale) / 2;
			const offsetY = (frameDims.height * this.spriteConfig.scale) / 2;
			this.setPosition(position.x - offsetX, position.y - offsetY);
		} else {
			this.setPosition(position.x, position.y);
		}

		// Update animation based on velocity if we have an animation controller
		if (this.animationController) {
			this.animationController.updateDirection(velocity);
		} else {
			// Fallback rotation for static sprites
			this.rotation = Math.atan2(velocity.y, velocity.x) + Math.PI / 2;
		}
	}

	// Combat Methods
	canAttack(): boolean {
		const currentTime = this.scene.time.now;
		return (currentTime - this.lastAttackTime) >= this.attackCooldown;
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
	 * Show collision flash effect
	 */
	private showCollisionFlash(): void {
		// Flash red for hurt
		this.setTint(0xff4444);
		
		// Return to original tint after short delay
		this.scene.time.delayedCall(200, () => {
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
}
