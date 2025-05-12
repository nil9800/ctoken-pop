// src/lib/compressed-tokens.ts
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  clusterApiUrl,
} from '@solana/web3.js';
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
  createTree,
} from '@solana/spl-account-compression';
import {
  createInitializeTreeInstruction,
  createMintV1Instruction,
  MetadataArgs,
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
} from '@metaplex-foundation/mpl-bubblegum';
import { createAllocTreeIx } from '@solana/spl-account-compression';
import { ConcurrentMerkleTreeAccount } from '@solana/spl-account-compression';
import {
  CreateMetadataAccountArgsV3,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
} from '@metaplex-foundation/mpl-token-metadata';
import * as bs58 from 'bs58';

// Configuration for the compression
const MAX_DEPTH = 14; // Maximum tree depth
const MAX_BUFFER_SIZE = 64; // Buffer size for concurrent operations

/**
 * Creates a new Merkle tree for compressed NFTs
 */
export async function createMerkleTree(
  connection: Connection,
  payer: Keypair,
): Promise<{ treeKeypair: Keypair; merkleTree: PublicKey }> {
  // Generate a new keypair for the tree
  const treeKeypair = Keypair.generate();

  // Calculate tree space needed
  const space = await createTree(connection, 
    payer.publicKey, 
    treeKeypair.publicKey, 
    MAX_DEPTH, 
    MAX_BUFFER_SIZE,
    payer.publicKey
  );

  // Create the allocation instruction
  const allocTreeIx = await createAllocTreeIx(
    connection,
    treeKeypair.publicKey,
    payer.publicKey,
    space,
    MAX_DEPTH,
    MAX_BUFFER_SIZE
  );

  // Initialize the tree
  const [treeAuthority] = PublicKey.findProgramAddressSync(
    [treeKeypair.publicKey.toBuffer()],
    BUBBLEGUM_PROGRAM_ID
  );

  const initTreeIx = createInitializeTreeInstruction(
    {
      merkleTree: treeKeypair.publicKey,
      treeAuthority,
      treeCreator: payer.publicKey,
      payer: payer.publicKey,
      logWrapper: SPL_NOOP_PROGRAM_ID,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
    },
    {
      maxBufferSize: MAX_BUFFER_SIZE,
      maxDepth: MAX_DEPTH,
      public: false,
    },
    BUBBLEGUM_PROGRAM_ID
  );

  // Create and send the transaction
  const tx = new Transaction().add(allocTreeIx).add(initTreeIx);
  tx.feePayer = payer.publicKey;
  
  const latestBlockhash = await connection.getLatestBlockhash();
  tx.recentBlockhash = latestBlockhash.blockhash;

  // Sign and send the transaction
  try {
    const signature = await connection.sendTransaction(tx, [payer, treeKeypair]);
    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });
    
    console.log(`Tree created successfully! Signature: ${signature}`);
    
    return { treeKeypair, merkleTree: treeKeypair.publicKey };
  } catch (error) {
    console.error("Error creating tree:", error);
    throw error;
  }
}

/**
 * Mint a compressed NFT as proof of participation
 */
export async function mintCompressedNFT(
  connection: Connection,
  payer: Keypair,
  merkleTree: PublicKey,
  eventDetails: {
    name: string;
    description: string;
    image: string;
    organizer: string;
    date: string;
  },
  recipientAddress: string,
): Promise<string> {
  // Find the tree authority PDA
  const [treeAuthority] = PublicKey.findProgramAddressSync(
    [merkleTree.toBuffer()],
    BUBBLEGUM_PROGRAM_ID
  );

  // Prepare metadata for the cToken
  const metadataArgs: MetadataArgs = {
    name: eventDetails.name,
    symbol: "POP",
    uri: eventDetails.image, // In production, this would be a URL to JSON metadata
    sellerFeeBasisPoints: 0, // No royalties
    creators: [
      {
        address: payer.publicKey,
        verified: true,
        share: 100,
      },
    ],
    editionNonce: null,
    uses: null,
    collection: null,
    primarySaleHappened: false,
    isMutable: true,
    tokenProgramVersion: 0,
    tokenStandard: 0,
  };

  // Create recipient public key
  const recipient = new PublicKey(recipientAddress);

  // Create the mint instruction
  const mintIx = createMintV1Instruction(
    {
      merkleTree,
      treeAuthority,
      treeCreator: payer.publicKey,
      payer: payer.publicKey,
      leafOwner: recipient,
      leafDelegate: payer.publicKey,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      logWrapper: SPL_NOOP_PROGRAM_ID,
    },
    {
      metadataArgs,
    }
  );

  // Create and send transaction
  const tx = new Transaction().add(mintIx);
  tx.feePayer = payer.publicKey;
  
  const latestBlockhash = await connection.getLatestBlockhash();
  tx.recentBlockhash = latestBlockhash.blockhash;

  try {
    const signature = await connection.sendTransaction(tx, [payer]);
    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });
    
    console.log(`Compressed NFT minted successfully! Signature: ${signature}`);
    return signature;
  } catch (error) {
    console.error("Error minting compressed NFT:", error);
    throw error;
  }
}

