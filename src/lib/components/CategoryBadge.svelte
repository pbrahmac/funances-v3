<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';
  
  export let name: string;
  export let color: string;
</script>

<Badge style={`background-color: ${color};`} class="text-white font-medium">{name}</Badge>