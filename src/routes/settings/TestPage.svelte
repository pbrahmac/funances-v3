<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import * as Table from '$lib/components/ui/table';
	import { formatPercentage, getAvatarURL } from '$lib/utils';
	import { Check, Cross2, Pencil1, Plus, Trash } from 'radix-icons-svelte';
	import type { PageData } from './$types';
	import MobileSettings from './MobileSettings.svelte';

	// props
	export let data: PageData;

	const fallback = data.user?.firstName.at(0) + data.user?.lastName.at(0).toUpperCase();

	const allocationTableEditStates = data.allocations.map(() => false);
</script>

<svelte:head>
	<title>Settings</title>
</svelte:head>

<div class="fullPageContainer p-3 lg:p-6">
	<!-- mobile -->
	<MobileSettings user={data.user} {fallback} />

	<!-- desktop -->
	<div class="hidden lg:flex flex-col space-y-4 items-center justify-center text-center">
		<Avatar.Root class="w-1/3 lg:w-1/6 xl:w-1/12 h-auto">
			<Avatar.Image src={getAvatarURL(data.user?.id)} alt={`@${data.user?.username}`} />
			<Avatar.Fallback>{fallback}</Avatar.Fallback>
		</Avatar.Root>
		<h2 class="text-4xl">{`${data.user?.firstName} ${data.user?.lastName}`}</h2>
		<p class="text-2xl">{`@${data.user?.username}`}</p>
		<Separator />
	</div>

	<div class="flex flex-col space-y-4">
		<div class="flex flex-col justify-center space-y-4 my-4 text-left">
			<h3 class="text-xl font-bold">Account</h3>
			<!-- temp UI - replace with form -->
			<div class="flex items-center justify-start space-x-2">
				<Input placeholder="First name" class="max-w-max" />
				<Button>Change</Button>
			</div>
			<div class="flex items-center justify-start space-x-2">
				<Input placeholder="Last name" class="max-w-max" />
				<Button>Change</Button>
			</div>
			<div class="flex items-center justify-start space-x-2">
				<Input placeholder="username" class="max-w-max" />
				<Button>Change</Button>
			</div>
			<Dialog.Root>
				<Dialog.Trigger class={`${buttonVariants({ variant: 'default' })} w-fit`}>
					Change Password
				</Dialog.Trigger>
				<Dialog.Content class="max-w-sm">
					<Dialog.Header>
						<Dialog.Title>Change Password</Dialog.Title>
						<Dialog.Description>Can't be the same as the old one.</Dialog.Description>
					</Dialog.Header>
					<div class="max-w-sm flex flex-col space-y-4 py-2">
						<div>
							<Label>Old Password</Label>
							<Input type="password" />
						</div>
						<div>
							<Label>New Password</Label>
							<Input type="password" />
						</div>
						<div>
							<Label>Confirm New Password</Label>
							<Input type="password" />
						</div>
						<Button class="w-fit">Change</Button>
					</div>
				</Dialog.Content>
			</Dialog.Root>
		</div>
		<div class="flex flex-col justify-center space-y-4 my-4 text-left">
			<h3 class="text-xl font-bold">Allocations</h3>
			<Table.Root class="max-w-xl">
				<Table.Header>
					<Table.Row>
						<Table.Head>Allocation</Table.Head>
						<Table.Head>Percentage</Table.Head>
						<Table.Head />
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.allocations as item, idx}
						{#if allocationTableEditStates[idx]}
							<Table.Row>
								<Table.Cell>
									<!-- TODO: replace inputs with forms -->
									<Input value={item.category} />
								</Table.Cell>
								<Table.Cell>
									<Input value={item.percentage} />
								</Table.Cell>
								<Table.Cell class="text-right">
									<!-- TODO: add functionality -->
									<Button variant="ghost">
										<Check class="w-5 h-5" />
									</Button>
									<Button
										on:click={() =>
											(allocationTableEditStates[idx] = !allocationTableEditStates[idx])}
										variant="ghost"
										><Cross2 class="w-5 h-5" />
									</Button>
								</Table.Cell>
							</Table.Row>
						{:else}
							<Table.Row>
								<Table.Cell>{item.category}</Table.Cell>
								<Table.Cell>{formatPercentage(item.percentage)}</Table.Cell>
								<Table.Cell class="text-right">
									<Button
										on:click={() =>
											(allocationTableEditStates[idx] = !allocationTableEditStates[idx])}
										variant="ghost"
										><Pencil1 class="w-4 h-4" />
									</Button>
									<!-- TODO: add functionality -->
									<Button variant="ghost"><Trash class="w-4 h-4" /></Button>
								</Table.Cell>
							</Table.Row>
						{/if}
					{/each}
					<Table.Row class="font-semibold bg-secondary">
						<Table.Cell>Total</Table.Cell>
						<Table.Cell>
							{formatPercentage(data.allocations.reduce((sum, item) => sum + item.percentage, 0))}
						</Table.Cell>
						<Table.Cell />
					</Table.Row>
				</Table.Body>
				<!-- TODO: add dialog for form (with validation - total allocations should not exceed 100%) -->
				<Button class="mt-4" variant="secondary"><Plus class="w-5 h-5" /></Button>
			</Table.Root>
		</div>
	</div>
</div>
