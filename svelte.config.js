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
			$utils: 'src/lib/utils',
			$game: 'src/lib/game',
			$scenes: 'src/lib/game/scenes',
			$boid: 'src/lib/game/boid',
			$assets: 'src/assets'
		}
	}
};

export default config;
