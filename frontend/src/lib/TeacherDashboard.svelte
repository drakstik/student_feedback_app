<script lang="ts">
    import Logout from "./Logout.svelte";
    import { onMount } from "svelte";

    interface FeedbackEntry {
        comment: string;
        createdAt: string;
    }

    interface Props {
        username: string;
        onLogoutSuccess: () => void;
    }

    let { username, onLogoutSuccess }: Props = $props();

    let feedbackList = $state<FeedbackEntry[]>([]);
    let feedbackError = $state<string | null>(null);
    let loading = $state(false);

    async function loadFeedback() {
        feedbackError = null;
        loading = true;
        try {
            const res = await fetch("/api/getAllFeedback");
            if (res.ok) {
                feedbackList = await res.json();
            } else {
                feedbackError = "Could not load feedback.";
            }
        } catch {
            feedbackError = "Network error loading feedback.";
        } finally {
            loading = false;
        }
    }

    onMount(loadFeedback);
</script>

<div class="dashboard">
    <div class="top-bar">
        <div></div>
        <Logout {onLogoutSuccess} />
    </div>

    <h2>🍎 Teacher Dashboard</h2>
    <p>Welcome, Professor <strong>{username}</strong>.</p>

    <div class="feedback-section">
        <h3>All Student Feedback</h3>

        {#if loading}
            <p class="muted">Loading...</p>
        {:else if feedbackError}
            <p class="error">{feedbackError}</p>
        {:else if feedbackList.length === 0}
            <p class="muted">No feedback submitted yet.</p>
        {:else}
            <div class="scroll-table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th class="col-date">Date</th>
                            <th class="col-comment">Comment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each feedbackList as entry}
                            <tr>
                                <td class="col-date">
                                    {new Date(entry.createdAt).toLocaleString()}
                                </td>
                                <td class="col-comment">{entry.comment}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </div>
</div>

<style>
    .dashboard {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        margin-top: 1rem;
        width: 100%;
    }

    .top-bar {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 1.5rem;
        box-sizing: border-box;
    }

    .feedback-section {
        width: 90%;
        max-width: 900px;
    }

    .feedback-section h3 {
        margin-bottom: 0.5rem;
        color: #333;
    }

    .scroll-table-wrapper {
        height: 66vh;
        overflow-y: auto;
        border: 1px solid #ddd;
        border-radius: 6px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    thead th {
        position: sticky;
        top: 0;
        background: #6366f1;
        color: white;
        padding: 0.6rem 1rem;
        text-align: left;
        z-index: 1;
    }

    tbody tr:nth-child(even) {
        background: #f9f9f9;
    }

    tbody td {
        padding: 0.6rem 1rem;
        vertical-align: top;
        border-bottom: 1px solid #eee;
        font-size: 0.9rem;
    }

    .col-date {
        width: 180px;
        white-space: nowrap;
        color: #555;
    }

    .col-comment {
        word-break: break-word;
    }

    .error {
        color: #dc2626;
        font-size: 0.9rem;
    }

    .muted {
        color: #888;
        font-size: 0.9rem;
    }
</style>
