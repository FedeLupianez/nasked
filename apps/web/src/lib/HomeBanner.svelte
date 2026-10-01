<script lang="ts">
  import { ImagePlus } from 'lucide-svelte';
  import { store } from './store.svelte';
  import BannerEditor from './BannerEditor.svelte';

  let editing = $state(false);
</script>

<div class="home-banner" class:has-img={!!store.homeBannerUrl}>
  {#if store.homeBannerUrl}
    <img class="home-banner-img" src={store.homeBannerUrl} alt="" aria-hidden="true" />
  {/if}

  <button
    class="banner-trigger"
    title={store.homeBannerUrl ? 'Cambiar portada' : 'Agregar portada'}
    onclick={() => (editing = !editing)}
  >
    <ImagePlus size={17} />
  </button>

  {#if editing}
    <div class="banner-pop">
      <BannerEditor
        url={store.homeBannerUrl}
        onsave={(u) => { store.setHomeBanner(u); editing = false; }}
        onclose={() => (editing = false)}
      />
    </div>
  {/if}
</div>