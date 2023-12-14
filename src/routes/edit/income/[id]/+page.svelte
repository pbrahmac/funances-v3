<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import * as Popover from '$lib/components/ui/popover';
	import { editIncomeSchema } from '$lib/schemas/editIncome';
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

	// props
	export let data: PageData;

	// date picker setup
	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});
	const formStore: Writable<string | undefined> = writable('');
	let value: DateValue | undefined = $formStore
		? parseDate($formStore)
		: parseDate(formatDatepickerString(new Date(data.income.date)));
</script>

<svelte:head>
	<title>Edit Income</title>
</svelte:head>

<div class="fullPageContainer p-6 flex items-center justify-center">
	<Card.Root class="max-w-xl">
		<Card.Header>
			<Card.Title>Edit Income</Card.Title>
		</Card.Header>
		<Form.Root method="POST" form={data.form} schema={editIncomeSchema} class="m-2 w-96" let:config>
			<Card.Content>
				<input type="hidden" name="id" value={data.income?.id} />
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
					<Form.Item>
						<Form.Label>Paycheck?</Form.Label>
						<Form.Checkbox />
						<Form.Validation />
					</Form.Item>
				</Form.Field>
			</Card.Content>
			<Card.Footer>
				<Form.Button class="mt-2" type="submit">Update</Form.Button>
			</Card.Footer>
		</Form.Root>
	</Card.Root>
</div>
