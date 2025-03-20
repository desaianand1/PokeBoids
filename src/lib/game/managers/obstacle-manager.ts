import type { Scene, GameObjects } from 'phaser';

/**
 * Manages obstacle creation and interaction in the game
 */
export class ObstacleManager {
  private obstacleGroup: Phaser.GameObjects.Group;

  constructor(private scene: Scene) {
    this.obstacleGroup = scene.add.group();
    this.setupDragHandling();
  }

  /**
   * Create or update obstacles to match desired count
   */
  updateObstacles(count: number): void {
    if (count === this.obstacleGroup.getLength()) return;

    // Clear existing obstacles
    this.obstacleGroup.clear(true, true);

    // Create new obstacles
    for (let i = 0; i < count; i++) {
      this.createObstacle();
    }
  }

  /**
   * Get all current obstacles
   */
  getObstacles(): GameObjects.GameObject[] {
    return this.obstacleGroup.getChildren();
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.scene.input.off('drag');
    this.obstacleGroup.destroy(true);
  }

  private createObstacle(): void {
    const margin = 100;
    const x = Phaser.Math.Between(margin, this.scene.scale.width - margin);
    const y = Phaser.Math.Between(margin, this.scene.scale.height - margin);
    const radius = Phaser.Math.Between(20, 60);

    // Create circle obstacle
    const obstacle = this.scene.add.circle(x, y, radius, 0x555555, 0.7);
    this.obstacleGroup.add(obstacle);

    // Make it draggable
    obstacle.setInteractive();
    this.scene.input.setDraggable(obstacle);
  }

  private setupDragHandling(): void {
    this.scene.input.on(
      'drag',
      (
        pointer: Phaser.Input.Pointer,
        gameObject: GameObjects.GameObject,
        dragX: number,
        dragY: number
      ) => {
        if (gameObject.body) {
          gameObject.body.position.x = dragX;
          gameObject.body.position.y = dragY;
        }
      }
    );
  }
}
