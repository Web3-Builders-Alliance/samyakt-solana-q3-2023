import { Connection, Keypair, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Program, Wallet, AnchorProvider, Address, BN } from "@project-serum/anchor";
import { WbaVault, IDL } from "../programs/wba_vault";
import wallet from "../wba-wallet.json";
import { TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

const connection = new Connection("https://api.devnet.solana.com");


const provider = new AnchorProvider(connection, new Wallet(keypair), { commitment: "confirmed"});
const program = new Program<WbaVault>(IDL, "D51uEDHLbWAxNfodfQDv7qkp8WZtxrhi3uganGbNos7o" as Address, provider);


const vaultState = new PublicKey("HTiK2Xc9MnYMbmim8Sg59Bjo7DfhFb4j8pgMbAPsLqPB");

const vault_auth_seeds = [Buffer.from("auth"), vaultState.toBuffer()];
const vaultAuth = PublicKey.findProgramAddressSync(vault_auth_seeds, program.programId)[0];

const vault_seeds = [Buffer.from("vault"), vaultAuth.toBuffer()];
// const vault = PublicKey.findProgramAddressSync(vault_seeds, program.programId)[0];

(async () => {
    

    try {

        const mint = new PublicKey("3GwaMhdg4sMfubUUFe3o4jQ6KE8RTWzUH69emJZtoho6");
        let OwnerAta = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey
        );

        let vaultAta = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            vaultAuth,
            true
        );

        const txhash = await program.methods
        .depositSpl(new BN(0.1* LAMPORTS_PER_SOL))
        .accounts({
            owner: keypair.publicKey,
            vaultState: vaultState,
            vaultAuth,
            systemProgram: SystemProgram.programId,
            ownerAta: OwnerAta.address,
            vaultAta: vaultAta.address,
            tokenMint: mint,
            tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([
            keypair,
        ]).rpc();
        
        
        console.log(`Success! Check out your TX here: 
        https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
    } catch(err) {
        console.error(`Oops, something went wrong: ${err}`);
    }
})();