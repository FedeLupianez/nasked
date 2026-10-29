<script lang="ts">
  import { store } from './store.svelte';
  import CardItem from './CardItem.svelte';
  import CardForm from './CardForm.svelte';
  import { getDueInfo } from './utils';
  import {
    Users,
    ArrowLeft,
    Plus,
    LogOut,
    UserPlus,
    UserX,
    UserCheck,
    Search,
    ArrowDownUp,
    FileText,
    ChevronRight,
    Paperclip,
    LayoutGrid,
    List,
    X,
  } from 'lucide-svelte';

  let showForm = $state(false);
  let sort: 'due' | 'recent' = $state('due');
  let showMemberManager = $state(false);
  let memberSelection = $state<string[]>([]);
  let query = $state('');
  let selectedCardId = $state<string | null>(null);
  let layout: 'list' | 'grid' = $state('list');

  // usuarios de la empresa = rol USER
  let companyUsers = $derived(
    store.users.filter((u) => u.role === 'USER'),
  );

  function openMemberManager() {
    memberSelection = [...(folder?.memberIds ?? [])];
    showMemberManager = true;
  }

  function toggleMemberInManager(id: string) {
    if (memberSelection.includes(id)) {
      memberSelection = memberSelection.filter((x) => x !== id);
    } else {
      memberSelection = [...memberSelection, id];
    }
  }

  function toggleAllMembersInManager() {
    if (memberSelection.length === companyUsers.length) {
      memberSelection = [];
    } else {
      memberSelection = companyUsers.map((u) => u.id);
    }
  }

  function saveMembers() {
    if (!folder) return;
    // update folder memberIds
    folder.memberIds = [...memberSelection];
    // sync users' joinedFolderIds
    for (const u of store.users) {
      const wasMember = u.joinedFolderIds.includes(folder.id);
      const isMember = memberSelection.includes(u.id);
      if (wasMember && !isMember) {
        u.joinedFolderIds = u.joinedFolderIds.filter((x) => x !== folder.id);
      } else if (!wasMember && isMember) {
        u.joinedFolderIds.push(folder.id);
      }
    }
    store.persistLocalData();
    showMemberManager = false;
  }

  let folder = $derived(store.selectedFolder);
  let view = $derived(store.view);

  let dueTodayCount = $derived.by(() => {
    const now = new Date();
    return (folder?.cards ?? []).filter(
      (c) => new Date(c.dueDate).toDateString() === now.toDateString(),
    ).length;
  });

  let subtitle = $derived(
    dueTodayCount === 0
      ? 'No hay vencimientos para hoy.'
      : dueTodayCount === 1
        ? 'Hay 1 vencimiento para hoy.'
        : `Hay ${dueTodayCount} vencimientos para hoy.`,
  );

  let cards = $derived.by(() => {
    if (!folder) return [];
    const arr = [...folder.cards];
    if (sort === 'due') arr.sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));
    else arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    const q = query.trim().toLowerCase();
    if (!q) return arr;
    return arr.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  });

  let recent = $derived(
    cards.length
      ? [...cards].sort(
          (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
        )[0]
      : null,
  );

  let selectedCard = $derived(
    selectedCardId
      ? (folder?.cards.find((c) => c.id === selectedCardId) ?? null)
      : null,
  );

  function toggleSort() {
    sort = sort === 'due' ? 'recent' : 'due';
  }

  function toggleLayout() {
    layout = layout === 'list' ? 'grid' : 'list';
  }

  function openCard(id: string) {
    selectedCardId = id;
  }

  function closeCard() {
    selectedCardId = null;
  }

  $effect(() => {
    const id = store.highlightCardId;
    if (!id || view !== 'folder-detail') return;
    selectedCardId = id;
  });
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape') closeCard(); }} />

{#if !folder}
  <div class="panel">
    <h3>Selecciona una carpeta</h3>
    <p class="muted">Ve a Mis carpetas y abre una para ver sus tarjetas.</p>
    <button class="btn btn-ghost with-icon" onclick={() => (store.view = 'folders')}><ArrowLeft size={15} /> Ver carpetas</button>
  </div>
{:else}
  <div class="folder-page">
    <header class="folder-hero">
      <h2>{folder.name}</h2>
      <p>{subtitle}</p>
    </header>

    <div class="folder-search-row">
      <div class="folder-search">
        <Search size={18} />
        <input
          type="search"
          placeholder={`Buscar tarjetas en ${folder.name}...`}
          bind:value={query}
        />
      </div>
      <div class="folder-actions">
        <button
          class="round-btn"
          title={layout === 'list' ? 'Ver como cuadrícula' : 'Ver como lista'}
          onclick={toggleLayout}
        >
          {#if layout === 'list'}<LayoutGrid size={17} />{:else}<List size={17} />{/if}
        </button>
        <button
          class="round-btn"
          title={sort === 'due' ? 'Ordenar por vencimiento' : 'Ordenar por recientes'}
          onclick={toggleSort}
        >
          <ArrowDownUp size={17} />
        </button>
        {#if store.isAdmin}
          <button class="round-btn" title="Gestionar acceso" onclick={openMemberManager}>
            <UserPlus size={17} />
          </button>
          <button class="round-btn" title="Nueva tarjeta" onclick={() => (showForm = true)}>
            <Plus size={18} />
          </button>
        {:else}
          <button class="round-btn" title="Salir de la carpeta" onclick={() => store.leaveFolder(folder.id)}>
            <LogOut size={16} />
          </button>
        {/if}
      </div>
    </div>

    <hr class="folder-rule" />

    {#if !cards.length}
      <section class="folder-empty">
        <svg class="folder-empty-art" width="230" height="120" viewBox="0 0 230 120" fill="none" aria-hidden="true">
          <g stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
            <path d="M14 52a7 7 0 0 1 7-7h24l9 10h33a7 7 0 0 1 7 7v31a7 7 0 0 1-7 7H21a7 7 0 0 1-7-7V52Z" opacity=".35" />
            <path d="M62 40a7 7 0 0 1 7-7h24l9 10h33a7 7 0 0 1 7 7v43a7 7 0 0 1-7 7H69a7 7 0 0 1-7-7V40Z" opacity=".6" />
            <path d="M110 28a7 7 0 0 1 7-7h24l9 10h33a7 7 0 0 1 7 7v55a7 7 0 0 1-7 7h-66a7 7 0 0 1-7-7V28Z" opacity=".9" />
          </g>
        </svg>
        <p>
          {#if query.trim()}
            No encontramos coincidencias para “{query.trim()}”.
          {:else}
            Todavía no hay tarjetas en esta carpeta.
          {/if}
        </p>
        {#if store.isAdmin && !query.trim()}
          <button class="btn btn-primary btn-small with-icon" onclick={() => (showForm = true)}>
            <Plus size={14} /> Nueva tarjeta
          </button>
        {/if}
      </section>
    {:else}
      {#if recent}
        <section class="folder-section">
          <h3>Últimos subidos</h3>
          {#if layout === 'grid'}
            <div class="card-grid">
              <button
                class="card-tile"
                class:active={selectedCardId === recent.id}
                class:card-highlight={store.highlightCardId === recent.id}
                onclick={() => openCard(recent.id)}
              >
                <span class="file-glyph"><FileText size={20} /></span>
                <b>{recent.title}</b>
                <small>{recent.description || 'Sin descripción'}</small>
                <span class="tile-foot">
                  <span class="due {getDueInfo(recent.dueDate).status}">{getDueInfo(recent.dueDate).short}</span>
                  {#if recent.attachments?.length}
                    <span class="file-count with-icon">
                      <Paperclip size={12} /> {recent.attachments.length}
                    </span>
                  {/if}
                </span>
              </button>
            </div>
          {:else}
            <button class="recent-file-card" onclick={() => openCard(recent.id)}>
              <span class="file-glyph"><FileText size={22} /></span>
              <span class="recent-file-main">
                <b>{recent.title}</b>
                <small>{folder.code} · {recent.description || 'Sin descripción'}</small>
              </span>
              <span class="due {getDueInfo(recent.dueDate).status}">{getDueInfo(recent.dueDate).short}</span>
            </button>
          {/if}
        </section>
      {/if}

      <section class="folder-section">
        <h3>Todas las tarjetas <span class="count">{cards.length}</span></h3>
        {#if layout === 'grid'}
          <div class="card-grid">
            {#each cards as c (c.id)}
              <button
                class="card-tile"
                class:active={selectedCardId === c.id}
                class:card-highlight={store.highlightCardId === c.id}
                onclick={() => openCard(c.id)}
              >
                <span class="file-glyph"><FileText size={20} /></span>
                <b>{c.title}</b>
                <small>{c.description || 'Sin descripción'}</small>
                <span class="tile-foot">
                  <span class="due {getDueInfo(c.dueDate).status}">{getDueInfo(c.dueDate).short}</span>
                  {#if c.attachments?.length}
                    <span class="file-count with-icon">
                      <Paperclip size={12} /> {c.attachments.length}
                    </span>
                  {/if}
                </span>
              </button>
            {/each}
          </div>
        {:else}
          <div class="file-list">
            {#each cards as c (c.id)}
              <div
                class="file-entry"
                class:card-highlight={store.highlightCardId === c.id}
              >
                <button
                  class="file-row"
                  onclick={() => openCard(c.id)}
                >
                  <span class="file-glyph small"><FileText size={17} /></span>
                  <span class="file-row-main">
                    <b>{c.title}</b>
                    <small>{c.description || 'Sin descripción'}</small>
                  </span>
                  <span class="file-row-meta">
                    <span class="due {getDueInfo(c.dueDate).status}">{getDueInfo(c.dueDate).short}</span>
                    {#if c.attachments?.length}
                      <span class="file-count with-icon">
                        <Paperclip size={12} /> {c.attachments.length}
                      </span>
                    {/if}
                  </span>
                  <ChevronRight size={16} class="chev" />
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </section>
    {/if}
  </div>

  {#if selectedCard}
    <div
      class="modal-back"
      onclick={(e) => { if (e.target === e.currentTarget) closeCard(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Detalle de tarjeta"
      tabindex="-1"
    >
      <div class="modal card-modal">
        <header class="card-modal-head">
          <span class="card-modal-kicker with-icon"><FileText size={15} /> Detalle de tarjeta</span>
          <button class="icon-btn" onclick={closeCard} aria-label="Cerrar"><X size={18} /></button>
        </header>
        <CardItem card={selectedCard} folderId={folder.id} />
      </div>
    </div>
  {/if}

  {#if showForm}
    <CardForm folderId={folder.id} onclose={() => (showForm = false)} />
  {/if}

  {#if showMemberManager}
    <div class="modal-back" onclick={() => (showMemberManager = false)} role="dialog" aria-modal="true" aria-labelledby="member-manager-title">
      <div class="modal" onclick={(e) => e.stopPropagation()}>
        <header class="row" style="justify-content: space-between; margin-bottom: 16px;">
          <h3 id="member-manager-title" class="with-icon"><Users size={18} /> Gestionar acceso a la carpeta</h3>
          <button class="icon-btn" onclick={() => (showMemberManager = false)} aria-label="Cerrar"><UserX size={18} /></button>
        </header>
        <p class="muted" style="margin-bottom: 16px;">Seleccioná los usuarios de la empresa que tendrán acceso a esta carpeta.</p>
        <div class="member-list">
          <label class="member-select-all">
            <input
              type="checkbox"
              checked={memberSelection.length === companyUsers.length && companyUsers.length > 0}
              indeterminate={memberSelection.length > 0 && memberSelection.length < companyUsers.length}
              onchange={toggleAllMembersInManager}
            />
            <span>Seleccionar todos ({companyUsers.length})</span>
          </label>
          {#if companyUsers.length > 0}
            {#each companyUsers as u}
              <label class="member-item">
                <input
                  type="checkbox"
                  checked={memberSelection.includes(u.id)}
                  onchange={() => toggleMemberInManager(u.id)}
                />
                <span class="member-avatar" style="background:{u.avatarColor}">{u.name.charAt(0)}</span>
                <span class="member-name">{u.name}</span>
                <span class="member-email">{u.email}</span>
              </label>
            {/each}
          {:else}
            <p class="muted" style="padding: 8px;">No hay usuarios USER en la plataforma.</p>
          {/if}
        </div>
        <div class="row row-end" style="margin-top: 20px;">
          <button class="btn btn-ghost" onclick={() => (showMemberManager = false)}>Cancelar</button>
          <button class="btn btn-primary with-icon" onclick={saveMembers}><UserCheck size={14} /> Guardar cambios</button>
        </div>
      </div>
    </div>
  {/if}
{/if}

<style>
  .folder-page {
    width: 100%;
    max-width: 980px;
    margin: 0 auto;
    padding: 0 8px 48px;
    box-sizing: border-box;
  }

  .folder-hero {
    text-align: center;
    padding: 28px 0 32px;
  }
  .folder-hero h2 {
    margin: 0;
    font-size: 30px;
    font-weight: 600;
    letter-spacing: -0.02em;
  }
  .folder-hero p {
    margin: 8px 0 0;
    color: var(--muted);
    font-size: 14px;
  }

  .folder-search-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .folder-search {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 11px 18px;
    transition: border-color .16s ease, box-shadow .16s ease;
  }
  .folder-search:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
  .folder-search :global(svg) { color: var(--muted); flex-shrink: 0; }
  .folder-search input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: 0;
    outline: none;
    color: var(--text);
    font-size: 14.5px;
    font-family: inherit;
  }
  .folder-search input::placeholder { color: var(--faint); }

  .folder-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
  .round-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--panel);
    color: var(--muted);
    border: 1px solid var(--border);
    cursor: pointer;
    transition: color .16s ease, border-color .16s ease, background .16s ease;
  }
  .round-btn:hover {
    color: var(--text);
    border-color: var(--border-strong);
    background: var(--panel-2);
  }

  .folder-rule {
    border: 0;
    border-top: 1px solid var(--border);
    margin: 18px 0 28px;
  }

  .folder-section { margin-bottom: 30px; }
  .folder-section > h3 {
    margin: 0 0 14px;
    font-size: 17px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  .folder-section .count {
    color: var(--faint);
    font-weight: 400;
    margin-left: 6px;
  }

  .recent-file-card {
    width: 100%;
    text-align: left;
    font-family: inherit;
    display: flex;
    align-items: center;
    gap: 16px;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 26px 24px;
    cursor: pointer;
    color: var(--text);
    transition: border-color .16s ease, box-shadow .16s ease, transform .16s ease;
  }
  .recent-file-card:hover {
    border-color: var(--border-strong);
    box-shadow: var(--shadow-1);
    transform: translateY(-1px);
  }
  .recent-file-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .recent-file-main b { font-size: 16px; font-weight: 600; }
  .recent-file-main small {
    font-size: 13px;
    color: var(--faint);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-glyph {
    width: 46px;
    height: 46px;
    border-radius: var(--radius-sm);
    display: grid;
    place-items: center;
    flex-shrink: 0;
    background: var(--panel-2);
    border: 1px solid var(--border);
    color: var(--muted);
  }
  .file-glyph.small { width: 34px; height: 34px; }
  .file-glyph :global(svg) { display: block; }

  .file-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .file-entry { border-radius: var(--radius); }
  .file-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px 16px;
    cursor: pointer;
    color: var(--text);
    font-family: inherit;
    text-align: left;
    transition: border-color .16s ease, background .16s ease;
  }
  .file-row:hover {
    border-color: var(--border-strong);
    background: var(--panel-2);
  }
  .file-row-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .file-row-main b { font-size: 14.5px; font-weight: 600; }
  .file-row-main small {
    font-size: 12.5px;
    color: var(--faint);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .file-row-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .file-row-meta :global(.due) { white-space: nowrap; }
  .file-count { font-size: 12px; color: var(--faint); }
  .chev {
    color: var(--faint);
    flex-shrink: 0;
  }

  .card-modal {
    width: 620px;
  }
  .card-modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }
  .card-modal-kicker {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--faint);
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 12px;
  }
  .card-tile {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    min-height: 160px;
    padding: 16px;
    text-align: left;
    color: var(--text);
    font-family: inherit;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
    transition: border-color .16s ease, background .16s ease,
      box-shadow .16s ease, transform .16s ease;
  }
  .card-tile:hover {
    border-color: var(--border-strong);
    background: var(--panel-2);
    box-shadow: var(--shadow-1);
    transform: translateY(-1px);
  }
  .card-tile.active {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
  .card-tile b {
    font-size: 14px;
    font-weight: 600;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .card-tile small {
    font-size: 12.5px;
    color: var(--faint);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .tile-foot {
    width: 100%;
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .tile-foot :global(.due) {
    font-size: 11px;
    padding: 4px 8px;
  }

  .folder-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 48px 24px 60px;
    text-align: center;
  }
  .folder-empty p {
    margin: 0;
    color: var(--muted);
    font-size: 14px;
  }
  .folder-empty-art {
    color: var(--faint);
    opacity: .7;
  }

  @media (max-width: 640px) {
    .folder-hero h2 { font-size: 24px; }
    .folder-search-row { flex-wrap: wrap; }
    .folder-search { flex-basis: 100%; }
    .folder-actions { margin-left: auto; }
    .file-row-meta :global(.due) { display: none; }
  }
</style>
