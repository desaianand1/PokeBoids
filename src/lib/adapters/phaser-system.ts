import { Math as PhaserMath, Scene, Core, Time } from 'phaser';
import type {
	IPhysics,
	IDebugRenderer,
	ITimeProvider,
	IRandomGenerator
} from '$lib/interfaces/system';
import type { IVector2 } from '$lib/interfaces/vector';

/**
 * Phaser-specific physics implementation
 */
export class PhaserPhysics implements IPhysics {
	constructor(private scene: Scene) {}

	wrapPosition(position: IVector2): void {
		this.scene.physics.world.wrap(position);
	}

	getWorldBounds(): { width: number; height: number } {
		return {
			width: this.scene.physics.world.bounds.width,
			height: this.scene.physics.world.bounds.height
		};
	}

	circleOverlap(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number): boolean {
		const dx = x2 - x1;
		const dy = y2 - y1;
		const distance = Math.sqrt(dx * dx + dy * dy);
		return distance < r1 + r2;
	}

	pointInCircle(x: number, y: number, cx: number, cy: number, radius: number): boolean {
		const dx = x - cx;
		const dy = y - cy;
		return dx * dx + dy * dy <= radius * radius;
	}

	angleBetweenPoints(x1: number, y1: number, x2: number, y2: number): number {
		return PhaserMath.Angle.Between(x1, y1, x2, y2);
	}

	shortestAngleBetween(angle1: number, angle2: number): number {
		return PhaserMath.Angle.ShortestBetween(
			PhaserMath.RadToDeg(angle1),
			PhaserMath.RadToDeg(angle2)
		);
	}
}

/**
 * Phaser-specific debug renderer implementation
 */
export class PhaserDebugRenderer implements IDebugRenderer {
	private graphics: Phaser.GameObjects.Graphics;
	private currentLineWidth: number = 1;
	private currentLineColor: number = 0xffffff;
	private currentLineAlpha: number = 1;

	constructor(scene: Scene) {
		this.graphics = scene.add.graphics();
	}

	setLineStyle(width: number, color: number, alpha: number = 1): void {
		this.currentLineWidth = width;
		this.currentLineColor = color;
		this.currentLineAlpha = alpha;
		this.graphics.lineStyle(width, color, alpha);
	}

	drawCircle(x: number, y: number, radius: number, color: number): void {
		this.setLineStyle(this.currentLineWidth, color, this.currentLineAlpha);
		this.graphics.strokeCircle(x, y, radius);
	}

	drawLine(x1: number, y1: number, x2: number, y2: number, color: number, alpha = 1): void {
		this.setLineStyle(this.currentLineWidth, color, alpha);
		this.graphics.lineBetween(x1, y1, x2, y2);
	}

	drawVector(
		x: number,
		y: number,
		vector: { x: number; y: number },
		color: number,
		alpha = 1
	): void {
		const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
		if (length === 0) return;

		// Draw main line
		this.drawLine(x, y, x + vector.x, y + vector.y, color, alpha);

		// Draw arrowhead
		const headLength = Math.min(length * 0.2, 10); // 20% of vector length, max 10 pixels
		const angle = Math.atan2(vector.y, vector.x);
		const headAngle = Math.PI / 6; // 30 degrees

		const x2 = x + vector.x;
		const y2 = y + vector.y;

		this.drawLine(
			x2,
			y2,
			x2 - headLength * Math.cos(angle - headAngle),
			y2 - headLength * Math.sin(angle - headAngle),
			color,
			alpha
		);

		this.drawLine(
			x2,
			y2,
			x2 - headLength * Math.cos(angle + headAngle),
			y2 - headLength * Math.sin(angle + headAngle),
			color,
			alpha
		);
	}

	clear(): void {
		this.graphics.clear();
	}

	destroy(): void {
		this.graphics.destroy();
	}
}

/**
 * Phaser-specific time provider implementation
 */
export class PhaserTimeProvider implements ITimeProvider {
	private timeouts: Map<number, Time.TimerEvent>;
	private nextTimeoutId: number;
	private timestep: Core.TimeStep;

	constructor(private scene: Scene) {
		this.timestep = scene.game.loop;
		this.nextTimeoutId = 1;
		this.timeouts = new Map();
	}

	now(): number {
		return this.scene.time.now;
	}

	getDelta(): number {
		return this.timestep.delta;
	}

	getFrame(): number {
		return this.timestep.frame;
	}

	getFPS(): number {
		return this.timestep.actualFps;
	}

	delay(delay: number, callback: () => void, context?: unknown): void {
		this.scene.time.delayedCall(delay, callback, undefined, context);
	}

	setTimeout(callback: () => void, delay: number): number {
		const id = this.nextTimeoutId++;
		const timerEvent = new Time.TimerEvent({
			delay: delay,
			callback: () => {
				callback();
				this.timeouts.delete(id);
			},
			callbackScope: this
		});
		this.timeouts.set(id, timerEvent);
		return id;
	}

	clearTimeout(id: number): void {
		const event = this.timeouts.get(id);
		if (event) {
			event.destroy();
			this.timeouts.delete(id);
		}
	}
}

/**
 * Phaser-specific random generator implementation
 */
export class PhaserRandomGenerator implements IRandomGenerator {
	float(min: number, max: number): number {
		return PhaserMath.FloatBetween(min, max);
	}

	integer(min: number, max: number): number {
		return PhaserMath.Between(min, max);
	}

	boolean(probability = 0.5): boolean {
		return this.float(0, 1) < probability;
	}

	angle(): number {
		return this.float(0, Math.PI * 2);
	}

	pick<T>(array: T[]): T {
		const index = this.integer(0, array.length - 1);
		return array[index];
	}

	value(): number {
		return PhaserMath.FloatBetween(0, 1);
	}
}
