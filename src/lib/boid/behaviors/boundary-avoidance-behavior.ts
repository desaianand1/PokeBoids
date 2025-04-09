import type { IFlockingBehavior } from '$interfaces/flocking';
import type { IBoid } from '$interfaces/boid';
import type { IVector2, IVectorFactory } from '$interfaces/vector';
import type { IGameEventBus } from '$events/types';
import type { BoundaryMode } from '$config/types';

type CollisionBoundary = 'left' | 'right' | 'top' | 'bottom' | null;
/**
 * Implements boundary avoidance behavior - boids steer away from world boundaries
 */
export class BoundaryAvoidanceBehavior implements IFlockingBehavior {
	private worldWidth: number;
	private worldHeight: number;
	private boidBoundaryCollisionTimes: Map<
		string,
		{
			boundary: CollisionBoundary;
			timestamp: number;
		}
	>;

	constructor(
		private vectorFactory: IVectorFactory,
		private forceMultiplier: number,
		private forceRamp: number,
		private boundaryMargin: number,
		private boundaryMode: BoundaryMode,
		private boundaryStuckThreshold: number,
		private eventBus: IGameEventBus
	) {
		this.worldWidth = 3000; // Default value
		this.worldHeight = 3000; // Default value
		this.boidBoundaryCollisionTimes = new Map();
		// Listen for world bounds events
		this.setupWorldBoundsListeners();
	}

	calculate(boid: IBoid, _neighbors: IBoid[], eventBus?: IGameEventBus): IVector2 {
		if (this.boundaryMode === 'wrappable') {
			return this.handleWrappableBoundaries(boid, eventBus);
		} else {
			return this.handleCollidableBoundaries(boid, eventBus);
		}
	}

	// Handle wrappable boundaries - teleport boids to the opposite side
	private handleWrappableBoundaries(boid: IBoid, eventBus?: IGameEventBus): IVector2 {
		const position = boid.getBoidPosition();
		// Check if boid is outside any boundary
		let wrapped = false;

		// Check and wrap horizontal boundaries
		if (position.x < 0) {
			position.x = this.worldWidth;
			wrapped = true;
		} else if (position.x > this.worldWidth) {
			position.x = 0;
			wrapped = true;
		}

		// Check and wrap vertical boundaries
		if (position.y < 0) {
			position.y = this.worldHeight;
			wrapped = true;
		} else if (position.y > this.worldHeight) {
			position.y = 0;
			wrapped = true;
		}

		// If we wrapped the boid, update its position
		if (wrapped) {
			boid.setBoidPosition(position);

			// Emit boundary wrap event if eventBus is provided
			if (eventBus) {
				eventBus.emit('boundary-wrapped', {
					boid,
					position: { x: position.x, y: position.y }
				});
			}
		}

		// No steering force for wrappable boundaries
		return this.vectorFactory.create(0, 0);
	}

