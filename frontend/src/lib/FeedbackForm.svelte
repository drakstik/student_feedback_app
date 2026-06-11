<script lang="ts">
    interface Props {
        onSubmitSuccess: () => void;
    }

    let { onSubmitSuccess }: Props = $props();

    let comment = $state("");
    let loading = $state(false);
    let successMessage = $state<string | null>(null);
    let errorMessage = $state<string | null>(null);

    async function handleSubmit() {
        if (!comment.trim()) return;

        loading = true;
        successMessage = null;
        errorMessage = null;

        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comment }),
            });

            const data = await res.json();

            if (res.ok) {
                comment = "";
                successMessage = data.message;
                onSubmitSuccess();
            } else {
                errorMessage = data.error || "Submission failed.";
            }
        } catch {
            errorMessage = "Network error. Could not reach the server.";
        } finally {
            loading = false;
        }
    }
</script>

<div class="feedback-form">
    <h3>Type your feedback comment in the text box below.</h3>

    <textarea
        bind:value={comment}
        placeholder="Write your comment here... (max 10000 characters)"
        maxlength={10000}
        rows={7}
        disabled={loading}
    ></textarea>

    <div class="char-count">{comment.length} / 10000</div>

    {#if successMessage}
        <p class="success">{successMessage}</p>
    {/if}

    {#if errorMessage}
        <p class="error">{errorMessage}</p>
    {/if}

    <button onclick={handleSubmit} disabled={loading || !comment.trim()}>
        {loading ? "Submitting..." : "Submit Feedback"}
    </button>
</div>

<style>
    .feedback-form {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        width: 320px;
        margin-top: 1rem;
    }
    h3 {
        margin: 0;
        color: #333;
    }
    textarea {
        padding: 0.6rem;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 1rem;
        resize: vertical;
        font-family: inherit;
    }
    textarea:disabled {
        background: #f5f5f5;
    }
    .char-count {
        font-size: 0.75rem;
        color: #888;
        text-align: right;
    }
    button {
        padding: 0.6rem 1.2rem;
        background-color: #6366f1;
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
    }
    button:disabled {
        background-color: #a5b4fc;
        cursor: not-allowed;
    }
    .success {
        color: #16a34a;
        font-size: 0.9rem;
        margin: 0;
    }
    .error {
        color: #dc2626;
        font-size: 0.9rem;
        margin: 0;
    }
</style>
