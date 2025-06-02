import Web3 from 'web3';
import TransferEvent from '../models/TransferEvent';
import sequelize from '../config/sequilize';
import dotenv from 'dotenv';

dotenv.config();


const createWeb3Instance = () => {

  const provider = new Web3.providers.WebsocketProvider(process.env.INFURA_URL as any);
  
  if (provider) {

    provider.on('connect', () => {
      console.log('WebSocket provider connected !!');
    });
    
    provider.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });
    
    provider.on('end', () => {
      console.log('WebSocket connection ended. Will attempt to reconnect...');
  
      setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        web3 = createWeb3Instance();
        setupSubscription();
      }, 5000);
    });
  }

  return new Web3(provider);
};

let web3 = createWeb3Instance();


const transferEventSignature = web3.utils.sha3('Transfer(address,address,uint256)');
if (!transferEventSignature) {
  throw new Error("Failed to compute event signature hash.");
}

const filterOptions = {
  topics: [transferEventSignature],
};

const setupSubscription = async () => {
  try {
    console.log("Setting up event subscription...");
  
    const subscription = await web3.eth.subscribe('logs', filterOptions);
    
    console.log("Subscription established:", subscription);
    
    subscription.on('data', async (result) => {
      try {
        if (!result.topics || result.topics.length < 3) {
          console.log("Received event with insufficient topics:", result);
          return;
        }
        
        const from = web3.eth.abi.decodeParameter('address', result.topics[1]) as string;
        const to = web3.eth.abi.decodeParameter('address', result.topics[2]) as string;
        
        const rawValue = web3.eth.abi.decodeParameter('uint256', result.data);
       
        const value = typeof rawValue === 'string' ? rawValue : 
                     (typeof rawValue === 'object' && rawValue !== null && 'toString' in rawValue) ? 
                     rawValue.toString() : String(rawValue);
        const tokenAddress = result.address;
        const blockNumber = result.blockNumber;

        await TransferEvent.create({
          from,
          to,
          value,
          tokenAddress,
          blockNumber,
          timestamp: new Date(),
        });

        console.log(`New ERC-20 Transfer: ${from} -> ${to}, Value: ${value}, Token: ${tokenAddress}`);
      } catch (err) {
        console.error("Error processing event:", err);
      }
    });

    subscription.on('error', (error) => {
      console.error("Subscription error:", error);
    
      setTimeout(() => {
        console.log("Attempting to reconnect after error...");
        web3 = createWeb3Instance();
        setupSubscription();
      }, 10000);
    });
    
    subscription.on('connected', (subscriptionId) => {
      console.log(`Subscription connected with ID: ${subscriptionId}`);
    });
    
    return subscription;
  } catch (error) {
    console.error("Failed to set up subscription:", error);
   
    setTimeout(() => {
      console.log("Attempting to reconnect after setup failure...");
      web3 = createWeb3Instance();
      setupSubscription();
    }, 10000);
    
    return null;
  }
};

const listenForTransferEvents = async () => {
  try {

    try {
      await sequelize.authenticate();
      console.log("✅ Database connected successfully!");
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      throw dbError; 
    }
    
  
    console.log("Waiting for WebSocket connection...");
    
 
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Setup the subscription
    await setupSubscription();
    
 
    console.log("WebSocket provider and event handlers configured.")
    
    console.log("Transfer event listener is now running!");
    
  } catch (e) {
    console.error("Failed to initialize transfer event listener:", e);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  console.log('Gracefully shutting down...');
  
  try {
    await sequelize.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
  
  try {
   
    const provider = web3.currentProvider;
    if (provider) {
      
      // @ts-ignore - Ignore TypeScript errors here as we're trying different approaches
      if (typeof provider.disconnect === 'function') {
        // @ts-ignore
        provider.disconnect();
      } else if (provider.reset && typeof provider.reset === 'function') {
        // @ts-ignore
        provider.reset();
      }
    }
    console.log('Attempted to close WebSocket connection.');
  } catch (error) {
    console.error('Error closing WebSocket:', error);
  }
  
  process.exit(0);
});

// // Start the application
// listenForTransferEvents().catch(console.error);

export default listenForTransferEvents