	// Handle collidable boundaries - steer away and detect stuck boids
	private handleCollidableBoundaries(boid: IBoid, eventBus?: IGameEventBus): IVector2 {
		const steering = this.vectorFactory.create(0, 0);
		const position = boid.getBoidPosition();
		const velocity = boid.getBoidVelocity();
		let collisionDetected = false;
		let collisionBoundary: CollisionBoundary = null;

		// Check if boid is in a corner (near two perpendicular boundaries)
		const inLeftBoundary = position.x < this.boundaryMargin;
		const inRightBoundary = position.x > this.worldWidth - this.boundaryMargin;
		const inTopBoundary = position.y < this.boundaryMargin;
		const inBottomBoundary = position.y > this.worldHeight - this.boundaryMargin;

		// Handle corner cases first
		if (
			(inLeftBoundary && inTopBoundary) ||
			(inLeftBoundary && inBottomBoundary) ||
			(inRightBoundary && inTopBoundary) ||
			(inRightBoundary && inBottomBoundary)
		) {
			// Create a vector pointing away from the corner
			const centerX = this.worldWidth / 2;
			const centerY = this.worldHeight / 2;

			// Vector from position to center
			const awayFromCorner = this.vectorFactory.create(centerX - position.x, centerY - position.y);

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

		// Handle stuck boid detection
		if (collisionDetected) {
			this.checkForStuckBoid(boid, collisionBoundary, steering);
		} else {
			// Clear collision record if not colliding
			this.boidBoundaryCollisionTimes.delete(boid.getId());
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
	private calculateBoundaryForce(distance: number, isApproaching: boolean, boid: IBoid): number {
		// If moving away from boundary, reduce force
		if (!isApproaching) return 0;

		// Calculate force based on distance
		const normalizedDist = Math.max(0, Math.min(1, distance / this.boundaryMargin));
		return Math.pow(1 - normalizedDist, this.forceRamp) * boid.getMaxSpeed();
	}

	private setupWorldBoundsListeners(): void {
		this.eventBus.on(
			'world-bounds-initialized',
			(data) => {
				this.worldWidth = data.width;
				this.worldHeight = data.height;
			},
			this
		);

		this.eventBus.on(
			'world-bounds-changed',
			(data) => {
				this.worldWidth = data.width;
				this.worldHeight = data.height;
			},
			this
		);

		this.eventBus.on(
			'boundary-mode-changed',
			(data) => {
				this.boundaryMode = data.value;
			},
			this
		);

		this.eventBus.on(
			'boundary-stuck-threshold-changed',
			(data) => {
				this.boundaryStuckThreshold = data.value;
			},
			this
		);
	}

	// Check if a boid is stuck at a boundary and help it escape
	private checkForStuckBoid(boid: IBoid, boundary: CollisionBoundary, steering: IVector2): void {
		const boidId = boid.getId();
		const currentTime = Date.now();

		// If no collision detected, skip over
		if (boundary === null) {
			return;
		}

		// Get or create the collision record
		if (!this.boidBoundaryCollisionTimes.has(boidId)) {
			this.boidBoundaryCollisionTimes.set(boidId, {
				boundary,
				timestamp: currentTime
			});
			return;
		}

		const collisionRecord = this.boidBoundaryCollisionTimes.get(boidId)!;

		// If boundary changed, update the record
		if (collisionRecord.boundary !== boundary) {
			collisionRecord.boundary = boundary;
			collisionRecord.timestamp = currentTime;
			return;
		}

		// Check if the boid has been stuck for longer than the threshold
		const stuckDuration = currentTime - collisionRecord.timestamp;

		if (stuckDuration >= this.boundaryStuckThreshold) {
			// Boid is stuck - apply a strong turning force perpendicular to the boundary
			this.applyEscapeForce(boid, boundary, steering);

			// Reset the timer after applying the escape force
			collisionRecord.timestamp = currentTime;

			// Emit stuck boid event
			this.eventBus.emit('boid-unstuck', {
				boid,
				boundary,
				stuckDuration
			});
		}
	}

	// Apply a strong force to help a stuck boid escape
	private applyEscapeForce(boid: IBoid, boundary: CollisionBoundary, steering: IVector2): void {
		const velocity = boid.getBoidVelocity();
		const position = boid.getBoidPosition();

		// Create a strong perpendicular force based on boundary
		switch (boundary) {
			case 'left':
			case 'right':
				// For horizontal boundaries, apply vertical force
				// Use current velocity's y component to determine direction
				// If y is close to 0, pick a random direction
				if (Math.abs(velocity.y) < 0.1) {
					// Pick a direction biased toward the center of the world
					const centerY = this.worldHeight / 2;
					const directionY = position.y < centerY ? 1 : -1;
					steering.y += directionY * boid.getMaxSpeed() * 2;
				} else {
					// Amplify existing y component
					steering.y += Math.sign(velocity.y) * boid.getMaxSpeed() * 2;
				}
				break;

			case 'top':
			case 'bottom':
				// For vertical boundaries, apply horizontal force
				if (Math.abs(velocity.x) < 0.1) {
					// Pick a direction biased toward the center of the world
					const centerX = this.worldWidth / 2;
					const directionX = position.x < centerX ? 1 : -1;
					steering.x += directionX * boid.getMaxSpeed() * 2;
				} else {
					// Amplify existing x component
					steering.x += Math.sign(velocity.x) * boid.getMaxSpeed() * 2;
				}
				break;
		}
	}

	destroy(): void {
		// Clean up event listeners
		this.eventBus.off('world-bounds-initialized', undefined, this);
		this.eventBus.off('world-bounds-changed', undefined, this);
		this.eventBus.off('boundary-mode-changed', undefined, this);
		this.eventBus.off('boundary-stuck-threshold-changed', undefined, this);
		this.boidBoundaryCollisionTimes.clear();
	}
}
