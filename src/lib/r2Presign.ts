/**
 * R2 Presigned URL generator — AWS SDK v3
 * Generates time-limited download URLs for R2 objects.
 *
 * AWS SDK is loaded dynamically to avoid bloating the worker bundle.
 */

let _s3: any = null;
let _sdkLoaded = false;
let _sdkPromise: Promise<any> | null = null;

async function loadSDK() {
	if (_sdkLoaded) return;
	if (!_sdkPromise) {
		_sdkPromise = Promise.all([
			import('@aws-sdk/client-s3'),
			import('@aws-sdk/s3-request-presigner'),
		]).then(([s3, presigner]) => {
			_sdkLoaded = true;
			return { S3Client: s3.S3Client, GetObjectCommand: s3.GetObjectCommand, getSignedUrl: presigner.getSignedUrl };
		});
	}
	return _sdkPromise;
}

async function getS3Client(env: {
	R2_ACCOUNT_ID: string;
	R2_ACCESS_KEY_ID: string;
	R2_SECRET_ACCESS_KEY: string;
}): Promise<any> {
	if (!_s3) {
		const sdk = await loadSDK();
		if (!sdk) throw new Error('Failed to load AWS SDK');
		_s3 = new sdk.S3Client({
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
	const sdk = await loadSDK();
	if (!sdk) throw new Error('Failed to load AWS SDK');
	const s3 = await getS3Client(env);
	const command = new sdk.GetObjectCommand({
		Bucket: bucket,
		Key: key,
	});
	return sdk.getSignedUrl(s3, command, { expiresIn });
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

/**
 * Sanitize a filename for safe Content-Disposition headers.
 * Strips special characters, limits length.
 */
export function sanitizeFilename(name: string): string {
	return name
		.replace(/[^\w\s.-]/g, '')
		.replace(/\s+/g, '_')
		.slice(0, 80);
}
