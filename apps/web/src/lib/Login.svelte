<script lang="ts">
  import { store } from './store.svelte';
  let mode: 'login' | 'register' = $state('login');
  let name = $state('');
  let email = $state('');
  let password = $state('');
  let showPw = $state(false);
  let role: 'USER' | 'ADMIN' = $state('USER');
  let error = $state<string | null>(null);

  function submit(e: Event) {
    e.preventDefault();
    error = mode === 'login' ? store.login(email, password) : store.register(name, email, password, role);
  }
</script>

<div class="login-wrap">
  <div class="login-card">
    <div class="login-hero">
      <div class="brand-mark">N</div>
      <h1>Nasked Boards</h1>
      <p class="slogan">“Todo a tiempo, todo en orden.”</p>
      <p class="tagline">Tu espacio para organizar actividades y cumplir cada vencimiento sin estrés.</p>
    </div>
    <form class="login-form" onsubmit={submit}>
      <h2>{mode === 'login' ? 'Entrar a tu cuenta' : 'Crear cuenta'}</h2>
      <span class="muted">{mode === 'login' ? 'Bienvenido de nuevo' : 'Empieza a organizarte hoy'}</span>

      {#if mode === 'register'}
        <div class="field">
          <label>Nombre</label>
          <input bind:value={name} placeholder="Tu nombre" required />
        </div>
      {/if}
      <div class="field">
        <label>Email</label>
        <input bind:value={email} type="email" placeholder="tu@email.io" required />
      </div>
      <div class="field">
        <label>Contraseña</label>
        <div class="pw-wrap">
          <input
            bind:value={password}
            type={showPw ? 'text' : 'password'}
            placeholder={mode === 'login' ? 'Tu contraseña' : 'Mínimo 6 caracteres'}
            required
            minlength="6"
          />
          <button type="button" class="btn btn-ghost btn-small" onclick={() => (showPw = !showPw)}>
            {showPw ? 'Ocultar' : 'Ver'}
          </button>
        </div>
      </div>
      {#if mode === 'register'}
        <div class="field">
          <label>Rol</label>
          <select bind:value={role}>
            <option value="USER">USER — ver y unirse a carpetas</option>
            <option value="ADMIN">ADMIN — crear carpetas y tarjetas</option>
          </select>
        </div>
      {/if}

      {#if error}<div class="error">{error}</div>{/if}

      <button class="btn btn-primary" type="submit" style="margin-top:10px">
        {mode === 'login' ? 'Entrar al dashboard →' : 'Crear cuenta →'}
      </button>

      <button
        type="button"
        class="btn btn-ghost"
        onclick={() => { mode = mode === 'login' ? 'register' : 'login'; error = null; password = ''; }}
      >
        {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
      </button>
    </form>
  </div>
</div>

<style>
  .slogan {
    font-size: 22px;
    font-weight: 700;
    font-style: italic;
    margin: 4px 0 0;
    letter-spacing: -0.3px;
  }
  .tagline {
    font-size: 15px;
    opacity: 0.92;
    margin: 0;
    line-height: 1.5;
  }
  .pw-wrap {
    display: flex;
    gap: 8px;
  }
  .pw-wrap input {
    flex: 1;
  }
  .pw-wrap .btn {
    flex-shrink: 0;
  }
</style>
