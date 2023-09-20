<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { signUpFormSchema } from '$lib/schemas/signup';
	import type { PageData } from './$types';

	// props
	export let data: PageData;
</script>

<div class="fullPageContainer flex items-center justify-center">
	<Card.Root class="w-96">
		<Card.Header>
			<Card.Title>Sign Up</Card.Title>
		</Card.Header>
		<Form.Root method="POST" form={data.form} schema={signUpFormSchema} let:config>
			<Card.Content>
				<Form.Field {config} name="firstName">
					<Form.Item>
						<Form.Label>First Name</Form.Label>
						<Form.Input />
						<Form.Validation />
					</Form.Item>
				</Form.Field>
				<Form.Field {config} name="lastName">
					<Form.Item>
						<Form.Label>Last Name</Form.Label>
						<Form.Input />
						<Form.Validation />
					</Form.Item>
				</Form.Field>
				<Form.Field {config} name="username">
					<Form.Item>
						<Form.Label>Username</Form.Label>
						<Form.Input />
						<Form.Validation />
					</Form.Item>
				</Form.Field>
				<Form.Field {config} name="password">
					<Form.Item>
						<Form.Label>Password</Form.Label>
						<Form.Input type="password" />
						<Form.Validation />
					</Form.Item>
				</Form.Field>
				<Form.Field {config} name="passwordConfirm">
					<Form.Item>
						<Form.Label>Confirm Password</Form.Label>
						<Form.Input type="password" />
						<Form.Validation />
					</Form.Item>
				</Form.Field>
			</Card.Content>
			<Card.Footer>
				<Form.Button>Submit</Form.Button>
			</Card.Footer>
		</Form.Root>
	</Card.Root>
</div>
