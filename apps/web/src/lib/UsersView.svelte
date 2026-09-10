<script lang="ts">
  import { store } from './store.svelte';
  import { initials } from './utils';
</script>

<div class="panel">
  <h3>👥 Usuarios y miembros por carpeta</h3>
  <p class="muted">Solo visible para ADMIN. Los USER se agregan solos con el código de cada carpeta.</p>
</div>
<div style="height:12px"></div>
<div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
  {#each store.users as u}
    <div class="panel" style="display:flex;gap:10px;align-items:center">
      <div class="avatar" style="background:{u.avatarColor}">{initials(u.name)}</div>
      <div>
        <b style="font-size:13.5px">{u.name}</b><br />
        <span class="muted" style="font-size:12px">{u.email}</span><br />
        <span class="role-pill {u.role === 'USER' ? 'user' : ''}">{u.role}</span>
        <span class="muted" style="font-size:11px"> · {u.joinedFolderIds.length} carpetas</span>
      </div>
    </div>
  {/each}
</div>

<div style="height:12px"></div>
{#each store.folders as f}
  <div class="panel" style="margin-bottom:12px">
    <div style="display:flex;gap:8px;align-items:center">
      <span class="folder-dot" style="background:{f.color}"></span>
      <b>{f.name}</b>
      <span class="folder-code">🔑 {f.code}</span>
      <span class="muted" style="font-size:12px">· {f.memberIds.length} miembros · {f.cards.length} tarjetas</span>
    </div>
    {#if !f.memberIds.length}
      <p class="muted" style="margin:8px 0 0">Sin miembros aún. Comparte el código <code>{f.code}</code>.</p>
    {:else}
      <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
        {#each f.memberIds as mid}
          {@const u = store.users.find((x) => x.id === mid)}
          {#if u}
            <span class="folder-code">👤 {u.name} ({u.email})</span>
          {/if}
        {/each}
      </div>
    {/if}
  </div>
{/each}
