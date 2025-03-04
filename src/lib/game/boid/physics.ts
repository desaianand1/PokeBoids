import { BOID_DEFAULTS } from '$boid/config';

export class BoidPhysics {
    private readonly body: Phaser.Physics.Arcade.Body;
    private maxSpeed: number;

    constructor(body: Phaser.Physics.Arcade.Body, maxSpeed: number) {
        this.body = body;
        this.maxSpeed = maxSpeed;
        this.initializePhysics();
    }

    private initializePhysics(): void {
        this.body
            .setAllowGravity(false)
            .setFriction(0, 0)
            .setDrag(0)
            .setAngularDrag(0)
            .setCollideWorldBounds(true)
            .setBounce(1, 1) 
            .setMaxSpeed(this.maxSpeed);
    }

    public setRandomVelocity(): void {
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const initialSpeed = this.maxSpeed * 0.4;
        const velocity = new Phaser.Math.Vector2(
            Math.cos(angle) * initialSpeed,
            Math.sin(angle) * initialSpeed
        );
        
        this.body.setVelocity(velocity.x, velocity.y);
    }

    public updateMaxSpeed(newMaxSpeed: number): void {
        this.maxSpeed = newMaxSpeed;
        this.body.setMaxSpeed(newMaxSpeed);
    }

    public get velocity(): Phaser.Math.Vector2 {
        return this.body.velocity;
    }

    public addForce(force: Phaser.Math.Vector2): void {
        // Apply force directly to velocity
        const newVelocity = this.body.velocity.clone().add(force);
        this.body.setVelocity(newVelocity.x, newVelocity.y);
    }

    public normalizeSpeed(): void {
        const minSpeed = this.maxSpeed * BOID_DEFAULTS.MIN_SPEED_RATIO;
        const currentVelocity = this.body.velocity.clone();
        
        if (currentVelocity.length() < minSpeed) {
            currentVelocity.normalize().scale(minSpeed);
        } else if (currentVelocity.length() > this.maxSpeed) {
            currentVelocity.normalize().scale(this.maxSpeed);
        }
        
        this.body.setVelocity(currentVelocity.x, currentVelocity.y);
    }
}
