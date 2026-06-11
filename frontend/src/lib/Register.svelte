<script lang="ts">
    let { onSuccess } = $props();

    let dialog: HTMLDialogElement;

    let username = $state("");
    let password = $state("");
    let phoneNumber = $state("");
    let role = $state("student"); // Initialize role with least priviledged user type by default
    let loading = $state(false);

    async function handleRegister() {
        // Basic client-side validation
        if (!username || !password || !phoneNumber || !role) {
            return alert(
                "Please enter a username, password, phone number and role.",
            );
        }
        loading = true;

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, phoneNumber, role }),
            });

            const data = await res.json();

            if (res.ok) {
                // Success: Alert the user and reset form
                alert(`Successfully created new user!`);
                onSuccess({
                    role: data.user.role,
                    username: data.user.username,
                });

                // This triggers closeDialog() to clear inputs
                dialog.close();
            } else {
                // Error: Handle backend validation or server errors
                // Express-validator returns an 'errors' array, others might return 'error'
                const errorMsg = data.errors
                    ? data.errors.map((e: any) => e.msg).join(", ")
                    : data.error || "Registration failed";

                alert(`Error: ${errorMsg}`);
            }
        } catch (err) {
            alert("Network error: Could not connect to the server.");
        } finally {
            loading = false;
        }
    }

    function closeDialog() {
        username = "";
        password = "";
        phoneNumber = "";
        role = "student";
    }
</script>

<!-- Trigger Button -->
<button class="join-btn" onclick={() => dialog.showModal()}>
    Become a Member
</button>

<!-- Modal Popup -->
<dialog bind:this={dialog} onclose={closeDialog}>
    <div class="modal-content">
        <h3>Create an Account</h3>

        <label for="reg-uname">Username</label>
        <input
            id="reg-uname"
            type="text"
            bind:value={username}
            placeholder="Choose a username"
            disabled={loading}
        />

        <label for="reg-phone">Phone Number</label>
        <input
            id="reg-phone"
            type="tel"
            bind:value={phoneNumber}
            placeholder="+250789999999"
            disabled={loading}
        />

        <label for="reg-password">Password</label>
        <input
            id="reg-password"
            type="password"
            bind:value={password}
            placeholder="At least 12 characters"
            disabled={loading}
        />

        <label for="reg-role">Account Type</label>
        <select id="reg-role" bind:value={role} disabled={loading}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
        </select>

        <div class="actions">
            <button
                type="button"
                class="cancel"
                onclick={() => dialog.close()}
                disabled={loading}
            >
                Cancel
            </button>
            <button class="done" onclick={handleRegister} disabled={loading}>
                {loading ? "Creating..." : "Done"}
            </button>
        </div>
    </div>
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
    }
    input,
    select {
        padding: 0.6rem;
        width: 280px;
        border: 1px solid #ccc;
        border-radius: 4px;
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
    .join-btn {
        background-color: #6366f1;
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
