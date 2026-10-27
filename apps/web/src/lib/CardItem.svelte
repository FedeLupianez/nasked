<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { CardItem } from './types';
  import { getDueInfo, formatDateTime, FIELD_TYPE_LABEL } from './utils';
  import { store } from './store.svelte';
  import { deleteAttachment } from './attachments';
  import AttachmentList from './AttachmentList.svelte';
  import { Trash2, Timer } from 'lucide-svelte';

  let { card, folderId }: { card: CardItem; folderId: string } = $props();
  let now = $state(Date.now());
  let timer: number;

  onMount(() => {
    timer = window.setInterval(() => (now = Date.now()), 1000);
  });
  onDestroy(() => clearInterval(timer));

  let due = $derived(getDueInfo(card.dueDate, now));

  async function del() {
    if (!confirm(`¿Eliminar tarjeta "${card.title}"?`)) return;
    const f = store.folders.find((x) => x.id === folderId);
    if (f) {
      f.cards = f.cards.filter((c) => c.id !== card.id);
      store.persist();
      for (const a of card.attachments ?? []) await deleteAttachment(a);
    }
  }
</script>

<div class="card-item">
  <div class="card-head">
    <div class="card-main">
      <b class="card-title">{card.title}</b>
      {#if card.description}<div class="card-desc muted">{card.description}</div>{/if}
    </div>
    {#if store.isAdmin}
      <button class="btn btn-danger btn-small icon-btn" onclick={del} title="Eliminar"><Trash2 size={14} /></button>
    {/if}
  </div>

  <div class="due {due.status}" title={new Date(card.dueDate).toLocaleString()}>
    <Timer size={13} /> {due.label} · vence {formatDateTime(card.dueDate)}
  </div>

  {#if card.fields.length}
    <div class="kv">
      {#each card.fields as f}
        <div>
          <small>{f.label} <span class="type-tag">{FIELD_TYPE_LABEL[f.type] ?? f.type}</span></small>
          <b>{f.value || '—'}</b>
        </div>
      {/each}
    </div>
  {:else}
    <p class="card-note muted">Sin campos extra.</p>
  {/if}

  {#if card.attachments?.length}
    <AttachmentList attachments={card.attachments} />
  {/if}
</div>
