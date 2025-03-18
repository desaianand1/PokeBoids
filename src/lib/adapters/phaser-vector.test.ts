import { describe, it, expect, beforeEach } from 'vitest';
import { PhaserVector, PhaserVectorFactory } from './phaser-vector';

describe('PhaserVector', () => {
  let vector: PhaserVector;

  beforeEach(() => {
    vector = new PhaserVector(3, 4);
  });

  describe('Basic Operations', () => {
    it('initializes with correct values', () => {
      expect(vector.x).toBe(3);
      expect(vector.y).toBe(4);
    });

    it('clones correctly', () => {
      const clone = vector.clone();
      expect(clone).not.toBe(vector);
      expect(clone.x).toBe(vector.x);
      expect(clone.y).toBe(vector.y);
    });

    it('copies values from another vector', () => {
      const other = new PhaserVector(5, 6);
      vector.copy(other);
      expect(vector.x).toBe(5);
      expect(vector.y).toBe(6);
    });
  });

  describe('Vector Operations', () => {
    it('adds vectors correctly', () => {
      const other = new PhaserVector(1, 2);
      vector.add(other);
      expect(vector.x).toBe(4);
      expect(vector.y).toBe(6);
    });

    it('subtracts vectors correctly', () => {
      const other = new PhaserVector(1, 2);
      vector.subtract(other);
      expect(vector.x).toBe(2);
      expect(vector.y).toBe(2);
    });

    it('scales vector correctly', () => {
      vector.scale(2);
      expect(vector.x).toBe(6);
      expect(vector.y).toBe(8);
    });

    it('normalizes vector correctly', () => {
      vector.normalize();
      expect(vector.length()).toBe(1);
      expect(vector.x).toBeCloseTo(0.6);
      expect(vector.y).toBeCloseTo(0.8);
    });
  });

  describe('Vector Properties', () => {
    it('calculates length correctly', () => {
      expect(vector.length()).toBe(5); // 3-4-5 triangle
    });

    it('calculates length squared correctly', () => {
      expect(vector.lengthSquared()).toBe(25);
    });

    it('calculates dot product correctly', () => {
      const other = new PhaserVector(2, 3);
      expect(vector.dot(other)).toBe(18); // 3*2 + 4*3
    });

    it('calculates cross product correctly', () => {
      const other = new PhaserVector(2, 3);
      expect(vector.cross(other)).toBe(1); // 3*3 - 4*2
    });
  });

  describe('Vector Manipulation', () => {
    it('sets values correctly', () => {
      vector.set(5, 6);
      expect(vector.x).toBe(5);
      expect(vector.y).toBe(6);
    });

    it('negates vector correctly', () => {
      vector.negate();
      expect(vector.x).toBe(-3);
      expect(vector.y).toBe(-4);
    });

    it('rotates vector correctly', () => {
      // Rotate 90 degrees clockwise
      vector.rotate(Math.PI / 2);
      expect(vector.x).toBeCloseTo(4);
      expect(vector.y).toBeCloseTo(-3);
    });

    it('limits vector length correctly', () => {
      vector.limit(2);
      expect(vector.length()).toBe(2);
      expect(vector.x).toBeCloseTo(1.2);
      expect(vector.y).toBeCloseTo(1.6);
    });

    it('sets vector length correctly', () => {
      vector.setLength(2);
      expect(vector.length()).toBe(2);
      expect(vector.x).toBeCloseTo(1.2);
      expect(vector.y).toBeCloseTo(1.6);
    });
  });
});

describe('PhaserVectorFactory', () => {
  let factory: PhaserVectorFactory;

  beforeEach(() => {
    factory = new PhaserVectorFactory();
  });

  it('creates vector with given coordinates', () => {
    const vector = factory.create(3, 4);
    expect(vector.x).toBe(3);
    expect(vector.y).toBe(4);
  });

  it('creates random vector', () => {
    const vector = factory.random();
    expect(vector.length()).toBe(1); // Random unit vector
    expect(vector.x).toBeGreaterThanOrEqual(-1);
    expect(vector.x).toBeLessThanOrEqual(1);
    expect(vector.y).toBeGreaterThanOrEqual(-1);
    expect(vector.y).toBeLessThanOrEqual(1);
  });

  it('creates zero vector', () => {
    const vector = factory.zero();
    expect(vector.x).toBe(0);
    expect(vector.y).toBe(0);
  });

  it('creates unit vector in given direction', () => {
    const angle = Math.PI / 4; // 45 degrees
    const vector = factory.fromAngle(angle);
    expect(vector.length()).toBe(1);
    expect(vector.x).toBeCloseTo(Math.cos(angle));
    expect(vector.y).toBeCloseTo(Math.sin(angle));
  });

  it('calculates distance between vectors', () => {
    const v1 = factory.create(0, 0);
    const v2 = factory.create(3, 4);
    expect(factory.between(v1, v2)).toBe(5);
  });

  it('calculates squared distance between vectors', () => {
    const v1 = factory.create(0, 0);
    const v2 = factory.create(3, 4);
    expect(factory.betweenSquared(v1, v2)).toBe(25);
  });

  it('calculates angle between vectors', () => {
    const v1 = factory.create(1, 0);
    const v2 = factory.create(0, 1);
    expect(factory.angle(v1, v2)).toBeCloseTo(Math.PI / 2);
  });
});
