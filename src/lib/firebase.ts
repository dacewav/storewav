import { browser } from '$app/environment';
import {
	PUBLIC_FIREBASE_API_KEY,
	PUBLIC_FIREBASE_AUTH_DOMAIN,
	PUBLIC_FIREBASE_DATABASE_URL,
	PUBLIC_FIREBASE_PROJECT_ID,
	PUBLIC_FIREBASE_STORAGE_BUCKET,
	PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	PUBLIC_FIREBASE_APP_ID
} from '$env/static/public';

const firebaseConfig = {
	apiKey: PUBLIC_FIREBASE_API_KEY,
	authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
	databaseURL: PUBLIC_FIREBASE_DATABASE_URL,
	projectId: PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: PUBLIC_FIREBASE_APP_ID
};

/** Valida que las env vars existan antes de intentar init */
function validateConfig() {
	const required = Object.entries(firebaseConfig);
	const missing = required.filter(([, v]) => !v).map(([k]) => k);
	if (missing.length > 0) {
		console.error(
			`[Firebase] Variables de entorno faltantes: ${missing.join(', ')}\n` +
			`→ Copia .env.example a .env y completa los valores.`
		);
		return false;
	}
	return true;
}

// Lazy init — only on client side (Firebase SDK doesn't work in Workers SSR)
let _app: any = null;
let _db: any = null;
let _auth: any = null;
let _initError: Error | null = null;

async function initFirebase() {
	if (!browser) return;
	if (_app) return;
	if (_initError) throw _initError;

	if (!validateConfig()) {
		_initError = new Error('Firebase config incompleta — revisa .env');
		throw _initError;
	}

	try {
		const { initializeApp, getApps } = await import('firebase/app');
		const { getDatabase } = await import('firebase/database');
		const { getAuth } = await import('firebase/auth');

		_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
		_db = getDatabase(_app);
		_auth = getAuth(_app);
	} catch (err) {
		_initError = err instanceof Error ? err : new Error(String(err));
		console.error('[Firebase] Error de inicialización:', _initError.message);
		throw _initError;
	}
}

export async function getDb() {
	await initFirebase();
	return _db;
}

export async function getAuthInstance() {
	await initFirebase();
	return _auth;
}

export async function getApp() {
	await initFirebase();
	return _app;
}

/** ¿Firebase se inicializó correctamente? */
export function isFirebaseReady() {
	return _app !== null && _initError === null;
}

/** Último error de init (si lo hubo) */
export function getFirebaseError() {
	return _initError;
}
