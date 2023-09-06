use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
pub struct Escrow {
    pub maker: Pubkey,
    pub maker_token: Pubkey,
    pub taker_token: Pubkey,
    pub offer_amount: u64,
    pub seed: u64,
    pub auth_bump: u8,
    pub vault_bump: u8,
    pub escrow_bump: u8,
}

impl Escrow {
    pub const LEN: usize = PUBKEY * 3 + U64 * 2 + U8 * 3;
}
