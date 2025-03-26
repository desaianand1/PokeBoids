import { Math as PhaserMath } from 'phaser';
import type { IVector2, IVectorFactory } from '$interfaces/vector';

/**
 * Phaser-specific vector implementation
 */
export class PhaserVector implements IVector2 {
  private vector: PhaserMath.Vector2;

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
 
  create(x: number, y: number): IVector2 {
    return new PhaserVector(x, y);
  }

  random(): IVector2 {
    const angle = PhaserMath.FloatBetween(0, Math.PI * 2);
    return this.fromAngle(angle);
  }

  zero(): IVector2 {
    return this.create(0, 0);
  }

  fromAngle(angle: number): IVector2 {
    return this.create(Math.cos(angle), Math.sin(angle));
  }

 

  angle(v1: IVector2, v2: IVector2): number {
    return Math.atan2(v2.y - v1.y, v2.x - v1.x);
  }
}
