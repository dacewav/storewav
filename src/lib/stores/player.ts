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
	title: string;
	artist: string;
	coverUrl: string;
	audioUrl: string;
	currentTime: number;
	duration: number;
	volume: number;
	muted: boolean;
};

const DEFAULT: PlayerState = {
	playing: false,
	beatId: null,
	title: '',
	artist: '',
	coverUrl: '',
	audioUrl: '',
	currentTime: 0,
	duration: 0,
	volume: 0.8,
	muted: false
};

const store = writable<PlayerState>(DEFAULT);
let audio: HTMLAudioElement | null = null;
let audioListenersAttached = false;

function getAudio(): HTMLAudioElement | null {
	if (!audio && browser) {
		audio = new Audio();
		audio.volume = DEFAULT.volume;
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

function attachAudioListeners() {
	if (!audio || audioListenersAttached) return;
	audioListenersAttached = true;
	audio.addEventListener('timeupdate', onTimeUpdate);
	audio.addEventListener('loadedmetadata', onLoadedMetadata);
	audio.addEventListener('ended', onEnded);
}

/** Cleanup listeners (para hot reload / SPA navigation) */
function detachAudioListeners() {
	if (!audio || !audioListenersAttached) return;
	audio.removeEventListener('timeupdate', onTimeUpdate);
	audio.removeEventListener('loadedmetadata', onLoadedMetadata);
	audio.removeEventListener('ended', onEnded);
	audioListenersAttached = false;
}

function play(beat: { id: string; title: string; artist: string; coverUrl: string; audioUrl: string }) {
	const a = getAudio();
	if (!a) return; // SSR guard

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
	a.play();
	store.update((s) => ({
		...s,
		playing: true,
		beatId: beat.id,
		title: beat.title,
		artist: beat.artist,
		coverUrl: beat.coverUrl,
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
