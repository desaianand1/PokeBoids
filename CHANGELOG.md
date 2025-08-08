# 1.0.0 (2025-08-08)


* feat(boid)!: integrate animation system into boid entities ([9a4758b](https://github.com/desaianand1/PokeBoids/commit/9a4758b945d701c3381666fc63d0d0aae8a6b8ab))


### Bug Fixes

* added semver system to cline workflow ([73c10e0](https://github.com/desaianand1/PokeBoids/commit/73c10e0868c240a3bd9002fb6e44ce579848f8b9))
* adjusted default parameters for a better, more interesting simulation without quick convergence or saddle points ([9494ebd](https://github.com/desaianand1/PokeBoids/commit/9494ebd53f4d37942cc692c7bb2b1b869c40ff06))
* **ci:** resolve semantic-release hook conflicts ([c864cea](https://github.com/desaianand1/PokeBoids/commit/c864ceae5bb5f42dfb0f08f4914b442acaad357b))
* downgrade bits-ui to resolve Svelte 5 compatibility ([7a9a9c9](https://github.com/desaianand1/PokeBoids/commit/7a9a9c9b4f49f7c57804f7dc32769b1ed17b9671))
* eliminate unknown types in sprite loading system ([d9ce405](https://github.com/desaianand1/PokeBoids/commit/d9ce4053e1409f53f87de6d2012b376fcd5f5c1e))
* footer UI now looks better on mobile ([ed7b3df](https://github.com/desaianand1/PokeBoids/commit/ed7b3dfaea17bd27e57b07dc736ae95a486c2905))
* improve event details UI layout and UUID display ([b508440](https://github.com/desaianand1/PokeBoids/commit/b508440f77d98fea430cdf89e98a7b866202d9a1))
* major bug with FoV angle Svelte infinite effect errors ([e0a9e2d](https://github.com/desaianand1/PokeBoids/commit/e0a9e2ddb44aba202a7e1db9e985b9adb4b10e9c))
* preloader progress bar now fills correctly as progress updates ([d85e400](https://github.com/desaianand1/PokeBoids/commit/d85e400565eb1baef7cfd6e2613a7b7763b5ba25))
* resetting simulation now uses correct, up-to-date config values instead of hardcoded defaults ([eb1072b](https://github.com/desaianand1/PokeBoids/commit/eb1072b7725780cca7f85e0e251da597cc15098f))
* resolve duplicate key errors in Svelte components ([8a6bd86](https://github.com/desaianand1/PokeBoids/commit/8a6bd86bd58d515a4d3ec8be6491f61bc811a5e0))
* resolve remaining TypeScript compilation errors ([b1b5080](https://github.com/desaianand1/PokeBoids/commit/b1b5080bfe94b3f40ba807ab4524c40cf0884648))
* resolve Svelte reactivity issues in event aggregation ([6966bc6](https://github.com/desaianand1/PokeBoids/commit/6966bc683fae972eddf46466046889ada5608f95))
* resolve TypeScript interface compliance issues ([7dcb1ed](https://github.com/desaianand1/PokeBoids/commit/7dcb1ed1a98b4b7c8cac728c1956bc396d6042c4))
* **ui:** fixed credits panel responsiveness ([48f2f0b](https://github.com/desaianand1/PokeBoids/commit/48f2f0ba2f683f9cbc2bdde45a63fbafbd671da3))
* **ui:** fixed sidebar tab UI grid-cols since credit-panel added ([47f5996](https://github.com/desaianand1/PokeBoids/commit/47f59969d2ed3f7ebe2d05b6760c746717da7aa0))
* update vector implementation to match interface ([54b7071](https://github.com/desaianand1/PokeBoids/commit/54b7071029090313e3e55d1557da0e66d6cd9ef5))
* various logic fixes, added missing predator texture (temporarily) ([786740f](https://github.com/desaianand1/PokeBoids/commit/786740f424438421f7c9c6231dd82338818a81fe))


### Features

* a ton of changes. MVP Phase 1 close to complete ([cfb742b](https://github.com/desaianand1/PokeBoids/commit/cfb742b640b824a11b79397cf3ea3ea16e4a3392))
* add UUID utility module for unique ID generation ([6c51e4b](https://github.com/desaianand1/PokeBoids/commit/6c51e4b86fcb7e66b2bba4f9b86d31bd69904336))
* added better collision flash effect ([5c036e9](https://github.com/desaianand1/PokeBoids/commit/5c036e9e95c59a45c6323dc94064fdcb43123b14))
* added FoV for boids ([9fdf5b0](https://github.com/desaianand1/PokeBoids/commit/9fdf5b0171b33ba049eaef52cf124557ac0df02a))
* added neat event debugging UI and toasts ([d7c805f](https://github.com/desaianand1/PokeBoids/commit/d7c805fa1d7a35243ed65ea8c98292bcc74f52d6))
* added spatial partitioning for massive performance gains ([4b174ac](https://github.com/desaianand1/PokeBoids/commit/4b174acdbc9ed5724d86e0f936470de2ebc4fc14))
* added versioning as a variable ([1c234f1](https://github.com/desaianand1/PokeBoids/commit/1c234f11e261558b7e226bca8500f6e8d8a5e362))
* **animation:** add boid animation system with sprite manager and controller ([fec9516](https://github.com/desaianand1/PokeBoids/commit/fec9516cdfd01c78002f4810adf407eab34683f2))
* **boid:** implement FoV-based predator-prey dynamics ([0049e53](https://github.com/desaianand1/PokeBoids/commit/0049e539f4bff72f175555f85c5cb1bb3019e508))
* **boundaries:** add wrappable boundary mode option ([ea7cb2b](https://github.com/desaianand1/PokeBoids/commit/ea7cb2b753005a842f69450f27df53cd128289ff))
* **boundaries:** implement stuck boid detection and recovery; other wrapping logic ([6c6b791](https://github.com/desaianand1/PokeBoids/commit/6c6b791a3528aea367295d8d6768ba09ecde62ee))
* **ci:** add comprehensive CI/CD pipeline with automated versioning ([5808fdd](https://github.com/desaianand1/PokeBoids/commit/5808fdd68a4b3663893886fe3f6cc706b5ad0675))
* **config:** add flavor mode configuration to simulation settings ([9b37aee](https://github.com/desaianand1/PokeBoids/commit/9b37aee52c1c3eeaf267e5b76795e94f2c9f0bc5))
* consolidate CI/CD workflows with proper gating ([5033cf4](https://github.com/desaianand1/PokeBoids/commit/5033cf473d33e81b731b584af74ee72bcbf93ad2))
* enhance UI component transitions and styling ([f42d911](https://github.com/desaianand1/PokeBoids/commit/f42d91140932f7eb68bdad9513fe679a388b6557))
* **game:** integrate sprite loading and flavor mode into game scenes ([22fbb76](https://github.com/desaianand1/PokeBoids/commit/22fbb76613f2e7863b576e61da41957c21a017b4))
* improve sidebar footer layout for mobile devices ([11d2854](https://github.com/desaianand1/PokeBoids/commit/11d2854df5a772865c37c14d571fdacd461eb9b0))
* improve simulation panel UX and branding ([0114726](https://github.com/desaianand1/PokeBoids/commit/0114726ea57b1eb0dba621f6ddeb64e9e5a51cf6))
* improve sprite origin positioning and animation handling ([088e92b](https://github.com/desaianand1/PokeBoids/commit/088e92beb4df792e47b2c53bd69351d65a7c1397))
* improve TypeScript interfaces with composition pattern ([5b97f74](https://github.com/desaianand1/PokeBoids/commit/5b97f74e270c3ab87237ddc783b6979a651d76a5))
* initial commit ([1a2761d](https://github.com/desaianand1/PokeBoids/commit/1a2761d495ad23029311e396925c5ff9309d9b15))
* re-added boundary avoidance, fixed tests, improved debug boundary visualization ([a9d43b1](https://github.com/desaianand1/PokeBoids/commit/a9d43b16832a9f1a785a94832c355909c9585a91))
* **sprites:** add sprite configuration for animated Pokémon boids ([b080a34](https://github.com/desaianand1/PokeBoids/commit/b080a343ff3c1bc66cfbae3333ec9e4e8e4afd15))
* **ui:** add boundary settings panel to sim controls ([c011f82](https://github.com/desaianand1/PokeBoids/commit/c011f8251b5e88bb637ddb5c61ec34d461129147))
* **ui:** add credits panel with references and attributions ([c531135](https://github.com/desaianand1/PokeBoids/commit/c5311359c03283a307d4189220d8eaacfc69d088))
* **ui:** add flavor mode toggle controls to simulation panel ([078737c](https://github.com/desaianand1/PokeBoids/commit/078737c592cbc7a0a0f2ebbc260ab0471a78737b))
* update components for Svelte 5 compliance ([dfaec01](https://github.com/desaianand1/PokeBoids/commit/dfaec01c34600e65446b985b1daf19830fe9d87a))
* **utils:** add FoV angle calculation utilities ([d4925bc](https://github.com/desaianand1/PokeBoids/commit/d4925bcca8cdfa6715b205f304515bdafba37bde))
* **vector:** extend Vector interface for FoV calculations ([1be50c2](https://github.com/desaianand1/PokeBoids/commit/1be50c2c02e789e1b2f4541f13bbad1396842040))


### BREAKING CHANGES

* IBoid interface now requires getGroupId() and getAttackRadius() methods
