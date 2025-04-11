<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$ui/card';
	import { Separator } from '$ui/separator';
	import { 
		BookText, 
		FileText, 
		Palette, 
		Code, 
		GraduationCap, 
		Users, 
		ExternalLink,
		Youtube
	} from '@lucide/svelte';
</script>

<Card class="w-full shadow-md">
	<CardHeader class="pb-4">
		<CardTitle class="flex items-center text-lg">
			<BookText class="mr-2 h-5 w-5" />
			Credits & References
		</CardTitle>
	</CardHeader>
	<CardContent>
		<!-- References Section -->
		<div class="space-y-6">
			<div>
				<h3 class="text-base font-semibold flex items-center">
					<FileText class="mr-2 h-4 w-4" />
					References
				</h3>
				<Separator class="my-3" />
				
				<!-- Original Research -->
				<div class="mb-5">
					<h4 class="text-sm font-medium flex items-center mb-3">
						<Users class="mr-2 h-4 w-4" />
						Original Research
					</h4>
					<div class="rounded-md border p-4">
						<div class="flex flex-col space-y-1">
							<h5 class="font-medium">Craig Reynolds' Boids</h5>
							<p class="text-sm opacity-90">The original flocking algorithm implementation (1986)</p>
							<a 
								href="https://www.red3d.com/cwr/boids/" 
								target="_blank" 
								rel="noopener noreferrer"
								class="text-xs text-blue-500 hover:underline flex items-center mt-1"
								aria-label="Visit Craig Reynolds' Boids website"
							>
								<ExternalLink class="h-3 w-3 mr-1" aria-hidden="true" />
								https://www.red3d.com/cwr/boids/
							</a>
						</div>
					</div>
				</div>
				
				<!-- Implementations -->
				<div class="mb-5">
					<h4 class="text-sm font-medium flex items-center mb-3">
						<Code class="mr-2 h-4 w-4" />
						Implementations & Visualizations
					</h4>
					<div class="space-y-3">
						<!-- Sebastian Lague -->
						<div class="rounded-md border p-4">
							<div class="flex flex-col space-y-1">
								<h5 class="font-medium">Sebastian Lague's "Coding Adventure: Boids"</h5>
								<p class="text-sm opacity-90">Modern implementation with Unity</p>
								<a 
									href="https://www.youtube.com/watch?v=bqtqltqcQhw" 
									target="_blank" 
									rel="noopener noreferrer"
									class="text-xs text-blue-500 hover:underline flex items-center mt-1"
									aria-label="Watch Sebastian Lague's Boids video on YouTube"
								>
									<Youtube class="h-3 w-3 mr-1" aria-hidden="true" />
									https://www.youtube.com/watch?v=bqtqltqcQhw
								</a>
							</div>
						</div>
						
						<!-- Ben Eater -->
						<div class="rounded-md border p-4">
							<div class="flex flex-col space-y-1">
								<h5 class="font-medium">Ben Eater's Boids Demo</h5>
								<p class="text-sm opacity-90">Interactive web-based demonstration</p>
								<a 
									href="https://eater.net/boids" 
									target="_blank" 
									rel="noopener noreferrer"
									class="text-xs text-blue-500 hover:underline flex items-center mt-1"
									aria-label="Visit Ben Eater's Boids demo"
								>
									<ExternalLink class="h-3 w-3 mr-1" aria-hidden="true" />
									https://eater.net/boids
								</a>
							</div>
						</div>
						
						<!-- Van Hunter Adam -->
						<div class="rounded-md border p-4">
							<div class="flex flex-col space-y-1">
								<h5 class="font-medium">Van Hunter Adam's Boids Algorithm</h5>
								<p class="text-sm opacity-90">Augmented for distributed consensus</p>
								<a 
									href="https://vanhunteradams.com/Pico/Animal_Movement/Boids-algorithm.html" 
									target="_blank" 
									rel="noopener noreferrer"
									class="text-xs text-blue-500 hover:underline flex items-center mt-1"
									aria-label="Visit Van Hunter Adam's Boids algorithm page"
								>
									<ExternalLink class="h-3 w-3 mr-1" aria-hidden="true" />
									https://vanhunteradams.com/Pico/Animal_Movement/Boids-algorithm.html
								</a>
							</div>
						</div>
					</div>
				</div>
				
				<!-- Academic Resources -->
				<div>
					<h4 class="text-sm font-medium flex items-center mb-3">
						<GraduationCap class="mr-2 h-4 w-4" />
						Academic Resources
					</h4>
					<div class="space-y-3">
						<!-- Distributed Boids Simulation -->
						<div class="rounded-md border p-4">
							<div class="flex flex-col space-y-1">
								<h5 class="font-medium">Distributed Boids Simulation</h5>
								<p class="text-sm opacity-90">
									Brett M. Martin, Ryan D. Winz, Luke J. McFadden, Tor J. Langehaug (Air Force Institute of Technology)
								</p>
								<a 
									href="https://www.american-cse.org/csce2023-ieee/pdfs/CSCE2023-5LlpKs7cpb4k2UysbLCuOx/275900a780/275900a780.pdf" 
									target="_blank" 
									rel="noopener noreferrer"
									class="text-xs text-blue-500 hover:underline flex items-center mt-1"
									aria-label="View Distributed Boids Simulation paper"
								>
									<FileText class="h-3 w-3 mr-1" aria-hidden="true" />
									View Paper
								</a>
							</div>
						</div>
						
						<!-- Stanford Course -->
						<div class="rounded-md border p-4">
							<div class="flex flex-col space-y-1">
								<h5 class="font-medium">Stanford Course: Boids Description</h5>
								<p class="text-sm opacity-90">Educational resource on flocking algorithms</p>
								<a 
									href="https://cs.stanford.edu/people/eroberts/courses/soco/projects/2008-09/modeling-natural-systems/boids.html" 
									target="_blank" 
									rel="noopener noreferrer"
									class="text-xs text-blue-500 hover:underline flex items-center mt-1"
									aria-label="Visit Stanford's Boids description page"
								>
									<ExternalLink class="h-3 w-3 mr-1" aria-hidden="true" />
									https://cs.stanford.edu/people/eroberts/courses/soco/projects/2008-09/modeling-natural-systems/boids.html
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Assets Section -->
			<div>
				<h3 class="text-base font-semibold flex items-center">
					<Palette class="mr-2 h-4 w-4" />
					Asset Credits
				</h3>
				<Separator class="my-3" />
				
				<!-- UI Assets -->
				<div class="rounded-md border p-4">
					<div class="flex flex-col space-y-1">
						<h4 class="font-medium">UI Elements</h4>
						<p class="text-sm opacity-90">Crusenho's Complete UI Essentials Pack</p>
						<a 
							href="https://crusenho.itch.io/complete-ui-essential-pack" 
							target="_blank" 
							rel="noopener noreferrer"
							class="text-xs text-blue-500 hover:underline flex items-center mt-1"
							aria-label="Visit Crusenho's UI Essentials Pack on itch.io"
						>
							<ExternalLink class="h-3 w-3 mr-1" aria-hidden="true" />
							https://crusenho.itch.io/complete-ui-essential-pack
						</a>
					</div>
				</div>
			</div>
		</div>
	</CardContent>
</Card>
