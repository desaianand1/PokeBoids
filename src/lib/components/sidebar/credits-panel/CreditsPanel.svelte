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
	import CardDescription from '$components/ui/card/card-description.svelte';
</script>

<Card class="w-full shadow-md">
	<CardHeader class="pb-4">
		<CardTitle class="flex items-center justify-center text-lg md:justify-start">
			<BookText class="mr-2 size-5" />
			Credits & References
		</CardTitle>
		<CardDescription class="space-y-3 pt-4">
			<p>
				This is an original work developed by <a
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center text-blue-500 hover:text-blue-400 hover:underline"
					aria-label="Anand Desai's website"
					href="https://ananddesai.dev/"
				>
					<ExternalLink class="mr-1 size-3" aria-hidden="true" />
					Anand Desai</a
				>
			</p>
			<p>
				This work is my own and does not represent the views, work or responsibility of any employer
				or institution.
			</p>
			<p>&copy; 2025 Anand Desai. All rights reserved.</p>
		</CardDescription>
	</CardHeader>
	<CardContent>
		<ScrollArea.Root class="h-[32vh] max-h-[70vh] md:h-[40vh] xl:h-[60vh]">
			<div class="space-y-6 pr-4">
				<!-- References Section -->
				<div>
					<h3
						class="flex items-center justify-center py-2 text-base font-semibold md:justify-start"
					>
						<FileText class="mr-2 size-4" />
						<span>References</span>
					</h3>
					<Separator class="mb-4" />

					<Accordion.Root type="multiple" class="w-full space-y-4">
						<!-- Original Research -->
						<Accordion.Item value="original-research" class="rounded-md border">
							<Accordion.Trigger class="px-4">
								<div class="flex items-center">
									<Microscope class="mr-2 size-4" />
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
											class="mt-1 flex items-center text-xs text-blue-500 hover:text-blue-400 hover:underline"
											aria-label="Visit Craig Reynolds' Boids website"
										>
											<ExternalLink class="mr-1 size-3" aria-hidden="true" />
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
									<GraduationCap class="mr-2 size-4" />
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
											class="mt-1 flex items-center text-xs text-blue-500 hover:text-blue-400 hover:underline"
											aria-label="View Distributed Boids Simulation paper"
										>
											<FileText class="mr-1 size-3" aria-hidden="true" />
											<span>Read Paper</span>
										</a>
									</div>

									<!-- Stanford Course -->
									<div class="flex flex-col space-y-1 pt-2">
										<h5 class="font-medium">Stanford: Modeling Natural Systems</h5>
										<p class="text-sm opacity-90">
											Educational resource on flocking algorithms and other artificial life projects
										</p>
										<a
											href="https://cs.stanford.edu/people/eroberts/courses/soco/projects/2008-09/modeling-natural-systems/boids.html"
											target="_blank"
											rel="noopener noreferrer"
											class="mt-1 flex items-center text-xs text-blue-500 hover:text-blue-400 hover:underline"
											aria-label="Visit Stanford's Boids description page"
										>
											<ExternalLink class="mr-1 size-3" aria-hidden="true" />
											<span>View Course Materials</span>
										</a>
									</div>
								</div>
							</Accordion.Content>
						</Accordion.Item>

						<!-- Implementations -->
						<Accordion.Item value="implementations" class="rounded-md border">
							<Accordion.Trigger class="px-4">
								<div class="flex items-center">
									<Code class="mr-2 size-4" />
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
											class="mt-1 flex items-center text-xs text-blue-500 hover:text-blue-400 hover:underline"
											aria-label="Watch Sebastian Lague's Boids video on YouTube"
										>
											<Youtube class="mr-1 size-3" aria-hidden="true" />
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
											class="mt-1 flex items-center text-xs text-blue-500 hover:text-blue-400 hover:underline"
											aria-label="Visit Ben Eater's Boids demo"
										>
											<Clapperboard class="mr-1 size-3" aria-hidden="true" />
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
											class="mt-1 flex items-center text-xs text-blue-500 hover:text-blue-400 hover:underline"
											aria-label="Visit Van Hunter Adam's Boids algorithm page"
										>
											<ExternalLink class="mr-1 size-3" aria-hidden="true" />
											<span>Visit Website</span>
										</a>
									</div>
								</div>
							</Accordion.Content>
						</Accordion.Item>
					</Accordion.Root>
				</div>

				<!-- Assets Section -->
				<div>
					<h3
						class="flex items-center justify-center py-2 text-base font-semibold md:justify-start"
					>
						<Palette class="mr-2 size-4" />
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
									class="mt-1 flex items-center text-xs text-blue-500 hover:text-blue-400 hover:underline"
									aria-label="Visit Crusenho's UI Essentials Pack on itch.io"
								>
									<Store class="mr-1 size-3" aria-hidden="true" />
									<span>View Store</span>
								</a>
							</div>
						</div>

						<div class="px-4">
							<div class="flex flex-col space-y-1">
								<h5 class="font-medium">Pokémon Sprites</h5>
								<p class="text-sm opacity-90">
									Pokémon&reg; is property of Nintendo/Creatures Inc./GAME FREAK inc.
								</p>

								<p class="text-sm opacity-90">
									PMD Sprite Collab - Community project by Marco Köpcke, audinowho and contributors
								</p>
								<a
									href="https://github.com/PMDCollab/SpriteCollab"
									target="_blank"
									rel="noopener noreferrer"
									class="mt-1 flex items-center text-xs text-blue-500 hover:text-blue-400 hover:underline"
									aria-label="Visit PMD Sprite Collab repository on GitHub"
								>
									<ExternalLink class="mr-1 size-3" aria-hidden="true" />
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
