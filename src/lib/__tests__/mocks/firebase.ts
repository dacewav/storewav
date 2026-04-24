// Mock for $lib/firebase — used by vitest
export async function getDb() { return null; }
export async function getAuthInstance() { return null; }
export async function getStorageInstance() { return null; }
export async function getApp() { return null; }
export function isFirebaseReady() { return false; }
export function getFirebaseError() { return null; }
