import { describe, it, expect } from 'vitest';
import { getWavDuration, getMp3DurationEstimate, getAudioDuration } from '../audioDuration';

/**
 * Helper: create a minimal valid WAV buffer (PCM, 16-bit, 44100Hz, mono).
 * durationSec → data chunk size calculated accordingly.
 */
function createWavBuffer(durationSec: number, opts?: {
	sampleRate?: number;
	channels?: number;
	bitsPerSample?: number;
	extraChunks?: { id: string; data: Uint8Array }[];
}): Uint8Array {
	const sampleRate = opts?.sampleRate ?? 44100;
	const channels = opts?.channels ?? 1;
	const bitsPerSample = opts?.bitsPerSample ?? 16;
	const byteRate = sampleRate * channels * (bitsPerSample / 8);
	const dataSize = Math.floor(durationSec * byteRate);

	// Build extra chunks (before data chunk)
	let extraBytes = new Uint8Array(0);
	if (opts?.extraChunks) {
		for (const chunk of opts.extraChunks) {
			const idBytes = new TextEncoder().encode(chunk.id);
			const sizeBuf = new Uint8Array(4);
			new DataView(sizeBuf.buffer).setUint32(0, chunk.data.length, true);
			const combined = new Uint8Array(idBytes.length + 4 + chunk.data.length);
			combined.set(idBytes, 0);
			combined.set(sizeBuf, idBytes.length);
			combined.set(chunk.data, idBytes.length + 4);
			const padded = chunk.data.length % 2 !== 0
				? new Uint8Array(combined.length + 1)
				: combined;
			if (padded !== combined) padded.set(combined);
			const next = new Uint8Array(extraBytes.length + padded.length);
			next.set(extraBytes);
			next.set(padded, extraBytes.length);
			extraBytes = next;
		}
	}

	// WAV header (12) + fmt chunk (24) + extra chunks + data chunk header (8) + data
	const totalSize = 12 + 24 + extraBytes.length + 8 + dataSize;
	const buf = new Uint8Array(totalSize);
	const view = new DataView(buf.buffer);

	// RIFF header
	buf.set([0x52, 0x49, 0x46, 0x46]); // "RIFF"
	view.setUint32(4, totalSize - 8, true);
	buf.set([0x57, 0x41, 0x56, 0x45], 8); // "WAVE"

	// fmt chunk
	buf.set([0x66, 0x6D, 0x74, 0x20], 12); // "fmt "
	view.setUint32(16, 16, true); // chunk size
	view.setUint16(20, 1, true); // PCM format
	view.setUint16(22, channels, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, byteRate, true);
	view.setUint16(32, channels * (bitsPerSample / 8), true); // block align
	view.setUint16(34, bitsPerSample, true);

	// Extra chunks
	let offset = 36;
	if (extraBytes.length > 0) {
		buf.set(extraBytes, offset);
		offset += extraBytes.length;
	}

	// data chunk
	buf.set([0x64, 0x61, 0x74, 0x61], offset); // "data"
	view.setUint32(offset + 4, dataSize, true);

	return buf;
}

