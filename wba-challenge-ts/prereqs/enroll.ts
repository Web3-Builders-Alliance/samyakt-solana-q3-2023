import { Connection, Keypair, SystemProgram, PublicKey } from "@solana/web3.js";
import { Program, Wallet, AnchorProvider, Address } from "@project-serum/anchor";
import { WbaPrereq, IDL } from "../programs/wba_prereq";
import wallet from "../wba-wallet.json";

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

const connection = new Connection("https://api.devnet.solana.com");

const githubAcc = Buffer.from("testaccount", "utf8");

const anchorProvider = new AnchorProvider(connection, new Wallet(keypair), { commitment: "confirmed"});

const program = new Program<WbaPrereq>(IDL, "HC2oqz2p6DEWfrahenqdq2moUcga9c9biqRBcdK3XKU1" as Address, anchorProvider);

const enrollmentSeeds = [Buffer.from("prereq"), keypair.publicKey.toBuffer()];

const [enrollmentPubkey, _bump] = PublicKey.findProgramAddressSync(enrollmentSeeds, program.programId);

(async () => {
    try {
        const txhash = await program.methods
        .complete(githubAcc)
        .accounts({
            signer: keypair.publicKey,
            prereq: enrollmentPubkey,
            systemProgram: SystemProgram.programId,
        })
        .signers([
            keypair
        ]).rpc();
        console.log(`Success! Check out your TX here: 
        https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
    } catch(err) {
        console.error(`Oops, something went wrong: ${err}`);
    }
})();

