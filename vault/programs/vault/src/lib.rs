use anchor_lang::prelude::*;
use anchor_spl::{
    token::{TokenAccount, Mint, Token, Transfer as SplTransfer, transfer as spl_transfer}, 
    associated_token::AssociatedToken
};

declare_id!("CTpCj2U7zZ1gHB7nJQ2vPpEFTeWP3yPjWcZm2PHogw5d");

#[program]
pub mod vault {
    use anchor_lang::system_program::{Transfer, transfer};

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.state.auth_bump = *ctx.bumps.get("auth").unwrap();
        ctx.accounts.state.vault_bump = *ctx.bumps.get("vault").unwrap();
        ctx.accounts.state.state_bump = *ctx.bumps.get("state").unwrap();

        Ok(())
    }

    pub fn deposit(ctx: Context<Payment>, amount: u64) -> Result<()> {
        let accounts = Transfer {
            from: ctx.accounts.owner.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(), 
            accounts
        );

        transfer(cpi_ctx, amount)
    }

    pub fn withdraw(ctx: Context<Payment>, amount: u64) -> Result<()> {
        let accounts = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.owner.to_account_info()
        };

        let seeds = &[
            b"vault",
            ctx.accounts.state.to_account_info().key.as_ref(),
            &[ctx.accounts.state.vault_bump]
        ];

        let pda_seeds = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            accounts,
            pda_seeds
        );

        transfer(cpi_ctx, amount)
    }

    pub fn spl_deposit(ctx: Context<SPLDeposit>, amount: u64) -> Result<()> {
        let accounts = SplTransfer {
            from: ctx.accounts.owner_ata.to_account_info(),
            to: ctx.accounts.vault_ata.to_account_info(),
            authority: ctx.accounts.owner.to_account_info()
        };

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(), 
            accounts
        );

        spl_transfer(cpi_ctx, amount)
    }


    pub fn spl_withdraw(ctx: Context<SPLWithdraw>, amount: u64) -> Result<()> {
        let accounts = SplTransfer {
            from: ctx.accounts.vault_ata.to_account_info(),
            to: ctx.accounts.owner_ata.to_account_info(),
            authority: ctx.accounts.auth.to_account_info(),
        };

        let seeds = &[
            b"auth",
            ctx.accounts.state.to_account_info().key.as_ref(),
            &[ctx.accounts.state.auth_bump]
        ];

        let pda_seeds = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(), 
            accounts, 
            pda_seeds
        );

        spl_transfer(cpi_ctx, amount)
        
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    owner: Signer<'info>,

    #[account(
        seeds = [b"auth", state.key().as_ref()],
        bump
    )]
    // CHECK: This is safe
    auth: UncheckedAccount<'info>,

    #[account(
        seeds=[b"vault", state.key().as_ref()],
        bump
    )]
    vault: SystemAccount<'info>,

    #[account(
        init,
        payer = owner,
        space = VaultState::LEN,
        seeds = [b"state", owner.key().as_ref()],
        bump
    )]
    state: Account<'info, VaultState>,

    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Payment<'info> {
    #[account(mut)]
    owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", state.key().as_ref()],
        bump = state.vault_bump
    )]
    vault: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [b"state", owner.key().as_ref()],
        bump = state.state_bump
    )]
    state: Account<'info, VaultState>,

    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SPLDeposit<'info> {
    #[account(mut)]
    owner: Signer<'info>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = owner,
    )]
    owner_ata: Account<'info, TokenAccount>,

    mint: Account<'info, Mint>,

    #[account(
        seeds = [b"auth", owner.key().as_ref()],
        bump = state.auth_bump
    )]
    /// CHECK: This is safer
    auth: UncheckedAccount<'info>,

    #[account(
        init,
        payer = owner,
        seeds = [b"spl_vault", state.key().as_ref()],
        bump,
        token::mint = mint,
        token::authority = auth,
    )]
    vault_ata: Account<'info, TokenAccount>,

    #[account(
        seeds = [b"state", owner.key().as_ref()],
        bump = state.state_bump,
    )]
    state: Account<'info, VaultState>,

    token_program: Program<'info, Token>,
    associated_token_program: Program<'info, AssociatedToken>,
    system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct SPLWithdraw<'info> {
    #[account(mut)]
    owner: Signer<'info>,

    #[account(
        seeds = [b"auth", state.key().as_ref()],
        bump = state.auth_bump
    )]
    /// CHECK: this is safe.
    auth: UncheckedAccount<'info>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = owner
    )]
    owner_ata: Account<'info, TokenAccount>,

    mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [b"spl_vault", state.key().as_ref()],
        bump,
        token::mint = mint,
        token::authority = auth
    )]
    vault_ata: Account<'info, TokenAccount>,

    #[account(
        seeds = [b"state", owner.key().as_ref()],
        bump = state.state_bump
    )]
    state: Account<'info, VaultState>,

    token_program: Program<'info, Token>,
    associated_token_program: Program<'info, AssociatedToken>,
    system_program: Program<'info, System>
}

#[account]
pub struct VaultState {
    auth_bump: u8,
    vault_bump: u8,
    state_bump: u8,
}

impl VaultState {
    const LEN: usize = 8 + 3 * 1;
}