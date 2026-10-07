<script lang="ts">
  import type { Snippet } from "svelte";
  import { store } from "./store.svelte";
  import { initials } from "./utils";
  import { getDueInfo } from "./utils";
  import HomeBanner from "./HomeBanner.svelte";
  import {
    House,
    Folder,
    UserPlus,
    Settings,
    Users,
    FolderOpen,
    Bell,
    Moon,
    Sun,
    Plus,
    Search,
  } from "lucide-svelte";

  let { children }: { children?: Snippet } = $props();
  let searchOpen = $state(false);
  let notifOpen = $state(false);

  const notifications = $derived.by(() => {
    const list = store.visibleFolders
      .flatMap((f) => f.cards.map((c) => ({ card: c, folder: f })))
      .sort((a, b) => +new Date(b.card.createdAt) - +new Date(a.card.createdAt))
      .slice(0, 30);
    return list;
  });

  const unreadCount = $derived(
    notifications.filter((n) => !store.reviewedNotifIds.includes(n.card.id))
      .length,
  );

  function notifBucket(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const startOfDay = (x: Date) =>
      new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
    if (diffDays <= 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return "Esta semana";
    if (diffDays < 14) return "La semana pasada";
    return "Anteriores";
  }

  const notifGroups = $derived.by(() => {
    const groups: { label: string; items: typeof notifications }[] = [];
    for (const n of notifications) {
      const label = notifBucket(n.card.createdAt);
      const g = groups.find((x) => x.label === label);
      if (g) g.items.push(n);
      else groups.push({ label, items: [n] });
    }
    return groups;
  });

  function notifColor(dueISO: string): string {
    const s = getDueInfo(dueISO).status;
    if (s === "overdue") return "var(--red)";
    if (s === "urgent" || s === "soon") return "var(--amber)";
    return "var(--green)";
  }

  const navUser = [
    { id: "overview", label: "Home", icon: House },
    { id: "folders", label: "Carpetas", icon: Folder },
    { id: "join", label: "Unirse con código", icon: UserPlus },
    { id: "account", label: "Configuración", icon: Settings },
  ];
  const navAdmin = [
    { id: "overview", label: "Home", icon: House },
    { id: "folders", label: "Carpetas", icon: Folder },
    { id: "join", label: "Unirse con código", icon: UserPlus },
    { id: "users", label: "Miembros", icon: Users },
    { id: "account", label: "Configuración", icon: Settings },
  ];

  let items = $derived(store.isAdmin ? navAdmin : navUser);
  let titles: Record<string, string> = {
    overview: "Home",
    folders: "Carpetas",
    "folder-detail": store.selectedFolder?.name ?? "Carpeta",
    join: "Unirse a una carpeta",
    account: "Configuración de cuenta",
    users: "Usuarios y miembros",
    today: "Tareas de hoy",
  };

  let clock = $state(new Date());
  $effect(() => {
    const t = setInterval(() => (clock = new Date()), 30000);
    return () => clearInterval(t);
  });
  let time = $derived(
    clock.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
  );
  let date = $derived(
    clock.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }),
  );

  $effect(() => {
    document.documentElement.dataset.theme = store.theme;
  });
</script>

