use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Transfer};

declare_id!("5i2GW24syHC4PqN29VEbiorHHrLPpVNx2rkfE3xEGmFM");

#[program]
pub mod anchor_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.vault_state.owner = *ctx.accounts.owner.key;
        ctx.accounts.vault_state.auth_bump = *ctx.bumps.get("vault_auth").unwrap();
        ctx.accounts.vault_state.vault_bump = *ctx.bumps.get("vault").unwrap();
        ctx.accounts.vault_state.score = 0;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let from_pubkey = &ctx.accounts.owner.key();
        let to_pubkey = &ctx.accounts.vault.key();
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            from_pubkey, 
            to_pubkey, 
            amount,
        );

        anchor_lang::solana_program::program::invoke(
            &ix, 
            &[
                ctx.accounts.owner.to_account_info(),
                ctx.accounts.vault_state.to_account_info(),
                ctx.accounts.vault_auth.to_account_info(),
                ctx.accounts.vault.to_account_info(),
            ],
        )?;

        ctx.accounts.vault_state.score = 1;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let owner = &mut ctx.accounts.owner;
        let vault = &mut ctx.accounts.vault;

        // check that there is enought SOL in vault
        let vault_balance = vault.to_account_info().lamports();
        if vault_balance < amount {
            return err!(Error::InsufficentFunds);
        }

        let from_pubkey = &vault.key();
        let to_pubkey = &owner.key();
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            from_pubkey, 
            to_pubkey, 
            amount
        );

        anchor_lang::solana_program::program::invoke_signed(
            &ix, 
            &[
                ctx.accounts.owner.to_account_info(),
                ctx.accounts.vault_state.to_account_info(),
                ctx.accounts.vault_auth.to_account_info(),
                ctx.accounts.vault.to_account_info(),
            ],
            &[&[
                b"vault",
                ctx.accounts.vault_auth.key().as_ref(),
                &[ctx.accounts.vault_state.vault_bump],
            ]]
        )?;

        ctx.accounts.vault_state.score = 2;
        Ok(())
    }

    pub fn deposit_spl(ctx: Context<DepositSPL>, amount: u64) -> Result<()> {
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_context = CpiContext::new(
            cpi_program, 
            Transfer {
                from: ctx.accounts.owner_ata.to_account_info(),
                to: ctx.accounts.vault_ata.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        );

        anchor_spl::token::transfer(cpi_context, amount)?;

        ctx.accounts.vault_state.score = 3;
        Ok(())
    }

    pub fn withdraw_spl(ctx: Context<WithdrawSPL>, amount: u64) -> Result<()> {
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let seeds = &[
            b"auth",
            ctx.accounts.vault_state.to_account_info().key.as_ref(),
            &[ctx.accounts.vault_state.auth_bump],
        ];

        let signer = &[&seeds[..]];

        let cpi_context = CpiContext::new_with_signer(
            cpi_program, Transfer {
                from: ctx.accounts.vault_ata.to_account_info(),
                to: ctx.accounts.owner_ata.to_account_info(),
                authority: ctx.accounts.vault_auth.to_account_info(),
            }, 
            signer,
        );

        anchor_spl::token::transfer(cpi_context, amount)?;

        ctx.accounts.vault_state.score = 4;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(init, payer = owner, space = VaultState::LEN)]
    pub vault_state: Account<'info, VaultState>,

    ///CHECK: Trust me! It's safe
    #[account(seeds = [b"auth", vault_state.key().as_ref()], bump)]
    pub vault_auth: UncheckedAccount<'info>,

    #[account(mut, seeds = [b"vault", vault_auth.key().as_ref()], bump)]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut, has_one=owner)]
    pub vault_state: Account<'info, VaultState>,

    ///CHECK: Trust me! It's safe
    #[account(seeds = [b"auth", vault_state.key().as_ref()], bump)]
    pub vault_auth: UncheckedAccount<'info>,

    #[account(mut, seeds = [b"vault", vault_auth.key().as_ref()], bump)]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut,has_one=owner)]
    pub vault_state: Account<'info, VaultState>,

    ///CHECK: Trust me! It's safe
    #[account(seeds = [b"auth", vault_state.key().as_ref()], bump)]
    pub vault_auth: UncheckedAccount<'info>,

    #[account(mut, seeds = [b"vault", vault_auth.key().as_ref()], bump)]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositSPL<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut, has_one=owner)]
    pub vault_state: Account<'info, VaultState>,

    ///CHECK: Trust me! It's safe
    #[account(seeds=[b"auth", vault_state.key().as_ref()], bump)]
    pub vault_auth: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,

    #[account(mut)]
    pub owner_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,

    ///CHECK: It's token mint
    pub token_mint: UncheckedAccount<'info>,

    ///CHECK: This is address of the SPL Associated Token Account program
    pub associated_token_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct WithdrawSPL<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut, has_one=owner)]
    pub vault_state: Account<'info, VaultState>,

    ///CHECK: It's safe
    #[account(seeds=[b"auth", vault_state.key().as_ref()], bump)]
    pub vault_auth: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,

    #[account(mut)]
    pub owner_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,

    ///CHECK: It's token mint
    pub token_mint: UncheckedAccount<'info>,

    ///CHECK: This is address of the SPL Associated Token Account program
    pub associated_token_program: UncheckedAccount<'info>,
}

#[account]
pub struct VaultState {
    owner: Pubkey,
    auth_bump: u8,
    vault_bump: u8,
    score: u8
}

impl VaultState {
    const LEN: usize = 8 + 32 + 1 + 1 + 1;
}

#[error_code]
pub enum Error {
    #[msg("Insufficent funds")]
    InsufficentFunds,
}
