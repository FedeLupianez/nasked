<script lang="ts">
  import { store } from './store.svelte';
  import CardItem from './CardItem.svelte';
  import CardForm from './CardForm.svelte';
  import { getDueInfo } from './utils';
  import { masonry, isPositioned } from './masonry';
  import {
    FolderOpen,
    Users,
    KeyRound,
    ArrowLeft,
    Plus,
    LogOut,
    CircleCheck,
    Clock,
    Flame,
    Ban,
    UserPlus,
    UserX,
    UserCheck,
  } from 'lucide-svelte';

  let showForm = $state(false);
  let sort: 'due' | 'recent' = $state('due');
  let showMemberManager = $state(false);
  let memberSelection = $state<string[]>([]);

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
    store.persist();
    showMemberManager = false;
  }

  let folder = $derived(store.selectedFolder);
  let cards = $derived.by(() => {
    if (!folder) return [];
    const arr = [...folder.cards];
    if (sort === 'due') arr.sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));
    else arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    const q = store.search.toLowerCase();
    if (!q) return arr;
    return arr.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  });
  let stats = $derived.by(() => {
    const all = folder?.cards ?? [];
    return {
      ok: all.filter((c) => getDueInfo(c.dueDate).status === 'ok').length,
      soon: all.filter((c) => getDueInfo(c.dueDate).status === 'soon').length,
      urgent: all.filter((c) => getDueInfo(c.dueDate).status === 'urgent').length,
      overdue: all.filter((c) => getDueInfo(c.dueDate).status === 'overdue').length
    };
  });

  let view = $derived(store.view);
  /**
   * Card a la que hay que hacer scroll. No es $state a proposito: se lee dentro
   * del mismo $effect que la escribe, y si fuera reactivo el efecto se
   * re-dispararia en loop reiniciando el scroll suave.
   */
  let pendingScrollId: string | null = null;

  $effect(() => {
    const id = store.highlightCardId;
    if (!id || view !== 'folder-detail') {
      pendingScrollId = null;
      return;
    }
    pendingScrollId = id;
    probeTop = -1;
    probeHits = 0;
    scrollWhenPlaced(id);
  });

  /**
   * Con posicionamiento absoluto las cards arrancan en top:0 recién montadas y
   * masonry las va moviendo durante los primeros frames. Hay que esperar a que la
   * posición se estabilice: si se scrollea mientras la card todavía se mueve, el
   * navegador aborta el scroll suave en curso y nunca llega al destino.
   *
   * Se exigen STABLE_FRAMES frames seguidos con la misma posición porque al
   * escribir el transform el rect recién se recalcula al frame siguiente: con un
   * solo frame de confirmación el scroll se dispara contra la posición vieja.
   */
  const STABLE_FRAMES = 3;
  let probeTop = -1;
  let probeHits = 0;

  function scrollWhenPlaced(id: string, frame = 0) {
    if (pendingScrollId !== id) return;
    const el = document.getElementById(`card-${id}`);
    if (!el) return;
    const top = Math.round(el.getBoundingClientRect().top);
    probeHits = isPositioned(el) && top === probeTop ? probeHits + 1 : 0;
    probeTop = top;
    if (frame < 30 && probeHits < STABLE_FRAMES) {
      requestAnimationFrame(() => scrollWhenPlaced(id, frame + 1));
      return;
    }
    probeTop = -1;
    probeHits = 0;
    pendingScrollId = null;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
</script>

{#if !folder}
  <div class="panel">
    <h3>Selecciona una carpeta</h3>
    <p class="muted">Ve a Mis carpetas y abre una para ver sus tarjetas.</p>
    <button class="btn btn-ghost with-icon" onclick={() => (store.view = 'folders')}><ArrowLeft size={15} /> Ver carpetas</button>
  </div>
{:else}
  <div class="panel" style="border-left: 4px solid {folder.color}">
    <div class="row">
      <div class="grow">
        <h3 class="with-icon panel-title"><FolderOpen size={18} /> {folder.name}</h3>
        <p class="muted with-icon">{folder.description} · <Users size={12} /> {folder.memberIds.length} miembros</p>
      </div>
      <span class="folder-code with-icon"><KeyRound size={12} /> {folder.code}</span>
      <select class="select" bind:value={sort}>
        <option value="due">Orden: vencimiento</option>
        <option value="recent">Orden: recientes</option>
      </select>
      {#if store.isAdmin}
        <div class="row" style="gap: 8px;">
          <button class="btn btn-primary btn-small with-icon" onclick={() => (showForm = true)}><Plus size={14} /> Nueva tarjeta</button>
          <button class="btn btn-ghost btn-small with-icon" onclick={openMemberManager}><UserPlus size={14} /> Gestionar acceso</button>
        </div>
      {:else}
        <button class="btn btn-ghost btn-small with-icon" onclick={() => store.leaveFolder(folder.id)}><LogOut size={13} /> Salir de la carpeta</button>
      {/if}
    </div>
    <div class="stats">
      <div class="stat"><small class="with-icon"><CircleCheck size={13} /> En tiempo</small><b>{stats.ok}</b></div>
      <div class="stat"><small class="with-icon"><Clock size={13} /> Pronto (&lt;72h)</small><b>{stats.soon}</b></div>
      <div class="stat"><small class="with-icon"><Flame size={13} /> Urgente (&lt;24h)</small><b>{stats.urgent}</b></div>
      <div class="stat"><small class="with-icon"><Ban size={13} /> Vencidas</small><b>{stats.overdue}</b></div>
    </div>
  </div>

  <div class="mt16"></div>

  {#if !cards.length}
    <div class="panel">
      <h3>Sin tarjetas</h3>
      <p class="muted">
        {#if store.isAdmin} Crea la primera actividad con fecha de vencimiento y campos infinitos.
        {:else} Aún no hay actividades en esta carpeta. Vuelve pronto.
        {/if}
      </p>
    </div>
  {:else}
    <div class="masonry" use:masonry={{ minColWidth: 300, colGap: 16, rowGap: 16 }}>
      {#each cards as c (c.id)}
        <div id={`card-${c.id}`} class:card-highlight={store.highlightCardId === c.id}>
          <CardItem card={c} folderId={folder.id} />
        </div>
      {/each}
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
