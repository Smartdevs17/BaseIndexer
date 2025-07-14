import { FunctionTool } from "openai/resources/beta/assistants";

export const indexerTool: FunctionTool = {
  type: "function",
  function: {
    name: "index_token_address",
    description: "Index a specific token address and optionally select fields to return.",
    parameters: {
      type: "object",
      properties: {
        tokenAddress: {
          type: "string",
          pattern: '^0x[a-fA-F0-9]{40}$',
          description: "The token address to index",
        },
        fields: {
          type: "array",
          items: {
            type: "string",
            enum: ["value", "to", "from", "blockNumber", "timestamp", "transactionHash"],
          },
          description: "Specific fields to include in the response",
        },
      },
      required: ["tokenAddress"],
    },
  },
};
