import type { Scene } from 'phaser';

/**
 * Manages game background setup and resizing
 */
export class BackgroundManager {
  private background: Phaser.GameObjects.Image;

  constructor(private scene: Scene) {
    // Create background
    this.background = scene.add.image(0, 0, 'day-sky').setOrigin(0.5, 0.5);
    
    // Setup resize handling
    scene.scale.on('resize', this.handleResize, this);
    
    // Initial resize
    this.handleResize();
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.scene.scale.off('resize', this.handleResize, this);
    this.background.destroy();
  }

  private handleResize = (): void => {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    const scaleX = width / this.background.width;
    const scaleY = height / this.background.height;
    const scale = Math.max(scaleX, scaleY);

    this.background.setScale(scale);
    this.background.setPosition(width / 2, height / 2);
  };
}
