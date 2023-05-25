import { Commitment, Connection, Keypair } from "@solana/web3.js";
import wallet from "../wba-wallet.json";
import {
    Metaplex,
    keypairIdentity,
    bundlrStorage,
    toMetaplexFile,
} from "@metaplex-foundation/js";
import { readFile } from "fs/promises"; // for async use promises

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

const metaplex = Metaplex
    .make(connection)
    .use(keypairIdentity(keypair))
    .use(
        bundlrStorage({
            address: "https://devnet.bundlr.network",
            providerUrl: "https://api.devnet.solana.com",
            timeout: 6000,
        })
    );



(async () => {
    try {
        const { nft } = await metaplex.nfts().create({
            name: "Crazy GenRug",
            symbol: "CGR",
            sellerFeeBasisPoints: 700,
            uri: "https://arweave.net/0EVTOqrCZoumXtkciv67zKaDMMXmWTqTwIhjgfdDjkg",
            creators: [
                {
                    address: keypair.publicKey,
                    share: 100,
                }
            ],
            isMutable: true,
            
        }
    );

        console.log(`nft address: ${nft.address.toBase58()}`);
        // 58aNMaYDNy62gGEQ3DAVk9BkKYADVTbBuqEZpTqVSBHR
    } catch(error) {
        console.log(`Oops, something went wrong: ${error}`)
    }
})()