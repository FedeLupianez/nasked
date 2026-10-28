<script lang="ts">
  import { store } from "./store.svelte";
  import { FOLDER_COLORS } from "./utils";
  import {
    Plus,
    Folder,
    UserPlus,
    KeyRound,
    Layers,
    Users,
    Trash2,
    LogOut,
    ImagePlus,
    UserCheck,
    UserX,
  } from "lucide-svelte";
  import BannerEditor from "./BannerEditor.svelte";

  let name = $state("");
  let description = $state("");
  let color = $state(FOLDER_COLORS[0]);
  let selectedMemberIds = $state<string[]>([]);
  let error = $state<string | null>(null);
  let editingBannerId = $state<string | null>(null);
  let q = $derived(store.search.toLowerCase());
  let showMemberPicker = $state(false);

  // usuarios de la empresa = rol USER (no admins)
  let companyUsers = $derived(
    store.users.filter((u) => u.role === "USER" && u.id !== store.currentUserId),
  );

  let list = $derived(
    store.visibleFolders.filter((f) =>
      !q
        ? true
        : f.name.toLowerCase().includes(q) || f.code.toLowerCase().includes(q),
    ),
  );

  async function create(e: Event) {
    e.preventDefault();
    error = await store.createFolder(name, description, color, selectedMemberIds);
    if (!error) {
      name = "";
      description = "";
      color = FOLDER_COLORS[0];
      selectedMemberIds = [];
      showMemberPicker = false;
    }
  }
  function open(id: string) {
    store.selectedFolderId = id;
    store.view = "folder-detail";
  }

  function toggleMember(id: string) {
    if (selectedMemberIds.includes(id)) {
      selectedMemberIds = selectedMemberIds.filter((x) => x !== id);
    } else {
      selectedMemberIds = [...selectedMemberIds, id];
    }
  }

  function toggleAllMembers() {
    if (selectedMemberIds.length === companyUsers.length) {
      selectedMemberIds = [];
    } else {
      selectedMemberIds = companyUsers.map((u) => u.id);
    }
  }
</script>

