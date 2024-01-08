<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import * as Popover from '$lib/components/ui/popover';
	import { editExpenseSchema } from '$lib/schemas/editExpense';
	import { cn, formatDatepickerString } from '$lib/utils';
	import {
		DateFormatter,
		getLocalTimeZone,
		parseDate,
		today,
		type DateValue
	} from '@internationalized/date';
	import { Calendar as CalendarIcon } from 'radix-icons-svelte';
	import { writable, type Writable } from 'svelte/store';
	import type { PageData } from './$types';
	import { applyAction, enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';

	// props
	export let data: PageData;

	// date picker setup
	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});
	const currDateStr = formatDatepickerString(new Date(data.expense.date));
	const formStore: Writable<string | undefined> = writable();
	let value: DateValue | undefined = parseDate(currDateStr);

	onMount(async () => {
		$formStore = value?.toString();
	});

	// progressive enhancement functions
	const submitEditExpense: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type == 'success') {
				await invalidateAll();
				console.log('success');
			} else {
				console.log('Something went wrong: ', result.type, result.status);
			}
			await applyAction(result);
		};
	};
</script>

<svelte:head>
	<title>Edit Expense</title>
</svelte:head>

<div class="fullPageContainer p-6 flex items-center justify-center">
	<Card.Root class="max-w-xl">
		<Card.Header>
			<Card.Title>Edit Expense</Card.Title>
		</Card.Header>
		<Form.Root form={data.form} schema={editExpenseSchema} let:config asChild>
			<form method="post" class="m-2 w-96" use:enhance={submitEditExpense}>
				<Card.Content>
					<input type="hidden" name="expenseId" value={data.expense?.id} />
					<Form.Field {config} name="date">
						<Form.Item class="flex flex-col items-start">
							<Form.Label>Date</Form.Label>
							<Popover.Root>
								<Popover.Trigger asChild let:builder>
									<Button
										variant="outline"
										class={cn(
											'justify-start text-left font-normal',
											!value && 'text-muted-foreground'
										)}
										builders={[builder]}
									>
										<CalendarIcon class="mr-2 h-4 w-4" />
										{value ? df.format(value.toDate(getLocalTimeZone())) : 'Pick a date'}
									</Button>
								</Popover.Trigger>
								<Popover.Content class="w-auto p-2">
									<Calendar
										maxValue={today(getLocalTimeZone())}
										bind:value
										onValueChange={(v) => ($formStore = v?.toString())}
									/>
								</Popover.Content>
							</Popover.Root>
							<Form.Input type="hidden" bind:value={$formStore} />
							<Form.Validation />
						</Form.Item>
					</Form.Field>
					<Form.Field {config} name="amount">
						<Form.Item>
							<Form.Label>Amount</Form.Label>
							<Form.Input type="text" />
							<Form.Validation />
						</Form.Item>
					</Form.Field>
					<Form.Field {config} name="expense">
						<Form.Item>
							<Form.Label>Expense</Form.Label>
							<Form.Input />
							<Form.Validation />
						</Form.Item>
					</Form.Field>
					<Form.Field {config} name="type">
						<Form.Item>
							<Form.Label>Category</Form.Label>
							<Form.Select>
								<Form.SelectTrigger placeholder="—" />
								<Form.SelectContent>
									{#each data.expenseTypes as category}
										<Form.SelectItem value={category.id}>{category.name}</Form.SelectItem>
									{/each}
								</Form.SelectContent>
							</Form.Select>
							<Form.Validation />
						</Form.Item>
					</Form.Field>
					<Form.Field {config} name="notes">
						<Form.Item>
							<Form.Label>Notes</Form.Label>
							<Form.Textarea class="resize-none" />
							<Form.Validation />
						</Form.Item>
					</Form.Field>
				</Card.Content>
				<Card.Footer>
					<Form.Button class="mt-2" type="submit">Update</Form.Button>
				</Card.Footer>
			</form>
		</Form.Root>
	</Card.Root>
</div>
