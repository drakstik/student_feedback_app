<script lang="ts">
  import Counter from "./lib/Counter.svelte";
  import SayHello from "./lib/Hello_backend.svelte";
  import CreateUser from "./lib/CreateUser.svelte";
  import UpdateUsername from "./lib/UpdateUsername.svelte";
  import Register from "./lib/Register.svelte";
  import Login from "./lib/Login.svelte";
  import Logout from "./lib/Logout.svelte";

  let sayHelloComponent: SayHello | null = null;

  function handlePostLogout() {
    // If the hello component is mounted, force it to refresh its message state
    if (
      sayHelloComponent &&
      typeof sayHelloComponent.fetchMessage === "function"
    ) {
      sayHelloComponent.fetchMessage();
    }
  }
</script>

<section id="center">
  <Counter />
  <SayHello bind:this={sayHelloComponent} />
  <Logout onLogoutSuccess={handlePostLogout} />
  <CreateUser />
  <UpdateUsername />
  <Register />
  <Login />
</section>
