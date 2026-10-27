<script lang="ts">
  import { store } from "./store.svelte";
  import { initials } from "./utils";
  import { Users, KeyRound, User } from "lucide-svelte";
</script>

<div class="panel">
  <h3 class="with-icon"><Users size={16} /> Usuarios y miembros por carpeta</h3>
  <p class="muted">Solo visible para ADMIN. Los USER se agregan solos con el código de cada carpeta.</p>
</div>
<div class="grid">
  {#each store.users as u}
    <div class="panel panel-row">
      <div class="avatar" style="background:{u.avatarColor}">{initials(u.name)}</div>
      <div class="grow">
        <b class="u-name">{u.name}</b>
        <span class="u-mail muted">{u.email}</span>
        <span class="role-pill {u.role === 'USER' ? 'user' : ''}">{u.role}</span>
        <span class="u-meta muted"> · {u.joinedFolderIds.length} carpetas</span>
      </div>
    </div>
  {/each}
</div>

<div class="stack">
  {#each store.folders as f}
    <div class="panel">
      <div class="row">
        <span class="folder-dot" style="background:{f.color}"></span>
        <b>{f.name}</b>
        <span class="grow"></span>
        <span class="folder-code with-icon"><KeyRound size={12} /> {f.code}</span>
        <span class="muted with-icon">· {f.memberIds.length} miembros · {f.cards.length} tarjetas</span>
      </div>
      {#if !f.memberIds.length}
        <p class="muted">Sin miembros aún. Comparte el código <code>{f.code}</code>.</p>
      {:else}
        <div class="row">
          {#each f.memberIds as mid}
            {@const u = store.users.find((x) => x.id === mid)}
            {#if u}
              <span class="folder-code with-icon"><User size={12} /> {u.name} ({u.email})</span>
            {/if}
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</div>