describe('getWavDuration', () => {
	it('parses a standard PCM WAV correctly', () => {
		const wav = createWavBuffer(5.0); // 5 seconds
		const dur = getWavDuration(wav);
		expect(dur).toBe(5.0);
	});

	it('parses a 1-second WAV', () => {
		const wav = createWavBuffer(1.0);
		expect(getWavDuration(wav)).toBe(1.0);
	});

	it('parses a 60-second WAV', () => {
		const wav = createWavBuffer(60.0);
		expect(getWavDuration(wav)).toBe(60.0);
	});

	it('parses a 0.5-second WAV (short sample)', () => {
		const wav = createWavBuffer(0.5);
		expect(getWavDuration(wav)).toBe(0.5);
	});

	it('handles different sample rates', () => {
		// 48000Hz, 16-bit, mono → byteRate = 96000
		const wav = createWavBuffer(10.0, { sampleRate: 48000 });
		expect(getWavDuration(wav)).toBe(10.0);
	});

	it('handles stereo WAV', () => {
		// 44100Hz, 16-bit, stereo → byteRate = 176400
		const wav = createWavBuffer(3.0, { channels: 2 });
		expect(getWavDuration(wav)).toBe(3.0);
	});

	it('handles 24-bit WAV', () => {
		const wav = createWavBuffer(2.0, { bitsPerSample: 24 });
		expect(getWavDuration(wav)).toBe(2.0);
	});

	it('handles WAV with extra chunks before data (e.g. fact chunk)', () => {
		// fact chunk contains numSamples (not needed for duration, but common in compressed WAV)
		const factData = new Uint8Array(4);
		new DataView(factData.buffer).setUint32(0, 220500, true); // 5 sec * 44100
		const wav = createWavBuffer(5.0, { extraChunks: [{ id: 'fact', data: factData }] });
		expect(getWavDuration(wav)).toBe(5.0);
	});

	it('handles WAV with LIST chunk (metadata)', () => {
		// LIST chunk is common and appears before data
		const listData = new TextEncoder().encode('INFOIART\x00\x00\x00\x06Artist\x00');
		const wav = createWavBuffer(4.0, { extraChunks: [{ id: 'LIST', data: listData }] });
		expect(getWavDuration(wav)).toBe(4.0);
	});

	it('returns null for data shorter than 44 bytes', () => {
		expect(getWavDuration(new Uint8Array(10))).toBeNull();
		expect(getWavDuration(new Uint8Array(43))).toBeNull();
	});

	it('returns null for empty buffer', () => {
		expect(getWavDuration(new Uint8Array(0))).toBeNull();
	});

	it('returns null for non-WAV data', () => {
		const notWav = new TextEncoder().encode('This is not a WAV file at all!!');
		expect(getWavDuration(notWav)).toBeNull();
	});

	it('returns null for RIFF file that is not WAVE', () => {
		const buf = new Uint8Array(100);
		buf.set([0x52, 0x49, 0x46, 0x46]); // RIFF
		buf.set([0x41, 0x56, 0x49, 0x20], 8); // "AVI " (not WAVE)
		expect(getWavDuration(buf)).toBeNull();
	});

	it('returns null for truncated WAV (header present, data missing)', () => {
		// Valid RIFF+WAVE header but only 30 bytes total
		const buf = new Uint8Array(30);
		buf.set([0x52, 0x49, 0x46, 0x46]); // RIFF
		buf.set([0x57, 0x41, 0x56, 0x45], 8); // WAVE
		expect(getWavDuration(buf)).toBeNull();
	});

	it('handles WAV with zero byte rate (corrupt fmt)', () => {
		// Manually craft WAV with byteRate=0
		const buf = new Uint8Array(100);
		buf.set([0x52, 0x49, 0x46, 0x46]); // RIFF
		buf.set([0x57, 0x41, 0x56, 0x45], 8); // WAVE
		buf.set([0x66, 0x6D, 0x74, 0x20], 12); // fmt
		// byteRate at offset 28 = 0 (default)
		buf.set([0x64, 0x61, 0x74, 0x61], 36); // data
		expect(getWavDuration(buf)).toBeNull();
	});
});

describe('getMp3DurationEstimate', () => {
	it('estimates duration for typical MP3 at 128kbps', () => {
		// 1MB file at 128kbps ≈ 64 seconds
		const dur = getMp3DurationEstimate(1024 * 1024);
		expect(dur).toBeCloseTo(65.5, 0); // 1048576 / 16000 ≈ 65.5
	});

	it('returns null for files smaller than 1KB', () => {
		expect(getMp3DurationEstimate(500)).toBeNull();
		expect(getMp3DurationEstimate(1023)).toBeNull();
	});

	it('handles exact 1KB boundary', () => {
		const dur = getMp3DurationEstimate(1024);
		expect(dur).toBeCloseTo(0.1, 0);
	});

	it('estimates for large file (10MB)', () => {
		// 10MB at 128kbps ≈ 655 seconds ≈ 10:55
		const dur = getMp3DurationEstimate(10 * 1024 * 1024);
		expect(dur).toBeGreaterThan(600);
	});

	it('estimates for small file (100KB)', () => {
		const dur = getMp3DurationEstimate(100 * 1024);
		expect(dur).toBeGreaterThan(6);
		expect(dur).toBeLessThan(7);
	});
});

describe('getAudioDuration', () => {
	it('routes .wav to WAV parser', () => {
		const wav = createWavBuffer(3.0);
		expect(getAudioDuration(wav, 'kick.wav')).toBe(3.0);
	});

	it('routes .WAV (uppercase) to WAV parser', () => {
		const wav = createWavBuffer(2.0);
		expect(getAudioDuration(wav, 'KICK.WAV')).toBe(2.0);
	});

	it('routes .mp3 to MP3 estimator', () => {
		const dur = getAudioDuration(new Uint8Array(16000), 'beat.mp3');
		expect(dur).toBeCloseTo(1.0, 0);
	});

	it('returns null for .flac (unsupported)', () => {
		expect(getAudioDuration(new Uint8Array(10000), 'track.flac')).toBeNull();
	});

	it('returns null for .ogg (unsupported)', () => {
		expect(getAudioDuration(new Uint8Array(10000), 'loop.ogg')).toBeNull();
	});

	it('returns null for .m4a (unsupported)', () => {
		expect(getAudioDuration(new Uint8Array(10000), 'vocal.m4a')).toBeNull();
	});

	it('handles filename with path separators', () => {
		const wav = createWavBuffer(1.5);
		expect(getAudioDuration(wav, 'samples/kick.wav')).toBe(1.5);
	});
});
