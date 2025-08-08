import type { IVector2 } from '$interfaces/vector';
import type { BoidVariant, BoidStats, PreyStats, PredatorStats } from '$boid/types';
import type { BoundaryDirection, IGameEventBus } from '$events/types';
import type { BoidAnimationController } from '$boid/animation/animation-controller';

/**
 * Core boid behavior interface independent of rendering/physics framework
 */
export interface IBoid {
	// Identity
	getId(): string;
	getVariant(): BoidVariant;
	getGroupId(): string;

	// Position and Movement
	getBoidPosition(): IVector2;
	setBoidPosition(position: IVector2): void;
	getBoidVelocity(): IVector2;
	setBoidVelocity(velocity: IVector2): void;
	applyForce(force: IVector2): void;

	// Configuration
	getMaxSpeed(): number;
	setMaxSpeed(speed: number): void;
	getMaxForce(): number;
	setMaxForce(force: number): void;
	getPerceptionRadius(): number;
	setPerceptionRadius(radius: number): void;
	getFieldOfViewAngle(): number;
	isInFieldOfView(other: IBoid): boolean;

	// Stats and State
	getStats(): BoidStats;
	takeDamage(amount: number): boolean;
	increaseReproduction(amount: number): boolean;
	levelUp(): void;

	// Lifecycle
	update(deltaTime: number): void;
	destroy(): void;

	// Visualization
	showCollisionEffect(boundary: BoundaryDirection): void;
}

/**
 * Interface for sprite animation capabilities that can be composed with boids
 */
export interface ISpriteAnimatable {
	getAnimationController(): BoidAnimationController | undefined;
	getSpriteScale(): number;
	validateAndFixSpriteProperties(): void;
}

/**
 * Type guard to check if a boid has sprite animation capabilities
 */
export function hasSpriteAnimation(boid: IBoid): boid is IBoid & ISpriteAnimatable {
	return 'getAnimationController' in boid && 
	       'getSpriteScale' in boid && 
	       'validateAndFixSpriteProperties' in boid;
}

/**
 * Prey-specific behavior interface
 */
export interface IPreyBoid extends IBoid {
	getStats(): PreyStats;
	// Future prey-specific methods can be added here
	// For example:
	// evade(predator: IPredatorBoid): void;
	// activateCamouflage(): void;
}

/**
 * Predator-specific behavior interface
 */
export interface IPredatorBoid extends IBoid {
	getStats(): PredatorStats;
	// Future predator-specific methods can be added here
	// For example:
	// hunt(prey: IPreyBoid): void;
	// activateStealth(): void;
}

import type { BoidConfig } from '$config/types';

/**
 * Configuration for boid behavior
 */
export type IBoidConfig = Partial<BoidConfig>;

/**
 * Dependencies required for boid behavior
 */
export interface IBoidDependencies {
	vectorFactory: IVectorFactory;
	eventEmitter: IGameEventBus;
	random: IRandomGenerator;
	time: ITimeProvider;
	physics: IPhysics;
	config?: IBoidConfig;
}

// Import required types
import type { IVectorFactory, IRandomGenerator, ITimeProvider, IPhysics } from './index';
