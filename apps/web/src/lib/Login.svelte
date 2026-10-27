<script lang="ts">
  import { store } from "./store.svelte";
  import { Moon, Sun } from "lucide-svelte";

  let mode: "login" | "register" = $state("login");
  let name = $state("");
  let email = $state("");
  let password = $state("");
  let showPw = $state(false);
  let role: "USER" | "ADMIN" = $state("USER");
  let error = $state<string | null>(null);

  function submit(e: Event) {
    e.preventDefault();
    error =
      mode === "login"
        ? store.login(email, password)
        : store.register(name, email, password, role);
  }
</script>

<div class="login-wrap">
  <button
    type="button"
    class="theme-btn"
    onclick={() => store.toggleTheme()}
    title={store.theme === "dark" ? "Tema claro" : "Tema oscuro"}
    aria-label="Cambiar tema"
  >
    {#if store.theme === "dark"}<Sun size={18} />{:else}<Moon size={18} />{/if}
  </button>

  <div class="login-inner">
    <div class="login-left">
      <h1>Todo a tiempo,<br />Todo en orden.</h1>
      <p class="tagline">
        Tu espacio para organizar actividades y cumplir cada vencimiento sin
        estrés.
      </p>
    </div>

    <form class="login-form" onsubmit={submit}>
      {#if mode === "register"}
        <div class="field">
          <label for="name">Nombre</label>
          <input id="name" bind:value={name} placeholder="Tu nombre" required />
        </div>
      {/if}
      <div class="field">
        <label for="email">Nombre de Usuario o Email</label>
        <input
          id="email"
          bind:value={email}
          type="text"
          placeholder="Ingresa tu Nombre de Usuario o Email"
          required
        />
      </div>
      <div class="field">
        <label for="password">Contraseña</label>
        <div class="pw-wrap">
          <input
            id="password"
            bind:value={password}
            type={showPw ? "text" : "password"}
            placeholder={mode === "login"
              ? "Ingresa tu contraseña"
              : "Mínimo 6 caracteres"}
            required
            minlength="6"
          />
          <button
            type="button"
            class="pw-toggle"
            onclick={() => (showPw = !showPw)}
            aria-label="Mostrar contraseña"
          >
            {#if showPw}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><path
                  d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                /><circle cx="12" cy="12" r="3" /></svg
              >
            {:else}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                /><line x1="1" y1="1" x2="23" y2="23" /></svg
              >
            {/if}
          </button>
        </div>
      </div>
      {#if mode === "register"}
        <div class="field">
          <label for="role">Rol</label>
          <select id="role" bind:value={role}>
            <option value="USER">USER — ver y unirse a carpetas</option>
            <option value="ADMIN">ADMIN — crear carpetas y tarjetas</option>
          </select>
        </div>
      {/if}

      {#if mode === "login"}
        <a class="forgot" href="#" onclick={(e) => e.preventDefault()}
          >¿Olvidaste tu contraseña?</a
        >
      {/if}

      {#if error}<div class="error">{error}</div>{/if}

      <button class="btn btn-primary" type="submit">
        {mode === "login" ? "Ingresar" : "Crear cuenta"}
      </button>

      {#if mode === "register"}
        <button
          type="button"
          class="switch-mode"
          onclick={() => {
            mode = "login";
            error = null;
            password = "";
          }}
        >
          ¿Ya tienes cuenta? Inicia sesión
        </button>
      {/if}

      <p class="demo-hint">
        Datos demo: <b>admin@demo.io</b> / <b>admin123</b> (ADMIN) ·
        <b>bruno@demo.io</b>
        / <b>bruno123</b> (USER)
      </p>
    </form>
  </div>

  <p class="register-link">
    ¿No tenes cuenta en Nasked? <a
      href="#"
      onclick={(e) => {
        e.preventDefault();
        mode = "register";
      }}>Registrate</a
    >
  </p>
</div>
