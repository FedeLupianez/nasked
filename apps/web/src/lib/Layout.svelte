<script lang="ts">
  import type { Snippet } from 'svelte';
  import { store } from './store.svelte';
  import { initials } from './utils';

  let { children }: { children?: Snippet } = $props();

  const navUser = [
    { id: 'overview', label: '🏠 Resumen', desc: 'Vista general' },
    { id: 'folders', label: '📁 Mis carpetas', desc: 'Espacios unidos' },
    { id: 'join', label: '➕ Unirse a carpeta', desc: 'Usar código' },
    { id: 'account', label: '⚙️ Config de cuenta', desc: 'Perfil' }
  ];
  const navAdmin = [
    { id: 'overview', label: '🏠 Dashboard', desc: 'Vista general' },
    { id: 'folders', label: '📁 Carpetas', desc: 'Todas' },
    { id: 'join', label: '➕ Unirse con código', desc: 'Entrar a otra' },
    { id: 'users', label: '👥 Usuarios', desc: 'Miembros' },
    { id: 'account', label: '⚙️ Config de cuenta', desc: 'Perfil' }
  ];

  let items = $derived(store.isAdmin ? navAdmin : navUser);
  let titles: Record<string, string> = {
    overview: 'Resumen',
    folders: store.isAdmin ? 'Carpetas' : 'Mis carpetas',
    'folder-detail': store.selectedFolder?.name ?? 'Carpeta',
    join: 'Unirse a una carpeta',
    account: 'Configuración de cuenta',
    users: 'Usuarios y miembros'
  };
</script>

<div class="shell">
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-mark">N</div>
      <div>
        <b>Nasked Boards</b>
        <small>dashboard · svelte</small>
      </div>
    </div>

    <nav class="nav">
      {#each items as it}
        <button
          class:active={store.view === it.id}
          onclick={() => { store.view = it.id; if (it.id !== 'folder-detail') store.selectedFolderId = it.id === 'folders' ? store.selectedFolderId : store.selectedFolderId; }}
          title={it.desc}
        >
          <span>{it.label}</span>
        </button>
      {/each}
      {#if store.selectedFolder}
        <button
          class:active={store.view === 'folder-detail'}
          onclick={() => (store.view = 'folder-detail')}
        >
          <span>📂 {store.selectedFolder.name}</span>
        </button>
      {/if}
    </nav>

    <div class="user-box">
      {#if store.currentUser}
        <div class="avatar" style="background:{store.currentUser.avatarColor}">
          {initials(store.currentUser.name)}
        </div>
        <div style="min-width:0">
          <b style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{store.currentUser.name}</b>
          <small>{store.currentUser.email}</small><br />
          <span class="role-pill {store.currentUser.role === 'USER' ? 'user' : ''}">{store.currentUser.role}</span>
        </div>
        <button class="btn btn-ghost btn-small" style="margin-left:auto" onclick={() => store.logout()} title="Salir">↩</button>
      {/if}
    </div>
  </aside>

  <div class="main">
    <div class="topbar">
      <h1>{titles[store.view] ?? 'Dashboard'}</h1>
      {#if store.view === 'folders' || store.view === 'overview'}
        <input class="search" placeholder="🔍 Buscar carpetas o tarjetas…" bind:value={store.search} />
      {/if}
      <button class="btn btn-ghost btn-small" onclick={() => store.resetDemo()}>⟲ Reset demo</button>
    </div>
    <div class="content">
      {@render children?.()}
    </div>
  </div>
</div>
