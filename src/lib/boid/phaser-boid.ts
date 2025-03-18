import { Physics } from 'phaser';
import { BoidBehavior } from '$boid/boid-behavior';
import type { IBoid, IBoidDependencies } from '$interfaces/boid';
import type { IVector2 } from '$interfaces/vector';
import { BoidVariant } from '$boid/types';
import type { BoidStats } from '$boid/types';

/**
 * Phaser-specific boid implementation using composition
 */
export class PhaserBoid extends Physics.Arcade.Sprite implements IBoid {
  private behavior: BoidBehavior;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    variant: BoidVariant,
    deps: IBoidDependencies
  ) {
    // Initialize Phaser sprite with appropriate texture
    const texture = variant === BoidVariant.PREDATOR ? 'predator' : 'prey';
    super(scene, x, y, texture);

    // Add to physics system
    scene.physics.add.existing(this);

    // Create behavior instance
    this.behavior = new BoidBehavior(deps, x, y, variant);

    // Set display properties
    this.setupDisplay();
  }

  // Identity
  getId(): string {
    return this.behavior.getId();
  }

  getVariant(): BoidVariant {
    return this.behavior.getVariant();
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
    // Update behavior
    this.behavior.update(deltaTime);

    // Sync position and rotation from behavior
    const position = this.behavior.getBoidPosition();
    const velocity = this.behavior.getBoidVelocity();
    
    this.setPosition(position.x, position.y);
    this.rotation = Math.atan2(velocity.y, velocity.x) + Math.PI / 2;
  }

  destroy(fromScene?: boolean): void {
    // Clean up behavior
    this.behavior.destroy();
    
    // Call parent destroy
    super.destroy(fromScene);
  }

  private setupDisplay(): void {
    // Set scale based on variant
    this.setScale(this.getVariant() === BoidVariant.PREDATOR ? 0.75 : 0.5);
    this.setOrigin(0.5, 0.5);

    // Set tint based on variant
    this.setTint(this.getVariant() === BoidVariant.PREDATOR ? 0xff8c00 : 0x00ff7f);
  }
}
