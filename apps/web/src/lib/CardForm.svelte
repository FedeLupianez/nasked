<script lang="ts">
  import type { Attachment, FieldType } from './types';
  import { uid } from './utils';
  import { store } from './store.svelte';
  import { Plus, X, Paperclip } from 'lucide-svelte';
  import { saveAttachment, deleteAttachment, formatBytes, MAX_ATTACHMENTS, MAX_ATTACHMENT_SIZE } from './attachments';

  let { folderId, onclose }: { folderId: string; onclose: () => void } = $props();

  let title = $state('');
  let description = $state('');
  let dueDate = $state(new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16));
  let error = $state<string | null>(null);
  let saving = $state(false);
  let dragging = $state(false);
  let fileInput: HTMLInputElement;

  interface Draft { id: string; label: string; type: FieldType; value: string }
  let fields: Draft[] = $state([{ id: uid('f'), label: '', type: 'TEXT', value: '' }]);

  let attachments: Attachment[] = $state([]);
  let totalSize = $derived(attachments.reduce((n, a) => n + a.size, 0));

  function addField() {
    fields.push({ id: uid('f'), label: '', type: 'TEXT', value: '' });
  }
  function removeField(id: string) {
    fields = fields.filter((f) => f.id !== id);
  }

  async function addFiles(list: FileList | File[] | null) {
    if (!list) return;
    const incoming = Array.from(list);
    const room = MAX_ATTACHMENTS - attachments.length;
    if (room <= 0) {
      error = `Máximo ${MAX_ATTACHMENTS} archivos por tarjeta`;
      return;
    }
    const tooBig = incoming.find((f) => f.size > MAX_ATTACHMENT_SIZE);
    if (tooBig) {
      error = `"${tooBig.name}" supera el límite de ${formatBytes(MAX_ATTACHMENT_SIZE)}`;
      return;
    }
    error = null;
    const saved: Attachment[] = [];
    for (const f of incoming.slice(0, room)) saved.push(await saveAttachment(f));
    attachments = [...attachments, ...saved];
    if (incoming.length > room) {
      error = `Solo se adjuntaron ${room} archivos (límite ${MAX_ATTACHMENTS})`;
    }
  }

  function onPick(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    addFiles(input.files);
    input.value = '';
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragging = false;
    addFiles(e.dataTransfer?.files ?? null);
  }

  async function removeAttachmentAt(id: string) {
    const att = attachments.find((a) => a.id === id);
    attachments = attachments.filter((a) => a.id !== id);
    if (att) await deleteAttachment(att);
  }

  async function save(e: Event) {
    e.preventDefault();
    if (saving) return;
    if (!title.trim()) { error = 'El título es requerido'; return; }
    if (!dueDate) { error = 'La fecha de vencimiento es requerida'; return; }
    const clean = fields
      .filter((f) => f.label.trim() !== '')
      .map((f) => ({ id: f.id, label: f.label.trim(), type: f.type, value: f.value }));
    const folder = store.folders.find((f) => f.id === folderId);
    if (!folder) { error = 'Carpeta no encontrada'; return; }
    saving = true;
    folder.cards.unshift({
      id: uid('c'),
      title: title.trim(),
      description: description.trim(),
      dueDate: new Date(dueDate).toISOString(),
      fields: clean,
      attachments,
      createdAt: new Date().toISOString()
    });
    store.persist();
    onclose();
  }
</script>

<div
  class="modal-back"
  onclick={(e) => { if (e.target === e.currentTarget) onclose(); }}
  ondragover={(e) => e.preventDefault()}
  ondrop={(e) => e.preventDefault()}
>
  <div class="modal">
    <h3 style="margin:0">Nueva tarjeta / actividad</h3>
    <p class="muted">Agrega infinitos campos NUMBER, TEXT, DATE, TIME. El vencimiento muestra el countdown.</p>
    <form onsubmit={save}>
      <div class="field"><label>Título *</label><input bind:value={title} placeholder="Ej: Entrega TP 3" required /></div>
      <div class="field"><label>Descripción</label><textarea bind:value={description} rows="2" placeholder="Detalles de la actividad…"></textarea></div>
      <div class="field"><label>Fecha y hora de vencimiento *</label><input type="datetime-local" bind:value={dueDate} required /></div>

      <div style="margin-top:14px;display:flex;align-items:center;gap:8px">
        <b style="font-size:13px" class="with-icon"><Paperclip size={13} /> Archivos adjuntos ({attachments.length}/{MAX_ATTACHMENTS})</b>
        <span style="flex:1"></span>
        {#if totalSize}<span class="muted" style="font-size:12px">{formatBytes(totalSize)}</span>{/if}
        <button type="button" class="btn btn-ghost btn-small with-icon" onclick={() => fileInput.click()} disabled={attachments.length >= MAX_ATTACHMENTS}>
          <Plus size={13} /> Adjuntar
        </button>
      </div>

      <input
        bind:this={fileInput}
        type="file"
        multiple
        class="hidden-file"
        onchange={onPick}
        accept="*/*"
      />

      <div
        class="dropzone"
        class:dragging
        role="button"
        tabindex="0"
        onclick={() => fileInput.click()}
        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInput.click()}
        ondragover={(e) => { e.preventDefault(); dragging = true; }}
        ondragleave={() => (dragging = false)}
        ondrop={onDrop}
      >
        <Paperclip size={16} />
        <span>Arrastrá archivos acá o hacé clic para elegirlos · máx {formatBytes(MAX_ATTACHMENT_SIZE)} por archivo</span>
      </div>

      {#if attachments.length}
        <ul class="attach-list">
          {#each attachments as a (a.id)}
            <li>
              <Paperclip size={13} />
              <span class="attach-name">{a.name}</span>
              <span class="type-tag">{a.mime}</span>
              <span class="muted" style="font-size:11.5px">{formatBytes(a.size)}</span>
              <button type="button" class="btn btn-danger btn-small icon-btn" onclick={() => removeAttachmentAt(a.id)} title="Quitar archivo">
                <X size={13} />
              </button>
            </li>
          {/each}
        </ul>
      {/if}

      <div style="margin-top:14px;display:flex;align-items:center;gap:8px">
        <b style="font-size:13px">Campos personalizados ({fields.length}) — infinitos</b>
        <span style="flex:1"></span>
        <button type="button" class="btn btn-ghost btn-small with-icon" onclick={addField}><Plus size={13} /> Agregar campo</button>
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
          <button type="button" class="btn btn-danger btn-small icon-btn" onclick={() => removeField(f.id)} title="Quitar"><X size={14} /></button>
        </div>
      {/each}

      {#if error}<div class="error" style="margin-top:10px">{error}</div>{/if}

      <div class="row" style="margin-top:16px;justify-content:flex-end">
        <button type="button" class="btn btn-ghost" onclick={onclose}>Cancelar</button>
        <button type="submit" class="btn btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Crear tarjeta'}</button>
      </div>
    </form>
  </div>
</div>

<style>
  .hidden-file { display: none; }
  .dropzone {
    margin-top: 8px; display: flex; align-items: center; gap: 8px;
    border: 1px dashed var(--border-strong); border-radius: 10px;
    padding: 12px; color: var(--muted); font-size: 12.5px; cursor: pointer;
    transition: border-color .15s, background .15s;
  }
  .dropzone:hover, .dropzone.dragging { border-color: var(--text); background: var(--panel-2); }
  .attach-list { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
  .attach-list li {
    display: flex; align-items: center; gap: 8px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 10px; padding: 6px 8px 6px 10px; font-size: 12.5px;
  }
  .attach-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
</style>
