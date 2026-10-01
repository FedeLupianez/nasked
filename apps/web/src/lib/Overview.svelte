<script lang="ts">
  import { store } from "./store.svelte";
  import { getDueInfo } from "./utils";
  import {
    Search,
    Sun,
    Moon,
    ChevronRight,
    Folder,
    Layers,
    Bell,
  } from "lucide-svelte";

  const DOW = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

  let query = $derived(store.search);

  let cards = $derived(
    store.visibleFolders.flatMap((f) =>
      f.cards.map((c) => ({ card: c, folder: f })),
    ),
  );

  let hour = new Date().getHours();
  let greeting = $derived(
    hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches",
  );
  let firstName = $derived(store.currentUser?.name.split(" ")[0] ?? "");
  let isDay = $derived(hour < 19);

  let todayCount = $derived(
    cards.filter(({ card }) => {
      const d = new Date(card.dueDate);
      const n = new Date();
      return d.toDateString() === n.toDateString();
    }).length,
  );
  let pending = $derived(
    cards.filter(({ card }) => getDueInfo(card.dueDate).status !== "ok").length,
  );

  // semana que empieza el domingo de la semana actual
  let week = $derived.by(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const items = cards.filter(
        ({ card }) =>
          new Date(card.dueDate).toDateString() === d.toDateString(),
      );
      return {
        date: d,
        dow: DOW[i],
        dom: String(d.getDate()).padStart(2, "0"),
        today: d.toDateString() === now.toDateString(),
        statuses: items.map(({ card }) => getDueInfo(card.dueDate).status),
      };
    });
  });

  let upcoming = $derived(
    cards
      .map(({ card, folder }) => ({
        card,
        folder,
        due: getDueInfo(card.dueDate),
      }))
      .filter(({ due }) => due.status !== "overdue")
      .sort((a, b) => a.due.diffMs - b.due.diffMs)
      .slice(0, 4),
  );

  let notifications = $derived(
    cards
      .map(({ card, folder }) => ({
        card,
        folder,
        due: getDueInfo(card.dueDate),
      }))
      .filter(({ due }) => due.status === "overdue" || due.status === "urgent")
      .sort((a, b) => a.due.diffMs - b.due.diffMs)
      .slice(0, 3),
  );

  let results = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return cards.filter(
      ({ card, folder }) =>
        card.title.toLowerCase().includes(q) ||
        card.description.toLowerCase().includes(q) ||
        folder.name.toLowerCase().includes(q),
    );
  });

  let recents = $derived.by(() => {
    const list = store.visibleFolders
      .map((f) => ({
        f,
        t: new Date(f.createdAt).getTime(),
        cards: f.cards.length,
      }))
      .sort((a, b) => b.t - a.t)
      .slice(0, 3);
    return list;
  });

  function openFolder(id: string) {
    store.selectedFolderId = id;
    store.view = "folder-detail";
  }
</script>

<section class="home-greet">
  <h2>
    {greeting}, {firstName}
    {#if isDay}<Sun size={30} />{:else}<Moon size={30} />{/if}
  </h2>
  <p>
    {#if pending === 0}
      No hay vencimientos para hoy. Todo al día.
    {:else}
      Hay <b>{pending}</b>
      {pending === 1 ? "tarea pendiente" : "tareas pendientes"} en tus carpetas.
    {/if}
  </p>
</section>

<div class="home-search">
  <Search size={19} />
  <input
    placeholder="Buscar tareas o documentos en todas las vistas..."
    bind:value={store.search}
  />
  <button title="Buscar"><Search size={19} /></button>
</div>

{#if query.trim()}
  <div class="home-card" style="margin-bottom:22px">
    <h3>Resultados para “{query.trim()}”</h3>
    {#if !results.length}
      <div class="home-empty">No encontramos nada.</div>
    {:else}
      <div class="inner">
        {#each results as r (r.card.id)}
          <button class="due-row" onclick={() => openFolder(r.folder.id)}>
            <span class="t">{r.card.title}</span>
            <span class="w">{r.folder.name}</span>
            <ChevronRight size={15} />
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<div class="home-cols">
  <div class="home-card">
    <h3>Próximos Vencimientos</h3>
    <div class="inner">
      <div class="week">
        {#each week as d (d.date.toISOString())}
          <div
            class="week-day"
            class:today={d.today}
            title={`${d.dow} ${d.dom}`}
          >
            <span class="dow">{d.dow}</span>
            <span class="dom">{d.dom}</span>
            <span class="week-dots">
              {#each d.statuses.slice(0, 3) as s, i (i)}
                <i class="dot-{s}"></i>
              {/each}
            </span>
          </div>
        {/each}
      </div>

      {#if !upcoming.length}
        <div class="home-empty">Sin vencimientos próximos.</div>
      {:else}
        {#each upcoming as u (u.card.id)}
          <button class="due-row" onclick={() => openFolder(u.folder.id)}>
            <span class={`due ${u.due.status}`}>{u.due.short}</span>
            <span class="t">{u.card.title}</span>
            <span class="w">{u.folder.name}</span>
          </button>
        {/each}
      {/if}
    </div>
  </div>

  <div class="home-card">
    <h3>Notificaciones</h3>
    <div class="inner" style="padding:10px 14px;margin-bottom:12px">
      <span class="with-icon" style="font-size:13px;color:var(--muted)">
        <Bell size={14} />
        {notifications.length} sin revisar
      </span>
    </div>
    <div class="inner">
      {#if !notifications.length}
        <div class="home-empty">Sin novedades.</div>
      {:else}
        {#each notifications as n (n.card.id)}
          <div class="notif">
            <span
              class="mark"
              style="background:{n.due.status === 'overdue'
                ? 'var(--red)'
                : 'var(--amber)'}"
            ></span>
            <span>
              {n.card.title}
              <small>{n.due.label} · {n.folder.name}</small>
            </span>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>

<hr class="home-rule" />

<section class="home-section">
  <h3>Últimos accesos</h3>
  {#if !recents.length}
    <div class="home-empty">
      Todavía no hay carpetas. Creá una o unite con un código.
    </div>
  {:else}
    <div class="recents">
      {#each recents as r (r.f.id)}
        <button class="recent-card" onclick={() => openFolder(r.f.id)}>
          <span class="with-icon" style="color:var(--muted)"
            ><Folder size={18} /></span
          >
          <b>{r.f.name}</b>
          <p>{r.f.description || "Sin descripción"}</p>
          <span class="meta">
            <Layers size={13} />
            {r.cards} tareas · {r.f.code}
          </span>
        </button>
      {/each}
    </div>
  {/if}
</section>
