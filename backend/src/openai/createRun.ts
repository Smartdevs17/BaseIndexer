import OpenAI from "openai";
import { Thread } from "openai/resources/beta/threads/threads";
import { Run } from "openai/resources/beta/threads/runs/runs";

/**
 * Creates a run for a given thread and waits for it to complete.
 *
 * @param client - The OpenAI client instance.
 * @param thread - The thread for which the run is being created.
 * @param assistantId - The ID of the assistant handling the thread.
 * @returns A promise that resolves with the completed run.
 */
export async function createRun(client: OpenAI, thread: Thread, assistantId: string): Promise<Run> {

    console.log(`🚀 Creating run for thread ${thread.id} with assistant ${assistantId}...`);

    let run = await client.beta.threads.runs.create(thread.id, {
        assistant_id: assistantId,

    });
    
    while (run.status === 'in_progress' || run.status === 'queued') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        run = await client.beta.threads.runs.retrieve(thread.id, run.id);
    }

    return run;
}
