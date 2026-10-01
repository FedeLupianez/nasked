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
  <div class="blob blob-tr"></div>
  <div class="blob blob-bl"></div>

  <div class="login-inner">
    <div class="login-left">
      <h1>Todo a tiempo,<br />Todo en orden.</h1>
      <p class="tagline">Tu espacio para organizar actividades y cumplir cada vencimiento sin estrés.</p>
    </div>

    <form class="login-form" onsubmit={submit}>
      {#if mode === 'register'}
        <div class="field">
          <label for="name">Nombre</label>
          <input id="name" bind:value={name} placeholder="Tu nombre" required />
        </div>
      {/if}
      <div class="field">
        <label for="email">Nombre de Usuario o Email</label>
        <input id="email" bind:value={email} type="text" placeholder="Ingresa tu Nombre de Usuario o Email" required />
      </div>
      <div class="field">
        <label for="password">Contraseña</label>
        <div class="pw-wrap">
          <input
            id="password"
            bind:value={password}
            type={showPw ? 'text' : 'password'}
            placeholder={mode === 'login' ? 'Ingresa tu contraseña' : 'Mínimo 6 caracteres'}
            required
            minlength="6"
          />
          <button type="button" class="pw-toggle" onclick={() => (showPw = !showPw)} aria-label="Mostrar contraseña">
            {#if showPw}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            {/if}
          </button>
        </div>
      </div>
      {#if mode === 'register'}
        <div class="field">
          <label for="role">Rol</label>
          <select id="role" bind:value={role}>
            <option value="USER">USER — ver y unirse a carpetas</option>
            <option value="ADMIN">ADMIN — crear carpetas y tarjetas</option>
          </select>
        </div>
      {/if}

      {#if mode === 'login'}
        <a class="forgot" href="#" onclick={(e) => e.preventDefault()}>¿Olvidaste tu contraseña?</a>
      {/if}

      {#if error}<div class="error">{error}</div>{/if}

      <button class="btn-ingresar" type="submit">
        {mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
      </button>

      <button type="button" class="btn-google">
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
        Ingresa con tu cuenta de Google
      </button>

      {#if mode === 'register'}
        <button
          type="button"
          class="switch-mode"
          onclick={() => { mode = 'login'; error = null; password = ''; }}
        >
          ¿Ya tienes cuenta? Inicia sesión
        </button>
      {/if}

      <p class="demo-hint">
        Datos demo: <b>admin@demo.io</b> / <b>admin123</b> (ADMIN) · <b>bruno@demo.io</b> / <b>bruno123</b> (USER)
      </p>
    </form>
  </div>

  <p class="register-link">¿No tenes cuenta en Nasked? <a href="#" onclick={(e) => { e.preventDefault(); mode = 'register'; }}>Registrate</a></p>
</div>

<style>
  .login-wrap {
    position: relative;
    min-height: 100vh;
    background: #ffffff;
    color: #111;
    overflow: hidden;
    font-family: var(--sans);
  }
  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    opacity: 0.75;
    pointer-events: none;
  }
  .blob-tr {
    width: 480px; height: 480px;
    top: -140px; right: -120px;
    background: radial-gradient(circle at 40% 40%, #d9f99d, #fde68a 55%, #fda4af 90%);
  }
  .blob-bl {
    width: 520px; height: 520px;
    bottom: -180px; left: -140px;
    background: radial-gradient(circle at 60% 60%, #fda4af, #fcd34d 55%, #fde68a 90%);
  }
  .login-inner {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    max-width: 1180px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 48px;
    padding: 48px;
  }
  .login-left h1 {
    font-size: 44px;
    font-weight: 800;
    letter-spacing: -1px;
    line-height: 1.15;
    margin: 0 0 14px;
    color: #111;
  }
  .tagline {
    font-size: 15px;
    color: #333;
    margin: 0;
    max-width: 340px;
    line-height: 1.5;
  }
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-width: 380px;
    width: 100%;
    justify-self: center;
  }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field label { font-size: 13px; color: #111; font-weight: 500; }
  .field input, .field select {
    background: #fff;
    border: 1px solid #111;
    color: #111;
    border-radius: 8px;
    padding: 11px 12px;
    font-size: 13.5px;
    outline: none;
    width: 100%;
  }
  .field input::placeholder { color: #666; }
  .pw-wrap { position: relative; }
  .pw-wrap input { padding-right: 40px; }
  .pw-toggle {
    position: absolute;
    right: 10px; top: 50%;
    transform: translateY(-50%);
    background: transparent; border: 0; cursor: pointer;
    color: #111; display: grid; place-items: center; padding: 4px;
  }
  .forgot {
    font-size: 13px; color: #111; text-decoration: none; margin-top: -6px;
  }
  .forgot:hover { text-decoration: underline; }
  .btn-ingresar {
    background: #fff;
    border: 1.5px solid #111;
    border-radius: 8px;
    padding: 11px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    color: #111;
  }
  .btn-ingresar:hover { background: #f5f5f5; }
  .btn-google {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    background: #fff;
    border: 1.5px solid #111;
    border-radius: 8px;
    padding: 11px;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    color: #111;
  }
  .btn-google:hover { background: #f5f5f5; }
  .switch-mode {
    background: transparent; border: 0; cursor: pointer;
    font-size: 13px; color: #111; text-decoration: underline;
    align-self: flex-start; padding: 0;
  }
  .error {
    background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.5);
    color: #b91c1c; padding: 10px 12px; border-radius: 8px; font-size: 13px;
  }
  .demo-hint {
    font-size: 12px; color: #555; margin: 4px 0 0;
  }
  .register-link {
    position: absolute;
    bottom: 28px; left: 48px;
    z-index: 1;
    font-size: 13px; color: #111; margin: 0;
  }
  .register-link a { color: #111; font-weight: 600; }

  @media (max-width: 860px) {
    .login-inner { grid-template-columns: 1fr; padding: 32px; gap: 24px; }
    .register-link { position: static; padding: 0 32px 24px; }
  }
</style>
