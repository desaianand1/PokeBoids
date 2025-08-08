import { Scene } from 'phaser';
import { BoidSpriteManager } from '$boid/animation/sprite-manager';
import type { SpriteDatabase, BoidSpriteConfig, AnimationConfig } from '$boid/animation/types';

const assetsPath = 'assets/';
const spritesPath = 'sprites/';
const airPath = `${spritesPath}air/`;
const landPath = `${spritesPath}land/`;
const waterPath = `${spritesPath}water/`;

export class Preloader extends Scene {
	constructor() {
		super('Preloader');
	}

	init() {
		const [x, y, barWidth, barHeight] = [this.scale.width / 2, this.scale.height / 2, 512, 32];

		// Calculate the left edge of the progress bar
		const barX = x - barWidth / 2;

		// This is the outline of the bar
		this.add.rectangle(x, y, barWidth, barHeight).setStrokeStyle(1, 0xffffff);

		// This is the progress bar itself, positioned at the left edge
		const bar = this.add.rectangle(barX, y, 0, barHeight - 4, 0xffffff).setOrigin(0, 0.5); // Set origin to left-center

		// Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
		this.load.on('progress', (progress: number) => {
			// Update the progress bar width based on loading progress
			bar.width = barWidth * progress;
		});
	}

	preload() {
		this.load.setPath(assetsPath);
		console.log(`[Preloader] Loading assets from: ${assetsPath}`);

		// Load legacy static sprites for fallback
		this.load.image('prey', 'default-prey.png');
		this.load.image('predator', 'default-predator.png');

		// Load background images for all environments (day/night variants)
		this.load.image('air-day', `${airPath}bg-light.png`);
		this.load.image('air-night', `${airPath}bg-dark.png`);
		this.load.image('land-day', `${landPath}bg-light.png`);
		this.load.image('land-night', `${landPath}bg-dark.png`);
		this.load.image('water-day', `${waterPath}bg-light.png`);
		this.load.image('water-night', `${waterPath}bg-dark.png`);

		// Load sprite configuration JSON
		this.load.json('sprite-config', `${spritesPath}/sprite-config.json`);

		// Note: Sprite sheets will be loaded dynamically in create() after JSON is parsed
	}

	create() {
		// Stage 2: Parse JSON config and load sprite sheets dynamically
		const spriteManager = BoidSpriteManager.getInstance();
		const spriteConfig = this.cache.json.get('sprite-config') as SpriteDatabase;

		if (spriteConfig && spriteConfig.sprites) {
			console.log('Loading sprites dynamically from config...');
			spriteManager.initializeFromJSON(spriteConfig);

			// Load sprite sheets for air environment (and others when available)
			this.loadSpritesFromConfig(spriteConfig);
		} else {
			console.warn('Sprite configuration not found, using fallback sprites only');
			this.startGame();
		}
	}

	private hasSprites(flavorConfig: {
		predator: BoidSpriteConfig[];
		prey: BoidSpriteConfig[];
	}): boolean {
		return flavorConfig.predator.length > 0 || flavorConfig.prey.length > 0;
	}

	private loadSpritesFromConfig(config: SpriteDatabase) {
		// Track number of sprites to load
		let spritesToLoad = 0;
		let spritesLoaded = 0;

		// Count sprites to load from all environments
		const environments = ['air', 'land', 'water'] as const;
		environments.forEach((env) => {
			if (config.sprites[env] && this.hasSprites(config.sprites[env])) {
				spritesToLoad += config.sprites[env].predator.length + config.sprites[env].prey.length;
			}
		});
		spritesToLoad *= 3; // 3 animations per sprite (walk, attack, hurt)

		const onSpriteLoaded = () => {
			spritesLoaded++;
			console.log(`Sprite loaded: ${spritesLoaded}/${spritesToLoad}`);
			if (spritesLoaded >= spritesToLoad) {
				// All sprites loaded, create animations and start game
				console.log('All sprites loaded, creating animations...');
				this.createAnimationsFromConfig(config);
				this.startGame();
			}
		};

		// Load sprites for all available environments
		environments.forEach((env) => {
			if (config.sprites[env] && this.hasSprites(config.sprites[env])) {
				console.log(`Loading sprites for ${env} environment`);
				this.loadFlavorSprites(config.sprites[env], onSpriteLoaded);
			}
		});

		// If no sprites to load, start game immediately
		if (spritesToLoad === 0) {
			console.log('No sprite sheets to load, using static sprites');
			this.startGame();
		}
	}

