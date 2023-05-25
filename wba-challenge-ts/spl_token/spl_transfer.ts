import { Commitment, Connection, Keypair, PublicKey} from "@solana/web3.js"
import wallet from "../wba-wallet.json"
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("3GwaMhdg4sMfubUUFe3o4jQ6KE8RTWzUH69emJZtoho6");

// Recipient address
const to = new PublicKey("EtGf3KRUT2R21mAPCyZBXb7GFQy1sAeAfwBsHtCeBXP8");

// Token decimal
const token_decimals = 1_000_000n;

(async () => {
    try {
        // Get the token account of the fromWallet address, and if it does not exist, create it
        let fromWallet = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey
        );

        // Get the token account of the toWallet address, and if it does not exist, create it
        let toWallet = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey
        );

        // Transfer the new token to the "toTokenAccount" we just created
        const tx = await transfer(
            connection, 
            keypair,
            fromWallet.address, 
            toWallet.address,
            keypair.publicKey, 
            1n * token_decimals
        );
        console.log(`transaction: ${tx}`);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();