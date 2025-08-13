import type { Loader, Scene } from 'phaser';
import type { SimulationFlavor, SpriteDatabase, BoidSpriteConfig } from '$boid/animation/types';
import { BoidVariant } from '$boid/types';
import { EventBus } from '$events/event-bus';
import { safeExtractSpriteFrame, type ExtractedSpriteFrame } from '$utils/sprite-frame-extractor';
import { phaserGameRef } from '$game/phaser-signals.svelte';

/**
 * Singleton manager for sprite configurations and flavor management
 */
export class BoidSpriteManager {
	private static instance: BoidSpriteManager;
	private spriteDatabase: SpriteDatabase | null = null;
	private currentFlavor: SimulationFlavor = 'air';
	private loadedSprites = new Set<string>();

	private constructor() {}

	/**
	 * Get singleton instance
	 */
	static getInstance(): BoidSpriteManager {
		if (!this.instance) {
			this.instance = new BoidSpriteManager();
		}
		return this.instance;
	}

	/**
	 * Load sprite configuration JSON
	 */
	loadSpriteDatabase(loader: Loader.LoaderPlugin): void {
		loader.json('sprite-config', 'sprites/sprite-config.json');
	}

	/**
	 * Initialize from loaded JSON data
	 */
	initializeFromJSON(jsonData: SpriteDatabase): void {
		this.spriteDatabase = jsonData;
		console.log(
			'Sprite database initialized with flavors:',
			Object.keys(this.spriteDatabase.sprites)
		);
	}

	/**
	 * Load sprite sheets for a specific flavor
	 */
	loadSpriteSheetsForFlavor(loader: Loader.LoaderPlugin, flavor: SimulationFlavor): void {
		if (!this.spriteDatabase) {
			console.error('Sprite database not initialized');
			return;
		}

		const flavorData = this.spriteDatabase.sprites[flavor];

		// Load predator sprites
		flavorData.predator.forEach((sprite) => {
			this.loadSpriteAnimations(loader, sprite);
		});

		// Load prey sprites
		flavorData.prey.forEach((sprite) => {
			this.loadSpriteAnimations(loader, sprite);
		});

		// Load background for this flavor
		const bgKey = `${flavor}-background`;
		if (!this.loadedSprites.has(bgKey)) {
			loader.image(bgKey, this.spriteDatabase.backgrounds[flavor]);
			this.loadedSprites.add(bgKey);
		}
	}

	/**
	 * Load all animations for a sprite with comprehensive validation
	 */
	private loadSpriteAnimations(loader: Loader.LoaderPlugin, sprite: BoidSpriteConfig): void {
		// Validate sprite config before loading
		if (!this.validateSpriteConfig(sprite)) {
			console.error(`[SpriteManager] Invalid sprite config for '${sprite.id}', skipping load`);
			return;
		}

		// Load walk animation
		const walkKey = `${sprite.id}-walk`;
		if (!this.loadedSprites.has(walkKey)) {
			try {
				loader.spritesheet(walkKey, sprite.animations.walk.spriteSheet, {
					frameWidth: sprite.animations.walk.frameWidth,
					frameHeight: sprite.animations.walk.frameHeight
				});
				this.loadedSprites.add(walkKey);
				console.debug(
					`[SpriteManager] Loaded walk animation for '${sprite.id}': ${sprite.animations.walk.frameWidth}x${sprite.animations.walk.frameHeight}`
				);
			} catch (error) {
				console.error(`[SpriteManager] Failed to load walk animation for '${sprite.id}':`, error);
			}
		}

		// Load attack animation
		const attackKey = `${sprite.id}-attack`;
		if (!this.loadedSprites.has(attackKey)) {
			try {
				loader.spritesheet(attackKey, sprite.animations.attack.spriteSheet, {
					frameWidth: sprite.animations.attack.frameWidth,
					frameHeight: sprite.animations.attack.frameHeight
				});
				this.loadedSprites.add(attackKey);
				console.debug(
					`[SpriteManager] Loaded attack animation for '${sprite.id}': ${sprite.animations.attack.frameWidth}x${sprite.animations.attack.frameHeight}`
				);
			} catch (error) {
				console.error(`[SpriteManager] Failed to load attack animation for '${sprite.id}':`, error);
			}
		}

		// Load hurt animation
		const hurtKey = `${sprite.id}-hurt`;
		if (!this.loadedSprites.has(hurtKey)) {
			try {
				loader.spritesheet(hurtKey, sprite.animations.hurt.spriteSheet, {
					frameWidth: sprite.animations.hurt.frameWidth,
					frameHeight: sprite.animations.hurt.frameHeight
				});
				this.loadedSprites.add(hurtKey);
				console.debug(
					`[SpriteManager] Loaded hurt animation for '${sprite.id}': ${sprite.animations.hurt.frameWidth}x${sprite.animations.hurt.frameHeight}`
				);
			} catch (error) {
				console.error(`[SpriteManager] Failed to load hurt animation for '${sprite.id}':`, error);
			}
		}
	}

