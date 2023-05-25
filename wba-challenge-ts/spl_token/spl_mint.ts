import { Keypair, PublicKey, Connection, Commitment } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import wallet from "../wba-wallet.json"

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

const token_decimals = 1_000_000_000n;

// Mint address
const mint = new PublicKey("3GwaMhdg4sMfubUUFe3o4jQ6KE8RTWzUH69emJZtoho6");

(async () => {
    try {
        const tokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey
        );
        console.log(`You're successfully created or found an existing ATA account: ${tokenAccount.address.toBase58()}\n`);

        const mintTx = await mintTo(
            connection,
            keypair, // our wallet
            mint, // mint address from previous step
            tokenAccount.address, // associated Token Account we just found/created
            keypair, // token mint authority
            100n * token_decimals // mint yourself 100 tokens
        )
        console.log(`Success! Check out your mint TX here:\nhttps://explorer.solana.com/tx/${mintTx}?cluster=devnet`);
    } catch(error: any) {
        if (error.name === "TokenAccountNotFoundError") {
            console.log("Failed to find Token Account. This is probably because we are trying to use it before a block has been found confirming it. Wait a few seconds and try again.");
        } else {
            console.log(`Oops, something went wrong: ${error}`);
        }
    }
})()