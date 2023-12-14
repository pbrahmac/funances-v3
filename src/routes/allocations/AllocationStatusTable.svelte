<script lang="ts">
	import { enhance } from '$app/forms';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Table from '$lib/components/ui/table';
	import { monthIdxToName } from '$lib/utils';

	// props
	export let allocationNames: {
		id: string;
		allocation: string;
	}[];
	export let monthIdxs: number[];
	export let eachMonthAllocationStatus: Map<number, Map<string, { id: string; status: boolean }>>;

	// create 2D array of form objects for the DOM object to bind to
	const forms = [...Array(monthIdxs.length).keys()].map(() =>
		[...Array(allocationNames.length).keys()].map(() => {
			let form: any;
			return form;
		})
	);
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head />
			{#each allocationNames as name}
				<Table.Head class="text-center">{name.allocation}</Table.Head>
			{/each}
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each monthIdxs as idx}
			<Table.Row>
				<Table.Cell class="text-muted-foreground font-medium text-left">
					{monthIdxToName(idx, 'long')}
				</Table.Cell>
				{#each allocationNames as name, idy}
					<Table.Cell>
						<!-- {@const form = undefined} -->
						<div class="flex justify-center">
							<form action="?/updateChecked" method="post" bind:this={forms[idx][idy]} use:enhance>
								<input
									type="hidden"
									name="id"
									value={eachMonthAllocationStatus.get(idx)?.get(name.allocation)?.id}
								/>
								<input type="hidden" name="month" value={idx + 1} />
								<input type="hidden" name="allocation_id" value={name.id} />
								<Checkbox
									on:click={() => forms[idx][idy].requestSubmit()}
									checked={eachMonthAllocationStatus.get(idx)?.get(name.allocation)?.status}
									class="border-negative data-[state=checked]:bg-affirmative data-[state=checked]:text-white data-[state=checked]:border-affirmative"
								/>
							</form>
						</div>
					</Table.Cell>
				{/each}
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
