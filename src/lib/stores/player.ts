/**
 * Player store — estado del reproductor de audio
 *
 * No necesita Firebase. Estado local reactivo.
 */

import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export type PlayerState = {
	playing: boolean;
	beatId: string | null;
	name: string;
	artist: string;
	imageUrl: string;
	audioUrl: string;
	currentTime: number;
	duration: number;
	volume: number;
	muted: boolean;
};

/** Load persisted volume from localStorage */
function loadVolume(): number {
	if (!browser) return 0.8;
	try {
		const saved = localStorage.getItem('player-volume');
		if (saved !== null) {
			const v = parseFloat(saved);
			if (!isNaN(v) && v >= 0 && v <= 1) return v;
		}
	} catch {}
	return 0.8;
}

const DEFAULT: PlayerState = {
	playing: false,
	beatId: null,
	name: '',
	artist: '',
	imageUrl: '',
	audioUrl: '',
	currentTime: 0,
	duration: 0,
	volume: loadVolume(),
	muted: false
};

const store = writable<PlayerState>(DEFAULT);
let audio: HTMLAudioElement | null = null;
let audioListenersAttached = false;

function getAudio(): HTMLAudioElement | null {
	if (!audio && browser) {
		audio = new Audio();
		audio.volume = loadVolume();
		attachAudioListeners();
	}
	return audio;
}

/** Throttled timeupdate — update store max every 200ms */
let lastTimeUpdate = 0;
function onTimeUpdate() {
	const now = Date.now();
	if (now - lastTimeUpdate < 200 && audio!.currentTime !== audio!.duration) return;
	lastTimeUpdate = now;
	store.update((s) => ({ ...s, currentTime: audio!.currentTime }));
}

function onLoadedMetadata() {
	store.update((s) => ({ ...s, duration: audio!.duration }));
}

function onEnded() {
	store.update((s) => ({ ...s, playing: false }));
}

function onError() {
	store.update((s) => ({ ...s, playing: false }));
	console.warn('[Player] Error de audio — posible problema de red');
}

function attachAudioListeners() {
	if (!audio || audioListenersAttached) return;
	audioListenersAttached = true;
	audio.addEventListener('timeupdate', onTimeUpdate);
	audio.addEventListener('loadedmetadata', onLoadedMetadata);
	audio.addEventListener('ended', onEnded);
	audio.addEventListener('error', onError);
}

/** Cleanup listeners (para hot reload / SPA navigation) */
function detachAudioListeners() {
	if (!audio || !audioListenersAttached) return;
	audio.removeEventListener('timeupdate', onTimeUpdate);
	audio.removeEventListener('loadedmetadata', onLoadedMetadata);
	audio.removeEventListener('ended', onEnded);
	audio.removeEventListener('error', onError);
	audioListenersAttached = false;
}

/** Shared Web Audio API — singleton for waveform visualization */
let sharedAudioCtx: AudioContext | null = null;
let sharedAnalyser: AnalyserNode | null = null;
let sharedSourceNode: MediaElementAudioSourceNode | null = null;

/**
 * Ensure the shared AudioContext + AnalyserNode exists.
 * MUST be called from a user gesture context (click handler)
 * so the AudioContext is not suspended.
 */
function ensureAudioContext() {
	if (!browser || sharedAudioCtx) return;
	const a = getAudio();
	if (!a) return;

	try {
		sharedAudioCtx = new AudioContext();
		sharedAnalyser = sharedAudioCtx.createAnalyser();
		sharedAnalyser.fftSize = 256;
		sharedAnalyser.smoothingTimeConstant = 0.75;
		sharedSourceNode = sharedAudioCtx.createMediaElementSource(a);
		sharedSourceNode.connect(sharedAnalyser);
		sharedAnalyser.connect(sharedAudioCtx.destination);
	} catch {
		// Already connected or unsupported — silent fail
	}
}

/**
 * Get the shared AnalyserNode (read-only, does NOT create).
 * Returns null if AudioContext hasn't been initialized yet.
 */
export function getSharedAnalyser(fftBars: number): AnalyserNode | null {
	if (!sharedAnalyser) return null;
	sharedAnalyser.fftSize = fftBars * 4;
	return sharedAnalyser;
}