	private loadFlavorSprites(
		flavorConfig: { predator: BoidSpriteConfig[]; prey: BoidSpriteConfig[] },
		onLoaded: () => void
	) {
		// Load predator sprites
		flavorConfig.predator.forEach((sprite: BoidSpriteConfig) => {
			this.loadSpriteAnimations(sprite, onLoaded);
		});

		// Load prey sprites
		flavorConfig.prey.forEach((sprite: BoidSpriteConfig) => {
			this.loadSpriteAnimations(sprite, onLoaded);
		});
	}

	private loadSpriteAnimations(sprite: BoidSpriteConfig, onLoaded: () => void) {
		const animations: (keyof BoidSpriteConfig['animations'])[] = ['walk', 'attack', 'hurt'];

		animations.forEach((animType) => {
			const animConfig = sprite.animations[animType];
			const key = `${sprite.id}-${animType}`;

			// Validate animation config before loading
			if (!this.validateAnimationConfig(sprite.id, animType, animConfig)) {
				console.error(`Skipping invalid animation config: ${key}`);
				onLoaded(); // Still call onLoaded to prevent hanging
				return;
			}

			try {
				// Phaser automatically uses setPath base + relative path
				// No complex path resolution needed!
				console.log(`[Preloader] Loading sprite sheet: ${key} from ${animConfig.spriteSheet}`);

				// Load sprite sheet with validated dimensions
				this.load.spritesheet(key, animConfig.spriteSheet, {
					frameWidth: animConfig.frameWidth,
					frameHeight: animConfig.frameHeight
				});

				// Add completion and error callbacks
				this.load.once(`filecomplete-spritesheet-${key}`, () => {
					console.log(`[Preloader] Successfully loaded sprite sheet: ${key}`);
					onLoaded();
				});

				this.load.once(`fileerror-spritesheet-${key}`, (error: Error) => {
					console.error(`[Preloader] Failed to load sprite sheet: ${key}`, error);
					onLoaded(); // Still call onLoaded to prevent hanging
				});
			} catch (error) {
				console.error(`[Preloader] Error setting up sprite sheet loading for ${key}:`, error);
				onLoaded(); // Still call onLoaded to prevent hanging
			}
		});

		// Start the loader for these files
		this.load.start();
	}

