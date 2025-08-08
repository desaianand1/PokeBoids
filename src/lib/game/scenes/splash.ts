import { Scene } from 'phaser';
import { mode } from 'mode-watcher';
import { BoidSpriteManager } from '$boid/animation/sprite-manager';
import type { SpriteDatabase, BoidSpriteConfig, AnimationConfig } from '$boid/animation/types';

const assetsPath = 'assets/';
const spritesPath = 'sprites/';
const airPath = `${spritesPath}air/`;
const landPath = `${spritesPath}land/`;
const waterPath = `${spritesPath}water/`;

export class Splash extends Scene {
	private logo!: Phaser.GameObjects.Image;
	private background!: Phaser.GameObjects.Image;
	private progressBar!: Phaser.GameObjects.Graphics;
	private progressBarOutline!: Phaser.GameObjects.Graphics;
	private loadingText!: Phaser.GameObjects.Text;
	private percentageText!: Phaser.GameObjects.Text;
	private phaseText!: Phaser.GameObjects.Text;
	private progressValue: number = 0;
	private shimmerOffset: number = 0;

	// Testing flag - only enabled in development
	private readonly ENABLE_MANUAL_TESTING = import.meta.env.DEV;

	// Track loading phases
	private currentPhase: 'initial' | 'sprites' = 'initial';
	private totalSpritesToLoad: number = 0;
	private spritesLoaded: number = 0;

	constructor() {
		super('Splash');
	}

	init() {
		const { width, height } = this.scale;
		const centerX = width / 2;
		const centerY = height / 2;

		// Create background based on current theme
		this.createThemeBackground(centerX, centerY, width, height);

		// Create and animate logo
		this.createLogo(centerX, centerY);

		// Create professional rounded loading bar
		this.createLoadingBar(centerX, centerY, width);

		// Create loading text elements
		this.createLoadingText(centerX, centerY, width);

		// Start animations
		this.startSplashAnimations();

		// Set up real progress tracking for initial asset loading
		this.load.on('progress', (progress: number) => {
			if (this.currentPhase === 'initial') {
				// Update progress bar with real loading progress
				this.progressValue = progress * 0.5; // First 50% for initial assets
				this.updateProgressBarVisual();
				this.updateProgressTexts();
			}
		});

		this.load.on('complete', () => {
			if (this.currentPhase === 'initial') {
				console.log('Initial assets loaded, loading sprites...');
				// Move to sprite loading phase in create()
			}
		});
	}

	preload() {
		this.load.setPath(assetsPath);
		console.log(`[Splash] Loading assets from: ${assetsPath}`);

		// Load legacy static sprites for fallback
		this.load.image('prey', 'default-prey.png');
		this.load.image('predator', 'default-predator.png');

		// Load background images for all environments (day/night variants)
		this.load.image('air-day', `${airPath}background/bg-light.png`);
		this.load.image('air-night', `${airPath}background/bg-dark.png`);
		this.load.image('land-day', `${landPath}background/bg-light.png`);
		this.load.image('land-night', `${landPath}background/bg-dark.png`);
		this.load.image('water-day', `${waterPath}background/bg-light.png`);
		this.load.image('water-night', `${waterPath}background/bg-dark.png`);

		// Load sprite configuration JSON
		this.load.json('sprite-config', `${spritesPath}/sprite-config.json`);
	}

	create() {
		// Phase 2: Parse JSON config and load sprite sheets dynamically
		this.currentPhase = 'sprites';
		const spriteManager = BoidSpriteManager.getInstance();
		const spriteConfig = this.cache.json.get('sprite-config') as SpriteDatabase;

		if (spriteConfig && spriteConfig.sprites) {
			console.log('[Splash] Loading sprites dynamically from config...');
			spriteManager.initializeFromJSON(spriteConfig);

			// Load sprite sheets with real progress tracking
			this.loadSpritesFromConfig(spriteConfig);
		} else {
			console.warn('[Splash] Sprite configuration not found, using fallback sprites only');
			this.progressValue = 1;
			this.updateProgressBarVisual();
			this.updateProgressTexts();
			this.onLoadingComplete();
		}
	}

	private createThemeBackground(centerX: number, centerY: number, width: number, height: number) {
		// Get current theme from mode-watcher
		const isDark = mode.current === 'dark';
		const backgroundKey = isDark ? 'splash-dark' : 'splash-light';

		// Create background image
		this.background = this.add.image(centerX, centerY, backgroundKey);

		// Scale background to cover screen while maintaining aspect ratio
		const scaleX = width / this.background.width;
		const scaleY = height / this.background.height;
		const scale = Math.max(scaleX, scaleY);
		this.background.setScale(scale);

		// Start with full opacity (no fade-in needed for background)
		this.background.setAlpha(1);
	}

