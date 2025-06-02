import OpenAI from "openai";
import { Assistant } from "openai/resources/beta/assistants";
import { indexerAssistantPrompt } from "./prompt";
import { indexerTool } from "../tools/IndexerTool";

export async function createAssistant(client: OpenAI): Promise<Assistant> {
    return await client.beta.assistants.create({
        model: "gpt-4o-mini",
        name: "indexa",
        instructions: indexerAssistantPrompt,
        tools: [indexerTool]
    });
}