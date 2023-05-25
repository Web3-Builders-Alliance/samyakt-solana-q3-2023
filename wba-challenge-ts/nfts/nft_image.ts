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
        // adding image to arweave
        let image = await readFile("./nfts/images/generug.png");
        let metaplexImage = toMetaplexFile(image, "generug.png");
        const uri = await metaplex.storage().upload(metaplexImage);

        console.log(`uri: ${uri}`);
        // https://arweave.net/HChQXaEjpZGC3eU-_qMdWzLjsXccrP0paGupJkXoENA

    } catch(error) {
        console.log(`Oops, something went wrong: ${error}`)
    }
})()