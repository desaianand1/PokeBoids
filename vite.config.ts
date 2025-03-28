/// <reference types="vitest/config" />
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,ts}', 'tests/**/*.{test,spec}.{js,ts}'],
		globals: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'**/*.svelte',
				'**/*.d.ts',
				'node_modules/**',
				'src/lib/components/ui/**',
				'tests/**'
			]
		},
		deps: {
			inline: [/phaser/]
		},
		pool: 'forks',
		poolOptions: {
			forks: {
				minForks: 2,
				maxForks: 4
			}
		},
		exclude: process.env.CI ? ['**/*.flaky.test.ts'] : []
	}
});
