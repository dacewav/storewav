/**
 * Player store — estado del reproductor de audio
 *
 * No necesita Firebase. Estado local reactivo.
 */

import { writable, derived } from 'svelte/store';

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

function getAudio(): HTMLAudioElement {
	if (!audio) {
		audio = new Audio();
		audio.volume = DEFAULT.volume;

		audio.addEventListener('timeupdate', () => {
			store.update((s) => ({ ...s, currentTime: audio!.currentTime }));
		});

		audio.addEventListener('loadedmetadata', () => {
			store.update((s) => ({ ...s, duration: audio!.duration }));
		});

		audio.addEventListener('ended', () => {
			store.update((s) => ({ ...s, playing: false }));
		});
	}
	return audio;
}

function play(beat: { id: string; title: string; artist: string; coverUrl: string; audioUrl: string }) {
	const a = getAudio();

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
	getAudio().pause();
	store.update((s) => ({ ...s, playing: false }));
}

function resume() {
	getAudio().play();
	store.update((s) => ({ ...s, playing: true }));
}

function seek(time: number) {
	const a = getAudio();
	a.currentTime = time;
}

function setVolume(vol: number) {
	const a = getAudio();
	a.volume = vol;
	store.update((s) => ({ ...s, volume: vol, muted: vol === 0 }));
}

function toggleMute() {
	const a = getAudio();
	a.muted = !a.muted;
	store.update((s) => ({ ...s, muted: a!.muted }));
}

function stop() {
	const a = getAudio();
	a.pause();
	a.src = '';
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
