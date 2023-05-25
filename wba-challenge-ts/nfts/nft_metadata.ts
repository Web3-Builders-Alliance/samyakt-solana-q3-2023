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
        const { uri } = await metaplex.nfts().uploadMetadata({
            name: "Crazy GenRug",
            symbol: "CGR",
            description: "these are crazy genrugs",
            seller_fee_basis_points: 700,
            image: "https://arweave.net/HChQXaEjpZGC3eU-_qMdWzLjsXccrP0paGupJkXoENA",
            attributes: [
                {
                    trait_type: "Feature",
                    value: "Blue",
                }, {
                    trait_type: "Style",
                    value: "Pixel",
                }, {
                    trait_type: "Background",
                    value: "Purple",
                }
            ],
            properties: {
                files: [
                    {
                        type: "image/png",
                        uri: "https://arweave.net/HChQXaEjpZGC3eU-_qMdWzLjsXccrP0paGupJkXoENA",
                    }
                ],
                
                creators: [
                    {
                        address: keypair.publicKey.toBase58(),
                        share: 100,
                    }
                ],
                
            }
        }
    );

        console.log(`metadata: ${uri}`);
        // https://arweave.net/0EVTOqrCZoumXtkciv67zKaDMMXmWTqTwIhjgfdDjkg
    } catch(error) {
        console.log(`Oops, something went wrong: ${error}`)
    }
})()