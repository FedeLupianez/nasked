<script lang="ts">
  import { store } from './store.svelte';
  import { getDueInfo } from './utils';
  import { Folder, Layers, Flame, Ban, Plus, UserPlus, KeyRound, Users } from 'lucide-svelte';

  let q = $derived(store.search.toLowerCase());
  let folders = $derived(
    store.visibleFolders.filter((f) =>
      !q ? true : f.name.toLowerCase().includes(q) || f.cards.some((c) => c.title.toLowerCase().includes(q))
    )
  );
  let totalCards = $derived(store.visibleFolders.reduce((a, f) => a + f.cards.length, 0));
  let overdue = $derived(
    store.visibleFolders.flatMap((f) => f.cards).filter((c) => getDueInfo(c.dueDate).status === 'overdue').length
  );
  let urgent = $derived(
    store.visibleFolders.flatMap((f) => f.cards).filter((c) => getDueInfo(c.dueDate).status === 'urgent').length
  );

  function open(id: string) {
    store.selectedFolderId = id;
    store.view = 'folder-detail';
  }
</script>

<div class="stats">
  <div class="stat"><small class="with-icon"><Folder size={13} /> Carpetas {store.isAdmin ? 'totales' : 'unidas'}</small><b>{store.visibleFolders.length}</b></div>
  <div class="stat"><small class="with-icon"><Layers size={13} /> Tarjetas activas</small><b>{totalCards}</b></div>
  <div class="stat"><small class="with-icon"><Flame size={13} /> Vencen en &lt;24h</small><b>{urgent}</b></div>
  <div class="stat"><small class="with-icon"><Ban size={13} /> Vencidas</small><b>{overdue}</b></div>
</div>

<div class="toolbar">
  <h3 style="margin:0">{store.isAdmin ? 'Todas las carpetas' : 'Mis carpetas'}</h3>
  <span class="spacer"></span>
  {#if store.isAdmin}
    <button class="btn btn-primary btn-small with-icon" onclick={() => (store.view = 'folders')}><Plus size={14} /> Nueva carpeta</button>
  {:else}
    <button class="btn btn-primary btn-small with-icon" onclick={() => (store.view = 'join')}><UserPlus size={14} /> Unirse con código</button>
  {/if}
</div>

{#if !folders.length}
  <div class="panel">
    <h3>Sin carpetas todavía</h3>
    <p class="muted">
      {#if store.isAdmin}
        Crea tu primera carpeta desde la sección Carpetas.
      {:else}
        Aún no te uniste a ninguna. Ve a “Unirse a carpeta” y pega el código que te dio tu ADMIN.
      {/if}
    </p>
  </div>
{:else}
  <div class="grid">
    {#each folders as f}
      <div class="panel folder-card" onclick={() => open(f.id)} onkeydown={(e) => e.key === 'Enter' && open(f.id)} role="button" tabindex="0">
        <div class="folder-top">
          <span class="folder-dot" style="background:{f.color}"></span>
          <b>{f.name}</b>
        </div>
        <p class="muted" style="margin:8px 0">{f.description || 'Sin descripción'}</p>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <span class="folder-code with-icon"><KeyRound size={12} /> {f.code}</span>
          <span class="muted with-icon" style="font-size:12px"><Layers size={12} /> {f.cards.length} · <Users size={12} /> {f.memberIds.length}</span>
        </div>
      </div>
    {/each}
  </div>
{/if}
