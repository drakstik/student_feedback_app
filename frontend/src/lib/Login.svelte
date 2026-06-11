<script lang="ts">
    let { onSuccess } = $props();

    let dialog: HTMLDialogElement;

    // Upgraded to Svelte 5 Runes
    let username = $state("");
    let password = $state("");
    let loading = $state(false);

    async function handleLogin(event: SubmitEvent) {
        event.preventDefault(); // stop page refresh

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

                onSuccess({
                    role: data.user.role,
                    username: data.user.username,
                });

                // Closes the modal visually, which triggers clearFormState() natively via onclose
                dialog.close();
            } else {
                alert(`Error: ${data.error || "Login failed"}`);
            }
        } catch (err) {
            alert("Network error occurred.");
        } finally {
            loading = false;
        }
    }

    // Side-effect-free state cleanup handler
    function clearFormState() {
        username = "";
        password = "";
    }
</script>

<button class="login-trigger-btn" onclick={() => dialog.showModal()}>
    Login
</button>

<dialog bind:this={dialog} onclose={clearFormState}>
    <form onsubmit={(e) => handleLogin(e)} class="modal-content">
        <h3>Login</h3>

        <label for="log-uname">Username</label>
        <input
            id="log-uname"
            type="text"
            bind:value={username}
            placeholder="Enter your username"
            disabled={loading}
            autocomplete="username"
            required
        />

        <label for="log-password">Password</label>
        <input
            id="log-password"
            type="password"
            bind:value={password}
            placeholder="Enter your password"
            disabled={loading}
            autocomplete="current-password"
            required
        />

        <div class="actions">
            <button
                type="button"
                class="cancel"
                onclick={() => dialog.close()}
                disabled={loading}
            >
                Cancel
            </button>
            <button type="submit" class="done" disabled={loading}>
                {loading ? "Authenticating..." : "Login"}
            </button>
        </div>
    </form>
</dialog>

<style>
    dialog {
        border-radius: 12px;
        border: 1px solid #ddd;
        padding: 2rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
    dialog::backdrop {
        background: rgba(0, 0, 0, 0.6);
    }
    .modal-content {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
    }
    h3 {
        margin-top: 0;
        color: #333;
    }
    label {
        font-size: 0.9rem;
        font-weight: bold;
        color: #666;
    }
    input {
        padding: 0.6rem;
        width: 280px;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
        font-size: 1rem;
    }
    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 1.5rem;
    }
    button {
        padding: 0.6rem 1.2rem;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        font-weight: 600;
    }
    .login-trigger-btn {
        background-color: #22c55e;
        color: white;
        font-size: 1rem;
    }
    .done {
        background-color: #22c55e;
        color: white;
    }
    .done:disabled {
        background-color: #86efac;
        cursor: not-allowed;
    }
    .cancel {
        background-color: #ef4444;
        color: white;
    }
</style>
