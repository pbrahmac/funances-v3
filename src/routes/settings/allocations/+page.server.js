/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
	const allocations = await event.locals.pb.collection('allocations').getFullList();
	return { allocations };
};
