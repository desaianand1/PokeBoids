import type { IBoid } from '$interfaces/boid';
import type { BoidVariant, BoidStats } from '$boid/types';
import type { IVector2 } from '$interfaces/vector';
import { TestVectorFactory } from '$tests/implementations/vector';
import { vi } from 'vitest';

/**
 * Creates a mock boid for testing
 */
export function createMockBoid(x: number, y: number, variant: BoidVariant): IBoid {
  const vectorFactory = new TestVectorFactory();
  const position = vectorFactory.create(x, y);
  const velocity = vectorFactory.create(
    Math.random() * 2 - 1,
    Math.random() * 2 - 1
  ).normalize().scale(variant === 'predator' ? 2 : 1);
  
  return {
    getId: vi.fn().mockReturnValue(`mock-boid-${x}-${y}`),
    getVariant: vi.fn().mockReturnValue(variant),
    
    getBoidPosition: vi.fn().mockReturnValue(position),
    setBoidPosition: vi.fn().mockImplementation((pos: IVector2) => {
      position.copy(pos);
    }),
    
    getBoidVelocity: vi.fn().mockReturnValue(velocity),
    setBoidVelocity: vi.fn().mockImplementation((vel: IVector2) => {
      velocity.copy(vel);
    }),
    
    applyForce: vi.fn(),
    
    getMaxSpeed: vi.fn().mockReturnValue(variant === 'predator' ? 2 : 1),
    setMaxSpeed: vi.fn(),
    
    getMaxForce: vi.fn().mockReturnValue(variant === 'predator' ? 0.2 : 0.1),
    setMaxForce: vi.fn(),
    
    getPerceptionRadius: vi.fn().mockReturnValue(variant === 'predator' ? 200 : 150),
    setPerceptionRadius: vi.fn(),
    
    getStats: vi.fn().mockReturnValue({
      health: 100,
      stamina: 100,
      speed: variant === 'predator' ? 2 : 1,
      reproduction: 0,
      level: 1,
      sex: Math.random() > 0.5 ? 'male' : 'female',
      ...(variant === 'predator' ? { attack: 10 } : {})
    } as BoidStats),
    
    takeDamage: vi.fn().mockReturnValue(false),
    increaseReproduction: vi.fn().mockReturnValue(false),
    levelUp: vi.fn(),
    
    update: vi.fn(),
    destroy: vi.fn()
  };
}
