<script lang="ts">
  import { store } from './store.svelte';
  import { getDueInfo } from './utils';
  import { ArrowLeft, ChevronRight } from 'lucide-svelte';

  let cards = $derived(
    store.visibleFolders.flatMap((f) =>
      f.cards.map((c) => ({ card: c, folder: f })),
    ),
  );

  let todayTasks = $derived.by(() => {
    const now = new Date();
    return cards
      .map(({ card, folder }) => ({ card, folder, due: getDueInfo(card.dueDate) }))
      .filter(({ card, due }) => {
        const d = new Date(card.dueDate);
        const sameDay = d.toDateString() === now.toDateString();
        return due.status === 'overdue' || due.status === 'urgent' || sameDay;
      })
      .sort((a, b) => {
        const rank = (s: string) => (s === 'overdue' ? 0 : s === 'urgent' ? 1 : 2);
        const ra = rank(a.due.status);
        const rb = rank(b.due.status);
        if (ra !== rb) return ra - rb;
        return a.due.diffMs - b.due.diffMs;
      });
  });

  function openFolder(id: string) {
    store.selectedFolderId = id;
    store.view = 'folder-detail';
  }
</script>

<div class="home-card">
  <h3>Tareas pendientes de hoy</h3>
  <button class="btn btn-ghost" style="margin-bottom:14px" onclick={() => (store.view = 'overview')}>
    <ArrowLeft size={15} /> Volver al Home
  </button>
  <div class="inner">
    {#if !todayTasks.length}
      <div class="home-empty">No hay tareas pendientes para hoy.</div>
    {:else}
      {#each todayTasks as t (t.card.id)}
        <button class="due-row" onclick={() => openFolder(t.folder.id)}>
          <span class={`due ${t.due.status}`}>{t.due.short}</span>
          <span class="t">{t.card.title}</span>
          <span class="w">{t.folder.name}</span>
          <ChevronRight size={15} />
        </button>
      {/each}
    {/if}
  </div>
</div>
