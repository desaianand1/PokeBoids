import { Math as PhaserMath } from 'phaser';
import type { IVector2, IVectorFactory } from '$interfaces/vector';

/**
 * Phaser-specific vector implementation
 */
export class PhaserVector implements IVector2 {
	private vector: PhaserMath.Vector2;
	private static readonly EPSILON_SQUARED = 0.0001; // Threshold for "zero" vector

	constructor(x: number, y: number) {
		this.vector = new PhaserMath.Vector2(x, y);
	}

	get x(): number {
		return this.vector.x;
	}

	set x(value: number) {
		this.vector.x = value;
	}

	get y(): number {
		return this.vector.y;
	}

	set y(value: number) {
		this.vector.y = value;
	}

	clone(): IVector2 {
		return new PhaserVector(this.x, this.y);
	}

	copy(other: IVector2): IVector2 {
		this.x = other.x;
		this.y = other.y;
		return this;
	}

	add(other: IVector2): IVector2 {
		this.x += other.x;
		this.y += other.y;
		return this;
	}

	subtract(other: IVector2): IVector2 {
		this.x -= other.x;
		this.y -= other.y;
		return this;
	}

	scale(scalar: number): IVector2 {
		this.x *= scalar;
		this.y *= scalar;
		return this;
	}

	normalize(): IVector2 {
		const len = this.length();
		if (len > 0) {
			this.scale(1 / len);
		}
		return this;
	}

	length(): number {
		return Math.sqrt(this.lengthSquared());
	}

	lengthSquared(): number {
		return this.x * this.x + this.y * this.y;
	}

	hasSignificantLength(): boolean {
		// faster than calculating real length with sqrt
		return this.lengthSquared() > PhaserVector.EPSILON_SQUARED;
	}
	dot(other: IVector2): number {
		return this.x * other.x + this.y * other.y;
	}

	cross(other: IVector2): number {
		return this.x * other.y - this.y * other.x;
	}

	set(x: number, y: number): IVector2 {
		this.x = x;
		this.y = y;
		return this;
	}

	negate(): IVector2 {
		this.x = -this.x;
		this.y = -this.y;
		return this;
	}

	rotate(angle: number): IVector2 {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		const x = this.x * cos - this.y * sin;
		const y = this.x * sin + this.y * cos;
		this.x = x;
		this.y = y;
		return this;
	}

	angle(): number {
		return Math.atan2(this.y, this.x);
	}

	angleTo(other: IVector2): number {
		return Math.atan2(other.y - this.y, other.x - this.x);
	}

	limit(max: number): IVector2 {
		const lengthSq = this.lengthSquared();
		if (lengthSq > max * max) {
			this.normalize().scale(max);
		}
		return this;
	}

	setLength(length: number): IVector2 {
		return this.normalize().scale(length);
	}

	distanceTo(other: IVector2): number {
		return Math.sqrt(this.distanceToSquared(other));
	}

	distanceToSquared(other: IVector2): number {
		const dx = other.x - this.x;
		const dy = other.y - this.y;
		return dx * dx + dy * dy;
	}
}

/**
 * Factory for creating Phaser vectors
 */
export class PhaserVectorFactory implements IVectorFactory {
	private readonly zeroVector: PhaserVector;
	private readonly upVector: PhaserVector;
	private readonly downVector: PhaserVector;
	private readonly leftVector: PhaserVector;
	private readonly rightVector: PhaserVector;

	constructor() {
		this.zeroVector = new PhaserVector(0, 0);
		this.upVector = new PhaserVector(0, -1);
		this.downVector = new PhaserVector(0, 1);
		this.leftVector = new PhaserVector(-1, 0);
		this.rightVector = new PhaserVector(1, 0);
	}

	create(x: number, y: number): IVector2 {
		return new PhaserVector(x, y);
	}

	random(): IVector2 {
		const angle = PhaserMath.FloatBetween(0, Math.PI * 2);
		return this.fromAngle(angle);
	}

	fromAngle(angle: number): IVector2 {
		return this.create(Math.cos(angle), Math.sin(angle));
	}

	zero(): IVector2 {
		return this.zeroVector;
	}

	up(): IVector2 {
		return this.upVector;
	}
	down(): IVector2 {
		return this.downVector;
	}
	left(): IVector2 {
		return this.leftVector;
	}
	right(): IVector2 {
		return this.rightVector;
	}
}
