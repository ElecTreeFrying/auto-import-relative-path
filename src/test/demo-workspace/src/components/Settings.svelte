<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  let visible = $state(false);

  onMount(() => {
    visible = true;
  });
</script>

<div class="settings">
  {#if visible}
    <h2 transition:fade>Settings</h2>
  {/if}
</div>
