import type { IFlockingBehavior } from '$interfaces/flocking';
import type { IBoid } from '$interfaces/boid';
import type { IVector2, IVectorFactory } from '$interfaces/vector';
import type { IGameEventBus } from '$events/types';

/**
 * Implements boundary avoidance behavior - boids steer away from world boundaries
 */
export class BoundaryAvoidanceBehavior implements IFlockingBehavior {
  private worldWidth: number;
  private worldHeight: number;

  constructor(
    private vectorFactory: IVectorFactory,
    private forceMultiplier: number,
    private forceRamp: number,
    private boundaryMargin: number,
    private eventBus: IGameEventBus
  ) {
    this.worldWidth = 3000; // Default value
    this.worldHeight = 3000; // Default value
    // Listen for world bounds events
    this.setupWorldBoundsListeners();
  }

  calculate(boid: IBoid, _neighbors: IBoid[], eventBus?: IGameEventBus): IVector2 {
    const steering = this.vectorFactory.create(0, 0);
    const position = boid.getBoidPosition();
    const velocity = boid.getBoidVelocity();
    let collisionDetected = false;
    let collisionBoundary: 'left' | 'right' | 'top' | 'bottom' | null = null;

    // Check if boid is in a corner (near two perpendicular boundaries)
    const inLeftBoundary = position.x < this.boundaryMargin;
    const inRightBoundary = position.x > this.worldWidth - this.boundaryMargin;
    const inTopBoundary = position.y < this.boundaryMargin;
    const inBottomBoundary = position.y > this.worldHeight - this.boundaryMargin;

    // Handle corner cases first
    if ((inLeftBoundary && inTopBoundary) || 
        (inLeftBoundary && inBottomBoundary) || 
        (inRightBoundary && inTopBoundary) || 
        (inRightBoundary && inBottomBoundary)) {
      
      // Create a vector pointing away from the corner
      const centerX = this.worldWidth / 2;
      const centerY = this.worldHeight / 2;
      
      // Vector from position to center
      const awayFromCorner = this.vectorFactory.create(
        centerX - position.x,
        centerY - position.y
      );
      
      // Normalize and scale by a stronger force for corners
      awayFromCorner.setLength(boid.getMaxSpeed() * 1.5);
      
      // Apply stronger force for corners
      steering.add(awayFromCorner);
    } else {
      // Handle individual boundaries
      if (inLeftBoundary) {
        const force = this.calculateBoundaryForce(position.x, velocity.x < 0, boid);
        steering.x += force;
        if (position.x <= 0) {
          collisionDetected = true;
          collisionBoundary = 'left';
        }
      } else if (inRightBoundary) {
        const force = this.calculateBoundaryForce(
          this.worldWidth - position.x,
          velocity.x > 0,
          boid
        );
        steering.x -= force;
        if (position.x >= this.worldWidth) {
          collisionDetected = true;
          collisionBoundary = 'right';
        }
      }

      if (inTopBoundary) {
        const force = this.calculateBoundaryForce(position.y, velocity.y < 0, boid);
        steering.y += force;
        if (position.y <= 0) {
          collisionDetected = true;
          collisionBoundary = 'top';
        }
      } else if (inBottomBoundary) {
        const force = this.calculateBoundaryForce(
          this.worldHeight - position.y,
          velocity.y > 0,
          boid
        );
        steering.y -= force;
        if (position.y >= this.worldHeight) {
          collisionDetected = true;
          collisionBoundary = 'bottom';
        }
      }
    }

    // If collision detected and we have an event bus, emit the event
    if (collisionDetected && collisionBoundary && eventBus) {
      eventBus.emit('boundary-collision', {
        boid,
        boundary: collisionBoundary
      });
    }

    // Scale the final force
    steering.scale(this.forceMultiplier);
    steering.limit(boid.getMaxForce());

    return steering;
  }

  /**
   * Calculate boundary avoidance force based on distance and approach
   */
  private calculateBoundaryForce(
    distance: number,
    isApproaching: boolean,
    boid: IBoid
  ): number {
    // If moving away from boundary, reduce force
    if (!isApproaching) return 0;

    // Calculate force based on distance
    const normalizedDist = Math.max(0, Math.min(1, distance / this.boundaryMargin));
    return Math.pow(1 - normalizedDist, this.forceRamp) * boid.getMaxSpeed();
  }

  private setupWorldBoundsListeners(): void {
    // Listen for world bounds initialization
    this.eventBus.on('world-bounds-initialized', (data) => {
      this.worldWidth = data.width;
      this.worldHeight = data.height;
    }, this);
    
    // Listen for world bounds changes
    this.eventBus.on('world-bounds-changed', (data) => {
      this.worldWidth = data.width;
      this.worldHeight = data.height;
    }, this);
  }

  destroy(): void {
    // Clean up event listeners
    this.eventBus.off('world-bounds-initialized', undefined, this);
    this.eventBus.off('world-bounds-changed', undefined, this);
  }
}
