import OpenAI from "openai";
import { Run } from "openai/resources/beta/threads/runs/runs";
import { Thread } from "openai/resources/beta/threads/threads";

export async function performRun(client: OpenAI, thread: Thread, run: Run) {
    // Handle runs that require action
    if (run.status === "requires_action" && run.required_action?.type === "submit_tool_outputs") {
        const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
        
        if (toolCalls && toolCalls.length > 0) {
            console.log(`Found ${toolCalls.length} tool calls, submitting empty responses`);
            
            const toolOutputs = toolCalls.map(tool => ({
                tool_call_id: tool.id,
                output: JSON.stringify({ success: true, message: "Tool execution skipped" })
            }));
            
            try {
                run = await client.beta.threads.runs.submitToolOutputsAndPoll(
                    thread.id,
                    run.id,
                    { tool_outputs: toolOutputs }
                );
            } catch (error) {
                console.error("Error submitting tool outputs:", error);
            }
        }
    }

    if (run.status === "failed") {
        await client.beta.threads.messages.create(
            thread.id, {
                role: "assistant",
                content: run.last_error?.message || "Unknown error"
            }
        );

        return {
            type: "text",
            text: {
                value: run.last_error?.message || "Unknown error",
                annotations: []
            }
        }
    }

    const message = await client.beta.threads.messages.list(thread.id);
    
    const assistantMessage = message.data.find(message => message.role === "assistant");

    return assistantMessage?.content[0] || {
         type: 'text', text: { value: 'No response from assistant', annotations: [] }
    }
}