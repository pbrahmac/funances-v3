<script lang="ts">
  import * as Avatar from '$lib/components/ui/avatar';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { Separator } from '$lib/components/ui/separator';
	import { cn, getAvatarURL } from '$lib/utils';
	import type { BaseModel } from 'pocketbase';
  import { Moon, Sun } from "radix-icons-svelte";
	import type { Writable } from 'svelte/store';
  import { page } from "$app/stores";

  // props
  export let darkModeStore: Writable<boolean>;
  export let user: BaseModel | undefined;

  // light switch stuff
  type OnKeyDownEvent = KeyboardEvent & {
		currentTarget: EventTarget & HTMLDivElement;
	};
  function onKeyDown(event: OnKeyDownEvent): void {
		if (["Enter", "Space"].includes(event.code)) {
			event.preventDefault();
			event.currentTarget.click();
		}
	}
  const switchLightMode = () => {
    window.document.documentElement.classList.toggle('dark');
    if ($darkModeStore) {
      darkModeStore.set(false);
    } else {
      darkModeStore.set(true);
    }
  }
  
  // menu items
  const loggedInItems = [
  {title: 'Dashboard', link: '/'},
  {title: 'Expenses', link: '/expenses'},
  {title: 'Income', link: '/income'},
  {title: 'Allocations', link: '/allocations'},
  ];
  const loggedOutItems = [
    {title: 'Sign In', link: '/signin'},
    {title: 'Sign Up', link: '/signup'},
  ];

  // user avatar stuff
  const fallback = user?.firstName.at(0) + user?.lastName.at(0).toUpperCase();

</script>

<nav class="h-20 flex items-center justify-between border-b-2 shadow-sm">
  <a href="/" class="ml-6 lowercase text-3xl font-semibold underline underline-offset-4 transition-all hover:underline-offset-8">funances</a>

  <div class="h-10 flex items-center space-x-2 last:mr-4">
    <ul class="flex items-center justify-center">
      {#if user}
        {#each loggedInItems as item}
        <a 
          class="ml-2 px-3 py-2 rounded text-sm text-muted-foreground transition-colors hover:bg-secondary" 
          href={item.link}
          aria-current={$page.url.pathname === item.link ? 'page' : undefined}
        >
          {item.title}
        </a>
        {/each}
      {:else}
        {#each loggedOutItems as item}
        <a 
          class="ml-2 px-3 py-2 rounded text-sm text-muted-foreground transition-colors hover:bg-secondary" 
          href={item.link}
          aria-current={$page.url.pathname === item.link ? 'page' : undefined}
        >
          {item.title}
        </a>
        {/each}
      {/if}
    </ul>
    <Separator orientation="vertical" />
    {#if user}
    <div class="px-3 h-full">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Avatar.Root>
            <Avatar.Image src={getAvatarURL(user?.id)} alt={`@${user?.username}`} />
            <Avatar.Fallback>{fallback}</Avatar.Fallback>
          </Avatar.Root>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Group>
            <DropdownMenu.Label>@{user.username}</DropdownMenu.Label>
            <DropdownMenu.Separator></DropdownMenu.Separator>
            <DropdownMenu.Item>
              <a href="/settings">Settings</a>
            </DropdownMenu.Item>
            <DropdownMenu.Item>
                <form action="/logout" method="post">
                  <button type="submit">Log Out</button>
                </form>
              </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
    {/if}
    <div
      on:click={switchLightMode} 
      on:keydown={onKeyDown} 
      role="switch" 
      aria-label="Light Switch"
      aria-checked="false"
      title="Toggle Dark Mode"
      tabindex="0"
    >
      <div class={cn("flex items-center justify-center w-10 h-10 rounded-md transition-colors hover:bg-secondary")}>
        {#if $darkModeStore}
          <Sun class="h-5 w-5" />
          <span class="sr-only">Light</span>
        {:else}
          <Moon class="h-5 w-5"/>
          <span class="sr-only">Dark</span>
        {/if}
      </div>
    </div>
  </div>
</nav>

<style>
  a[aria-current='page'] {
    @apply bg-secondary text-foreground;
  }
</style>