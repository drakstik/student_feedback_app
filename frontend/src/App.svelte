<script lang="ts">
  import { onMount } from "svelte";
  import Counter from "./lib/Counter.svelte";
  import Register from "./lib/Register.svelte";
  import Login from "./lib/Login.svelte";
  import StudentDashboard from "./lib/StudentDashboard.svelte";
  import TeacherDashboard from "./lib/TeacherDashboard.svelte";

  type AuthUser = { username: string; role: "student" | "teacher" } | null;

  // null = unknown (loading), false-y resolved via authUser being null after load
  let authUser = $state<AuthUser>(null);
  let authChecked = $state(false); // prevents flash of login UI on refresh

  async function checkSession() {
    try {
      const res = await fetch("/api/me");
      if (res.ok) {
        const data = await res.json();
        authUser = { username: data.username, role: data.role };
      } else {
        authUser = null;
      }
    } catch {
      authUser = null;
    } finally {
      authChecked = true;
    }
  }

  // Source of truth: always ask the backend's /api/me on mount
  onMount(() => {
    checkSession();
  });

  // Called by Login/Register on success — uses backend-returned data,
  // but we re-verify via /api/me to ensure session is real
  async function handleAuthSuccess() {
    await checkSession();
  }

  function handleLogout() {
    authUser = null;
    authChecked = true;
  }
</script>

<section id="center">
  <!-- <Counter /> -->

  {#if !authChecked}
    <!-- Avoids flashing the login UI while the /api/me check is in flight -->
    <p style="color: #888; margin-top: 2rem;">Checking session...</p>
  {:else if authUser?.role === "student"}
    <StudentDashboard
      username={authUser.username}
      onLogoutSuccess={handleLogout}
    />
  {:else if authUser?.role === "teacher"}
    <TeacherDashboard
      username={authUser.username}
      onLogoutSuccess={handleLogout}
    />
  {:else}
    <div class="auth-actions">
      <Register onSuccess={handleAuthSuccess} />
      <span class="or-separator">or</span>
      <Login onSuccess={handleAuthSuccess} />
    </div>
  {/if}
</section>
