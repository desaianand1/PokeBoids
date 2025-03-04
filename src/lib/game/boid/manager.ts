import Phaser from 'phaser';
import { Boid } from '$boid';
import { type BoidConfig } from '$boid/config';

export class BoidManager {
    private readonly boids: Set<Boid>;
    private readonly scale: { width: number; height: number };
    private currentConfig: BoidConfig;
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, config: BoidConfig) {
        this.boids = new Set();
        this.scale = {
            width: scene.scale.width,
            height: scene.scale.height
        };
        this.currentConfig = { ...config };
        this.scene = scene;

        this.initializeBoids();
    }

    private initializeBoids(): void {
        // Clear existing boids if any
        this.boids.clear();
        
        // Create new boids
        for (let i = 0; i < this.currentConfig.boidCount; i++) {
            this.addBoid();
        }
    }

    private addBoid(): void {
        const x = Phaser.Math.Between(0, this.scale.width);
        const y = Phaser.Math.Between(0, this.scale.height);
        const boid = new Boid(this.scene, x, y, this.currentConfig);
        this.boids.add(boid);
    }

    private removeBoid(): void {
        // Get the first boid from the set
        const boidToRemove = this.boids.values().next().value;
        if (boidToRemove) {
            boidToRemove.destroy(); // Clean up Phaser game object
            this.boids.delete(boidToRemove);
        }
    }

    private updateBoidCount(newCount: number): void {
        const currentCount = this.boids.size;
        const difference = newCount - currentCount;

        if (difference > 0) {
            // Add boids
            for (let i = 0; i < difference; i++) {
                this.addBoid();
            }
        } else if (difference < 0) {
            // Remove boids
            for (let i = 0; i < Math.abs(difference); i++) {
                this.removeBoid();
            }
        }
    }

    public update(): void {
        const boidsArray = Array.from(this.boids);
        
        this.boids.forEach(boid => {
            boid.flock(boidsArray);
            boid.update();
        });
    }

    public updateConfig(newConfig: Partial<BoidConfig>): void {
        // Update current config
        this.currentConfig = { ...this.currentConfig, ...newConfig };

        // Handle boid count changes
        if (newConfig.boidCount !== undefined) {
            this.updateBoidCount(newConfig.boidCount);
        }

        // Update all existing boids with new config
        this.boids.forEach(boid => boid.updateConfig(newConfig));
    }

    public getBoidsCount(): number {
        return this.boids.size;
    }

    public destroy(): void {
        // Clean up all boids when manager is destroyed
        this.boids.forEach(boid => boid.destroy());
        this.boids.clear();
    }
}