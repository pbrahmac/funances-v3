/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
	async function getAllocations() {
		const rawAllocations = await event.locals.pb.collection('allocations').getFullList();
		return rawAllocations;
	}

	return { allocations: getAllocations() };
}
