<script lang="ts">
  import { store } from "./store.svelte";
  import { UserPlus, KeyRound, Check } from "lucide-svelte";

  let code = $state("");
  let error = $state<string | null>(null);
  let ok = $state<string | null>(null);

  let demoFolders = $derived(store.folders);
  let canSubmit = $derived(code.trim().length > 0);
  let joinedIds = $derived.by(() => {
    const u = store.currentUser;
    return new Set([
      ...(u?.joinedFolderIds ?? []),
      ...store.folders
        .filter((f) => f.memberIds.includes(u?.id ?? ""))
        .map((f) => f.id),
    ]);
  });

  function pick(c: string) {
    code = c;
    error = null;
    ok = null;
  }

  function join(e: Event) {
    e.preventDefault();
    error = null;
    ok = null;
    if (!canSubmit) return;
    const err = store.joinByCode(code);
    if (err) error = err;
    else {
      ok = "¡Te uniste correctamente!";
      code = "";
    }
  }
</script>

<div class="join">
  <form class="panel join-card" onsubmit={join}>
    <h3 class="with-icon"><UserPlus size={16} /> Unirse a una carpeta</h3>
    <p class="muted">
      Ingresá el código que te pasó el administrador de la carpeta.
    </p>

    <div class="field">
      <label for="join-code">Código de carpeta</label>
      <input
        id="join-code"
        bind:value={code}
        placeholder="XXXX-XXXX"
        maxlength="24"
        autocomplete="off"
        spellcheck="false"
        style="font-family:var(--mono);text-transform:uppercase;letter-spacing:.06em;text-align:center"
      />
    </div>

    {#if error}
      <div class="error" style="margin-top:12px">{error}</div>
    {/if}
    {#if ok}
      <div class="notice-ok" style="margin-top:12px">
        <Check size={14} />
        {ok}
      </div>
    {/if}

    <button
      class="btn btn-primary with-icon"
      style="margin-top:14px;width:100%"
      type="submit"
      disabled={!canSubmit}
    >
      <UserPlus size={15} /> Unirme
    </button>
  </form>

  {#if demoFolders.length}
    <div class="panel join-card">
      <h3 class="with-icon"><KeyRound size={16} /> Carpetas de la demo</h3>

      <ul class="demo-list">
        {#each demoFolders as f (f.id)}
          {@const joined = joinedIds.has(f.id)}
          <li>
            <button
              type="button"
              class="demo-item"
              onclick={() => pick(f.code)}
              title="Usar {f.code}"
            >
              <span class="folder-dot" style="background:{f.color}"></span>
              <span class="demo-info">
                <b>{f.name}</b>
                <small>{f.cards.length} tarjetas</small>
              </span>
              <span class="folder-code">{f.code}</span>
              {#if joined}<span class="demo-check"><Check size={14} /></span
                >{/if}
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<style>
  .join {
    max-width: 480px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .join-card h3 {
    margin-bottom: 4px;
  }
  .join-card .btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .notice-ok {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid rgba(16, 185, 129, 0.4);
    color: #6ee7b7;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 13px;
  }
  .demo-list {
    list-style: none;
    margin: 12px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .demo-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    text-align: left;
    background: var(--panel-2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 11px 12px;
    color: var(--text);
    cursor: pointer;
    transition:
      border-color 0.15s,
      background 0.15s;
  }
  .demo-item:hover {
    border-color: var(--border-strong);
  }
  .demo-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }
  .demo-info b {
    font-size: 14px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .demo-info small {
    color: var(--muted);
    font-size: 12px;
  }
  .demo-check {
    color: var(--green);
    flex-shrink: 0;
  }
  :global(:root[data-theme="light"]) .notice-ok {
    background: rgba(16, 185, 129, 0.12);
    border-color: rgba(16, 185, 129, 0.45);
    color: #047857;
  }
  @media (max-width: 560px) {
    .demo-item {
      flex-wrap: wrap;
    }
  }
</style>

