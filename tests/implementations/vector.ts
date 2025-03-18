import type { IVector2, IVectorFactory } from '$lib/interfaces/vector';

/**
 * Test implementation of IVector2 for testing boid behaviors
 * without Phaser dependencies
 */
export class TestVector implements IVector2 {
  constructor(public x: number, public y: number) {}

  clone(): IVector2 {
    return new TestVector(this.x, this.y);
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
}

/**
 * Test implementation of IVectorFactory for creating test vectors
 */
export class TestVectorFactory implements IVectorFactory {
  create(x: number, y: number): IVector2 {
    return new TestVector(x, y);
  }

  random(): IVector2 {
    const angle = Math.random() * Math.PI * 2;
    return this.fromAngle(angle);
  }

  fromAngle(angle: number): IVector2 {
    return new TestVector(Math.cos(angle), Math.sin(angle));
  }

  between(v1: IVector2, v2: IVector2): number {
    return Math.sqrt(this.betweenSquared(v1, v2));
  }

  betweenSquared(v1: IVector2, v2: IVector2): number {
    const dx = v2.x - v1.x;
    const dy = v2.y - v1.y;
    return dx * dx + dy * dy;
  }

  angle(v1: IVector2, v2: IVector2): number {
    return Math.atan2(v2.y - v1.y, v2.x - v1.x);
  }
}
