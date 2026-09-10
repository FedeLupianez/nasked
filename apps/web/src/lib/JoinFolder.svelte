<script lang="ts">
  import { store } from './store.svelte';
  import { UserPlus, Lightbulb } from 'lucide-svelte';
  let code = $state('');
  let error = $state<string | null>(null);
  let ok = $state<string | null>(null);

  function join(e: Event) {
    e.preventDefault();
    error = null; ok = null;
    const err = store.joinByCode(code);
    if (err) error = err;
    else { ok = '¡Te uniste correctamente!'; code = ''; }
  }
</script>

<div style="max-width:560px">
  <div class="panel">
    <h3 class="with-icon"><UserPlus size={16} /> Unirse a una carpeta</h3>
    <p class="muted">Pide al ADMIN el código de la carpeta (ej: <code>MATE-2026</code>) y pégalo aquí. Disponible para USER y ADMIN.</p>
    <form onsubmit={join}>
      <div class="field">
        <label>Código de carpeta</label>
        <input bind:value={code} placeholder="XXXX-XXXX" style="font-family:var(--mono);text-transform:uppercase" />
      </div>
      {#if error}<div class="error" style="margin-top:10px">{error}</div>{/if}
      {#if ok}<div class="error" style="margin-top:10px;background:rgba(16,185,129,.12);border-color:rgba(16,185,129,.4);color:#6ee7b7">{ok}</div>{/if}
      <button class="btn btn-primary with-icon" style="margin-top:12px;width:100%" type="submit"><UserPlus size={15} /> Unirme</button>
    </form>
  </div>

  <div class="panel" style="margin-top:12px">
    <h3 class="with-icon"><Lightbulb size={16} /> ¿Cómo funciona?</h3>
    <p class="muted" style="line-height:1.6">
      1. El ADMIN crea una carpeta desde “Carpetas”.<br />
      2. Se genera un código único automáticamente.<br />
      3. El USER lo ingresa aquí y queda como miembro.<br />
      4. Podrá ver todas las tarjetas, vencimientos y countdown en vivo.
    </p>
    <p class="muted">Carpetas disponibles para unirte: {store.folders.length} (prueba con <code>MATE-2026</code> o <code>LABO-X7K2</code>)</p>
  </div>
</div>
