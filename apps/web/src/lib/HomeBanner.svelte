<script lang="ts">
  import { ImagePlus, MoveVertical, Check } from 'lucide-svelte';
  import { store } from './store.svelte';
  import BannerEditor from './BannerEditor.svelte';

  let editing = $state(false);
  let repositioning = $state(false);

  let dragging = $state(false);
  let startY = 0;
  let startPos = 50;

  function startDrag(e: PointerEvent) {
    if (!repositioning) return;
    dragging = true;
    startY = e.clientY;
    startPos = store.homeBannerPos;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onDrag(e: PointerEvent) {
    if (!dragging) return;
    const banner = (e.currentTarget as HTMLElement).closest('.home-banner') as HTMLElement | null;
    const h = banner?.offsetHeight || window.innerHeight * 0.35;
    const dy = e.clientY - startY;
    store.setHomeBannerPos(startPos - (dy / h) * 100);
  }

  function endDrag() {
    dragging = false;
  }
</script>

<div
  class="home-banner"
  class:has-img={!!store.homeBannerUrl}
  class:repositioning
>
  {#if store.homeBannerUrl}
    <img
      class="home-banner-img"
      src={store.homeBannerUrl}
      alt=""
      aria-hidden="true"
      style="object-position: center {store.homeBannerPos}%"
    />
    <img
      class="home-banner-img-blur"
      src={store.homeBannerUrl}
      alt=""
      aria-hidden="true"
      style="object-position: center {store.homeBannerPos}%"
    />
    {#if repositioning}
      <div
        class="banner-drag"
        role="slider"
        tabindex="0"
        aria-label="Posicionar portada"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={store.homeBannerPos}
        onpointerdown={startDrag}
        onpointermove={onDrag}
        onpointerup={endDrag}
        onpointercancel={endDrag}
        onkeydown={(e) => {
          if (e.key === 'ArrowUp') { store.setHomeBannerPos(store.homeBannerPos - 2); e.preventDefault(); }
          if (e.key === 'ArrowDown') { store.setHomeBannerPos(store.homeBannerPos + 2); e.preventDefault(); }
        }}
      ></div>
    {/if}
  {/if}
</div>

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
      onreposition={store.homeBannerUrl ? () => { repositioning = true; editing = false; } : undefined}
    />
  </div>
{/if}

{#if repositioning}
  <div class="banner-pop reposition-pop">
    <span class="rp-label"><MoveVertical size={14} /> Arrastra la imagen para posicionarla</span>
    <button class="rp-done" onclick={() => (repositioning = false)}>
      <Check size={15} /> Listo
    </button>
  </div>
{/if}

<style>
  .home-banner.repositioning .home-banner-img { outline: 2px dashed var(--border-strong); outline-offset: -2px; }
  .banner-drag {
    position: absolute; inset: 0; z-index: 3; cursor: grab; touch-action: none;
  }
  .banner-drag:active { cursor: grabbing; }

  .reposition-pop {
    display: flex; align-items: center; gap: 10px;
    background: var(--panel); border: 1px solid var(--border-strong);
    border-radius: 10px; padding: 8px 12px;
    pointer-events: auto;
  }
  .rp-label { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--muted); white-space: nowrap; }
  .reposition-pop input[type='range'] { flex: 1; min-width: 120px; accent-color: var(--text); }
  .rp-done {
    display: flex; align-items: center; gap: 5px;
    background: var(--panel-2); border: 1px solid var(--border-strong);
    color: var(--text); border-radius: 8px; padding: 5px 10px;
    font-size: 13px; cursor: pointer; font-family: inherit;
  }
  .rp-done:hover { background: var(--border-strong); }
</style>