	private createLogo(centerX: number, centerY: number) {
		// Position logo slightly above center to leave room for loading bar
		const logoY = centerY - 100;

		this.logo = this.add.image(centerX, logoY, 'logo');

		// Responsive logo scaling based on screen width - better mobile fit
		const { width } = this.scale;
		const logoScale = Math.min(0.8, Math.max(0.35, width * 0.0006));
		this.logo.setScale(logoScale);

		// Start logo invisible for fade-in animation
		this.logo.setAlpha(0);
	}

	private createLoadingBar(centerX: number, centerY: number, width: number) {
		// Position loading bar below the logo
		const barY = centerY + 120;
		// Larger bar dimensions for better visibility
		const barWidth = Math.min(500, width * 0.7); // Increased from 400, 0.6
		const barHeight = 32; // Increased from 20
		const cornerRadius = barHeight / 2; // Fully rounded corners

		// Create progress bar outline (background)
		this.progressBarOutline = this.add.graphics();
		this.progressBarOutline.lineStyle(3, 0xffffff, 1); // Thicker, more opaque outline
		this.progressBarOutline.fillStyle(0x000000, 0.5); // Darker background

		// Draw rounded rectangle outline
		this.progressBarOutline.fillRoundedRect(
			centerX - barWidth / 2,
			barY - barHeight / 2,
			barWidth,
			barHeight,
			cornerRadius
		);
		this.progressBarOutline.strokeRoundedRect(
			centerX - barWidth / 2,
			barY - barHeight / 2,
			barWidth,
			barHeight,
			cornerRadius
		);

		// Create progress bar fill
		this.progressBar = this.add.graphics();

		// Create percentage text that sits on the progress bar
		const percentFontSize = Math.max(24, Math.min(28, width * 0.035));
		this.percentageText = this.add.text(centerX, barY, '0%', {
			fontFamily: 'Arial, sans-serif',
			fontSize: `${percentFontSize}px`,
			fontStyle: 'bold',
			color: '#ffffff'
		});
		this.percentageText.setOrigin(0.5);
		this.percentageText.setDepth(10); // Ensure it's above the progress bar

		// Start with empty progress bar
		this.progressBarOutline.setAlpha(0);
		this.progressBar.setAlpha(0);
		this.percentageText.setAlpha(0);

		// Start shimmer animation for progress bar
		this.time.addEvent({
			delay: 50,
			callback: () => {
				this.shimmerOffset += 0.02;
				if (this.shimmerOffset > 1) this.shimmerOffset = 0;
				this.updateProgressBarVisual();
			},
			loop: true
		});
	}

	private updateProgressBarVisual() {
		const { width, height } = this.scale;
		const centerX = width / 2;
		const barY = height / 2 + 120;
		const barWidth = Math.min(500, width * 0.7);
		const barHeight = 32;
		const cornerRadius = barHeight / 2;

		this.progressBar.clear();

		// Calculate progress width
		const progressWidth = (barWidth - 6) * this.progressValue; // -6 for padding from outline

		if (progressWidth > 0) {
			// Create dynamic gradient with shimmer effect
			const shimmerIntensity = Math.sin(this.shimmerOffset * Math.PI * 2) * 0.2 + 0.8;
			const baseColor = 0x58ce00;
			const lightColor = 0x78e08e;
			const shimmerColor = 0xb8e994;

			// Apply gradient with shimmer
			const leftColor = this.interpolateColor(baseColor, shimmerColor, shimmerIntensity * 0.5);
			const rightColor = this.interpolateColor(lightColor, shimmerColor, shimmerIntensity);

			this.progressBar.fillGradientStyle(leftColor, rightColor, leftColor, rightColor, 1);

			// Draw rounded progress fill with padding
			this.progressBar.fillRoundedRect(
				centerX - barWidth / 2 + 3, // Add padding
				barY - barHeight / 2 + 3, // Add padding
				progressWidth,
				barHeight - 6, // Subtract padding
				Math.min(cornerRadius - 3, progressWidth / 2) // Adjust corner radius for padding
			);

			// Add a subtle highlight on top for glass effect
			this.progressBar.fillStyle(0xffffff, 0.2);
			this.progressBar.fillRoundedRect(
				centerX - barWidth / 2 + 3,
				barY - barHeight / 2 + 3,
				progressWidth,
				barHeight / 3,
				Math.min(cornerRadius - 3, progressWidth / 2)
			);
		}
	}

