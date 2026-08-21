import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

@Injectable()
export class StripeService {
    private readonly _stripe: Stripe;

    constructor(private readonly _configService: ConfigService) {
        this._stripe = new Stripe(this._configService.get('STRIPE_SECRET_KEY'));
    }

    async createCheckoutSession (
        assetTitle: string,
        priceInEur: number,
        assetId: string,
        buyerId: string,
        authorStripeAccountId: string,
    ): Promise<Stripe.Checkout.Session> {

        const frontendUrl = this._configService.get('FRONTEND_URL');
        const amountInCents = Math.round(priceInEur * 100);
        const applicationFee = Math.round(amountInCents * 0.01);

        return this._stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {name: assetTitle},
                        unit_amount: amountInCents,
                    },
                    quantity: 1,
                },
            ],
            payment_intent_data: {
                application_fee_amount: applicationFee,
                transfer_data: {
                    destination: authorStripeAccountId,
                },
            },
            metadata: {assetId, buyerId},
            success_url: `${frontendUrl}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/purchase-cancelled`,
        });
    }

    async createConnectedAccount(userId: string, email: string): Promise<string> {
        const account = await this._stripe.accounts.create({
            type: 'express',
            email: email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            metadata: {userId},
        });

        return account.id;
    }

    async createOnboardingLink(stripeAccountId: string): Promise<string> {
        const frontendUrl = this._configService.get('FRONTEND_URL');

        const accountLink = await this._stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${frontendUrl}/users/stripe/onboarding-refresh`,
            return_url: `${frontendUrl}/users/stripe/onboarding-complete`,
            type: 'account_onboarding',
        });

        return accountLink.url;
    }

    async retrieveAccount(accountId: string): Promise<Stripe.Account> {
        return this._stripe.accounts.retrieve(accountId);
    }

    constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
        const secret = this._configService.get('STRIPE_WEBHOOK_SECRET');
        return this._stripe.webhooks.constructEvent(payload, signature, secret);
    }

}