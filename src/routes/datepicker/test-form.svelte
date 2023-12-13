<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Popover from '$lib/components/ui/popover';
	import { dateRangeSchema } from '$lib/schemas/dateRangeSchema';
	import { writable, type Writable } from 'svelte/store';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { Calendar as CalendarIcon } from 'radix-icons-svelte';
	import {
		type DateValue,
		DateFormatter,
		getLocalTimeZone,
		parseDate,
		CalendarDate,
		today
	} from '@internationalized/date';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { RangeCalendar } from '$lib/components/ui/range-calendar';
	import type { DateRange } from 'bits-ui';
	import { enhance } from '$app/forms';

	export let form: SuperValidated<typeof dateRangeSchema>;
	export let formAction: string = '?/updateDateRangeWindow';
	let formObj: any;

	const df = new DateFormatter('en-US', {
		dateStyle: 'medium'
	});

	const formStore: Writable<{
		start: string | undefined;
		end: string | undefined;
	}> = writable({ start: '', end: '' });

	let value: DateRange | undefined = {
		start: $formStore.start
			? parseDate($formStore.start)
			: today(getLocalTimeZone()).subtract({ months: 1 }),
		end: $formStore.end ? parseDate($formStore.end) : today(getLocalTimeZone())
	};
	let startValue: DateValue | undefined = undefined;
</script>

<div class="flex flex-col items-center p-6">
	<Form.Root {form} schema={dateRangeSchema} let:config asChild>
		<form method="post" action={formAction} bind:this={formObj} use:enhance>
			<Popover.Root
				onOpenChange={(open) => {
					if (!open) {
						formObj.requestSubmit();
					}
				}}
			>
				<Popover.Trigger asChild let:builder>
					<Button
						variant="outline"
						class={cn(
							'w-[300px] justify-start text-left font-normal',
							!value && 'text-muted-foreground'
						)}
						builders={[builder]}
					>
						<CalendarIcon class="mr-2 h-4 w-4" />
						{#if value && value.start}
							{#if value.end}
								{df.format(value.start.toDate(getLocalTimeZone()))} - {df.format(
									value.end.toDate(getLocalTimeZone())
								)}
							{:else}
								{df.format(value.start.toDate(getLocalTimeZone()))}
							{/if}
						{:else if startValue}
							{df.format(startValue.toDate(getLocalTimeZone()))}
						{:else}
							Pick a date
						{/if}
					</Button>
				</Popover.Trigger>
				<Popover.Content class="w-auto p-0" side="top">
					<RangeCalendar
						bind:value
						bind:startValue
						placeholder={value?.start}
						minValue={new CalendarDate(1900, 1, 1)}
						maxValue={today(getLocalTimeZone())}
						calendarLabel="Date Range"
						numberOfMonths={2}
						initialFocus
						onValueChange={(v) => {
							if (v.start && v.end) {
								$formStore.start = v.start?.toString();
								$formStore.end = v.end?.toString();
							}
						}}
					/>
				</Popover.Content>
			</Popover.Root>
			<Form.Field {config} name="start">
				<Form.Item>
					<Form.Input type="hidden" bind:value={$formStore.start} />
					<Form.Validation />
				</Form.Item>
			</Form.Field>
			<Form.Field {config} name="end">
				<Form.Item>
					<Form.Input type="hidden" bind:value={$formStore.end} />
					<Form.Validation />
				</Form.Item>
			</Form.Field>
		</form>
	</Form.Root>
</div>