	private interpolateColor(color1: number, color2: number, amount: number): number {
		const r1 = (color1 >> 16) & 0xff;
		const g1 = (color1 >> 8) & 0xff;
		const b1 = color1 & 0xff;

		const r2 = (color2 >> 16) & 0xff;
		const g2 = (color2 >> 8) & 0xff;
		const b2 = color2 & 0xff;

		const r = Math.round(r1 + (r2 - r1) * amount);
		const g = Math.round(g1 + (g2 - g1) * amount);
		const b = Math.round(b1 + (b2 - b1) * amount);

		return (r << 16) | (g << 8) | b;
	}

	private createLoadingText(centerX: number, centerY: number, width: number) {
		// Calculate responsive font size - larger sizes
		const fontSize = Math.max(28, Math.min(36, width * 0.04));
		const textY = centerY + 170;

		// Main loading text
		this.loadingText = this.add.text(centerX, textY, 'Initializing...', {
			fontFamily: 'Arial, sans-serif',
			fontSize: `${fontSize}px`,
			fontStyle: 'bold',
			color: '#ffffff',
			stroke: '#000000',
			strokeThickness: 6
		});
		this.loadingText.setOrigin(0.5);
		this.loadingText.setAlpha(0);

		// Phase indicator text (smaller, below main text)
		const phaseFontSize = Math.max(20, Math.min(24, width * 0.03));
		this.phaseText = this.add.text(centerX, textY + 60, '', {
			fontFamily: 'Arial, sans-serif',
			fontSize: `${phaseFontSize}px`,
			fontStyle: 'bold',
			color: '#ffffff',
			stroke: '#000000',
			strokeThickness: 6
		});
		this.phaseText.setOrigin(0.5);
		this.phaseText.setAlpha(0);
	}

	private updateProgressTexts() {
		const percentage = Math.floor(this.progressValue * 1000) / 10; // One decimal place
		this.percentageText.setText(`${percentage}%`);

		if (this.currentPhase === 'initial') {
			this.loadingText.setText('Loading Assets');
			this.phaseText.setText('Preparing game resources...');
		} else {
			this.loadingText.setText('Loading Sprites');
			if (this.totalSpritesToLoad > 0) {
				this.phaseText.setText(`${this.spritesLoaded} of ${this.totalSpritesToLoad} sprite sheets`);
			}
		}
	}

	private startSplashAnimations() {
		// Timeline for splash screen animations
		this.time.delayedCall(300, () => {
			// Fade in logo with subtle pulse
			this.tweens.add({
				targets: this.logo,
				alpha: 1,
				duration: 1000,
				ease: 'Power2'
			});

			// Add subtle continuous pulse to logo with responsive scaling
			this.time.delayedCall(1000, () => {
				const { width } = this.scale;
				const baseScale = Math.min(0.8, Math.max(0.35, width * 0.0006));
				this.tweens.add({
					targets: this.logo,
					scale: { from: baseScale, to: baseScale * 1.05 },
					duration: 2000,
					ease: 'Sine.easeInOut',
					yoyo: true,
					repeat: -1
				});
			});
		});

		this.time.delayedCall(800, () => {
			// Fade in loading bar and text
			this.tweens.add({
				targets: [this.progressBarOutline, this.progressBar, this.percentageText],
				alpha: 1,
				duration: 500,
				ease: 'Power2'
			});

			this.tweens.add({
				targets: [this.loadingText, this.phaseText],
				alpha: { from: 0, to: 0.9 },
				duration: 500,
				ease: 'Power2'
			});
		});
	}

	// Sprite loading methods adapted from Preloader
	private hasSprites(flavorConfig: {
		predator: BoidSpriteConfig[];
		prey: BoidSpriteConfig[];
	}): boolean {
		return flavorConfig.predator.length > 0 || flavorConfig.prey.length > 0;
	}

