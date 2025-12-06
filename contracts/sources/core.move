module dolpads::core {
    use sui::balance;
    use sui::bcs;
    use sui::coin::{Self, Coin};
    use sui::ed25519;
    use sui::event;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::sui::SUI;
    use sui::table;
    use sui::tx_context::{Self, TxContext};
    use std::vector;

    const E_NOT_ACTIVE: u64 = 1;
    const E_REPLAYED_NONCE: u64 = 2;
    const E_INVALID_SIGNATURE: u64 = 3;
    const E_INSUFFICIENT_BALANCE: u64 = 4;
    const E_NOT_ADVERTISER: u64 = 5;

    struct AdminConfig has key {
        id: UID,
        admin_public_key: vector<u8>,
    }

    struct Campaign has key, store {
        id: UID,
        advertiser: address,
        balance: balance::Balance<SUI>,
        is_active: bool,
        processed_nonces: table::Table<u64, bool>,
    }

    struct ClaimMessage has copy, drop {
        publisher: address,
        amount: u64,
        nonce: u64,
        campaign_id: vector<u8>,
    }

    struct CampaignFunded has copy, drop {
        campaign_id: vector<u8>,
        amount: u64,
    }

    struct PayoutClaimed has copy, drop {
        campaign_id: vector<u8>,
        publisher: address,
        amount: u64,
        nonce: u64,
    }

    /// Creates the shared AdminConfig object that holds the backend's public key.
    /// This should be invoked once at package publish time by the admin.
    public entry fun init_admin(admin_public_key: vector<u8>, ctx: &mut TxContext) {
        let cfg = AdminConfig {
            id: object::new(ctx),
            admin_public_key,
        };
        transfer::share_object(cfg);
    }

    /// Creates a new shared campaign and seeds it with an initial budget.
    public entry fun create_campaign(budget: Coin<SUI>, ctx: &mut TxContext) {
        let processed_nonces = table::new<u64, bool>(ctx);
        let balance = coin::into_balance(budget);
        let advertiser = tx_context::sender(ctx);

        let campaign = Campaign {
            id: object::new(ctx),
            advertiser,
            balance,
            is_active: true,
            processed_nonces,
        };

        emit_funded(&campaign, balance::value(&campaign.balance));
        transfer::share_object(campaign);
    }

    /// Allows the advertiser to top up a campaign.
    public entry fun deposit_budget(campaign: &mut Campaign, coins: Coin<SUI>, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        assert!(sender == campaign.advertiser, E_NOT_ADVERTISER);

        let added = coin::value(&coins);
        balance::join(&mut campaign.balance, coin::into_balance(coins));
        campaign.is_active = true;

        emit_funded(campaign, added);
    }

    /// Publisher withdrawal flow guarded by backend signature and nonce replay protection.
    public entry fun withdraw_earning(
        campaign: &mut Campaign,
        admin: &AdminConfig,
        amount: u64,
        nonce: u64,
        signature: vector<u8>,
        ctx: &mut TxContext,
    ) {
        assert!(campaign.is_active, E_NOT_ACTIVE);
        assert!(!table::contains(&campaign.processed_nonces, nonce), E_REPLAYED_NONCE);
        assert!(balance::value(&campaign.balance) >= amount, E_INSUFFICIENT_BALANCE);
        let publisher = tx_context::sender(ctx);

        verify_signature(
            &admin.admin_public_key,
            publisher,
            amount,
            nonce,
            &signature,
            campaign,
        );

        table::add(&mut campaign.processed_nonces, nonce, true);

        let payout_balance = balance::split(&mut campaign.balance, amount);
        balance::send_funds(payout_balance, publisher);

        emit_claimed(campaign, publisher, amount, nonce);

        if (balance::value(&campaign.balance) == 0) {
            campaign.is_active = false;
        }
    }

    /// Verify backend signature over (publisher, amount, nonce, campaign_id_bytes).
    fun verify_signature(
        admin_pk: &vector<u8>,
        publisher: address,
        amount: u64,
        nonce: u64,
        signature: &vector<u8>,
        campaign: &Campaign,
    ) {
        assert!(vector::length(signature) > 0, E_INVALID_SIGNATURE);
        let msg = build_claim_message(publisher, amount, nonce, campaign);
        let ok = ed25519::ed25519_verify(signature, admin_pk, &msg);
        assert!(ok, E_INVALID_SIGNATURE);
    }

    fun build_claim_message(
        publisher: address,
        amount: u64,
        nonce: u64,
        campaign: &Campaign,
    ): vector<u8> {
        let campaign_id_bytes = object::uid_to_bytes(&campaign.id);
        bcs::to_bytes(&ClaimMessage {
            publisher,
            amount,
            nonce,
            campaign_id: campaign_id_bytes,
        })
    }

    fun emit_funded(campaign: &Campaign, amount: u64) {
        let id_bytes = object::uid_to_bytes(&campaign.id);
        event::emit(CampaignFunded { campaign_id: id_bytes, amount });
    }

    fun emit_claimed(campaign: &Campaign, publisher: address, amount: u64, nonce: u64) {
        let id_bytes = object::uid_to_bytes(&campaign.id);
        event::emit(PayoutClaimed {
            campaign_id: id_bytes,
            publisher,
            amount,
            nonce,
        });
    }
}

