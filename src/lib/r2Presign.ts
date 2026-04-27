/**
 * R2 Presigned URL generator — AWS SDK v3
 * Generates time-limited download URLs for R2 objects.
 */

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let _s3: S3Client | null = null;

function getS3Client(env: {
	R2_ACCOUNT_ID: string;
	R2_ACCESS_KEY_ID: string;
	R2_SECRET_ACCESS_KEY: string;
}): S3Client {
	if (!_s3) {
		_s3 = new S3Client({
			region: 'auto',
			endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId: env.R2_ACCESS_KEY_ID,
				secretAccessKey: env.R2_SECRET_ACCESS_KEY,
			},
		});
	}
	return _s3;
}

/**
 * Generate a presigned GET URL for an R2 object.
 * @param bucket - R2 bucket name (e.g. "dace-beats")
 * @param key - Object key (e.g. "beats/abc123.mp3")
 * @param env - R2 credentials from Cloudflare env
 * @param expiresIn - URL validity in seconds (default 3600 = 1h)
 */
export async function getPresignedDownloadUrl(
	bucket: string,
	key: string,
	env: {
		R2_ACCOUNT_ID: string;
		R2_ACCESS_KEY_ID: string;
		R2_SECRET_ACCESS_KEY: string;
	},
	expiresIn = 3600
): Promise<string> {
	const s3 = getS3Client(env);
	const command = new GetObjectCommand({
		Bucket: bucket,
		Key: key,
	});
	return getSignedUrl(s3, command, { expiresIn });
}

/**
 * Extract R2 object key from a cdn.dacewav.store URL.
 * E.g. "https://cdn.dacewav.store/beats/abc.mp3" → "beats/abc.mp3"
 */
export function r2KeyFromUrl(url: string): string | null {
	try {
		const u = new URL(url);
		return u.pathname.slice(1) || null;
	} catch {
		return null;
	}
}
