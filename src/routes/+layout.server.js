import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

injectSpeedInsights();

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals }) {
	return { user: locals.user ?? undefined };
}
