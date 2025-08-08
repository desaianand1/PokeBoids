import { Scene } from 'phaser';
import { BoidSpriteManager } from '$boid/animation/sprite-manager';

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
		this.load.setPath('src/assets');

		// Load legacy static sprites for fallback
		this.load.image('prey', 'prey.png');
		this.load.image('predator', 'predator.png');

		// Load background images for all environments (day/night variants)
		this.load.image('air-day', 'day-sky.jpg');
		this.load.image('air-night', 'night-sky.jpg');
		// Note: land and water backgrounds will be added when assets are available
		// this.load.image('land-day', 'grassland-day.jpg');
		// this.load.image('land-night', 'grassland-night.jpg');
		// this.load.image('water-day', 'ocean-day.jpg');
		// this.load.image('water-night', 'ocean-night.jpg');

		// Stage 1: Load sprite configuration JSON only
		const spriteManager = BoidSpriteManager.getInstance();
		spriteManager.loadSpriteDatabase(this.load);

		// Note: Sprite sheets will be loaded dynamically in create() after JSON is parsed
	}

	create() {
		// Stage 2: Parse JSON config and load sprite sheets dynamically
		const spriteManager = BoidSpriteManager.getInstance();
		const spriteConfig = this.cache.json.get('sprite-config');

		if (spriteConfig) {
			console.log('Loading sprites dynamically from config...');
			spriteManager.initializeFromJSON(spriteConfig);

			// Load sprite sheets for air environment (and others when available)
			this.loadSpritesFromConfig(spriteConfig);
		} else {
			console.warn('Sprite configuration not found, using fallback sprites only');
			this.startGame();
		}
	}

	private hasSprites(flavorConfig: { predator: unknown[]; prey: unknown[] }): boolean {
		return flavorConfig.predator.length > 0 || flavorConfig.prey.length > 0;
	}

	private loadSpritesFromConfig(config: {
		sprites: Record<string, { predator: unknown[]; prey: unknown[] }>;
	}) {
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
		flavorConfig: { predator: unknown[]; prey: unknown[] },
		onLoaded: () => void
	) {
		// Load predator sprites
		flavorConfig.predator.forEach((sprite: unknown) => {
			this.loadSpriteAnimations(sprite, onLoaded);
		});

		// Load prey sprites
		flavorConfig.prey.forEach((sprite: unknown) => {
			this.loadSpriteAnimations(sprite, onLoaded);
		});
	}

	private loadSpriteAnimations(sprite: unknown, onLoaded: () => void) {
		const animations = ['walk', 'attack', 'hurt'];

		animations.forEach((animType) => {
			const animConfig = sprite.animations[animType];
			const key = `${sprite.id}-${animType}`;

			// Load sprite sheet
			this.load.spritesheet(key, animConfig.spriteSheet, {
				frameWidth: animConfig.frameWidth,
				frameHeight: animConfig.frameHeight
			});

			// Add completion callback
			this.load.once(`filecomplete-spritesheet-${key}`, onLoaded);
		});

		// Start the loader for these files
		this.load.start();
	}

	private createAnimationsFromConfig(config: unknown) {
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

	private createSpriteAnimations(spriteConfig: unknown) {
		const animations = ['walk', 'attack', 'hurt'];
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
