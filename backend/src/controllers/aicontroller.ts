import { Response, Request} from "express";
import OpenAI from "openai";
import { createAssistant } from "../openai/createAssistant";
import { createThread } from "../openai/createThread";
import { performRun } from "../openai/performRunDev";
import { createRun } from "../openai/createRun";
import TransferQueryService from  './db'
// import * as dotenv from "dotenv";
// import { QueryTypes } from "sequelize";
import {validateAccount} from "../utils/validateAddress"

interface QueryOptions {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDir?: 'ASC' | 'DESC';
  }
  
  
  
  const parseQueryOptions = (query: any): QueryOptions => {
      let sortDir: 'ASC' | 'DESC' | undefined;
    
      if (typeof query.sortDir === 'string') {
        const dir = query.sortDir.toUpperCase();
        if (dir === 'ASC' || dir === 'DESC') {
          sortDir = dir;
        }
      }
    
      return {
        limit: query.limit ? parseInt(query.limit) : 100,
        offset: query.offset ? parseInt(query.offset) : 0,
        sortBy: typeof query.sortBy === 'string' ? query.sortBy : 'timestamp',
        sortDir,
      };
    };
  


export async function runCommand(req: Request, res: Response) {
  const options = parseQueryOptions(req.body);
  let { userMessage } = req.body;

  if (!userMessage) {
      return res.status(408).send({
          success: false,
          message: "UserMessage field can't be empty"
      });
  }
  
  console.log("User message:", userMessage);

  try {
      const client = new OpenAI();
      const assistant = await createAssistant(client);
      const thread = await createThread(client, userMessage);
      const run = await createRun(client, thread, assistant.id);

      let result;
      const toolCalls = run.required_action?.submit_tool_outputs?.tool_calls;
      console.log("i am tool calls", toolCalls)

      if (toolCalls && Array.isArray(toolCalls)) {

          const functionCalls = toolCalls.filter(call => call.type === "function");
          
          if (functionCalls.length > 0) {
            
              const parsedFunctions = functionCalls.map(call => {
                  try {
                      const functionName = call.function?.name;
                      const parsedArgs = JSON.parse(call.function?.arguments || "{}");
                      
                      return {
                          id: call.id,
                          functionName,
                          arguments: parsedArgs
                      };
                  } catch (err) {
                      console.error("Failed to parse arguments:", err);
                      return {
                          id: call.id,
                          functionName: call.function?.name,
                          arguments: {},
                          error: "Failed to parse arguments"
                      };
                  }
              });
              
           
              const toolOutputs = parsedFunctions.map(func => ({
                  tool_call_id: func.id,
                  output: JSON.stringify({ success: true, message: "Arguments parsed successfully" })
              }));
              
              await client.beta.threads.runs.submitToolOutputs(
                  thread.id,
                  run.id,
                  { tool_outputs: toolOutputs }
              );
              
             
              try {
                  const currentRun = await client.beta.threads.runs.retrieve(thread.id, run.id);
                console.log(`ℹ️ Current run status: ${currentRun.status}`);

                if (["completed", "cancelled", "failed", "expired"].includes(currentRun.status)) {
                    console.log(`⚠️ Run ${run.id} is already ${currentRun.status}, skipping cancellation.`);
                } else {
                    console.log(`Cancelling run ${run.id} on thread ${thread.id}...`);
                    await client.beta.threads.runs.cancel(thread.id, run.id);
                    console.log(`✅ Successfully cancelled run ${run.id}`);
                }
              } catch (cancelError) {
                  console.error("Failed to cancel run:", cancelError);
              
              }

            
              result = {
                  type: "functionCalls",
                  data: parsedFunctions
              };
              
              console.log("✅ Function arguments parsed and returned");
          } else {
              
              console.log("No function calls found, proceeding with regular response");
              const performRunAction = await performRun(client, thread, run);
              result = { type: "message", data: performRunAction };
          }
      } else {
         
          console.log("No tool calls found");
          const performRunAction = await performRun(client, thread, run);
          result = { type: "message", data: performRunAction };
      }

      console.log("I am result", result);
      
    
      let isAddressQuery = false;
      let address;
      let informationalResponse;
      let requestedFields = []; 
      
      if (result.type === 'message' && 'text' in result.data && typeof result.data.text?.value === 'string') {
         
          try {
              const messageContent = result.data.text.value;
            
              try {
                  const parsed = JSON.parse(messageContent);
             
                  if (parsed.addresses && Array.isArray(parsed.addresses)) {
                      address = parsed.addresses[0];
                      isAddressQuery = true;
                 
                      if (parsed.fields && Array.isArray(parsed.fields)) {
                          requestedFields = parsed.fields;
                      }
                  }
              } catch (jsonError) {
            
                  informationalResponse = messageContent;
              }
          } catch (parseError) {
              console.error("Failed to process message content:", parseError);
          }
      } else if (result.type === 'functionCalls' && Array.isArray(result.data) && result.data.length > 0) {
    
          isAddressQuery = true;
          const functionCall = result.data[0];
          
          if (functionCall.arguments && typeof functionCall.arguments === 'object') {
              const args = functionCall.arguments;
           
              address = args.address || 
                        args.token_address || 
                        args.tokenAddress;
             
              if (!address && args.token) {
                  address = args.token.address;
              }
              

              if (args.fields && Array.isArray(args.fields)) {
                  requestedFields = args.fields;
              } else if (args.returnFields && Array.isArray(args.returnFields)) {
                  requestedFields = args.returnFields;
              } else if (typeof args.fields === 'string') {
              
                  requestedFields = args.fields.split(',').map((field: string) => field.trim());
              } else if (typeof args.returnFields === 'string') {
                  requestedFields = args.returnFields.split(',').map((field: string) => field.trim());
              }
              
             
              if (args.include) {
                  if (Array.isArray(args.include)) {
                      requestedFields = args.include;
                  } else if (typeof args.include === 'string') {
                      requestedFields = args.include.split(',').map((field: string) => field.trim());
                  }
              }
          }
      }
      
      
      if (isAddressQuery) {
          console.log("Processing as address query. Extracted address:", address);
          console.log("Requested fields:", requestedFields.length > 0 ? requestedFields : "All fields");
          
          let transfers;
          if (address) {
            // validate account 
            let code = validateAccount(address)
            console.log("Result ===" , code)

            
            if (!validateAccount(address)){
                console.log("Expect this ")
                return res.status(401).send({
                    success: false,
                    message: `invalid address ${address}`,
                    queryType: "Account"

                })
            }
              transfers = await TransferQueryService.getTransfersByToken(address, options);
              
              if (!transfers || transfers.length === 0){

                return res.status(404).send({

                    success: false,
                    message:`No record found for the address ${address}`,
                    queryType: "address"
                })
              }
              if (requestedFields.length > 0) {
                  transfers = transfers.map(transfer => {
                      const filteredTransfer: Record<string, any> = {};
               
                      filteredTransfer.id = transfer.id;
                      
                      requestedFields.forEach((field: string) => {
                          if (field in transfer) {
                              filteredTransfer[field] = transfer[field];
                          }
                      });
                      
                      return filteredTransfer;
                  });
              }
              
              const api_endpoint = `${process.env.BASE_URL}/api/baseindex/${address}`;
              return res.status(200).send({
                  success: true,
                  message: "Address query processed successfully",
                  data: transfers,
                  queryType: "address",
                  endPoint: api_endpoint,
                  fields: requestedFields.length > 0 ? requestedFields : "all"
              });
          } else {
              return res.status(400).send({
                  success: false,
                  message: "Address query detected but no valid address found",
                  queryType: "address"
              });
          }
      } else {
        
          console.log("Processing as informational query");
          
          return res.status(200).send({
              success: true,
              message: "Informational query processed successfully",
              data: { response: informationalResponse },
              queryType: "informational"
          });
      }
  } catch (error) {
      return res.status(406).send({
          success: false,
          message: (error as Error).message || "Unknown Error"
      });
  }
}