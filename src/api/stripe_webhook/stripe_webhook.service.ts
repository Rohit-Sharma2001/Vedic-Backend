import { Injectable, Redirect } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
let { ObjectId } = require('mongoose').Types;
// import { ConfigService } from '@nestjs/config';
import { orderManagement, OrderDocument, cartManagement, CartDocument, Product, ProductDocument, Coupon, CouponDocument, address, addressDocument, CenterManagement, CenterManagementDocument, Master, MasterDocument, MembershipManagement, MembershipManagementDocument, AppointmentManagement, AppointmentManagementDocument, CourseManagement, CourseManagementDocument, MembershipBuyHistroyDocument, MembershipBuyHistroy } from '../../schema/schema';
import Stripe from 'stripe';
import axios from 'axios';
import * as moment from 'moment';
import { sendLowStockEmail } from 'src/middlewares/nodemailer/nodemailer.controller';
// const stripe = new Stripe('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');

@Injectable()
export class StripeWebhookService {
    private stripe: Stripe;

    constructor(
        @InjectModel(orderManagement.name) private orderManagementModel: Model<OrderDocument>,
        @InjectModel(cartManagement.name) private cartManagementModel: Model<CartDocument>,
        @InjectModel(Product.name) private productManagementModel: Model<ProductDocument>,
        @InjectModel(Coupon.name) private couponManagementModel: Model<CouponDocument>,
        @InjectModel(address.name) private addressModel: Model<addressDocument>,
        @InjectModel(CenterManagement.name) private centerModel: Model<CenterManagementDocument>,
        @InjectModel(Master.name) private masterModel: Model<MasterDocument>,
        @InjectModel(MembershipManagement.name) private MembershipModel: Model<MembershipManagementDocument>,
        @InjectModel(AppointmentManagement.name) private AppointmentModel: Model<AppointmentManagementDocument>,
        @InjectModel(CourseManagement.name) private CoursesModel: Model<CourseManagementDocument>,
        @InjectModel(MembershipBuyHistroy.name) private MembershipBuyModel: Model<MembershipBuyHistroyDocument>,
    ) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            // apiVersion: '2023-10-16',
        });
    }

    // async webhook(request) {
    //     const sig = request.headers['stripe-signature'];
    //     // console.log(request,"sig") 
    //     let event;
    //     try {
    //         event = this.stripe.webhooks.constructEvent(request.rawBody, sig, process.env.STRIPE_WEBHOOK_KEY);
    //     }
    //     catch (err) {
    //         // response.status(400).send(`Webhook Error: ${err.message}`);
    //         return {
    //             message: `Webhook Error: ${err.message}`
    //         }
    //     }

    //     // Handle the event
    //     switch (event.type) {
    //         case 'charge.succeeded':
    //             const session = event.data.object as Stripe.Checkout.Session;

    //             const sessionId = session.id;
    //             const orderId = session.metadata?.orderId;
    //             const charge = event.data.object;
    //             // const sessionId = charge.id
    //             console.log(sessionId, "sessionIdsessionId")
    //             console.log(charge.payment_method_details, "charge.payment_method_details")
    //             console.log(charge.metadata, "charge.metadata")
    //             //  const charge = event.data.object as Stripe.Charge;

    //             const paymentIntentId = charge.payment_intent as string;

    //             const card = charge.payment_method_details?.card;

    //             if (!card) {
    //                 console.log('No card details found');
    //                 break;
    //             }
    //             console.log(charge, "charge")
    //             console.log(paymentIntentId, "paymentIntentId")
    //             console.log(card, "card")
    //             if (charge.metadata.type == 'shop') {
    //                 await this.orderManagementModel.findByIdAndUpdate(new Types.ObjectId(charge?.metadata?.id), { paymentDetails: charge.payment_method_details })
    //             } else if (charge.metadata.type == 'appointment') {
    //                 await this.AppointmentModel.findByIdAndUpdate(new Types.ObjectId(charge?.metadata?.id), { paymentDetails: charge.payment_method_details })
    //             } else if (charge.metadata.type == 'course') {
    //                 await this.CoursesModel.findByIdAndUpdate(new Types.ObjectId(charge?.metadata?.id), { paymentDetails: charge.payment_method_details })
    //             }
    //             break
    //         case 'payment_intent.succeeded':
    //             const paymentIntent = event.data.object;
    //             console.log('PaymentIntent was successful!');
    //             break;
    //         case 'payment_method.attached':
    //             const paymentMethod = event.data.object;

    //             // charge.payment_method_details.card.brand   // visa, mastercard
    //             // charge.payment_method_details.card.last4   // **** **** **** 4242
    //             // charge.payment_method_details.card.exp_month
    //             // charge.payment_method_details.card.exp_year
    //             console.log('PaymentMethod was attached to a Customer!');

    //             break;
    //         // ... handle other event types
    //         default:
    //             console.log(`Unhandled event type ${event.type}`);
    //     }

    //     // Return a response to acknowledge receipt of the event
    //     //   response.json({received: true});
    //     return {
    //         received: true
    //     }
    // };
    async webhook(request) {
        console.log("ab aaya h sala")
        const sig = request.headers['stripe-signature'];

        let event: Stripe.Event;

        try {

            event = this.stripe.webhooks.constructEvent(request.rawBody, sig, process.env.STRIPE_WEBHOOK_KEY,);

        } catch (err) {
            console.log(err, 'Webhook Signature Error');
            return {
                message: `Webhook Error: ${err.message}`,
            };
        }

        try {

            switch (event.type) {
                case 'charge.succeeded': {

                    const charge = event.data.object as Stripe.Charge;

                    const card = charge.payment_method_details?.card;

                    if (!card) {
                        console.log('No card details found');
                        break;
                    }

                    if (charge.metadata.type == 'shop') {
                        await this.orderManagementModel.findByIdAndUpdate(new Types.ObjectId(charge?.metadata?.id), { paymentDetails: charge.payment_method_details })
                    } else if (charge.metadata.type == 'appointment') {
                        await this.AppointmentModel.findByIdAndUpdate(new Types.ObjectId(charge?.metadata?.id), { paymentDetails: charge.payment_method_details })
                    } else if (charge.metadata.type == 'course') {
                        await this.CoursesModel.findByIdAndUpdate(new Types.ObjectId(charge?.metadata?.id), { paymentDetails: charge.payment_method_details })
                    } else if (charge.metadata.type == 'membership') {
                        await this.MembershipBuyModel.findByIdAndUpdate(new Types.ObjectId(charge?.metadata?.id), { paymentDetails: charge.payment_method_details })
                    }

                    break;
                }

                /* MEMBERSHIP FIRST PAYMENT */

                case 'checkout.session.completed': {

                    const invoice = event.data.object;
                    const session = event.data.object as Stripe.Checkout.Session;
                    // only subscriptions
                    if (session.mode !== 'subscription') {
                        break;
                    }

                    const orderId = session.metadata?.orderId;

                    const type = session.metadata?.type;

                    if (type !== 'membership') {
                        break;
                    }

                    const subscriptionId = session.subscription as string;

                    const customerId = session.customer as string;

                    console.log('Membership Subscription Activated', customerId);
                    console.log('Membership subscriptionId ', subscriptionId);

                    const orderData = await this.MembershipBuyModel.findById(orderId);

                    if (!orderData) {
                        console.log('Membership order not found');
                        break;
                    }

                    // already processed
                    // if (orderData.status === 'paid') {
                    //     break;
                    // }

                    /*
                    | ACTIVATE MEMBERSHIP
                    */

                    await this.MembershipBuyModel.findByIdAndUpdate(
                        orderId,
                        {
                            $set: {
                                // status: 'paid',
                                is_expired: false,
                                stripeSubscriptionId: subscriptionId,
                                // stripeCustomerId: customerId,
                                paymentType: 'new',
                            },
                        }
                    );

                    /*
                    | EXPIRE OLD MEMBERSHIPS
                    */

                    await this.MembershipBuyModel.updateMany(
                        {
                            user_id: orderData.user_id,
                            _id: { $ne: orderData._id },
                        },
                        {
                            $set: {
                                is_expired: true,
                            },
                        },
                    );

                    break;
                }

                /*
                | MEMBERSHIP RENEWAL SUCCESS
                */


                // case 'invoice.paid': {

                //     const invoice = event.data.object as Stripe.Invoice;

                //     const subscriptionId = invoice.subscription as string;
                //      const billingReason = invoice.billing_reason;
                //     console.log(billingReason,"billingReason")
                //     if (!subscriptionId) {
                //         break;
                //     }

                //     /*
                //     |--------------------------------------------------------------------------
                //     | FIND CURRENT ACTIVE MEMBERSHIP
                //     |--------------------------------------------------------------------------
                //     */

                //     const membership = await this.MembershipBuyModel.findOne({
                //         stripeSubscriptionId: subscriptionId,
                //         is_expired: false,
                //     });
                //     console.log(membership,"kkkk")
                //     if (!membership) {
                //         console.log('Membership not found for renewal');
                //         break;
                //     }

                //     console.log('Membership Renewed Successfully');

                //     /*
                //     |--------------------------------------------------------------------------
                //     | GENERATE MEMBERSHIP INVOICE NUMBER
                //     |--------------------------------------------------------------------------
                //     */

                //     const counter = await this.MembershipBuyModel.countDocuments();

                //     const invoiceNo = `-M-${counter + 1 + 17000}`;

                //     /*
                //     |--------------------------------------------------------------------------
                //     | EXPIRE OLD MEMBERSHIP
                //     |--------------------------------------------------------------------------
                //     */

                //     membership.is_expired = true;

                //     await membership.save();

                //     /*
                //     |--------------------------------------------------------------------------
                //     | CALCULATE NEW RENEWAL DATE
                //     |--------------------------------------------------------------------------
                //     */

                //     const expiryDate = moment().add(
                //         Number(membership.expire_in),
                //         'days'
                //     );

                //     /*
                //     |--------------------------------------------------------------------------
                //     | CREATE NEW MEMBERSHIP ENTRY
                //     |--------------------------------------------------------------------------
                //     */

                //     let newMembership = { _id: membership._id }
                //     if (invoice.billing_reason !== 'subscription_create') {
                //         newMembership = await this.MembershipBuyModel.create({
                //             user_id: membership.user_id,
                //             membership_id: membership.membership_id,
                //             invoiceNo,
                //             status: 'paid',
                //             is_expired: false,
                //             renewal_date: expiryDate.format('YYYY-MM-DD'),
                //             expire_in: membership.expire_in,
                //             membership_price: membership.membership_price,
                //             discount: membership.discount,
                //             totalPrice: membership.totalPrice,
                //             // stripeCustomerId: membership.stripeCustomerId,
                //             stripeSubscriptionId: membership.stripeSubscriptionId,
                //             // stripePriceId: membership.stripePriceId,
                //             paymentType: 'renewal'
                //             // invoice.billing_reason ==='subscription_create'
                //             //     ? 'new'
                //             //     : 'renewal'
                //             ,
                //             lastRenewalDate: new Date(),
                //         });
                //     }
                //     const paymentIntentId = invoice.payment_intent as string;
                //     console.log(billingReason, "const billingReason = invoice.billing_reason")
                //     if (paymentIntentId) {

                //         const paymentIntent = await this.stripe.paymentIntents.retrieve(
                //             paymentIntentId
                //         );

                //         const latestCharge = await this.stripe.charges.retrieve(
                //             paymentIntent.latest_charge as string
                //         );

                //         const paymentDetails = latestCharge.payment_method_details;

                //         // await this.MembershipBuyModel.findByIdAndUpdate(
                //         //     (billingReason === 'subscription_cycle' || billingReason === 'subscription_update') ? membership._id : newMembership._id,
                //         //     {
                //         //         $set: {
                //         //             paymentDetails,
                //         //         },
                //         //     }
                //         // );
                //         await this.MembershipBuyModel.findByIdAndUpdate(
                //             (billingReason === 'subscription_cycle' || billingReason === 'subscription_update')
                //                 ? newMembership._id : membership._id,
                //             {
                //                 $set: {
                //                     paymentDetails,
                //                 },
                //             }
                //         );
                //     }
                //     break;
                // }

                case 'invoice.paid': {

                    const invoice = event.data.object as Stripe.Invoice;

                    const subscriptionId = invoice.subscription as string;

                    const billingReason = invoice.billing_reason;

                    console.log('billingReason =>', billingReason);

                    if (!subscriptionId) {
                        break;
                    }

                    /* FIND ACTIVE MEMBERSHIP                    */

                    const membership = await this.MembershipBuyModel.findOne({
                        stripeSubscriptionId: subscriptionId,
                        is_expired: false,
                    });

                    if (!membership) {
                        console.log('Membership not found');
                        break;
                    }

                    /* PAYMENT DETAILS*/

                    let paymentDetails = null;

                    try {

                        const paymentIntentId = invoice.payment_intent as string;

                        if (paymentIntentId) {
                            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
                            if (paymentIntent.latest_charge) {
                                const latestCharge = await this.stripe.charges.retrieve(
                                    paymentIntent.latest_charge as string
                                );
                                paymentDetails = latestCharge.payment_method_details;
                            }
                        }

                    } catch (err) {
                        console.log('Payment detail error', err.message);
                    }

                    /* FIRST SUBSCRIPTION PAYMENT*/

                    if (billingReason === 'subscription_create') {

                        await this.MembershipBuyModel.findByIdAndUpdate(
                            membership._id,
                            {
                                $set: {
                                    // status: 'paid',
                                    paymentType: 'new',
                                    paymentDetails,
                                },
                            }
                        );

                        console.log('First subscription payment completed');

                        break;
                    }

                    /* SUBSCRIPTION UPGRADE*/

                    if (billingReason === 'subscription_update') {

                        await this.MembershipBuyModel.findByIdAndUpdate(
                            membership._id,
                            {
                                $set: {
                                    paymentType: 'upgrade',
                                    paymentDetails,
                                },
                            }
                        );

                        console.log('Subscription upgraded');

                        break;
                    }

                    /* SUBSCRIPTION RENEWAL*/

                    if (billingReason === 'subscription_cycle') {

                        /*
                        | EXPIRE OLD
                        */

                        membership.is_expired = true;

                        await membership.save();

                        /*
                        | CREATE NEW
                        */

                        const counter = await this.MembershipBuyModel.countDocuments();

                        const invoiceNo = `-M-${counter + 1 + 17000}`;

                        const expiryDate = moment().add(Number(membership.expire_in), 'days');

                        await this.MembershipBuyModel.create({
                            user_id: membership.user_id,
                            membership_id: membership.membership_id,
                            invoiceNo,
                            status: 'paid',
                            is_expired: false,
                            renewal_date: expiryDate.format('YYYY-MM-DD'),
                            expire_in: membership.expire_in,
                            membership_price: membership.membership_price,
                            discount: membership.discount,
                            totalPrice: membership.totalPrice,
                            stripeSubscriptionId: membership.stripeSubscriptionId,
                            paymentType: 'renewal',
                            paymentDetails,
                            lastRenewalDate: new Date(),
                        });
                        console.log('Subscription renewed');
                        break;
                    }

                    break;
                }

                /* MEMBERSHIP PAYMENT FAILED
                */

                case 'invoice.payment_failed': {

                    const invoice = event.data.object as Stripe.Invoice;
                    console.log('Membership Renewal Failed', invoice.subscription);

                    // optional:
                    // send email
                    // notify admin
                    // mark pending state

                    break;
                }

                /*SUBSCRIPTION UPDATED*/

                case 'customer.subscription.updated': {

                    const subscription = event.data.object as Stripe.Subscription;

                    console.log('Subscription Updated',subscription);

                    /* HANDLE UPGRADE/DOWNGRADE                    */

                    const membership = await this.MembershipBuyModel.findOne({
                        stripeSubscriptionId: subscription.id,
                    });
                    console.log(membership,"membership")
                    if (!membership) {
                        break;
                    }
                    await this.MembershipBuyModel.findByIdAndUpdate(
                        membership._id,
                        {
                            $set: {

                                /*
                                | active / canceled / past_due
                                */

                                stripeSubscriptionStatus: subscription.status,

                                /*
                                | USER CLICKED CANCEL
                                */

                                cancelAtPeriodEnd: subscription.cancel_at_period_end,

                                /*
                                | STRIPE CANCEL DATE
                                */

                                cancelAt: subscription.cancel_at
                                    ? new Date(subscription.cancel_at * 1000)
                                    : null,
                            }
                        }
                    );

                    // optional:
                    // update stripePriceId
                    // update membership plan

                    break;
                }

                /* SUBSCRIPTION CANCELLED*/

                case 'customer.subscription.deleted': {

                    const subscription = event.data.object as Stripe.Subscription;

                    console.log('Membership Subscription Cancelled');

                    await this.MembershipBuyModel.findOneAndUpdate(
                        {
                            stripeSubscriptionId: subscription.id,
                        },
                        {
                            $set: {
                                is_expired: true,
                                cancelAtPeriodEnd: false,
                                stripeSubscriptionStatus: subscription.status,
                                cancelledAt: new Date(),
                            }
                        }
                    );

                    break;
                }

                /* OPTIONAL*/

                case 'payment_method.attached': {

                    console.log('Payment Method Attached');

                    break;
                }

                default:

                    console.log(`Unhandled event type ${event.type}`);
            }

            return {
                received: true
            };

        } catch (error) {

            console.log(error, 'Webhook Main Error');

            return {
                message: 'Webhook processing failed',

                error: error.message,
            };
        }
    }
}