<div class="split">
  {#if store.isAdmin}
    <form class="panel panel-form" onsubmit={create}>
      <header class="panel-header">
        <h3 class="with-icon"><Plus size={15} /> Nueva carpeta</h3>
        <p class="muted">Crea un espacio para organizar tarjetas y colaborar</p>
      </header>
      <div class="panel-fields">
        <div class="field">
          <label for="folder-name">Nombre <span class="required">*</span></label
          >
          <input
            id="folder-name"
            bind:value={name}
            placeholder="Ej: Historia 2026"
            aria-required="true"
          />
        </div>
        <div class="field">
          <label for="folder-desc">Descripción</label>
          <textarea
            id="folder-desc"
            bind:value={description}
            rows="2"
            placeholder="¿Para qué es este espacio?"
          ></textarea>
        </div>
        <div class="field">
          <label for="folder-color">Color</label>
          <div
            class="color-row"
            role="radiogroup"
            aria-label="Color de carpeta"
          >
            {#each FOLDER_COLORS as c}
              <button
                class="color-dot {color === c ? 'sel' : ''}"
                style="background:{c}"
                onclick={() => (color = c)}
                onkeydown={(e) => e.key === "Enter" && (color = c)}
                role="radio"
                aria-checked={color === c}
                aria-label={"Color " + c}
              ></button>
            {/each}
          </div>
        </div>
        <div class="field">
          <label for="folder-members">Acceso inicial</label>
          <div class="member-picker">
            <button
              type="button"
              class="btn btn-ghost btn-small with-icon"
              onclick={() => (showMemberPicker = !showMemberPicker)}
              aria-expanded={showMemberPicker}
            >
              {#if showMemberPicker}
                <UserX size={14} /> Ocultar selección
              {:else}
                <UserCheck size={14} /> Seleccionar usuarios
              {/if}
              <span class="member-count">{selectedMemberIds.length} de {companyUsers.length}</span>
            </button>
            {#if showMemberPicker && companyUsers.length > 0}
              <div class="member-list">
                <label class="member-select-all">
                  <input
                    type="checkbox"
                    checked={selectedMemberIds.length === companyUsers.length && companyUsers.length > 0}
                    indeterminate={selectedMemberIds.length > 0 && selectedMemberIds.length < companyUsers.length}
                    onchange={toggleAllMembers}
                  />
                  <span>Seleccionar todos ({companyUsers.length})</span>
                </label>
                {#each companyUsers as u}
                  <label class="member-item">
                    <input
                      type="checkbox"
                      checked={selectedMemberIds.includes(u.id)}
                      onchange={() => toggleMember(u.id)}
                    />
                    <span class="member-avatar" style="background:{u.avatarColor}">{u.name.charAt(0)}</span>
                    <span class="member-name">{u.name}</span>
                    <span class="member-email">{u.email}</span>
                  </label>
                {/each}
              </div>
            {:else if showMemberPicker}
              <p class="muted" style="margin: 8px 0 0;">No hay usuarios USER en la plataforma.</p>
            {/if}
          </div>
        </div>
      </div>
      {#if error}<div class="error panel-error">{error}</div>{/if}
      <button class="btn btn-primary btn-block" type="submit"
        >Crear carpeta</button
      >
    </form>
  {:else}
    <div class="panel panel-info">
      <header class="panel-header">
        <h3 class="with-icon">
          <Folder size={15} />
          {store.visibleFolders.length} carpetas unidas
        </h3>
        <p class="muted">
          Como USER solo ves las carpetas a las que te uniste. Para entrar a
          otra necesitas su código.
        </p>
      </header>
      <button
        class="btn btn-primary btn-block with-icon"
        onclick={() => (store.view = "join")}
        ><UserPlus size={15} /> Unirse con código</button
      >
    </div>
  {/if}

  <section class="folder-list" aria-label="Lista de carpetas">
    {#if !list.length}
      <div class="panel panel-empty">
        <div class="empty-state">
          <Folder size={48} class="empty-icon" />
          <h3>Sin resultados</h3>
          <p class="muted">
            Prueba con otra búsqueda o crea / únete a una carpeta.
          </p>
        </div>
      </div>
    {:else}
      <div class="stack">
        {#each list as f}
          <article
            class="folder-card"
            class:has-img={!!f.bannerUrl}
            onclick={() => open(f.id)}
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === "Enter" && open(f.id)}
          >
            {#if f.bannerUrl}
              <img
                class="folder-banner-img"
                src={f.bannerUrl}
                alt="Portada de {f.name}"
              />
            {/if}
            <div class="folder-body">
              <header class="folder-header">
                <span
                  class="folder-dot"
                  style="background:{f.color}"
                  aria-hidden="true"
                ></span>
                <h4 class="folder-name">{f.name}</h4>
                <span class="folder-code with-icon"
                  ><KeyRound size={12} /> {f.code}</span
                >
              </header>
              <p class="folder-meta with-icon">
                {f.description || "Sin descripción"}
                <span class="meta-divider" aria-hidden="true">·</span>
                <Layers size={12} />
                {f.cards.length} tarjetas
                <span class="meta-divider" aria-hidden="true">·</span>
                <Users size={12} />
                {f.memberIds.length} miembros
              </p>
              <footer class="folder-actions">
                <button
                  class="icon-btn"
                  title={f.bannerUrl ? "Cambiar portada" : "Agregar portada"}
                  onclick={(e) => {
                    e.stopPropagation();
                    editingBannerId = editingBannerId === f.id ? null : f.id;
                  }}
                  aria-label={f.bannerUrl
                    ? "Cambiar portada"
                    : "Agregar portada"}><ImagePlus size={16} /></button
                >
                {#if store.isAdmin}
                  <button
                    class="btn btn-danger btn-small with-icon"
                    onclick={(e) => {
                      e.stopPropagation();
                      if (confirm(`¿Eliminar "${f.name}"?`))
                        store.deleteFolder(f.id);
                    }}
                    aria-label={"Eliminar " + f.name}
                    ><Trash2 size={13} /> Eliminar</button
                  >
                {:else}
                  <button
                    class="btn btn-ghost btn-small with-icon"
                    onclick={(e) => {
                      e.stopPropagation();
                      if (confirm(`¿Salir de "${f.name}"?`))
                        store.leaveFolder(f.id);
                    }}
                    aria-label={"Salir de " + f.name}
                    ><LogOut size={13} /> Salir</button
                  >
                {/if}
              </footer>
              {#if editingBannerId === f.id}
                <div
                  class="banner-editor-wrap"
                  onclick={(e) => e.stopPropagation()}
                  role="presentation"
                >
                  <BannerEditor
                    url={f.bannerUrl ?? ""}
                    onsave={(u) => {
                      store.setFolderBanner(f.id, u);
                      editingBannerId = null;
                    }}
                    onclose={() => (editingBannerId = null)}
                  />
                </div>
              {/if}
            </div>
          </article>
        {/each}
      </div>
    {/if}
  </section>
</div>

<style>
  .split {
    padding-top: 2rem;
  }
  /* Responsive split layout */
  @media (max-width: 1024px) {
    .split {
      grid-template-columns: 1fr;
    }
    .panel-form {
      position: sticky;
      top: calc(var(--topbar-h) + 16px);
    }
  }

  /* Panel variants */
  .panel-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
  }
  .panel-header h3 {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 600;
  }
  .panel-header .muted {
    margin: 0;
    font-size: 13px;
  }

  .panel-fields {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .panel-error {
    margin-top: 12px;
  }

  .panel-info {
    text-align: center;
    padding: 28px 20px;
  }
  .panel-info .panel-header {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 20px;
  }
  .panel-info h3 {
    font-size: 15px;
  }

  .panel-empty {
    text-align: center;
    padding: 48px 24px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .empty-icon {
    color: var(--faint);
    opacity: 0.6;
  }
  .empty-state h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
  .empty-state .muted {
    margin: 0;
    max-width: 280px;
  }

  /* Folder list section */
  .folder-list {
    min-width: 0;
  }

  /* Stack spacing for folder cards */
  .stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Folder card improvements */
  .folder-card {
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition:
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      transform 0.14s ease;
    border-radius: 14px;
  }
  .folder-card:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
  .folder-card.has-img {
    padding: 0;
  }
  .folder-card:hover {
    border-color: var(--border-strong);
    box-shadow: var(--shadow-1);
    transform: translateY(-1px);
  }
  .folder-card:active {
    transform: translateY(0);
  }

  .folder-banner-img {
    width: 100%;
    height: 140px;
    object-fit: cover;
    display: block;
    border-bottom: 1px solid var(--border);
  }

  .folder-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 18px;
  }

  .folder-header {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    flex-wrap: wrap;
  }

  .folder-dot {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    flex-shrink: 0;
    margin-top: 3px;
  }

  .folder-name {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    flex: 1 1 auto;
    min-width: 0;
  }

  .folder-code {
    font-family: var(--mono);
    font-size: 11px;
    background: var(--panel-2);
    border: 1px dashed var(--border-strong);
    padding: 4px 8px;
    border-radius: 6px;
    color: var(--muted);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .folder-meta {
    margin: 0;
    font-size: 12.5px;
    line-height: 1.5;
    color: var(--muted);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }

  .meta-divider {
    color: var(--faint);
  }

  .folder-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 4px;
    padding-top: 8px;
    border-top: 1px solid var(--border);
  }

  .banner-editor-wrap {
    margin-top: 4px;
    padding-top: 8px;
    border-top: 1px solid var(--border);
    animation: slide-down 0.18s ease;
  }

  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  /* Color picker */
  .color-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .color-dot {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    transition:
      transform 0.14s ease,
      border-color 0.14s ease,
      box-shadow 0.14s ease;
  }
  .color-dot:hover {
    transform: scale(1.12);
  }
  .color-dot:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
  .color-dot.sel {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  .required {
    color: var(--red);
    margin-left: 2px;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .folder-card,
    .color-dot,
    .banner-editor-wrap {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
    }
  }
</style>
