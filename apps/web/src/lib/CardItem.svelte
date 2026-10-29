<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { CardItem, SubCard } from './types';
  import { getDueInfo, formatDateTime, FIELD_TYPE_LABEL } from './utils';
  import { store } from './store.svelte';
  import { deleteAttachment } from './attachments';
  import AttachmentList from './AttachmentList.svelte';
  import { Trash2, Timer, Pencil, Plus, Layers } from 'lucide-svelte';

  let {
    card,
    folderId,
    onedit,
    onaddsubcard,
    oneditsubcard
  }: {
    card: CardItem;
    folderId: string;
    onedit?: () => void;
    onaddsubcard?: () => void;
    oneditsubcard?: (sub: SubCard) => void;
  } = $props();

  let now = $state(Date.now());
  let timer: number;

  onMount(() => {
    timer = window.setInterval(() => (now = Date.now()), 1000);
  });
  onDestroy(() => clearInterval(timer));

  let due = $derived(getDueInfo(card.dueDate, now));

  async function del() {
    if (!confirm(`¿Eliminar tarjeta "${card.title}"?`)) return;
    await store.deleteCard(folderId, card.id);
  }

  async function delSubcard(sub: SubCard) {
    if (!confirm(`¿Eliminar subtarjeta "${sub.title}"?`)) return;
    const next = (card.subcards ?? []).filter((s) => s.id !== sub.id);
    await store.updateCard(folderId, card.id, { subcards: next });
    for (const a of sub.attachments ?? []) await deleteAttachment(a);
  }
</script>

<div class="card-item">
  <div class="card-head">
    <div class="card-main">
      <b class="card-title">{card.title}</b>
      {#if card.description}<div class="card-desc muted">{card.description}</div>{/if}
    </div>
    {#if store.isAdmin}
      <div class="card-actions">
        {#if onedit}
          <button class="btn btn-ghost btn-small with-icon" onclick={onedit} title="Editar tarjeta"><Pencil size={14} /> Editar</button>
        {/if}
        <button class="btn btn-danger btn-small icon-btn" onclick={del} title="Eliminar"><Trash2 size={14} /></button>
      </div>
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

  {#if (card.subcards?.length ?? 0) > 0 || store.isAdmin}
    <section class="subcards">
      <div class="subcards-head">
        <b class="with-icon"><Layers size={14} /> Subtarjetas</b>
        {#if card.subcards?.length}
          <span class="subcard-count">{card.subcards.length}</span>
        {/if}
        <span class="grow"></span>
        {#if store.isAdmin && onaddsubcard}
          <button type="button" class="btn btn-ghost btn-small with-icon" onclick={onaddsubcard}>
            <Plus size={13} /> Agregar subtarjeta
          </button>
        {/if}
      </div>

      {#if card.subcards?.length}
        <div class="subcard-list">
          {#each card.subcards as sub (sub.id)}
            <article class="subcard">
              <div class="subcard-head">
                <div class="subcard-main">
                  <b>{sub.title}</b>
                  {#if sub.description}<small class="muted">{sub.description}</small>{/if}
                </div>
                {#if store.isAdmin}
                  <div class="card-actions">
                    {#if oneditsubcard}
                      <button class="btn btn-ghost btn-small icon-btn" onclick={() => oneditsubcard(sub)} title="Editar subtarjeta"><Pencil size={13} /></button>
                    {/if}
                    <button class="btn btn-danger btn-small icon-btn" onclick={() => delSubcard(sub)} title="Eliminar subtarjeta"><Trash2 size={13} /></button>
                  </div>
                {/if}
              </div>

              {#if sub.fields.length}
                <div class="kv subcard-kv">
                  {#each sub.fields as f}
                    <div>
                      <small>{f.label} <span class="type-tag">{FIELD_TYPE_LABEL[f.type] ?? f.type}</span></small>
                      <b>{f.value || '—'}</b>
                    </div>
                  {/each}
                </div>
              {/if}

              {#if sub.attachments?.length}
                <AttachmentList attachments={sub.attachments} />
              {/if}
            </article>
          {/each}
        </div>
      {:else}
        <p class="card-note muted">
          Todavía no hay subtarjetas.{store.isAdmin ? ' Agregá una para agrupar información.' : ''}
        </p>
      {/if}
    </section>
  {/if}
</div>
