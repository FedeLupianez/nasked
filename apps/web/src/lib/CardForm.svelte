<script lang="ts">
  import type { FieldType } from './types';
  import { uid } from './utils';
  import { store } from './store.svelte';

  let { folderId, onclose }: { folderId: string; onclose: () => void } = $props();

  let title = $state('');
  let description = $state('');
  let dueDate = $state(new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16));
  let error = $state<string | null>(null);

  interface Draft { id: string; label: string; type: FieldType; value: string }
  let fields: Draft[] = $state([{ id: uid('f'), label: '', type: 'TEXT', value: '' }]);

  function addField() {
    fields.push({ id: uid('f'), label: '', type: 'TEXT', value: '' });
  }
  function removeField(id: string) {
    fields = fields.filter((f) => f.id !== id);
  }

  function save(e: Event) {
    e.preventDefault();
    if (!title.trim()) { error = 'El título es requerido'; return; }
    if (!dueDate) { error = 'La fecha de vencimiento es requerida'; return; }
    const clean = fields
      .filter((f) => f.label.trim() !== '')
      .map((f) => ({ id: f.id, label: f.label.trim(), type: f.type, value: f.value }));
    const folder = store.folders.find((f) => f.id === folderId);
    if (!folder) { error = 'Carpeta no encontrada'; return; }
    folder.cards.unshift({
      id: uid('c'),
      title: title.trim(),
      description: description.trim(),
      dueDate: new Date(dueDate).toISOString(),
      fields: clean,
      createdAt: new Date().toISOString()
    });
    store.persist();
    onclose();
  }
</script>

<div class="modal-back" onclick={(e) => { if (e.target === e.currentTarget) onclose(); }}>
  <div class="modal">
    <h3 style="margin:0">Nueva tarjeta / actividad</h3>
    <p class="muted">Agrega infinitos campos NUMBER, TEXT, DATE, TIME. El vencimiento muestra el countdown.</p>
    <form onsubmit={save}>
      <div class="field"><label>Título *</label><input bind:value={title} placeholder="Ej: Entrega TP 3" required /></div>
      <div class="field"><label>Descripción</label><textarea bind:value={description} rows="2" placeholder="Detalles de la actividad…"></textarea></div>
      <div class="field"><label>Fecha y hora de vencimiento *</label><input type="datetime-local" bind:value={dueDate} required /></div>

      <div style="margin-top:14px;display:flex;align-items:center;gap:8px">
        <b style="font-size:13px">Campos personalizados ({fields.length}) — infinitos</b>
        <span style="flex:1"></span>
        <button type="button" class="btn btn-ghost btn-small" onclick={addField}>+ Agregar campo</button>
      </div>

      {#each fields as f}
        <div class="field-row">
          <div class="field"><label>Nombre</label><input bind:value={f.label} placeholder="Ej: Aula, Nota…" /></div>
          <div class="field">
            <label>Tipo</label>
            <select bind:value={f.type}>
              <option value="TEXT">TEXT</option>
              <option value="NUMBER">NUMBER</option>
              <option value="DATE">DATE</option>
              <option value="TIME">TIME</option>
            </select>
          </div>
          <div class="field">
            <label>Valor</label>
            {#if f.type === 'NUMBER'}
              <input type="number" bind:value={f.value} placeholder="0" />
            {:else if f.type === 'DATE'}
              <input type="date" bind:value={f.value} />
            {:else if f.type === 'TIME'}
              <input type="time" bind:value={f.value} />
            {:else}
              <input bind:value={f.value} placeholder="Texto…" />
            {/if}
          </div>
          <button type="button" class="btn btn-danger btn-small" onclick={() => removeField(f.id)} title="Quitar">✕</button>
        </div>
      {/each}

      {#if error}<div class="error" style="margin-top:10px">{error}</div>{/if}

      <div class="row" style="margin-top:16px;justify-content:flex-end">
        <button type="button" class="btn btn-ghost" onclick={onclose}>Cancelar</button>
        <button type="submit" class="btn btn-primary">Crear tarjeta</button>
      </div>
    </form>
  </div>
</div>
