import { describe, test, expect, beforeEach, vi } from 'vitest';
import { BoidAnimationController } from './animation-controller';
import type { BoidSpriteConfig } from './types';
import type { IVector2 } from '$interfaces/vector';

// Mock minimal Phaser dependencies for direction calculation testing
const createMockScene = () => ({
	anims: { exists: vi.fn().mockReturnValue(true) }
});

const createMockSprite = () => ({
	scene: createMockScene(),
	anims: { currentAnim: null, play: vi.fn() },
	play: vi.fn(),
	once: vi.fn(),
	off: vi.fn(),
	setOrigin: vi.fn(),
	setScale: vi.fn(),
	setPosition: vi.fn(),
	scale: 1,
	x: 100,
	y: 100
});

const createMockSpriteConfig = (): BoidSpriteConfig => ({
	id: 'test-sprite',
	name: 'Test Sprite',
	groupId: 'test-group',
	animations: {
		walk: {
			spriteSheet: 'test.png',
			frameWidth: 32,
			frameHeight: 32,
			frameCount: 8,
			frameDurations: [100],
			defaultFrameRate: 8
		},
		attack: {
			spriteSheet: 'test-attack.png',
			frameWidth: 32,
			frameHeight: 32,
			frameCount: 4,
			frameDurations: [150],
			defaultFrameRate: 6
		},
		hurt: {
			spriteSheet: 'test-hurt.png',
			frameWidth: 32,
			frameHeight: 32,
			frameCount: 3,
			frameDurations: [200],
			defaultFrameRate: 4
		}
	},
	attackRadius: 32,
	scale: 1.0
});

describe('BoidAnimationController - Direction Calculation', () => {
	let controller: BoidAnimationController;

	beforeEach(() => {
		const mockScene = createMockScene();
		const mockSprite = createMockSprite();
		const mockSpriteConfig = createMockSpriteConfig();
		controller = new BoidAnimationController(
			mockScene as unknown as Phaser.Scene,
			mockSprite as unknown as Phaser.GameObjects.Sprite,
			mockSpriteConfig
		);
	});

	describe('velocity to direction mapping', () => {
		test('should handle basic directional velocities', () => {
			const velocities = [
				{ x: 1, y: 0 }, // right
				{ x: -1, y: 0 }, // left
				{ x: 0, y: 1 }, // down
				{ x: 0, y: -1 }, // up
				{ x: 1, y: 1 }, // down-right
				{ x: -1, y: -1 } // up-left
			];

			velocities.forEach((velocity) => {
				expect(() => controller.updateDirection(velocity as unknown as IVector2)).not.toThrow();
			});
		});

		test('should handle zero velocity gracefully', () => {
			const zeroVelocity = { x: 0, y: 0 };
			expect(() => controller.updateDirection(zeroVelocity as unknown as IVector2)).not.toThrow();
		});

		test('should handle extreme velocity values', () => {
			const extremeVelocities = [
				{ x: Number.MAX_VALUE, y: 0 },
				{ x: Infinity, y: 0 },
				{ x: NaN, y: 0 }
			];

			extremeVelocities.forEach((velocity) => {
				expect(() => controller.updateDirection(velocity as unknown as IVector2)).not.toThrow();
			});
		});
	});
});
