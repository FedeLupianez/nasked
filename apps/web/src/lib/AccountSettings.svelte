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

  async function save(e: Event) {
    e.preventDefault();
    error = null;
    ok = null;
    const err = await store.updateAccount(name, email, newPassword);
    if (err) error = err;
    else {
      ok = "Cuenta actualizada correctamente";
      newPassword = "";
    }
  }
</script>

<div class="page">
  <div class="panel panel-row">
    {#if store.currentUser}
      <div
        class="avatar"
        style="background:{store.currentUser
          .avatarColor};width:56px;height:56px;font-size:18px"
      >
        {initials(store.currentUser.name)}
      </div>
      <div>
        <b class="panel-title">{store.currentUser.name}</b><br />
        <span class="panel-sub muted">{store.currentUser.email}</span><br />
        <span
          class="role-pill {store.currentUser.role === 'USER' ? 'user' : ''}"
          >{store.currentUser.role}</span
        >
        {#if store.currentUser.role === "USER"}
          <span class="u-meta muted">
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
    {#if error}<div class="error mt10">{error}</div>{/if}
    {#if ok}<div class="notice-ok mt10">
        {ok}
      </div>{/if}
    <div class="row row-top">
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
        <div class="stack">
          {#each store.visibleFolders as f}
            <div class="member-line">
              <span class="folder-dot" style="background:{f.color}"></span>
              <b>{f.name}</b>
              <span class="folder-code">{f.code}</span>
              <span class="grow"></span>
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
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .page {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .panel {
    width: 35rem;
  }
</style>
