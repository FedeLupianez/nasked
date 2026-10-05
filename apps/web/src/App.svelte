<script lang="ts">
  import { store } from './lib/store.svelte';
  import Login from './lib/Login.svelte';
  import Layout from './lib/Layout.svelte';
  import Overview from './lib/Overview.svelte';
  import Folders from './lib/Folders.svelte';
  import FolderDetail from './lib/FolderDetail.svelte';
  import JoinFolder from './lib/JoinFolder.svelte';
  import AccountSettings from './lib/AccountSettings.svelte';
  import UsersView from './lib/UsersView.svelte';
  import TodayTasks from './lib/TodayTasks.svelte';
</script>

{#if !store.currentUser}
  <Login />
{:else}
  <Layout>
    {#if store.view === 'overview'}
      <Overview />
    {:else if store.view === 'folders'}
      <Folders />
    {:else if store.view === 'folder-detail'}
      <FolderDetail />
    {:else if store.view === 'join'}
      <JoinFolder />
    {:else if store.view === 'account'}
      <AccountSettings />
    {:else if store.view === 'users'}
      {#if store.isAdmin}
        <UsersView />
      {:else}
        <div class="panel"><h3>Solo ADMIN</h3><p class="muted">Esta sección es solo para administradores.</p></div>
      {/if}
    {:else if store.view === 'today'}
      <TodayTasks />
    {/if}
  </Layout>
{/if}
