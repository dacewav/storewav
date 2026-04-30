/**
 * Shared Firebase Database URL constant.
 * Uses the PUBLIC_FIREBASE_DATABASE_URL env var, falls back to project default.
 */
import { PUBLIC_FIREBASE_DATABASE_URL } from '$env/static/public';

export const FIREBASE_DB = PUBLIC_FIREBASE_DATABASE_URL || 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';
