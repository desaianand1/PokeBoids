import { Boot } from '$scenes/boot';
import { Game as MainGame } from '$scenes/game';
import { AUTO, Game } from 'phaser';
import { Preloader } from '$scenes/preloader';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
	type: AUTO,
	width: 1920,
	height: 1080,
	parent: 'game-container',
	backgroundColor: '#80EF80',
	scene: [Boot, Preloader, MainGame],
	physics: {
		default: 'arcade',
		arcade: {
			debug: false,
			gravity: {
				y: 0,
				x: 0
			}
		}
	}
};

const StartGame = (parent: string) => {
	return new Game({ ...config, parent });
};

export default StartGame;