	/**
	 * Get a random sprite configuration for a variant
	 */
	getRandomSprite(variant: BoidVariant): BoidSpriteConfig | null {
		if (!this.spriteDatabase) {
			console.warn(
				'[SpriteManager] Sprite database not initialized, falling back to legacy sprites'
			);
			return null;
		}

		try {
			const variantKey = variant === BoidVariant.PREDATOR ? 'predator' : 'prey';
			const flavorData = this.spriteDatabase.sprites[this.currentFlavor];

			if (!flavorData) {
				console.warn(`[SpriteManager] No data available for flavor: ${this.currentFlavor}`);
				return null;
			}

			const sprites = flavorData[variantKey];

			if (!sprites || sprites.length === 0) {
				console.warn(
					`[SpriteManager] No sprites available for ${variantKey} in ${this.currentFlavor} flavor`
				);
				return null;
			}

			const randomIndex = Math.floor(Math.random() * sprites.length);
			return sprites[randomIndex];
		} catch (error) {
			console.error('[SpriteManager] Error getting random sprite:', error);
			return null;
		}
	}

	/**
	 * Get sprite by specific ID
	 */
	getSpriteById(id: string, variant: BoidVariant): BoidSpriteConfig | null {
		if (!this.spriteDatabase) return null;

		const variantKey = variant === BoidVariant.PREDATOR ? 'predator' : 'prey';
		const sprites = this.spriteDatabase.sprites[this.currentFlavor][variantKey];

		return sprites.find((s) => s.id === id) || null;
	}

	/**
	 * Get all available sprites for current flavor and variant
	 */
	getAvailableSprites(variant: BoidVariant): BoidSpriteConfig[] {
		if (!this.spriteDatabase) return [];

		const variantKey = variant === BoidVariant.PREDATOR ? 'predator' : 'prey';
		return this.spriteDatabase.sprites[this.currentFlavor][variantKey];
	}

	/**
	 * Set the current simulation flavor
	 */
	setFlavor(flavor: SimulationFlavor): void {
		if (this.currentFlavor !== flavor) {
			this.currentFlavor = flavor;
			EventBus.emit('simulation-flavor-changed', { flavor });
		}
	}

	/**
	 * Get current flavor
	 */
	getCurrentFlavor(): SimulationFlavor {
		return this.currentFlavor;
	}

	/**
	 * Get background key for current flavor
	 */
	getBackgroundKey(): string {
		return `${this.currentFlavor}-background`;
	}

	/**
	 * Get background path for a specific flavor
	 */
	getBackgroundForFlavor(flavor: SimulationFlavor): string {
		if (!this.spriteDatabase) return 'day-sky.jpg';
		return this.spriteDatabase.backgrounds[flavor];
	}

	/**
	 * Check if sprites are available for a flavor
	 */
	hasSpritesForFlavor(flavor: SimulationFlavor): boolean {
		if (!this.spriteDatabase) return false;

		const flavorData = this.spriteDatabase.sprites[flavor];
		return flavorData.predator.length > 0 || flavorData.prey.length > 0;
	}

	/**
	 * Get all group IDs for current flavor
	 */
	getAllGroupIds(): string[] {
		if (!this.spriteDatabase) return [];

		const groups: string[] = [];
		const flavorData = this.spriteDatabase.sprites[this.currentFlavor];

		flavorData.predator.forEach((sprite) => groups.push(sprite.groupId));
		flavorData.prey.forEach((sprite) => groups.push(sprite.groupId));

		return groups;
	}

