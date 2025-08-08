<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$ui/card';
	import * as ScrollArea from '$ui/scroll-area';
	import * as Accordion from '$ui/accordion';
	import { Separator } from '$ui/separator';
	import {
		BookText,
		FileText,
		Palette,
		Code,
		GraduationCap,
		ExternalLink,
		Youtube,
		Store,
		Clapperboard,
		Microscope
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
		<ScrollArea.Root class="h-[32vh] md:h-[40vh] xl:h-[60vh] max-h-[70vh]">
			<div class="pr-4 space-y-6">
				<!-- References Section -->
				<div>
					<h3 class="text-base font-semibold flex items-center py-2">
						<FileText class="mr-2 h-4 w-4" />
						<span>References</span>
					</h3>
					<Separator class="mb-4" />
					
					<Accordion.Root type="multiple" class="w-full space-y-4">
						<!-- Original Research -->
						<Accordion.Item value="original-research" class="rounded-md border">
							<Accordion.Trigger class="px-4">
								<div class="flex items-center">
									<Microscope class="mr-2 h-4 w-4" />
									<span>Original Research</span>
								</div>
							</Accordion.Trigger>
							<Accordion.Content>
								<div class="px-4 pb-2">
									<div class="flex flex-col space-y-1">
										<h5 class="font-medium">Craig Reynolds' Boids</h5>
										<p class="text-sm opacity-90">
											The original flocking algorithm implementation (1986)
										</p>
										<a
											href="https://www.red3d.com/cwr/boids/"
											target="_blank"
											rel="noopener noreferrer"
											class="mt-1 flex items-center text-xs text-blue-500 hover:underline"
											aria-label="Visit Craig Reynolds' Boids website"
										>
											<ExternalLink class="mr-1 h-3 w-3" aria-hidden="true" />
											<span>Visit Website</span>
										</a>
									</div>
								</div>
							</Accordion.Content>
						</Accordion.Item>

						<!-- Implementations -->
						<Accordion.Item value="implementations" class="rounded-md border">
							<Accordion.Trigger class="px-4">
								<div class="flex items-center">
									<Code class="mr-2 h-4 w-4" />
									<span>Implementations & Visualizations</span>
								</div>
							</Accordion.Trigger>
							<Accordion.Content>
								<div class="space-y-3 px-4 pb-2">
									<!-- Sebastian Lague -->
									<div class="flex flex-col space-y-1 pt-2">
										<h5 class="font-medium">Sebastian Lague's "Coding Adventure: Boids"</h5>
										<p class="text-sm opacity-90">A modern implementation in Unity</p>
										<a
											href="https://www.youtube.com/watch?v=bqtqltqcQhw"
											target="_blank"
											rel="noopener noreferrer"
											class="mt-1 flex items-center text-xs text-blue-500 hover:underline"
											aria-label="Watch Sebastian Lague's Boids video on YouTube"
										>
											<Youtube class="mr-1 h-3 w-3" aria-hidden="true" />
											<span>Watch Video</span>
										</a>
									</div>

									<!-- Ben Eater -->
									<div class="flex flex-col space-y-1 pt-2">
										<h5 class="font-medium">Ben Eater's Boids Demo</h5>
										<p class="text-sm opacity-90">Interactive web-based demonstration</p>
										<a
											href="https://eater.net/boids"
											target="_blank"
											rel="noopener noreferrer"
											class="mt-1 flex items-center text-xs text-blue-500 hover:underline"
											aria-label="Visit Ben Eater's Boids demo"
										>
											<Clapperboard class="mr-1 h-3 w-3" aria-hidden="true" />
											<span>Try Interactive Demo</span>
										</a>
									</div>

									<!-- Van Hunter Adam -->
									<div class="flex flex-col space-y-1 pt-2">
										<h5 class="font-medium">Van Hunter Adam's Boids Algorithm</h5>
										<p class="text-sm opacity-90">Augmented for distributed consensus</p>
										<a
											href="https://vanhunteradams.com/Pico/Animal_Movement/Boids-algorithm.html"
											target="_blank"
											rel="noopener noreferrer"
											class="mt-1 flex items-center text-xs text-blue-500 hover:underline"
											aria-label="Visit Van Hunter Adam's Boids algorithm page"
										>
											<ExternalLink class="mr-1 h-3 w-3" aria-hidden="true" />
											<span>Visit Website</span>
										</a>
									</div>
								</div>
							</Accordion.Content>
						</Accordion.Item>

						<!-- Academic Resources -->
						<Accordion.Item value="academic" class="rounded-md border">
							<Accordion.Trigger class="px-4">
								<div class="flex items-center">
									<GraduationCap class="mr-2 h-4 w-4" />
									<span>Academic Resources</span>
								</div>
							</Accordion.Trigger>
							<Accordion.Content>
								<div class="space-y-3 px-4 pb-2">
									<!-- Distributed Boids Simulation -->
									<div class="flex flex-col space-y-1 pt-2">
										<h5 class="font-medium">Distributed Boids Simulation</h5>
										<p class="text-sm opacity-90">
											Brett M. Martin, Ryan D. Winz, Luke J. McFadden, Tor J. Langehaug (Air Force
											Institute of Technology)
										</p>
										<a
											href="https://www.american-cse.org/csce2023-ieee/pdfs/CSCE2023-5LlpKs7cpb4k2UysbLCuOx/275900a780/275900a780.pdf"
											target="_blank"
											rel="noopener noreferrer"
											class="mt-1 flex items-center text-xs text-blue-500 hover:underline"
											aria-label="View Distributed Boids Simulation paper"
										>
											<FileText class="mr-1 h-3 w-3" aria-hidden="true" />
											<span>Read Paper</span>
										</a>
									</div>

									<!-- Stanford Course -->
									<div class="flex flex-col space-y-1 pt-2">
										<h5 class="font-medium">Stanford: Modeling Natural Systems</h5>
										<p class="text-sm opacity-90">Educational resource on flocking algorithms and other artificial life projects</p>
										<a
											href="https://cs.stanford.edu/people/eroberts/courses/soco/projects/2008-09/modeling-natural-systems/boids.html"
											target="_blank"
											rel="noopener noreferrer"
											class="mt-1 flex items-center text-xs text-blue-500 hover:underline"
											aria-label="Visit Stanford's Boids description page"
										>
											<ExternalLink class="mr-1 h-3 w-3" aria-hidden="true" />
											<span>View Course Materials</span>
										</a>
									</div>
								</div>
							</Accordion.Content>
						</Accordion.Item>
					</Accordion.Root>
				</div>
				
				<!-- Assets Section -->
				<div>
					<h3 class="text-base font-semibold flex items-center py-2">
						<Palette class="mr-2 h-4 w-4" />
						<span>Asset Credits</span>
					</h3>

					<Separator class="mb-4" />
					
					<div class="space-y-4">
						<div class="px-4">
							<div class="flex flex-col space-y-1">
								<h5 class="font-medium">UI Elements</h5>
								<p class="text-sm opacity-90">Crusenho's Complete UI Essentials Pack</p>
								<a
									href="https://crusenho.itch.io/complete-ui-essential-pack"
									target="_blank"
									rel="noopener noreferrer"
									class="mt-1 flex items-center text-xs text-blue-500 hover:underline"
									aria-label="Visit Crusenho's UI Essentials Pack on itch.io"
								>
									<Store class="mr-1 h-3 w-3" aria-hidden="true" />
									<span>View Store</span>
								</a>
							</div>
						</div>
						
						<div class="px-4">
							<div class="flex flex-col space-y-1">
								<h5 class="font-medium">Pokémon Sprites</h5>
								<p class="text-sm opacity-90">
									PMD Sprite Collab - Community project by Marco Köpcke, audinowho and contributors
								</p>
								<a
									href="https://github.com/PMDCollab/SpriteCollab"
									target="_blank"
									rel="noopener noreferrer"
									class="mt-1 flex items-center text-xs text-blue-500 hover:underline"
									aria-label="Visit PMD Sprite Collab repository on GitHub"
								>
									<ExternalLink class="mr-1 h-3 w-3" aria-hidden="true" />
									<span>View Repository</span>
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</ScrollArea.Root>
	</CardContent>
</Card>
