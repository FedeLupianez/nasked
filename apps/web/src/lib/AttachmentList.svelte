<script lang="ts">
  import type { Attachment } from './types';
  import { attachmentUrl, formatBytes } from './attachments';
  import { Paperclip, Download, FileText } from 'lucide-svelte';

  let { attachments }: { attachments: Attachment[] } = $props();

  let urls = $state<Record<string, string>>({});
  /** ids ya resueltos — plano, para no re-disparar el efecto al escribir en `urls` */
  const loaded = new Set<string>();

  $effect(() => {
    let alive = true;
    (async () => {
      for (const a of attachments) {
        if (loaded.has(a.id)) continue;
        loaded.add(a.id);
        const url = await attachmentUrl(a);
        if (alive && url) urls = { ...urls, [a.id]: url };
      }
    })();
    return () => {
      alive = false;
    };
  });
</script>

<ul class="attach-list">
  {#each attachments as a (a.id)}
    {@const url = urls[a.id]}
    {@const isImg = a.mime.startsWith('image/')}
    <li>
      {#if isImg && url}
        <a class="attach-thumb" href={url} target="_blank" rel="noreferrer" title="Ver {a.name}">
          <img src={url} alt={a.name} />
        </a>
      {:else}
        <span class="attach-icon"><FileText size={15} /></span>
      {/if}
      <div class="attach-info">
        <b title={a.name}>{a.name}</b>
        <small>{a.mime} · {formatBytes(a.size)}</small>
      </div>
      {#if url}
        <a class="btn btn-ghost btn-small with-icon" href={url} download={a.name} title="Descargar">
          <Download size={13} /> Descargar
        </a>
      {:else}
        <span class="type-tag" title="El archivo no está en este navegador">no disponible</span>
      {/if}
    </li>
  {/each}
</ul>

<style>
  a.btn { text-decoration: none; }
  .attach-list {
    list-style: none; margin: 0; padding: 0;
    display: flex; flex-direction: column; gap: 6px;
  }
  .attach-list li {
    display: flex; align-items: center; gap: 9px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 10px; padding: 7px 8px 7px 10px;
  }
  .attach-thumb, .attach-icon {
    width: 30px; height: 30px; border-radius: 7px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; overflow: hidden;
    background: var(--panel-2); border: 1px solid var(--border); color: var(--muted);
  }
  .attach-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .attach-info { flex: 1; min-width: 0; }
  .attach-info b {
    display: block; font-size: 12.5px; font-weight: 600;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .attach-info small { color: var(--muted); font-size: 11px; }
</style>