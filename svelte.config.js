import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			fallback: 'index.html'
		}),
		alias: {
			$routes: '.svelte-kit/types/src/routes',
			$components: 'src/lib/components',
			$ui: 'src/lib/components/ui',
			$utils: 'src/lib/utils',
			$boid: 'src/lib/boid',
			$config: 'src/lib/config',
			$events: 'src/lib/events',
			$game: 'src/lib/game',
			$adapters: 'src/lib/adapters',
			$interfaces: 'src/lib/interfaces',
			$scenes: 'src/lib/game/scenes',
			$assets: 'src/assets',
			$tests: 'tests'
		}
	}
};

export default config;