	/**
	 * Validate sprite configuration for common issues
	 */
	private validateSpriteConfig(sprite: BoidSpriteConfig): boolean {
		if (!sprite || !sprite.id || !sprite.animations) {
			console.error(`[SpriteManager] Missing basic sprite config properties`);
			return false;
		}

		// Check required animations
		const requiredAnimations: (keyof BoidSpriteConfig['animations'])[] = ['walk', 'attack', 'hurt'];
		for (const animType of requiredAnimations) {
			const anim = sprite.animations[animType];
			if (!anim) {
				console.error(`[SpriteManager] Missing ${animType} animation for sprite '${sprite.id}'`);
				return false;
			}

			// Validate frame dimensions
			if (!anim.frameWidth || !anim.frameHeight || anim.frameWidth <= 0 || anim.frameHeight <= 0) {
				console.error(
					`[SpriteManager] Invalid frame dimensions for ${animType} animation of sprite '${sprite.id}': ${anim.frameWidth}x${anim.frameHeight}`
				);
				return false;
			}

			// Validate sprite sheet path
			if (!anim.spriteSheet || typeof anim.spriteSheet !== 'string') {
				console.error(
					`[SpriteManager] Invalid sprite sheet path for ${animType} animation of sprite '${sprite.id}': ${anim.spriteSheet}`
				);
				return false;
			}

			// Validate frame count
			if (!anim.frameCount || anim.frameCount <= 0) {
				console.error(
					`[SpriteManager] Invalid frame count for ${animType} animation of sprite '${sprite.id}': ${anim.frameCount}`
				);
				return false;
			}
		}

		// Validate sprite properties
		if (!sprite.scale || sprite.scale <= 0) {
			console.warn(
				`[SpriteManager] Invalid or missing scale for sprite '${sprite.id}', using default 1.0`
			);
			sprite.scale = 1.0;
		}

		if (!sprite.attackRadius || sprite.attackRadius <= 0) {
			console.warn(
				`[SpriteManager] Invalid or missing attack radius for sprite '${sprite.id}', using default 30`
			);
			sprite.attackRadius = 30;
		}

		return true;
	}

	/**
	 * Get group statistics
	 */
	getGroupStats(): Map<string, { count: number; variant: BoidVariant }> {
		const stats = new Map<string, { count: number; variant: BoidVariant }>();

		if (!this.spriteDatabase) return stats;

		const flavorData = this.spriteDatabase.sprites[this.currentFlavor];

		flavorData.predator.forEach((sprite) => {
			stats.set(sprite.groupId, { count: 0, variant: BoidVariant.PREDATOR });
		});

		flavorData.prey.forEach((sprite) => {
			stats.set(sprite.groupId, { count: 0, variant: BoidVariant.PREY });
		});

		return stats;
	}

	/**
	 * Get display frames for the WelcomeDialog
	 * Extracts down-facing walk frames from currently active sprites
	 */
	async getDisplayFrames(): Promise<{
		predator: ExtractedSpriteFrame | null;
		prey: ExtractedSpriteFrame | null;
	}> {
		// Check if we have access to the game scene
		if (!phaserGameRef.game || !phaserGameRef.scene) {
			console.warn('[SpriteManager] No Phaser game scene available for frame extraction');
			return { predator: null, prey: null };
		}

		const scene: Scene = phaserGameRef.scene;
		const results = {
			predator: null as ExtractedSpriteFrame | null,
			prey: null as ExtractedSpriteFrame | null
		};

		try {
			// Get representative sprites for current flavor
			const predatorSprite = this.getRandomSprite(BoidVariant.PREDATOR);
			const preySprite = this.getRandomSprite(BoidVariant.PREY);

			// Extract predator frame
			if (predatorSprite) {
				const predatorWalkKey = `${predatorSprite.id}-walk`;

				results.predator = await safeExtractSpriteFrame(
					scene,
					predatorWalkKey,
					0, // First frame of down direction
					'predator' // Fallback to legacy sprite
				);
			}

			// Extract prey frame
			if (preySprite) {
				const preyWalkKey = `${preySprite.id}-walk`;

				results.prey = await safeExtractSpriteFrame(
					scene,
					preyWalkKey,
					0, // First frame of down direction
					'prey' // Fallback to legacy sprite
				);
			}
		} catch (error) {
			console.error('[SpriteManager] Error extracting display frames:', error);
		}

		return results;
	}
}
