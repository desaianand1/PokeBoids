<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$ui/sonner';
	let { children } = $props();
</script>

<ModeWatcher />
<Toaster richColors position="top-center" />
{@render children()}