function play(beat: { id: string; name: string; artist: string; imageUrl: string; audioUrl: string; genre?: string }, retries = 2) {
	const a = getAudio();
	if (!a) return; // SSR guard

	// Si no hay audioUrl, no intentar reproducir
	if (!beat.audioUrl) {
		console.warn('[Player] Beat sin audio:', beat.name);
		store.update((s) => ({ ...s, playing: false }));
		return;
	}

	// Init Web Audio API on user gesture (play click)
	ensureAudioContext();
	if (sharedAudioCtx?.state === 'suspended') {
		sharedAudioCtx.resume();
	}

	// Track recently played (lazy import to avoid circular deps)
	if (beat.genre) {
		import('./recentlyPlayed').then(({ recentlyPlayed }) => {
			recentlyPlayed.add({
				id: beat.id,
				name: beat.name,
				artist: beat.artist,
				imageUrl: beat.imageUrl,
				genre: beat.genre!
			});
		}).catch(() => {});
	}

	// Si es el mismo beat, toggle play/pause
	let currentBeatId: string | null = null;
	store.subscribe((s) => { currentBeatId = s.beatId; })();

	if (currentBeatId === beat.id && !a.paused) {
		a.pause();
		store.update((s) => ({ ...s, playing: false }));
		return;
	}

	// Nuevo beat
	a.src = beat.audioUrl;

	let attempt = 0;
	function tryPlay() {
		if (!a) return;
		const playPromise = a.play();
		if (playPromise !== undefined) {
			playPromise.catch((err) => {
				// AbortError = user navigated away, no es un error real
				if (err.name === 'AbortError') return;
				if (attempt < retries) {
					attempt++;
					setTimeout(() => tryPlay(), 500 * attempt);
				} else {
					console.warn('[Player] No se pudo reproducir:', beat.name, err.message);
					store.update((s) => ({ ...s, playing: false }));
				}
			});
		}
	}

	// Timeout: if metadata doesn't load in 10s, abort
	const timeoutId = setTimeout(() => {
		if (a.readyState < 2) { // HAVE_CURRENT_DATA
			a.pause();
			a.src = '';
			store.update((s) => ({ ...s, playing: false }));
			console.warn('[Player] Timeout cargando audio:', beat.name);
		}
	}, 10_000);

	// Clear timeout once metadata loads (one-shot wrapper)
	const onMetaWithTimeout = () => {
		clearTimeout(timeoutId);
		onLoadedMetadata();
		a.removeEventListener('loadedmetadata', onMetaWithTimeout);
	};
	a.removeEventListener('loadedmetadata', onLoadedMetadata);
	a.addEventListener('loadedmetadata', onMetaWithTimeout);

	tryPlay();

	store.update((s) => ({
		...s,
		playing: true,
		beatId: beat.id,
		name: beat.name,
		artist: beat.artist,
		imageUrl: beat.imageUrl,
		audioUrl: beat.audioUrl
	}));
}

function pause() {
	const a = getAudio();
	if (!a) return;
	a.pause();
	store.update((s) => ({ ...s, playing: false }));
}

function resume() {
	const a = getAudio();
	if (!a) return;
	if (sharedAudioCtx?.state === 'suspended') {
		sharedAudioCtx.resume();
	}
	a.play();
	store.update((s) => ({ ...s, playing: true }));
}

function seek(time: number) {
	const a = getAudio();
	if (!a) return;
	a.currentTime = time;
}

function setVolume(vol: number) {
	const a = getAudio();
	if (!a) return;
	a.volume = vol;
	store.update((s) => ({ ...s, volume: vol, muted: vol === 0 }));
	try { localStorage.setItem('player-volume', String(vol)); } catch {}
}

function toggleMute() {
	const a = getAudio();
	if (!a) return;
	a.muted = !a.muted;
	store.update((s) => ({ ...s, muted: a.muted }));
}

function stop() {
	const a = getAudio();
	if (!a) return;
	a.pause();
	detachAudioListeners();
	a.src = '';
	audio = null;
	store.set(DEFAULT);
}

export const player = {
	subscribe: store.subscribe,
	play,
	pause,
	resume,
	seek,
	setVolume,
	toggleMute,
	stop,
	/** Exponer el Audio element interno (para waveform live, etc.) */
	getAudioElement: () => getAudio(),
	/** Get shared analyser for waveform visualization (read-only, no creation) */
	getAnalyser: getSharedAnalyser,
	/** Progreso 0-1 */
	progress: derived(store, ($s) => ($s.duration > 0 ? $s.currentTime / $s.duration : 0)),
	/** Tiempo formateado */
	timeFormatted: derived(store, ($s) => ({
		current: formatTime($s.currentTime),
		total: formatTime($s.duration)
	}))
};

function formatTime(sec: number): string {
	if (!sec || !isFinite(sec)) return '0:00';
	const m = Math.floor(sec / 60);
	const s = Math.floor(sec % 60);
	return `${m}:${s.toString().padStart(2, '0')}`;
}
