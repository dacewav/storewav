/**
 * Floating elements store — elementos flotantes sobre la tienda
 *
 * Firebase path: floatingElements/
 * Estructura: Record<string, FloatingElement>
 */

import { writable, derived } from 'svelte/store';
import { getDb } from '$lib/firebase';

export type FloatingElementType = 'image' | 'text';

export type FloatingAnimation = 'none' | 'float' | 'pulse' | 'bounce' | 'spin' | 'drift';

export interface FloatingElement {
	id: string;
	type: FloatingElementType;
	content: string;         // URL para image, texto para text
	x: number;               // posición X (0-100%)
	y: number;               // posición Y (0-100%)
	width: number;           // ancho en px
	height: number;          // alto en px (0 = auto para text)
	opacity: number;         // 0-1
	rotation: number;        // grados
	zIndex: number;          // capa
	animation: FloatingAnimation;
	animationDuration: number; // segundos
	visible: boolean;
	/** Solo mostrar en desktop */
	desktopOnly: boolean;
	/** Solo mostrar en mobile */
	mobileOnly: boolean;
}

type FloatingMap = Record<string, FloatingElement>;

const store = writable<FloatingMap>({});
const loading = writable(true);
const error = writable<string | null>(null);

let unsub: (() => void) | null = null;
let refCount = 0;

/** Generar ID corto */
function genId(): string {
	return 'fl_' + Math.random().toString(36).slice(2, 8);
}

/** Elemento por defecto */
export function defaultElement(overrides?: Partial<FloatingElement>): FloatingElement {
	return {
		id: genId(),
		type: 'text',
		content: '✨',
		x: 80,
		y: 20,
		width: 60,
		height: 10,
		opacity: 0.6,
		rotation: 0,
		zIndex: 5,
		animation: 'float',
		animationDuration: 4,
		visible: true,
		desktopOnly: false,
		mobileOnly: false,
		...overrides,
	};
}

/** Suscribirse a Firebase */
export async function initFloating() {
	refCount++;
	if (refCount > 1) return;

	try {
		const db = await getDb();
		if (!db) {
			loading.set(false);
			error.set('Firebase no inicializado');
			return;
		}

		const { ref, onValue } = await import('firebase/database');
		const dbRef = ref(db, 'floatingElements');

		unsub = onValue(
			dbRef,
			(snap) => {
				store.set(snap.val() ?? {});
				loading.set(false);
				error.set(null);
			},
			(err) => {
				console.error('[Store:floating]', err.message);
				loading.set(false);
				error.set(err.message);
			}
		);
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		loading.set(false);
		error.set(msg);
	}
}

/** Desuscribirse */
export function destroyFloating() {
	refCount = Math.max(0, refCount - 1);
	if (refCount === 0 && unsub) {
		unsub();
		unsub = null;
	}
}

/** Crear elemento */
export async function createFloatingElement(el?: Partial<FloatingElement>): Promise<string> {
	const element = defaultElement(el);
	const db = await getDb();
	if (!db) throw new Error('Firebase no inicializado');

	const { ref, set: fbSet } = await import('firebase/database');
	await fbSet(ref(db, `floatingElements/${element.id}`), element);
	return element.id;
}

/** Actualizar elemento */
export async function updateFloatingElement(id: string, patch: Partial<FloatingElement>): Promise<void> {
	const db = await getDb();
	if (!db) throw new Error('Firebase no inicializado');

	const { ref, update } = await import('firebase/database');
	await update(ref(db, `floatingElements/${id}`), patch);
}

/** Eliminar elemento */
export async function deleteFloatingElement(id: string): Promise<void> {
	const db = await getDb();
	if (!db) throw new Error('Firebase no inicializado');

	const { ref, remove } = await import('firebase/database');
	await remove(ref(db, `floatingElements/${id}`));
}

/** Toggle visibilidad */
export async function toggleFloatingVisibility(id: string, visible: boolean): Promise<void> {
	await updateFloatingElement(id, { visible });
}

/** Lista de elementos (derived) */
export const floatingElements = derived(store, ($s) =>
	Object.values($s).sort((a, b) => a.zIndex - b.zIndex)
);

/** Solo elementos visibles */
export const visibleFloatingElements = derived(floatingElements, ($els) =>
	$els.filter((el) => el.visible)
);

export { store as floatingStore, loading as floatingLoading, error as floatingError };