<div class="shell">
  <aside class="sidebar">
    <div class="brand">
      <img class="brand-logo" src="/logo_light.svg" alt="Nasked logo" />
    </div>
    <h2 class="brand-name">{store.currentUser?.name ?? "Nasked"}</h2>

    <nav class="nav">
      {#each items as it}
        <button
          class:active={store.view === it.id}
          onclick={() => {
            store.view = it.id;
          }}
        >
          <it.icon size={20} />
          <span>{it.label}</span>
        </button>
      {/each}
      {#if store.selectedFolder}
        <button
          class:active={store.view === "folder-detail"}
          onclick={() => (store.view = "folder-detail")}
        >
          <FolderOpen size={20} />
          <span
            style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis"
            >{store.selectedFolder.name}</span
          >
        </button>
      {/if}
      {#if store.isAdmin}
        <button onclick={() => (store.view = "folders")}>
          <Plus size={20} />
          <span>Crear Carpeta</span>
        </button>
      {/if}
    </nav>

    <div class="sidebar-spacer"></div>

    <div class="members-wrap">
      <div class="members-box">
        <h4>Miembros</h4>
        <div class="members-list">
          {#each store.users as u (u.id)}
            <div class="member-row">
              <span class="member-avatar">{initials(u.name)}</span>
              <span class="who"
                >@{u.name.split(" ")[0].toLowerCase()}
                <b>| {u.role === "ADMIN" ? "admin" : "usuario"}</b></span
              >
            </div>
          {/each}
        </div>
      </div>
      <span class="fab">{store.users.length}</span>
    </div>

    <div class="sidebar-foot">
      {#if store.currentUser}
        <span class="avatar">{initials(store.currentUser.name)}</span>
      {/if}
      <span class="spacer"></span>
      <button
        class="icon-btn"
        onclick={() => store.toggleTheme()}
        title={store.theme === "dark" ? "Tema claro" : "Tema oscuro"}
      >
        {#if store.theme === "dark"}<Moon size={19} />{:else}<Sun
            size={19}
          />{/if}
      </button>
      <button
        class="icon-btn"
        onclick={() => (store.view = "account")}
        title="Configuración"
      >
        <Settings size={19} />
      </button>
    </div>
  </aside>

  <div class="main">
    <div class="topbar">
      <span class="crumb">
        <button class="crumb-link" onclick={() => (store.view = "overview")}
          >Home</button
        >
        {#if store.view !== "overview"}
          <span class="sep">/</span><button
            class="crumb-link"
            onclick={() => (store.view = store.view)}
            >{titles[store.view] ?? "Home"}</button
          >
        {/if}
      </span>
      <span class="spacer"></span>
      {#if searchOpen}
        <input
          class="search-top"
          placeholder="Buscar…"
          bind:value={store.search}
          onblur={() => (searchOpen = false)}
        />
      {:else}
        <button
          class="icon-btn"
          title="Buscar"
          onclick={() => (searchOpen = true)}
        >
          <Search size={18} />
        </button>
      {/if}
      <div class="bell-wrap">
        <button
          class="icon-btn"
          title="Notificaciones"
          onclick={() => (notifOpen = !notifOpen)}
        >
          <Bell size={16} />
          {#if unreadCount > 0}
            <span class="bell-dot"></span>
          {/if}
        </button>
        {#if notifOpen}
          <div class="notif-panel">
            <h4>Últimas notificaciones</h4>
            {#if unreadCount > 0}
              <button
                class="notif-markall"
                onclick={() =>
                  store.markAllNotifsReviewed(
                    notifications.map((n) => n.card.id),
                  )}
              >
                Marcar todas como vistas
              </button>
            {/if}
            {#if !notifGroups.length}
              <p class="notif-empty">Sin notificaciones.</p>
            {/if}
            {#each notifGroups as g, gi (g.label)}
              {#if gi > 0}
                <hr class="notif-divider" />
              {/if}
              <p class="notif-group-label">{g.label}</p>
              {#each g.items as n (n.card.id)}
                <button
                  class="notif-block"
                  class:unread={!store.reviewedNotifIds.includes(n.card.id)}
                  onclick={() => {
                    store.openNotification(n.folder.id, n.card.id);
                    notifOpen = false;
                  }}
                >
                  <span
                    class="notif-bar"
                    style="background:{notifColor(n.card.dueDate)}"
                  ></span>
                  <span class="notif-body">
                    <b>
                      {#if !store.reviewedNotifIds.includes(n.card.id)}
                        <i class="notif-unread-dot"></i>
                      {/if}
                      {n.card.title}
                    </b>
                    <small
                      >{getDueInfo(n.card.dueDate).label} · {n.folder
                        .name}</small
                    >
                  </span>
                </button>
              {/each}
            {/each}
          </div>
        {/if}
      </div>
      <span class="clock-pill"
        >{time} <span style="color:var(--faint)">{date}</span></span
      >
    </div>
    {#if store.view === "overview"}
      <HomeBanner />
    {/if}
    <div
      class="content"
      class:content-banner={store.view === "overview" && !!store.homeBannerUrl}
    >
      {@render children?.()}
    </div>
  </div>
</div>
