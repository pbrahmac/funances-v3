<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { cn, getTextColorFromBackground } from '$lib/utils';

	export let name: string;
	export let color: string;
</script>

<Badge
	style={`background-color: ${color};`}
	class={cn('font-medium', getTextColorFromBackground(color))}
>
	{name}
</Badge>
