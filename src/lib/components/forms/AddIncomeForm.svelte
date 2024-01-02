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
	import { addIncomeSchema } from '$lib/schemas/addIncome';
	import type { Income } from '$lib/utils';
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
	export let form: SuperValidated<typeof addIncomeSchema>;
	export let store: Writable<Income[]>;

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
	const submitAddIncome: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type == 'success') {
				await invalidateAll();
				store.set($page.data.incomes?.items);
				open = false;
				toast.success('Added income.');
			} else {
				toast.error('Something went wrong.');
			}
			await applyAction(result);
		};
	};
</script>

{#if $isDesktop}
	<Dialog.Root bind:open>
		<Button class="ml-2" on:click={() => (open = true)}>Add Income</Button>
		<Dialog.Content class="max-w-sm">
			<Dialog.Header>
				<Dialog.Title>Add Income</Dialog.Title>
			</Dialog.Header>
			<Form.Root {form} schema={addIncomeSchema} class="m-4" let:config asChild>
				<form action="?/addIncome" method="post" use:enhance={submitAddIncome}>
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
					<Form.Field {config} name="income">
						<Form.Item>
							<Form.Label>Income</Form.Label>
							<Form.Input />
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
					<Form.Field {config} name="gross_amount">
						<Form.Item>
							<Form.Label>Amount</Form.Label>
							<Form.Input inputmode="decimal" />
							<Form.Validation />
						</Form.Item>
					</Form.Field>
					<Form.Field {config} name="taxes">
						<Form.Item>
							<Form.Label>Taxes</Form.Label>
							<Form.Input inputmode="decimal" />
							<Form.Validation />
						</Form.Item>
					</Form.Field>
					<Form.Field {config} name="retirement_401k">
						<Form.Item>
							<Form.Label>401k</Form.Label>
							<Form.Input inputmode="decimal" />
							<Form.Validation />
						</Form.Item>
					</Form.Field>
					<Form.Field {config} name="benefits">
						<Form.Item>
							<Form.Label>Benefits</Form.Label>
							<Form.Input inputmode="decimal" />
							<Form.Validation />
						</Form.Item>
					</Form.Field>
					<Form.Field {config} name="is_paycheck">
						<Form.Item class="flex items-end space-x-2">
							<Form.Label>Paycheck?</Form.Label>
							<Form.Checkbox />
							<Form.Validation />
						</Form.Item>
					</Form.Field>
					<Form.Button class="mt-4" type="submit">Add</Form.Button>
				</form>
			</Form.Root>
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Drawer.Root bind:open>
		<Button class="ml-2" on:click={() => (open = true)}>Add Income</Button>
		<Drawer.Content>
			<Drawer.Header class="text-left">
				<Drawer.Title>Add Income</Drawer.Title>
			</Drawer.Header>
			<div class="p-6">
				<Form.Root {form} schema={addIncomeSchema} class="m-4" let:config asChild>
					<form action="?/addIncome" method="post" use:enhance={submitAddIncome}>
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
						<Form.Field {config} name="income">
							<Form.Item>
								<Form.Label>Income</Form.Label>
								<Form.Input />
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
						<Form.Field {config} name="gross_amount">
							<Form.Item>
								<Form.Label>Amount</Form.Label>
								<Form.Input inputmode="decimal" />
								<Form.Validation />
							</Form.Item>
						</Form.Field>
						<Form.Field {config} name="taxes">
							<Form.Item>
								<Form.Label>Taxes</Form.Label>
								<Form.Input inputmode="decimal" />
								<Form.Validation />
							</Form.Item>
						</Form.Field>
						<Form.Field {config} name="retirement_401k">
							<Form.Item>
								<Form.Label>401k</Form.Label>
								<Form.Input inputmode="decimal" />
								<Form.Validation />
							</Form.Item>
						</Form.Field>
						<Form.Field {config} name="benefits">
							<Form.Item>
								<Form.Label>Benefits</Form.Label>
								<Form.Input inputmode="decimal" />
								<Form.Validation />
							</Form.Item>
						</Form.Field>
						<Form.Field {config} name="is_paycheck">
							<Form.Item class="flex items-end space-x-2">
								<Form.Label>Paycheck?</Form.Label>
								<Form.Checkbox />
								<Form.Validation />
							</Form.Item>
						</Form.Field>
						<Form.Button class="mt-4 w-full" type="submit">Add</Form.Button>
					</form>
				</Form.Root>
			</div>
		</Drawer.Content>
	</Drawer.Root>
{/if}
