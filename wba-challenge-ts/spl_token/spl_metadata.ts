import { Commitment, Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js"
import wallet from "../wba-wallet.json"
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Define our Mint address
const mint = new PublicKey("3GwaMhdg4sMfubUUFe3o4jQ6KE8RTWzUH69emJZtoho6");

// Add the Token Metadata Program
const token_metadata_program_id = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

// Create PDA for token metadata
const metadata_seeds = [
    Buffer.from('metadata'),
    token_metadata_program_id.toBuffer(),
    mint.toBuffer(),
];
const [metadata_pda, _bump] = PublicKey.findProgramAddressSync(metadata_seeds, token_metadata_program_id);

(async () => {
    try {
        // Start here
        const metadata = await createCreateMetadataAccountV3Instruction(
            {
                metadata: metadata_pda,
                mint,
                mintAuthority: keypair.publicKey,
                payer: keypair.publicKey,
                updateAuthority: keypair.publicKey,
            },
            {
                createMetadataAccountArgsV3: {
                    data: {
                        name: "WBA TOKEN",
                        symbol: "WBAT",
                        uri: "https://raw.githubusercontent.com/Web3-Builders-Alliance/samyakt-solana-q3-2023/main/wba-challenge-ts/spl_token/metadata.json",
                        sellerFeeBasisPoints: 0,
                        creators: null,
                        collection: null,
                        uses: null
                    },
                    isMutable: true,
                    collectionDetails: null
                }
            }
        );

        const tx = new Transaction().add(metadata);

        const txhash = await sendAndConfirmTransaction(
            connection,
            tx,
            [keypair]
        );

        console.log(`You've created a new metadata account:\n\n${txhash}\n\nSave this address, so you use it to mint SPL tokens!`);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();
