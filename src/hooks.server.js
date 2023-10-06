import Pocketbase from 'pocketbase';
import { SECRET_DATABASE_ROOT_URL } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import { serializeNonPOJOs } from '$lib/utils';

export const handle = async ({ event, resolve }) => {
	event.locals.pb = new Pocketbase(SECRET_DATABASE_ROOT_URL);
	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	// check for authenticated user
	try {
		if (event.locals.pb.authStore.isValid) {
			await event.locals.pb.collection('users').authRefresh();
			event.locals.user = serializeNonPOJOs(event.locals.pb.authStore.model);
		}
	} catch (_) {
		event.locals.pb.authStore.clear();
		event.locals.user = undefined;
	}

	// protect routes
	if (!event.locals.user) {
		if (!['/signin', '/signup'].includes(event.url.pathname)) {
			throw redirect(303, '/signin');
		}
	}

	const response = await resolve(event);
	// setting secure to false allows logging into app from the network (not just localhost)
	response.headers.set('set-cookie', event.locals.pb.authStore.exportToCookie());

	return response;
};
