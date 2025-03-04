export interface BoidConfig {
	boidCount: number;
	maxForce: number;
	maxSpeed: number;
	perceptionRadius: number;
	alignmentWeight: number;
	cohesionWeight: number;
	separationWeight: number;
}

export const BOID_DEFAULTS = {
	MIN_SPEED_RATIO: 0.7,
	SEPARATION_RADIUS_RATIO: 0.5,
	TRIANGLE_BASE: 8,
	TRIANGLE_HEIGHT: 16,
	COLOR: 0x000000
} as const;

export interface ConfigBounds {
    readonly min: number;
    readonly max: number;
    readonly step: number;
    readonly default: number;
}

export interface ConfigField {
    readonly key: keyof BoidConfig;
    readonly label: string;
    readonly bounds: ConfigBounds;
    readonly description?: string;
}


export const CONFIG_FIELDS: ConfigField[] = [
    {
        key: 'boidCount',
        label: 'Number of Boids',
        bounds: {
            min: 10,
            max: 500,
            step: 10,
            default: 50
        },
        description: 'Total number of boids in the simulation'
    },
    {
        key: 'maxForce',
        label: 'Maximum Force',
        bounds: {
            min: 0.1,
            max: 5,
            step: 0.1,
            default: 0.3
        },
        description: 'Maximum steering force that can be applied'
    },
    {
        key: 'maxSpeed',
        label: 'Maximum Speed',
        bounds: {
            min: 0,
            max: 1000,
            step: 50,
            default: 100
        },
        description: 'Maximum speed a boid can move'
    },
    {
        key: 'perceptionRadius',
        label: 'Perception Radius',
        bounds: {
            min: 10,
            max: 500,
            step: 10,
            default: 50
        },
        description: 'How far a boid can see its neighbors'
    },
    {
        key: 'alignmentWeight',
        label: 'Alignment Force',
        bounds: {
            min: 0,
            max: 10,
            step: 1,
            default: 1
        },
        description: 'How strongly boids match velocity with neighbors'
    },
    {
        key: 'cohesionWeight',
        label: 'Cohesion Force',
        bounds: {
            min: 0,
            max: 10,
            step: 1,
            default: 1
        },
        description: 'How strongly boids move toward the center of the group'
    },
    {
        key: 'separationWeight',
        label: 'Separation Force',
        bounds: {
            min: 0,
            max: 10,
            step: 1,
            default: 1
        },
        description: 'How strongly boids avoid crowding neighbors'
    }
] as const;

export class BoidConfigValidator {
    public static createDefaultConfig(): BoidConfig {
        return CONFIG_FIELDS.reduce((config, field) => ({
            ...config,
            [field.key]: field.bounds.default
        }), {}) as BoidConfig;
    }

    public static validateConfig(config: Partial<BoidConfig>): Partial<BoidConfig> {
        const validatedConfig: Partial<BoidConfig> = {};

        Object.entries(config).forEach(([key, value]) => {
            const field = CONFIG_FIELDS.find(f => f.key === key);
            if (field) {
                validatedConfig[key as keyof BoidConfig] = this.clampValue(
                    value as number,
                    field.bounds
                );
            }
        });

        return validatedConfig;
    }

    private static clampValue(value: number, bounds: ConfigBounds): number {
        const clampedValue = Math.max(bounds.min, Math.min(bounds.max, value));
        // Round to nearest step
        const steps = Math.round((clampedValue - bounds.min) / bounds.step);
        return bounds.min + (steps * bounds.step);
    }
}