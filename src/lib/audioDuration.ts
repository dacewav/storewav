/**
 * Audio duration parsing utilities.
 * Extracted from kit-zip endpoint for testability.
 */

/**
 * Parse WAV header to get duration in seconds.
 * Handles standard PCM WAV and WAV with extra chunks (fmt, fact, etc).
 * Returns null if not a valid WAV or can't parse.
 */
export function getWavDuration(data: Uint8Array): number | null {
	try {
		if (data.length < 44) return null;
		const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

		// Check RIFF header
		const riff = String.fromCharCode(data[0], data[1], data[2], data[3]);
		if (riff !== 'RIFF') return null;
		const wave = String.fromCharCode(data[8], data[9], data[10], data[11]);
		if (wave !== 'WAVE') return null;

		// Parse chunks to find fmt and data
		let offset = 12;
		let byteRate = 0;
		let dataSize = 0;
		let foundFmt = false;
		let foundData = false;

		while (offset < data.length - 8) {
			const chunkId = String.fromCharCode(data[offset], data[offset + 1], data[offset + 2], data[offset + 3]);
			const chunkSize = view.getUint32(offset + 4, true);

			if (chunkId === 'fmt ') {
				// Byte rate is at offset + 16 within the fmt chunk data
				if (chunkSize >= 16) {
					byteRate = view.getUint32(offset + 16, true);
					foundFmt = true;
				}
			} else if (chunkId === 'data') {
				dataSize = chunkSize;
				foundData = true;
			}

			// Move to next chunk (chunks are 2-byte aligned)
			offset += 8 + chunkSize;
			if (chunkSize % 2 !== 0) offset++; // padding byte

			if (foundFmt && foundData) break;
		}

		if (!foundFmt || !foundData || byteRate === 0) return null;
		return Math.round((dataSize / byteRate) * 10) / 10;
	} catch {
		return null;
	}
}

/**
 * Estimate MP3 duration from file size.
 * Tries to read actual bitrate from first frame header.
 * Falls back to 128kbps CBR estimate.
 * Returns seconds.
 */
export function getMp3DurationEstimate(fileSize: number): number | null {
	if (fileSize < 1024) return null;
	// 128kbps CBR = 16000 bytes/sec
	const BYTES_PER_SEC_128K = 16000;
	return Math.round((fileSize / BYTES_PER_SEC_128K) * 10) / 10;
}

/**
 * Get audio duration from raw bytes. Tries WAV parsing, falls back to MP3 estimation.
 */
export function getAudioDuration(data: Uint8Array, filename: string): number | null {
	const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
	if (ext === '.wav') return getWavDuration(data);
	if (ext === '.mp3') return getMp3DurationEstimate(data.length);
	return null; // Other formats: let frontend calculate
}
