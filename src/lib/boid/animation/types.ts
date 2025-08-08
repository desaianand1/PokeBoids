/**
 * Types and interfaces for the boid animation system
 */

export type SimulationFlavor = 'air' | 'land' | 'water';

export type AnimationType = 'walk' | 'attack' | 'hurt';

export type Direction = 'down' | 'downleft' | 'left' | 'upleft' | 'up' | 'upright' | 'right' | 'downright';

export interface AnimationConfig {
	spriteSheet: string;
	frameWidth: number;
	frameHeight: number;
	frameCount: number;
	frameDurations: number[];
	defaultFrameRate: number;
	rushFrame?: number; // For attack animations - frame when movement occurs
	hitFrame?: number; // Frame when damage is dealt
	returnFrame?: number; // Frame to return to idle state
}

export interface BoidSpriteConfig {
	id: string;
	name: string;
	groupId: string;
	animations: {
		walk: AnimationConfig;
		attack: AnimationConfig;
		hurt: AnimationConfig;
	};
	attackRadius: number;
	scale: number;
}

export interface SpriteDatabase {
	sprites: {
		[flavor in SimulationFlavor]: {
			predator: BoidSpriteConfig[];
			prey: BoidSpriteConfig[];
		};
	};
	backgrounds: {
		[flavor in SimulationFlavor]: string;
	};
}

export interface AnimationState {
	current: AnimationType;
	isInterruptible: boolean;
	queuedAnimation?: AnimationType;
}