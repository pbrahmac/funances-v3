/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
	const expense_types = await event.locals.pb.collection('expense_types').getFullList();
	return { expense_types };
};
