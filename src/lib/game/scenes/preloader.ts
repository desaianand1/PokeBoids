import { Scene } from 'phaser';

export class Preloader extends Scene {
	constructor() {
		super('Preloader');
	}

	init() {
		const [x, y, barWidth, barHeight] = [
			this.scale.width / 2,
			this.scale.height / 2,
			512,
			32
		];

		// Calculate the left edge of the progress bar
		const barX = x - barWidth / 2;

		// This is the outline of the bar
		this.add.rectangle(x, y, barWidth, barHeight).setStrokeStyle(1, 0xffffff);

		// This is the progress bar itself, positioned at the left edge
		const bar = this.add.rectangle(barX, y, 0, barHeight - 4, 0xffffff)
			.setOrigin(0, 0.5); // Set origin to left-center

		// Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
		this.load.on('progress', (progress: number) => {
			// Update the progress bar width based on loading progress
			bar.width = barWidth * progress;
		});
	}

	preload() {
		this.load.setPath('src/assets');

		this.load.image('day-sky', 'day-sky.jpg');
		this.load.image('night-sky', 'night-sky.jpg');
		this.load.image('prey', 'prey.png');
		this.load.image('predator', 'predator.png');
	}

	create() {
		//  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
		//  For example, you can define global animations here, so we can use them in other scenes.

		//  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
		this.scene.start('Game');
	}
}
