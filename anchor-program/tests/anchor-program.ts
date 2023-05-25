import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorProgram } from "../target/types/anchor_program";
import { Keypair, LAMPORTS_PER_SOL, PublicKey , SystemProgram } from "@solana/web3.js";

describe("wba-challenge-rs", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const keypair = Keypair.generate();

  const provider = anchor.AnchorProvider.env();

  const program = anchor.workspace.AnchorProgram as Program<AnchorProgram>;

  const vaultState = Keypair.generate();
  const vault_auth_seeds = [Buffer.from("auth"), vaultState.publicKey.toBuffer()];
  const vaultAuth = PublicKey.findProgramAddressSync(vault_auth_seeds, program.programId)[0];

  // console.log(vaultState.publicKey.toBase58());

  const vault_seeds = [Buffer.from("vault"), vaultAuth.toBuffer()];
  const vault = PublicKey.findProgramAddressSync(vault_seeds, program.programId)[0];
  
  it("airdrop tokens", async () => {
    // Add your test here.
    const txHash = await provider.connection.requestAirdrop(keypair.publicKey, 2 * LAMPORTS_PER_SOL);
    
    let latestBlockHash = await provider.connection.getLatestBlockhash()

    await provider.connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: txHash,
    });

        console.log(`Success! Checkout airdrop tx here:
          ${txHash}`);
  });

  it("Is initialized!", async () => {
    try {
      const txhash = await program.methods
      .initialize()
      .accounts({
          owner: keypair.publicKey,
          vaultState: vaultState.publicKey,
          vaultAuth,
          vault,
          systemProgram: SystemProgram.programId,
      })
      .signers([
          keypair,
          vaultState
      ]).rpc();
      
      
      console.log(`Success! Check out initialize TX here: 
        ${txhash}`);
  } catch(err) {
      console.log(err);
  }
  });


});



// anchor test --skip-local-validator




