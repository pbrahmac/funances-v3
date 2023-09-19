<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';
  
  export let is_paycheck: boolean;
</script>

<Badge style={`background-color: ${is_paycheck ? '#16a34a' : '#dc2626'};`} class="text-white font-medium">{is_paycheck ? "Yes" : "No"}</Badge>