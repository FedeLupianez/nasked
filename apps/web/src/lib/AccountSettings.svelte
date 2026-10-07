<script lang="ts">
  import { store } from "./store.svelte";
  import { initials } from "./utils";
  import { Settings, Folder, LogOut } from "lucide-svelte";

  let name = $state(store.currentUser?.name ?? "");
  let email = $state(store.currentUser?.email ?? "");
  let newPassword = $state("");
  let error = $state<string | null>(null);
  let ok = $state<string | null>(null);

  // refrescar cuando cambia de usuario
  $effect(() => {
    if (store.currentUser) {
      name = store.currentUser.name;
      email = store.currentUser.email;
    }
  });

  function save(e: Event) {
    e.preventDefault();
    error = null;
    ok = null;
    const err = store.updateAccount(name, email, newPassword);
    if (err) error = err;
    else {
      ok = "Cuenta actualizada correctamente";
      newPassword = "";
    }
  }
</script>

<div style="max-width:620px;display:flex;flex-direction:column;gap:12px">
  <div class="panel" style="display:flex;gap:14px;align-items:center">
    {#if store.currentUser}
      <div
        class="avatar"
        style="background:{store.currentUser
          .avatarColor};width:56px;height:56px;font-size:18px"
      >
        {initials(store.currentUser.name)}
      </div>
      <div>
        <b style="font-size:17px">{store.currentUser.name}</b><br />
        <span class="muted">{store.currentUser.email}</span><br />
        <span
          class="role-pill {store.currentUser.role === 'USER' ? 'user' : ''}"
          >{store.currentUser.role}</span
        >
        {#if store.currentUser.role === "USER"}
          <span class="muted" style="font-size:12px">
            · {store.currentUser.joinedFolderIds.length} carpetas unidas</span
          >
        {/if}
      </div>
    {/if}
  </div>

  <form class="panel" onsubmit={save}>
    <h3 class="with-icon"><Settings size={15} /> Config de cuenta</h3>
    <div class="field">
      <label>Nombre</label><input bind:value={name} required />
    </div>
    <div class="field">
      <label>Email</label><input bind:value={email} type="email" required />
    </div>
    <div class="field">
      <label>Nueva contraseña (opcional)</label>
      <input
        bind:value={newPassword}
        type="password"
        placeholder="Mínimo 6 caracteres, deja vacío para no cambiar"
        minlength="6"
      />
    </div>
    {#if error}<div class="error" style="margin-top:10px">{error}</div>{/if}
    {#if ok}<div
        class="error"
        style="margin-top:10px;background:rgba(16,185,129,.12);border-color:rgba(16,185,129,.4);color:#6ee7b7"
      >
        {ok}
      </div>{/if}
    <div class="row" style="margin-top:12px">
      <button class="btn btn-primary" type="submit">Guardar cambios</button>
      <button
        class="btn btn-ghost with-icon"
        type="button"
        onclick={() => store.logout()}
        ><LogOut size={14} /> Cerrar sesión</button
      >
    </div>
  </form>

  {#if store.currentUser?.role === "USER"}
    <div class="panel">
      <h3 class="with-icon">
        <Folder size={15} /> Mis carpetas ({store.visibleFolders.length})
      </h3>
      {#if !store.visibleFolders.length}
        <p class="muted">
          No estás en ninguna carpeta. <button
            class="btn btn-ghost btn-small"
            onclick={() => (store.view = "join")}>Unirme con código</button
          >
        </p>
      {:else}
        {#each store.visibleFolders as f}
          <div
            style="display:flex;gap:8px;align-items:center;padding:8px 0;border-top:1px solid var(--border)"
          >
            <span class="folder-dot" style="background:{f.color}"></span>
            <b style="font-size:13px">{f.name}</b>
            <span class="folder-code">{f.code}</span>
            <span style="flex:1"></span>
            <button
              class="btn btn-ghost btn-small"
              onclick={() => {
                store.selectedFolderId = f.id;
                store.view = "folder-detail";
              }}>Abrir</button
            >
            <button
              class="btn btn-danger btn-small"
              onclick={() => store.leaveFolder(f.id)}>Salir</button
            >
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>
