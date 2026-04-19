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

// Lazy init — only on client side (Firebase SDK doesn't work in Workers SSR)
let _app: any = null;
let _db: any = null;
let _auth: any = null;

async function initFirebase() {
	if (!browser) return;
	if (_app) return;

	const { initializeApp, getApps } = await import('firebase/app');
	const { getDatabase } = await import('firebase/database');
	const { getAuth } = await import('firebase/auth');

	_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
	_db = getDatabase(_app);
	_auth = getAuth(_app);
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
