<script lang="ts">
    // Define a prop to accept a callback function from the parent
    export let onLogoutSuccess: () => void = () => {};

    let loading = false;
    let error: string | null = null;
    let successMessage = "";

    async function handleLogout() {
        loading = true;
        error = null;
        successMessage = "";

        try {
            // Secure POST request ensures logout cannot be triggered via <img> tags or pre-fetching
            const res = await fetch("/api/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Logout failed");
            }

            successMessage = data.message;

            // Invoke the callback function passed by the parent component
            onLogoutSuccess();
        } catch (err: any) {
            error = err.message;
        } finally {
            loading = false;
        }
    }
</script>

<div class="logout-container">
    <button
        type="button"
        class="logout-btn"
        on:click={handleLogout}
        disabled={loading}
    >
        {loading ? "Logging out..." : "Secure Logout"}
    </button>

    {#if error}
        <div class="msg error">Error: {error}</div>
    {/if}

    {#if successMessage}
        <div class="msg success">{successMessage}</div>
    {/if}
</div>

<style>
    .logout-container {
        margin-top: 1em;
    }
    .logout-btn {
        background-color: #e03131;
        color: white;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
    }
    .logout-btn:disabled {
        background-color: #ffc9c9;
        cursor: not-allowed;
    }
    .msg {
        margin-top: 0.5em;
        font-size: 0.9em;
    }
    .error {
        color: #e03131;
    }
    .success {
        color: #2b8a3e;
    }
</style>