/**
 * Calculate the gas savings of using compressed NFTs vs regular NFTs
 * for a batch of tokens
 */
export function calculateGasSavings(
  tokenCount: number,
  regularNftCostInSol: number = 0.01,
  compressedNftCostInSol: number = 0.000005,
): { 
  regularCost: number;
  compressedCost: number;
  savings: number;
  savingsPercentage: number 
} {
  const treeCreationCostInSol = 0.00232; // One-time cost to create the tree
  
  const regularCost = tokenCount * regularNftCostInSol;
  const compressedCost = (tokenCount * compressedNftCostInSol) + treeCreationCostInSol;
  
  const savings = regularCost - compressedCost;
  const savingsPercentage = (savings / regularCost) * 100;
  
  return {
    regularCost,
    compressedCost,
    savings,
    savingsPercentage
  };
}

// Example API endpoint handlers

/**
 * API handler for creating a new event with compressed tokens
 */
export async function handleCreateEvent(
  eventDetails: {
    name: string;
    description: string;
    image: string;
    organizer: string;
    date: string;
    maxSupply: number;
  },
  organizerWalletPrivateKey: string
): Promise<{ 
  eventId: string; 
  merkleTree: string;
  estimatedSavings: { 
    regularCost: number;
    compressedCost: number;
    savings: number;
    savingsPercentage: number 
  }
}> {
  // Connect to Solana
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  
  // Reconstruct the organizer's keypair
  const organizerKeypair = Keypair.fromSecretKey(
    bs58.decode(organizerWalletPrivateKey)
  );
  
  // Create a Merkle tree for this event's tokens
  const { merkleTree } = await createMerkleTree(
    connection,
    organizerKeypair
  );
  
  // Generate an event ID
  const eventId = `event_${Date.now()}_${merkleTree.toString().substring(0, 8)}`;
  
  // Calculate potential gas savings
  const estimatedSavings = calculateGasSavings(eventDetails.maxSupply);
  
  // In a real implementation, we would store event details in a database
  // ...
  
  return {
    eventId,
    merkleTree: merkleTree.toString(),
    estimatedSavings
  };
}

/**
 * API handler for claiming a token
 */
export async function handleClaimToken(
  eventId: string,
  merkleTree: string,
  recipientWalletAddress: string,
  organizerWalletPrivateKey: string,
  eventDetails: {
    name: string;
    description: string;
    image: string;
    organizer: string;
    date: string;
  }
): Promise<{ 
  success: boolean;
  signature?: string;
  message?: string;
}> {
  try {
    // Connect to Solana
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    
    // Reconstruct the organizer's keypair
    const organizerKeypair = Keypair.fromSecretKey(
      bs58.decode(organizerWalletPrivateKey)
    );
    
    // Mint the compressed NFT
    const signature = await mintCompressedNFT(
      connection,
      organizerKeypair,
      new PublicKey(merkleTree),
      eventDetails,
      recipientWalletAddress
    );
    
    // In a real implementation, we would update a database to track claims
    // ...
    
    return {
      success: true,
      signature,
      message: "Token claimed successfully!"
    };
  } catch (error) {
    console.error("Error handling token claim:", error);
    return {
      success: false,
      message: `Failed to claim token: ${error.message}`
    };
  }
}

/**
 * Generate a QR code URL for claiming a token
 */
export function generateClaimUrl(eventId: string, claimCode: string): string {
  // In a real implementation, store the claim code in a database and link it to the event
  return `https://ctoken.pop/claim/${eventId}?code=${claimCode}`;
}

/**
 * Verify a claim code
 */
export function verifyClaimCode(eventId: string, claimCode: string): boolean {
  // In a real implementation, verify against a database
  // For now, we'll just return true for demonstration
  return true;
}

