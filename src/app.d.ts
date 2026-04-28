// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env?: {
				MEDIA: R2Bucket;
				STRIPE_SECRET_KEY?: string;
				STRIPE_WEBHOOK_SECRET?: string;
				RESEND_API_KEY?: string;
			};
			context?: {
				waitUntil(promise: Promise<unknown>): void;
			};
		}
	}

	// FedCM API types (not yet in standard TS DOM lib)
	interface IdentityCredential extends Credential {
		token?: string;
	}

	interface IdentityCredentialRequestOptions extends CredentialRequestOptions {
		identity?: {
			context?: 'signin' | 'signup' | 'use';
			providers: Array<{
				configURL: string;
				clientId: string;
				hint?: string;
			}>;
			mode?: 'active' | 'passive';
		};
	}

	interface Window {
		google?: {
			accounts?: {
				id?: {
					initialize(config: object): void;
					prompt(callback?: (notification: object) => void): void;
					cancel(): void;
				};
			};
		};
	}
}

export {};
