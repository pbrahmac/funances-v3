<script lang="ts">
	import type { PageData } from './$types';
	import TestForm from './test-form.svelte';

	export let data: PageData;
</script>

<TestForm form={data.form} />
