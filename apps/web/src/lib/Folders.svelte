<script lang="ts">
  import { store } from './store.svelte';
  import { FOLDER_COLORS } from './utils';
  import { Plus, Folder, UserPlus, KeyRound, Layers, Users, Trash2, LogOut, ImagePlus } from 'lucide-svelte';
  import BannerEditor from './BannerEditor.svelte';

  let name = $state('');
  let description = $state('');
  let color = $state(FOLDER_COLORS[0]);
  let error = $state<string | null>(null);
  let editingBannerId = $state<string | null>(null);
  let q = $derived(store.search.toLowerCase());

  let list = $derived(
    store.visibleFolders.filter((f) => (!q ? true : f.name.toLowerCase().includes(q) || f.code.toLowerCase().includes(q)))
  );

  function create(e: Event) {
    e.preventDefault();
    error = store.createFolder(name, description, color);
    if (!error) { name = ''; description = ''; }
  }
  function open(id: string) {
    store.selectedFolderId = id;
    store.view = 'folder-detail';
  }
</script>

<div class="grid" style="grid-template-columns: 340px 1fr; align-items:start">
  {#if store.isAdmin}
    <form class="panel" onsubmit={create}>
      <h3 class="with-icon"><Plus size={15} /> Nueva carpeta</h3>
      <p class="muted">Solo ADMIN. Se genera un código para que los USER se unan.</p>
      <div class="field"><label>Nombre *</label><input bind:value={name} placeholder="Ej: Historia 2026" /></div>
      <div class="field"><label>Descripción</label><textarea bind:value={description} rows="2" placeholder="¿Para qué es este espacio?"></textarea></div>
      <div class="field">
        <label>Color</label>
        <div class="color-row">
          {#each FOLDER_COLORS as c}
            <div class="color-dot {color === c ? 'sel' : ''}" style="background:{c}" onclick={() => (color = c)} onkeydown={(e) => e.key === 'Enter' && (color = c)} role="button" tabindex="0"></div>
          {/each}
        </div>
      </div>
      {#if error}<div class="error" style="margin-top:10px">{error}</div>{/if}
      <button class="btn btn-primary" style="margin-top:12px;width:100%" type="submit">Crear carpeta</button>
    </form>
  {:else}
    <div class="panel">
      <h3 class="with-icon"><Folder size={15} /> {store.visibleFolders.length} carpetas unidas</h3>
      <p class="muted">Como USER solo ves las carpetas a las que te uniste. Para entrar a otra necesitas su código.</p>
      <button class="btn btn-primary with-icon" style="width:100%" onclick={() => (store.view = 'join')}><UserPlus size={15} /> Unirse con código</button>
    </div>
  {/if}

  <div style="display:flex;flex-direction:column;gap:12px;min-width:0">
    {#if !list.length}
      <div class="panel"><h3>Sin resultados</h3><p class="muted">Prueba con otra búsqueda o crea / únete a una carpeta.</p></div>
    {:else}
      {#each list as f}
        <div class="panel folder-card" class:has-img={!!f.bannerUrl} onclick={() => open(f.id)} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && open(f.id)}>
          {#if f.bannerUrl}
            <img class="folder-banner-img" src={f.bannerUrl} alt="Portada de {f.name}" />
          {/if}
          <div class="folder-body">
          <div style="display:flex;gap:10px;align-items:center">
            <span class="folder-dot" style="background:{f.color}"></span>
            <b>{f.name}</b>
            <span style="flex:1"></span>
            <span class="folder-code with-icon"><KeyRound size={12} /> {f.code}</span>
            <button
              class="icon-btn"
              title={f.bannerUrl ? 'Cambiar portada' : 'Agregar portada'}
              onclick={(e) => { e.stopPropagation(); editingBannerId = editingBannerId === f.id ? null : f.id; }}
            ><ImagePlus size={16} /></button>
            {#if store.isAdmin}
              <button
                class="btn btn-danger btn-small with-icon"
                onclick={(e) => { e.stopPropagation(); if (confirm(`¿Eliminar "${f.name}"?`)) store.deleteFolder(f.id); }}
              ><Trash2 size={13} /> Eliminar</button>
            {:else}
              <button
                class="btn btn-ghost btn-small with-icon"
                onclick={(e) => { e.stopPropagation(); if (confirm(`¿Salir de "${f.name}"?`)) store.leaveFolder(f.id); }}
              ><LogOut size={13} /> Salir</button>
            {/if}
          </div>
          <p class="muted with-icon" style="margin:8px 0 0">{f.description} · <Layers size={12} /> {f.cards.length} tarjetas · <Users size={12} /> {f.memberIds.length} miembros</p>
          {#if editingBannerId === f.id}
            <div style="margin-top:10px" onclick={(e) => e.stopPropagation()} role="presentation">
              <BannerEditor
                url={f.bannerUrl ?? ''}
                onsave={(u) => { store.setFolderBanner(f.id, u); editingBannerId = null; }}
                onclose={() => (editingBannerId = null)}
              />
            </div>
          {/if}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  @media (max-width: 900px) { .grid { grid-template-columns: 1fr !important; } }
</style>
