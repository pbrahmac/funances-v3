<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Drawer from '$lib/components/ui/drawer';
	import * as Form from '$lib/components/ui/form';
	import * as Popover from '$lib/components/ui/popover';
	import { addExpenseSchema } from '$lib/schemas/addExpense';
	import type { Expense, ExpenseCategory } from '$lib/utils';
	import { cn } from '$lib/utils';
	import {
		DateFormatter,
		getLocalTimeZone,
		parseDate,
		today,
		type DateValue
	} from '@internationalized/date';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Calendar as CalendarIcon } from 'radix-icons-svelte';
	import { mediaQuery } from 'svelte-legos';
	import { toast } from 'svelte-sonner';
	import { writable, type Writable } from 'svelte/store';
	import type { SuperValidated } from 'sveltekit-superforms';

	// props
	export let form: SuperValidated<typeof addExpenseSchema>;
	export let categories: ExpenseCategory[];
	export let store: Writable<Expense[]>;

	// dialog open state
	let open = false;
	const isDesktop = mediaQuery('(min-width: 768px)');

	// date picker setup
	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});
	const formStore: Writable<string | undefined> = writable('');
	let value: DateValue | undefined = $formStore ? parseDate($formStore) : today(getLocalTimeZone());

	// progressive enhancement functions
	const submitAddExpense: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type == 'success') {
				await invalidateAll();
				store.set($page.data.expenses?.items);
				open = false;
				toast.success('Added expense.');
			} else {
				toast.error('Something went wrong.');
			}
			await applyAction(result);
		};
	};
</script>

{#if $isDesktop}
	<Dialog.Root bind:open>
		<Button class="ml-2" on:click={() => (open = true)}>Add Expense</Button>
		<Dialog.Content class="max-w-sm">
			<Dialog.Header>
				<Dialog.Title>Add an Expense</Dialog.Title>
			</Dialog.Header>
			<Form.Root {form} schema={addExpenseSchema} class="m-4" let:config asChild>
				<form action="?/addExpense" method="post" use:enhance={submitAddExpense}>
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
							<Form.Input inputmode="decimal" />
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
									{#each categories as category}
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
					<Form.Button class="mt-2" type="submit">Add</Form.Button>
				</form>
			</Form.Root>
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Drawer.Root bind:open>
		<Button class="ml-2" on:click={() => (open = true)}>Add Expense</Button>
		<Drawer.Content>
			<Drawer.Header class="text-left">
				<Drawer.Title>Add Expense</Drawer.Title>
			</Drawer.Header>
			<div class="p-6">
				<Form.Root {form} schema={addExpenseSchema} let:config asChild>
					<form action="?/addExpense" method="post" use:enhance={submitAddExpense}>
						<Form.Field {config} name="date">
							<Form.Item class="flex flex-col">
								<Form.Label class="w-full text-left">Date</Form.Label>
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
								<Form.Input inputmode="decimal" />
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
										{#each categories as category}
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
						<Form.Button class="mt-2 w-full" type="submit">Add</Form.Button>
					</form>
				</Form.Root>
			</div>
		</Drawer.Content>
	</Drawer.Root>
{/if}
