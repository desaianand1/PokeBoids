import { Scene } from 'phaser';

export class Preloader extends Scene {
	constructor() {
		super('Preloader');
	}

	init() {
		const [x, y, barWidth, barHeight, progressStep] = [
			this.scale.width / 2,
			this.scale.height / 2,
			512,
			32,
			4
		];
		//  A simple progress bar. This is the outline of the bar.
		this.add.rectangle(x, y, barWidth, barHeight).setStrokeStyle(1, 0xffffff);

		//  This is the progress bar itself. It will increase in size from the left based on the % of progress.
		const bar = this.add.rectangle(x, y, progressStep, barHeight - 4, 0xffffff);

		//  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
		this.load.on('progress', (progress: number) => {
			//  Update the progress bar (our bar is 464px wide, so 100% = 464px)
			bar.width = progressStep + barWidth * progress;
		});
	}

	preload() {
		this.load.setPath('src/assets');

		this.load.image('day-sky', 'day-sky.jpg');
		this.load.image('night-sky', 'night-sky.jpg');
		this.load.image('boid', 'chevron.png');
	}

	create() {
		//  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
		//  For example, you can define global animations here, so we can use them in other scenes.

		//  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
		this.scene.start('Game');
	}
}
