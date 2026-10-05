<script lang="ts">
  import { ImagePlus, Check, X, Eraser } from 'lucide-svelte';

  interface Props {
    url?: string;
    onsave: (url: string) => void;
    onclose?: () => void;
  }

  let { url = '', onsave, onclose }: Props = $props();

  let draft = $state(url ?? '');

  function save() {
    onsave(draft.trim());
  }
</script>

<div class="banner-editor" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="presentation">
  <span class="be-icon"><ImagePlus size={15} /></span>
  <input
    class="be-input"
    placeholder="https://…/portada.jpg"
    bind:value={draft}
    onkeydown={(e) => e.key === 'Enter' && save()}
  />
  <button class="icon-btn" title="Guardar" onclick={save}><Check size={17} /></button>
  <button class="icon-btn" title="Quitar portada" onclick={() => onsave('')}><Eraser size={16} /></button>
  <button class="icon-btn" title="Cancelar" onclick={() => onclose?.()}><X size={17} /></button>
</div>

<style>
  .banner-editor {
    display: flex; align-items: center; gap: 6px;
    background: var(--panel); border: 1px solid var(--border-strong);
    border-radius: 10px; padding: 6px 8px 6px 10px;
    width: 100%;
  }
  .be-icon { color: var(--muted); display: flex; flex-shrink: 0; }
  .be-input {
    flex: 1; min-width: 0; background: transparent; border: 0; outline: none;
    color: var(--text); font-size: 13.5px;
  }
  .be-input::placeholder { color: var(--faint); }
</style>
