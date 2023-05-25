import { Keypair } from "@solana/web3.js";

//Generate a new keypair
let kp = Keypair.generate();
console.log(`You've generated a new Solana wallet: ${kp.publicKey.toBase58()}
    
To save your wallet, copy and paste the following into a JSON file:
    
[${kp.secretKey}]`);

// [11,239,96,206,92,6,235,203,101,170,237,122,6,241,66,118,223,46,51,187,131,151,17,198,72,183,231,18,127,122,187,255,22,152,150,46,104,130,156,244,229,135,22,116,110,78,138,11,81,82,136,213,37,40,226,88,48,5,115,0,101,116,223,138]
// 2XCvEKkghGQF3bHczDwXPkQgd8xRbkCNU594sqKP38WD

