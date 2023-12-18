<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import { SidebarNav } from './index';

	const sidebarItems = [
		{ href: '/settings', title: 'Profile' },
		{ href: '/settings/allocations', title: 'Allocations' },
		{ href: '/settings/expense-categories', title: 'Expense Categories' }
	];
</script>

<div class="space-y-6 p-10 pb-16">
	<div class="space-y-1">
		<h2 class="text-2xl font-bold">Settings</h2>
		<p class="text-muted-foreground">Change account details and allocations here.</p>
	</div>
	<Separator class="my-6" />
	<div class="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
		<aside class="-mx-4 lg:w-1/5">
			<SidebarNav items={sidebarItems} />
		</aside>
		<div class="flex-1 lg:max-w-2xl">
			<slot />
		</div>
	</div>
</div>
