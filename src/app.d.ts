// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type PocketBase from 'pocketbase';
import { BaseModel } from 'pocketbase';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			pb: PocketBase;
			user: BaseModel | undefined;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