	private loadSpritesFromConfig(config: SpriteDatabase) {
		// Count sprites to load from all environments
		const environments = ['air', 'land', 'water'] as const;
		this.totalSpritesToLoad = 0;
		this.spritesLoaded = 0;

		environments.forEach((env) => {
			if (config.sprites[env] && this.hasSprites(config.sprites[env])) {
				this.totalSpritesToLoad +=
					config.sprites[env].predator.length + config.sprites[env].prey.length;
			}
		});
		this.totalSpritesToLoad *= 3; // 3 animations per sprite (walk, attack, hurt)

		const onSpriteLoaded = () => {
			this.spritesLoaded++;

			// Update progress bar for sprite loading (50% to 100%)
			const spriteProgress = this.spritesLoaded / this.totalSpritesToLoad;
			this.progressValue = 0.5 + spriteProgress * 0.5; // Second 50% for sprites
			this.updateProgressBarVisual();
			this.updateProgressTexts();

			console.log(`[Splash] Sprite loaded: ${this.spritesLoaded}/${this.totalSpritesToLoad}`);

			if (this.spritesLoaded >= this.totalSpritesToLoad) {
				// All sprites loaded, create animations and complete
				console.log('[Splash] All sprites loaded, creating animations...');
				this.createAnimationsFromConfig(config);
				this.onLoadingComplete();
			}
		};

		// Load sprites for all available environments
		environments.forEach((env) => {
			if (config.sprites[env] && this.hasSprites(config.sprites[env])) {
				console.log(`[Splash] Loading sprites for ${env} environment`);
				this.loadFlavorSprites(config.sprites[env], onSpriteLoaded);
			}
		});

		// If no sprites to load, complete immediately
		if (this.totalSpritesToLoad === 0) {
			console.log('[Splash] No sprite sheets to load, using static sprites');
			this.progressValue = 1;
			this.updateProgressBarVisual();
			this.updateProgressTexts();
			this.onLoadingComplete();
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
				console.error(`[Splash] Skipping invalid animation config: ${key}`);
				onLoaded(); // Still call onLoaded to prevent hanging
				return;
			}

			try {
				console.log(`[Splash] Loading sprite sheet: ${key} from ${animConfig.spriteSheet}`);

				// Load sprite sheet with validated dimensions
				this.load.spritesheet(key, animConfig.spriteSheet, {
					frameWidth: animConfig.frameWidth,
					frameHeight: animConfig.frameHeight
				});

				// Add completion and error callbacks
				this.load.once(`filecomplete-spritesheet-${key}`, () => {
					console.log(`[Splash] Successfully loaded sprite sheet: ${key}`);
					onLoaded();
				});

				this.load.once(`fileerror-spritesheet-${key}`, (error: Error) => {
					console.error(`[Splash] Failed to load sprite sheet: ${key}`, error);
					onLoaded(); // Still call onLoaded to prevent hanging
				});
			} catch (error) {
				console.error(`[Splash] Error setting up sprite sheet loading for ${key}:`, error);
				onLoaded(); // Still call onLoaded to prevent hanging
			}
		});

		// Start the loader for these files
		this.load.start();
	}

	private validateAnimationConfig(
		spriteId: string,
		animType: string,
		animConfig: AnimationConfig
	): boolean {
		if (!animConfig) {
			console.error(`[Splash] Missing animation config for ${spriteId}-${animType}`);
			return false;
		}

		const { frameWidth, frameHeight, frameCount, spriteSheet, frameDurations } = animConfig;

		// Check required properties
		if (typeof frameWidth !== 'number' || frameWidth <= 0) {
			console.error(`[Splash] Invalid frameWidth for ${spriteId}-${animType}: ${frameWidth}`);
			return false;
		}

		if (typeof frameHeight !== 'number' || frameHeight <= 0) {
			console.error(`[Splash] Invalid frameHeight for ${spriteId}-${animType}: ${frameHeight}`);
			return false;
		}

		if (typeof frameCount !== 'number' || frameCount <= 0) {
			console.error(`[Splash] Invalid frameCount for ${spriteId}-${animType}: ${frameCount}`);
			return false;
		}

		if (typeof spriteSheet !== 'string' || spriteSheet.length === 0) {
			console.error(
				`[Splash] Invalid spriteSheet path for ${spriteId}-${animType}: ${spriteSheet}`
			);
			return false;
		}

		// Validate frame durations array matches frame count
		if (Array.isArray(frameDurations) && frameDurations.length !== frameCount) {
			console.error(
				`[Splash] Frame duration count (${frameDurations.length}) does not match frameCount (${frameCount}) for ${spriteId}-${animType}`
			);
			return false;
		}

		return true;
	}

	private createAnimationsFromConfig(config: SpriteDatabase) {
		// Create animations for all loaded environments
		const environments = ['air', 'land', 'water'] as const;
		environments.forEach((env) => {
			if (config.sprites[env] && this.hasSprites(config.sprites[env])) {
				console.log(`[Splash] Creating animations for ${env} environment`);
				[...config.sprites[env].predator, ...config.sprites[env].prey].forEach((sprite) => {
					this.createSpriteAnimations(sprite);
				});
			}
		});
	}

	private createSpriteAnimations(spriteConfig: BoidSpriteConfig) {
		const animations: (keyof BoidSpriteConfig['animations'])[] = ['walk', 'attack', 'hurt'];
		console.log(`[Splash] Creating animations for ${spriteConfig.id}...`);

		animations.forEach((animType) => {
			const animConfig = spriteConfig.animations[animType];

			for (let direction = 0; direction < 8; direction++) {
				const key = `${spriteConfig.id}-${animType}-${direction}`;

				if (this.anims.exists(key)) continue;

				try {
					// PMD sprites: each row is a direction, each column is a frame
					const totalColumns = animConfig.frameCount;

					// For each direction row, select all frames in that row
					const startFrame = direction * totalColumns;
					const endFrame = startFrame + (totalColumns - 1);

					console.log(
						`[Splash] Creating animation ${key}: frames ${startFrame}-${endFrame} (direction ${direction}, ${totalColumns} frames per direction)`
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
					console.warn(`[Splash] Failed to create animation ${key}:`, error);
				}
			}
		});
	}

	private onLoadingComplete() {
		this.loadingText.setText('Ready!');
		this.phaseText.setText('');

		// Add a bounce animation to the completion
		this.tweens.add({
			targets: this.loadingText,
			scale: { from: 1, to: 1.1 },
			duration: 300,
			ease: 'Bounce.easeOut',
			yoyo: true
		});

		if (this.ENABLE_MANUAL_TESTING) {
			// For testing - show completion message and wait for manual input
			this.time.delayedCall(2000, () => {
				this.loadingText.setText('Ready!');
				this.loadingText.setColor('#58CE00');
				this.loadingText.setStroke('#FFF', 8);
				this.phaseText.setText('Press SPACE or click to continue');

				// Add keyboard input for manual testing
				const spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
				spaceKey?.on('down', () => {
					this.transitionToNextScene();
				});

				// Also allow click to continue
				this.input.once('pointerdown', () => {
					this.transitionToNextScene();
				});
			});
		} else {
			// Auto-transition after a brief delay
			this.time.delayedCall(2500, () => {
				this.transitionToNextScene();
			});
		}
	}

	private transitionToNextScene() {
		// Stop the pulse animation
		this.tweens.killTweensOf(this.logo);

		// Fade out everything before transitioning
		this.tweens.add({
			targets: [
				this.logo,
				this.background,
				this.progressBar,
				this.progressBarOutline,
				this.loadingText,
				this.percentageText,
				this.phaseText
			],
			alpha: 0,
			duration: 500,
			ease: 'Power2',
			onComplete: () => {
				console.log('[Splash] Loading complete, starting game...');
				this.scene.start('Game');
			}
		});
	}

	// Handle window resize
	resize(gameSize: Phaser.Structs.Size) {
		const { width, height } = gameSize;
		const centerX = width / 2;
		const centerY = height / 2;

		// Update background scale
		if (this.background) {
			const scaleX = width / this.background.width;
			const scaleY = height / this.background.height;
			const scale = Math.max(scaleX, scaleY);
			this.background.setScale(scale);
			this.background.setPosition(centerX, centerY);
		}

		// Reposition elements
		if (this.logo) {
			this.logo.setPosition(centerX, centerY - 100);
			// Update logo scale on resize - better mobile fit
			const logoScale = Math.min(0.8, Math.max(0.35, width * 0.0006));
			this.logo.setScale(logoScale);
		}

		if (this.loadingText) {
			const fontSize = Math.max(28, Math.min(36, width * 0.04));
			this.loadingText.setFontSize(fontSize);
			this.loadingText.setPosition(centerX, centerY + 170);
		}

		if (this.phaseText) {
			const phaseFontSize = Math.max(20, Math.min(24, width * 0.03));
			this.phaseText.setFontSize(phaseFontSize);
			this.phaseText.setPosition(centerX, centerY + 210);
		}

		if (this.percentageText) {
			const percentFontSize = Math.max(24, Math.min(28, width * 0.035));
			this.percentageText.setFontSize(percentFontSize);
			this.percentageText.setPosition(centerX, centerY + 120);
		}

		// Update loading bar position
		this.updateProgressBarVisual();
	}
}
