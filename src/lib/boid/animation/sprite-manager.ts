import type { Loader } from 'phaser';
import type { SimulationFlavor, SpriteDatabase, BoidSpriteConfig } from '$boid/animation/types';
import { BoidVariant } from '$boid/types';
import { EventBus } from '$events/event-bus';

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
	initializeFromJSON(jsonData: unknown): void {
		this.spriteDatabase = jsonData as SpriteDatabase;
		console.log('Sprite database initialized with flavors:', Object.keys(this.spriteDatabase.sprites));
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
		flavorData.predator.forEach(sprite => {
			this.loadSpriteAnimations(loader, sprite);
		});
		
		// Load prey sprites
		flavorData.prey.forEach(sprite => {
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
	 * Load all animations for a sprite
	 */
	private loadSpriteAnimations(loader: Loader.LoaderPlugin, sprite: BoidSpriteConfig): void {
		// Load walk animation
		const walkKey = `${sprite.id}-walk`;
		if (!this.loadedSprites.has(walkKey)) {
			loader.spritesheet(walkKey, sprite.animations.walk.spriteSheet, {
				frameWidth: sprite.animations.walk.frameWidth,
				frameHeight: sprite.animations.walk.frameHeight
			});
			this.loadedSprites.add(walkKey);
		}

		// Load attack animation
		const attackKey = `${sprite.id}-attack`;
		if (!this.loadedSprites.has(attackKey)) {
			loader.spritesheet(attackKey, sprite.animations.attack.spriteSheet, {
				frameWidth: sprite.animations.attack.frameWidth,
				frameHeight: sprite.animations.attack.frameHeight
			});
			this.loadedSprites.add(attackKey);
		}

		// Load hurt animation
		const hurtKey = `${sprite.id}-hurt`;
		if (!this.loadedSprites.has(hurtKey)) {
			loader.spritesheet(hurtKey, sprite.animations.hurt.spriteSheet, {
				frameWidth: sprite.animations.hurt.frameWidth,
				frameHeight: sprite.animations.hurt.frameHeight
			});
			this.loadedSprites.add(hurtKey);
		}
	}

	/**
	 * Get a random sprite configuration for a variant
	 */
	getRandomSprite(variant: BoidVariant): BoidSpriteConfig | null {
		if (!this.spriteDatabase) {
			console.error('Sprite database not initialized');
			return null;
		}

		const variantKey = variant === BoidVariant.PREDATOR ? 'predator' : 'prey';
		const sprites = this.spriteDatabase.sprites[this.currentFlavor][variantKey];
		
		if (sprites.length === 0) {
			console.warn(`No sprites available for ${variantKey} in ${this.currentFlavor} flavor`);
			return null;
		}

		const randomIndex = Math.floor(Math.random() * sprites.length);
		return sprites[randomIndex];
	}

	/**
	 * Get sprite by specific ID
	 */
	getSpriteById(id: string, variant: BoidVariant): BoidSpriteConfig | null {
		if (!this.spriteDatabase) return null;

		const variantKey = variant === BoidVariant.PREDATOR ? 'predator' : 'prey';
		const sprites = this.spriteDatabase.sprites[this.currentFlavor][variantKey];
		
		return sprites.find(s => s.id === id) || null;
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
		
		flavorData.predator.forEach(sprite => groups.push(sprite.groupId));
		flavorData.prey.forEach(sprite => groups.push(sprite.groupId));
		
		return groups;
	}

	/**
	 * Get group statistics
	 */
	getGroupStats(): Map<string, { count: number; variant: BoidVariant }> {
		const stats = new Map<string, { count: number; variant: BoidVariant }>();
		
		if (!this.spriteDatabase) return stats;
		
		const flavorData = this.spriteDatabase.sprites[this.currentFlavor];
		
		flavorData.predator.forEach(sprite => {
			stats.set(sprite.groupId, { count: 0, variant: BoidVariant.PREDATOR });
		});
		
		flavorData.prey.forEach(sprite => {
			stats.set(sprite.groupId, { count: 0, variant: BoidVariant.PREY });
		});
		
		return stats;
	}
}