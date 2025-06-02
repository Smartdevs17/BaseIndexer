// src/hooks/useAIAssistant.ts
import { useState } from 'react';

interface AIResponse {
  success: boolean;
  message: string;
  data?: any;
  queryType?: 'address' | 'informational';
  fields?: string[] | 'all';
  endPoint?: string
}

export interface ProcessedResponse {
  text: string;
  data?: any;
}

export function useAIAssistant() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const sendQuery = async (message: string): Promise<AIResponse> => {
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/indexer/run`;
      
      console.log('Calling backend endpoint:', endpoint);
      
      // Option 1: Use POST with request body (preferred method based on your backend code)
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userMessage: message }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        setDebugInfo({
          status: response.status,
          contentType: response.headers.get('Content-Type'),
          responsePreview: errorText.substring(0, 500) 
        });
        throw new Error(`Backend error: ${errorText}`);
      }
      // console.log('Response received from backend:', await response.json());
      return await response.json();
    } catch (error) {
      console.error('Error sending query to AI:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };









  const processResults = (response: AIResponse): ProcessedResponse => {
    if (!response.success) {
      return {
        text: response.message || 'Failed to process request',
      };
    }
    
    if (response.queryType === 'informational') {
      return {
        text: response.data?.response || response.message || 'No information available',
      };
    } else if (response.queryType === 'address') {
      if (Array.isArray(response.data)) {
        const count = response.data.length;
        return {
          text: `Found ${count} transactions for this address. Here's the most recent one:`,
          data: response.data[0],
        };
      } else if (response.data) {
        return {
          text: 'Found transaction for this address:',
          data: response.data,
        };
      } else {
        return {
          text: 'No blockchain data found for this address',
        };
      }
    }
    
    return {
      text: response.message || 'Received response from AI assistant',
      data: response.data,
    };
  };
  
  return {
    sendQuery,
    processResults,
    isLoading,
    error,
    debugInfo
  };
}