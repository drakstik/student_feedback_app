<script lang="ts">
    let username = "";
    let password = "";
    let loading = false;

    async function handleLogin() {
        if (!username || !password) return alert("Please fill out all fields.");
        loading = true;

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: username.trim().toLowerCase(),
                    password,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert("Logged in successfully!");
                // Clear state immediately
                username = "";
                password = "";
            } else {
                alert(`Error: ${data.error || "Login failed"}`);
            }
        } catch (err) {
            alert("Network error occurred.");
        } finally {
            loading = false;
        }
    }
</script>

<form on:submit|preventDefault={handleLogin} class="login-box">
    <h3>Login</h3>
    <input
        type="text"
        bind:value={username}
        placeholder="Username"
        disabled={loading}
        autocomplete="username"
        required
    />
    <input
        type="password"
        bind:value={password}
        placeholder="Password"
        disabled={loading}
        autocomplete="current-password"
        required
    />
    <button type="submit" disabled={loading}>
        {loading ? "Authenticating..." : "Login"}
    </button>
</form>

<style>
    .login-box {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        width: 280px;
        margin: auto;
    }
    input {
        padding: 0.6rem;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    button {
        background-color: #22c55e;
        color: white;
        padding: 0.6rem;
        cursor: pointer;
        border: none;
        border-radius: 4px;
        font-weight: bold;
    }
    button:disabled {
        background-color: #86efac;
        cursor: not-allowed;
    }
</style>