	/**
	 * Validate animation configuration with comprehensive checks
	 */
	private validateAnimationConfig(
		spriteId: string,
		animType: string,
		animConfig: AnimationConfig
	): boolean {
		if (!animConfig) {
			console.error(`[Preloader] Missing animation config for ${spriteId}-${animType}`);
			return false;
		}

		const { frameWidth, frameHeight, frameCount, spriteSheet, frameDurations } = animConfig;

		// Check required properties
		if (typeof frameWidth !== 'number' || frameWidth <= 0) {
			console.error(`[Preloader] Invalid frameWidth for ${spriteId}-${animType}: ${frameWidth}`);
			console.error(`[Preloader] Full config:`, animConfig);
			return false;
		}

		if (typeof frameHeight !== 'number' || frameHeight <= 0) {
			console.error(`[Preloader] Invalid frameHeight for ${spriteId}-${animType}: ${frameHeight}`);
			console.error(`[Preloader] Full config:`, animConfig);
			return false;
		}

		if (typeof frameCount !== 'number' || frameCount <= 0) {
			console.error(`[Preloader] Invalid frameCount for ${spriteId}-${animType}: ${frameCount}`);
			return false;
		}

		if (typeof spriteSheet !== 'string' || spriteSheet.length === 0) {
			console.error(
				`[Preloader] Invalid spriteSheet path for ${spriteId}-${animType}: ${spriteSheet}`
			);
			return false;
		}

		// Validate frame durations array matches frame count
		if (Array.isArray(frameDurations) && frameDurations.length !== frameCount) {
			console.error(
				`[Preloader] Frame duration count (${frameDurations.length}) does not match frameCount (${frameCount}) for ${spriteId}-${animType}`
			);
			return false;
		}

		// Calculate expected sprite sheet dimensions (8 directions for PMD sprites)
		const expectedWidth = frameWidth * frameCount;
		const expectedHeight = frameHeight * 8; // 8 directions
		console.debug(
			`[Preloader] Expected dimensions for ${spriteId}-${animType}: ${expectedWidth}x${expectedHeight} (${frameCount} frames x 8 directions)`
		);

		// Warn about common dimension issues
		if (frameWidth % 8 !== 0 || frameHeight % 8 !== 0) {
			console.warn(
				`[Preloader] Frame dimensions not aligned to 8px grid for ${spriteId}-${animType}: ${frameWidth}x${frameHeight}`
			);
		}

		// Validate reasonable size bounds
		if (frameWidth > 200 || frameHeight > 200) {
			console.warn(
				`[Preloader] Unusually large frame dimensions for ${spriteId}-${animType}: ${frameWidth}x${frameHeight}`
			);
		}

		if (frameWidth < 8 || frameHeight < 8) {
			console.warn(
				`[Preloader] Unusually small frame dimensions for ${spriteId}-${animType}: ${frameWidth}x${frameHeight}`
			);
		}

		return true;
	}

	private createAnimationsFromConfig(config: SpriteDatabase) {
		// Create animations for all loaded environments
		const environments = ['air', 'land', 'water'] as const;
		environments.forEach((env) => {
			if (config.sprites[env] && this.hasSprites(config.sprites[env])) {
				console.log(`Creating animations for ${env} environment`);
				[...config.sprites[env].predator, ...config.sprites[env].prey].forEach((sprite) => {
					this.createSpriteAnimations(sprite);
				});
			}
		});
	}

	private createSpriteAnimations(spriteConfig: BoidSpriteConfig) {
		const animations: (keyof BoidSpriteConfig['animations'])[] = ['walk', 'attack', 'hurt'];
		console.log(`Creating animations for ${spriteConfig.id}...`);

		animations.forEach((animType) => {
			const animConfig = spriteConfig.animations[animType];

			for (let direction = 0; direction < 8; direction++) {
				const key = `${spriteConfig.id}-${animType}-${direction}`;

				if (this.anims.exists(key)) continue;

				try {
					// PMD sprites: each row is a direction, each column is a frame
					// Total columns in sprite sheet = frameCount (frames per direction)
					const totalColumns = animConfig.frameCount;

					// For each direction row, select all frames in that row
					const startFrame = direction * totalColumns;
					const endFrame = startFrame + (totalColumns - 1);

					console.log(
						`Creating animation ${key}: frames ${startFrame}-${endFrame} (direction ${direction}, ${totalColumns} frames per direction)`
					);

					this.anims.create({
						key,
						frames: this.anims.generateFrameNumbers(`${spriteConfig.id}-${animType}`, {
							start: startFrame,
							end: endFrame
						}),
						frameRate: animConfig.defaultFrameRate,
						repeat: animType === 'walk' ? -1 : 0
					});
				} catch (error) {
					console.warn(`Failed to create animation ${key}:`, error);
				}
			}
		});
	}

	private startGame() {
		console.log('Starting game scene...');
		this.scene.start('Game');
	}
}
