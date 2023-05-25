import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import wallet from "../dev-wallet.json";

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

const connection = new Connection("https://api.devnet.solana.com");

(async () => {
    try {
        const txHash = await connection.requestAirdrop(keypair.publicKey, 2 * LAMPORTS_PER_SOL);
        console.log(`Success! Checkout your tx here:
        https://explorer.solana.com/tx/${txHash}?cluster=devnet`);
    } catch(err) {
        console.error(`Oops, something went wrong: ${err}`);
    }
})();

// https://explorer.solana.com/tx/edybzuzMQmLiR1UfXd12T7zdee6eiAwjEM37itFsRpk62XfCsvoTE9o6NiJAatTfGfbEu4MwrZv7Dk2oJMPz1gd?cluster=devnet