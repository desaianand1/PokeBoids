/**
 * Onboarding state management using Svelte 5 runes
 */

const STORAGE_KEY = 'pokeboids-has-seen-welcome';

class OnboardingStore {
	private _drawerOpen = $state(false);
	private _hasSeenWelcome = $state(false);
	private _dontShowAgain = $state(false);
	private _gameReady = $state(false);
	private _isRestartTriggered = $state(false);

	constructor() {
		// Check localStorage on initialization
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem(STORAGE_KEY);
			this._hasSeenWelcome = stored === 'true';
		}
	}

	get drawerOpen() {
		return this._drawerOpen;
	}

	set drawerOpen(value: boolean) {
		this._drawerOpen = value;
	}

	get hasSeenWelcome() {
		return this._hasSeenWelcome;
	}

	get dontShowAgain() {
		return this._dontShowAgain;
	}

	set dontShowAgain(value: boolean) {
		this._dontShowAgain = value;
	}

	get gameReady() {
		return this._gameReady;
	}

	setGameReady() {
		this._gameReady = true;
	}

	showWelcomeIfNeeded() {
		if (
			!this._hasSeenWelcome &&
			!this._drawerOpen &&
			this._gameReady &&
			!this._isRestartTriggered
		) {
			this.openDrawer();
		}
	}

	openDrawer() {
		this._drawerOpen = true;
	}

	openFromHelp() {
		// Always allow opening from help button, regardless of other flags
		this._drawerOpen = true;
	}

	closeDrawer() {
		this._drawerOpen = false;

		// If user checked "don't show again", save to localStorage
		if (this._dontShowAgain && !this._hasSeenWelcome) {
			this.markAsSeen();
		}
	}

	setRestartTriggered() {
		this._isRestartTriggered = true;
	}

	clearRestartFlag() {
		this._isRestartTriggered = false;
	}

	markAsSeen() {
		this._hasSeenWelcome = true;
		if (typeof window !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, 'true');
		}
	}

	resetOnboarding() {
		this._hasSeenWelcome = false;
		this._dontShowAgain = false;
		this._isRestartTriggered = false;
		if (typeof window !== 'undefined') {
			localStorage.removeItem(STORAGE_KEY);
		}
	}
}

// Export singleton instance
export const onboardingStore = new OnboardingStore();
