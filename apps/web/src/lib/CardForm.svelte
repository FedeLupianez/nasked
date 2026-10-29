<script lang="ts">
  import type { Attachment, CardItem, FieldType, SubCard } from './types';
  import { uid } from './utils';
  import { store } from './store.svelte';
  import { Plus, X, Paperclip } from 'lucide-svelte';
  import { saveAttachment, deleteAttachment, formatBytes, MAX_ATTACHMENTS, MAX_ATTACHMENT_SIZE } from './attachments';

  let {
    folderId = '',
    card,
    subcard,
    onsave,
    onclose
  }: {
    folderId?: string;
    card?: CardItem;
    subcard?: SubCard;
    onsave?: (data: { title: string; description: string; fields: SubCard['fields']; attachments: Attachment[] }) => Promise<string | null>;
    onclose: () => void;
  } = $props();

  const isSubcard = !!subcard;
  const isEdit = !!card || isSubcard;
  const initialAttachments: Attachment[] = [...(card?.attachments ?? subcard?.attachments ?? [])];
  const initialIds = new Set(initialAttachments.map((a) => a.id));

  function toLocalInput(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  let title = $state(card?.title ?? subcard?.title ?? '');
  let description = $state(card?.description ?? subcard?.description ?? '');
  let dueDate = $state(
    card?.dueDate
      ? toLocalInput(card.dueDate)
      : new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16)
  );
  let error = $state<string | null>(null);
  let saving = $state(false);
  let dragging = $state(false);
  let fileInput: HTMLInputElement;

  interface Draft { id: string; label: string; type: FieldType; value: string }
  const sourceFields = card?.fields ?? subcard?.fields ?? [];
  let fields: Draft[] = $state(
    sourceFields.length
      ? sourceFields.map((f) => ({ ...f }))
      : [{ id: uid('f'), label: '', type: 'TEXT', value: '' }]
  );

  let attachments: Attachment[] = $state([...initialAttachments]);
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

  function removeAttachmentAt(id: string) {
    attachments = attachments.filter((a) => a.id !== id);
  }

  async function handleClose() {
    // Los archivos nuevos que no llegaron a guardarse no deben quedar huérfanos.
    for (const a of attachments) {
      if (!initialIds.has(a.id)) await deleteAttachment(a);
    }
    onclose();
  }

  async function save(e: Event) {
    e.preventDefault();
    if (saving) return;
    if (!title.trim()) { error = 'El título es requerido'; return; }
    if (!isSubcard && !dueDate) { error = 'La fecha de vencimiento es requerida'; return; }
    const clean = fields
      .filter((f) => f.label.trim() !== '')
      .map((f) => ({ id: f.id, label: f.label.trim(), type: f.type, value: f.value }));

    const payload: {
      title: string;
      description: string;
      fields: Draft[];
      attachments: Attachment[];
      dueDate?: string;
    } = {
      title: title.trim(),
      description: description.trim(),
      fields: clean,
      attachments
    };
    const dueIso = !isSubcard ? new Date(dueDate).toISOString() : undefined;

    saving = true;
    if (onsave) {
      error = await onsave({
        title: payload.title,
        description: payload.description,
        fields: payload.fields,
        attachments: payload.attachments
      });
    } else if (card) {
      error = await store.updateCard(folderId, card.id, {
        ...payload,
        ...(dueIso ? { dueDate: dueIso } : {})
      });
    } else {
      error = await store.createCard(folderId, {
        ...payload,
        dueDate: dueIso ?? new Date().toISOString()
      });
    }
    saving = false;

    if (!error) {
      // Recién ahora es seguro borrar los adjuntos que se quitaron.
      for (const a of initialAttachments) {
        if (!attachments.some((x) => x.id === a.id)) await deleteAttachment(a);
      }
      onclose();
    }
  }
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape') handleClose(); }} />

<div
  class="modal-back"
  onclick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
  ondragover={(e) => e.preventDefault()}
  ondrop={(e) => e.preventDefault()}
>
  <div class="modal" onclick={(e) => e.stopPropagation()}>
    <h3>
      {#if isSubcard}
        {subcard ? 'Editar subtarjeta' : 'Nueva subtarjeta'}
      {:else if card}
        Editar tarjeta
      {:else}
        Nueva tarjeta / actividad
      {/if}
    </h3>
    <p class="muted">
      {#if isSubcard}
        Agrupa información relacionada dentro de esta tarjeta, por ejemplo un contrato o un acuerdo.
      {:else}
        Agrega infinitos campos NUMBER, TEXT, DATE, TIME. El vencimiento muestra el countdown.
      {/if}
    </p>
    <form onsubmit={save}>
      <div class="field"><label>Título *</label><input bind:value={title} placeholder={isSubcard ? 'Ej: Contrato de trabajo de Martin' : 'Ej: Entrega TP 3'} required /></div>
      <div class="field"><label>Descripción</label><textarea bind:value={description} rows="2" placeholder="Detalles…"></textarea></div>
      {#if !isSubcard}
        <div class="field"><label>Fecha y hora de vencimiento *</label><input type="datetime-local" bind:value={dueDate} required /></div>
      {/if}

      <div class="row row-top">
        <b class="with-icon">Archivos adjuntos ({attachments.length}/{MAX_ATTACHMENTS})</b>
        <span class="grow"></span>
        {#if totalSize}<span class="muted">{formatBytes(totalSize)}</span>{/if}
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
              <span class="muted">{formatBytes(a.size)}</span>
              <button type="button" class="btn btn-danger btn-small icon-btn" onclick={() => removeAttachmentAt(a.id)} title="Quitar archivo">
                <X size={13} />
              </button>
            </li>
          {/each}
        </ul>
      {/if}

      <div class="row row-top">
        <b>Campos personalizados ({fields.length}) — infinitos</b>
        <span class="grow"></span>
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

      {#if error}<div class="error mt10">{error}</div>{/if}

      <div class="row row-end mt16">
        <button type="button" class="btn btn-ghost" onclick={handleClose}>Cancelar</button>
        <button type="submit" class="btn btn-primary" disabled={saving}>
          {#if saving}
            Guardando…
          {:else if isEdit}
            Guardar cambios
          {:else}
            Crear tarjeta
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .hidden-file { display: none; }
  .dropzone {
    margin-top: 8px; display: flex; align-items: center; gap: 8px;
    border: 1px dashed var(--border-strong); border-radius: var(--radius-sm);
    padding: 12px; color: var(--muted); font-size: 12.5px; cursor: pointer;
    transition: border-color .15s, background .15s;
  }
  .dropzone:hover, .dropzone.dragging { border-color: var(--accent); background: var(--accent-soft); color: var(--text); }
  .attach-list { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
  .attach-list li {
    display: flex; align-items: center; gap: 8px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 6px 8px 6px 10px; font-size: 12.5px;
  }
  .attach-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
</style>
