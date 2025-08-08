import type { Scene } from 'phaser';
import type { SimulationFlavor } from '$boid/animation/types';
import { mode } from 'mode-watcher';

/**
 * Manages game background setup and resizing with environment/theme support
 */
export class BackgroundManager {
  private background: Phaser.GameObjects.Image;
  private currentFlavor: SimulationFlavor = 'air';
  private isDarkMode: boolean = false;

  constructor(private scene: Scene) {
    // Initialize with current theme state
    this.isDarkMode = mode.current === 'dark';
    
    // Create background with correct initial texture
    this.background = scene.add.image(0, 0, this.getBackgroundTexture()).setOrigin(0.5, 0.5);
    
    // Setup resize handling
    scene.scale.on('resize', this.handleResize, this);
    
    // Initial resize
    this.handleResize();
  }

  /**
   * Update environment flavor (triggers background change)
   */
  updateFlavor(flavor: SimulationFlavor): void {
    this.currentFlavor = flavor;
    this.updateBackground();
  }

  /**
   * Update theme mode (triggers background change)
   */
  updateTheme(isDark: boolean): void {
    this.isDarkMode = isDark;
    this.updateBackground();
  }

  /**
   * Get the appropriate background texture key
   */
  private getBackgroundTexture(): string {
    const timeOfDay = this.isDarkMode ? 'night' : 'day';
    const textureKey = `${this.currentFlavor}-${timeOfDay}`;
    
    // Fallback to air backgrounds if specific environment not available
    if (!this.scene.textures.exists(textureKey)) {
      return `air-${timeOfDay}`;
    }
    
    return textureKey;
  }

  /**
   * Update the background texture
   */
  private updateBackground(): void {
    const newTexture = this.getBackgroundTexture();
    this.background.setTexture(newTexture);
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
