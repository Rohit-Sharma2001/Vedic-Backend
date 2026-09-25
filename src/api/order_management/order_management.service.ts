import { Injectable, Redirect } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
let { ObjectId } = require('mongoose').Types;
// import { ConfigService } from '@nestjs/config';
import {
    orderManagement, OrderDocument, cartManagement, CartDocument, Product, ProductDocument, Coupon, CouponDocument, address, AppointmentManagement, AppointmentManagementDocument, Employee, EmployeeDocument,
    addressDocument, CenterManagement, CenterManagementDocument, Master, MasterDocument, MembershipManagement, MembershipManagementDocument, MembershipBuyHistroy, MembershipBuyHistroyDocument, User, UserDocument
} from '../../schema/schema';
import Stripe from 'stripe';
import axios from 'axios';
import {
    sendLowStockEmail, sendOrderConfirmationEmail, sendOrderPaymentSuccessEmail, sendNewOrderAdminEmail, sendOrderPlacedEmail,
    sendOrderPackedEmail, sendOrderReadyEmail, sendOrderDeliveredEmail, sendPickupDateUpdateEmail, sendOrderCancelEmail,
    sendAppointmentConfirmationEmail,
    sendOrderPackedAdminEmail,
    sendOrderReadyAdminEmail,
    sendOrderPickupAdminEmail,
    sendOrderDispatchedAdminEmail,
    sendOrderCancelledAdminEmail,
    sendOrderPickupDateUpdatedAdminEmail
} from 'src/middlewares/nodemailer/nodemailer.controller';
import * as moment from 'moment';
import * as momentTime from "moment-timezone";
// const stripe = new Stripe('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');

// import {
//     sendPickupDateUpdateEmail, sendOrderCancelEmail
// } from '../../middlewares/nodemailer/nodemailer.controller';


@Injectable()
export class OrderManagementService {
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
        @InjectModel(MembershipBuyHistroy.name) private membershipBuyModel: Model<MembershipBuyHistroyDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(AppointmentManagement.name) private appointmentModel: Model<AppointmentManagementDocument>,
        @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    ) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            // apiVersion: '2023-10-16',
        });
    }

    async addOrder(orderManagementData): Promise<orderManagement> {
        const orderCount = await this.orderManagementModel.countDocuments();
        const userId = new Types.ObjectId(orderManagementData.userId);

        if (orderManagementData.cartId.length > 0) {
            for (const cartId of orderManagementData.cartId) {
                await this.cartManagementModel.deleteOne({ _id: cartId });
            }
        }

        const saveData = {
            userId: userId,
            productId: orderManagementData.products,
            totalAmount: orderManagementData.totalAmount,
            invoiceNo: `-S-${orderCount + 1 + 17000}`
        };

        const orderManagement = new this.orderManagementModel(saveData);
        return orderManagement.save();
    }

    // async findOneById(page: number, pageSize: number, id: string, order_id: string, order_type: string): Promise<any> {
    //     try {
    //         let objectId
    //         const skip = (page - 1) * pageSize;
    //         const limit = pageSize;
    //         const filter: any = { status: { $ne: 'ordered' } }//{ status: 'paid' };
    //         console.log(page, pageSize, skip, "skip")
    //         if (id) {
    //             objectId = new Types.ObjectId(id);
    //             filter['userId'] = objectId
    //         }

    //         if (order_id) {
    //             objectId = new Types.ObjectId(order_id);
    //             filter['_id'] = objectId
    //         }
    //         // if (order_type && order_type == 'not_shipped') {
    //         //     // e.pickupDate === null || e.pickupOrder !== 'pickupDone'
    //         //     filter['$and'] = [
    //         //         {
    //         //             $or: [
    //         //                 { pickupDate: null },
    //         //                 { pickupOrder: { $ne: "pickupDone" } }
    //         //             ]
    //         //         },
    //         //         { "deliveryDates.shippedDate": null }
    //         //     ]
    //         // }
    //         const returnDays = await this.masterModel.findOne({ dropdown_type: 'return_reasons' })
    //         // const cartData = await this.orderManagementModel.find(filter).exec()
    //         console.log(filter)
    //         const cartData = await this.orderManagementModel.aggregate([{ $match: filter }, {
    //             $lookup: {
    //                 from: "addresses",
    //                 localField: "addressId",
    //                 foreignField: "_id",
    //                 as: "address"
    //             }
    //         },
    //         { $unwind: { path: "$address", preserveNullAndEmptyArrays: true } },
    //         {
    //             $lookup: {
    //                 from: "cartManagement",
    //                 let: { cartIds: "$cartIds" }, // cartId is assumed to be an array
    //                 pipeline: [
    //                     {
    //                         $match: {
    //                             $expr: {
    //                                 $in: ["$_id", "$$cartIds"]
    //                             }
    //                         }
    //                     }
    //                 ],
    //                 as: "cartItems"
    //             }
    //         },
    //         {
    //             $lookup: {
    //                 from: "products",
    //                 let: { productIds: "$orderItems._id" }, // extract all product ids
    //                 pipeline: [
    //                     {
    //                         $match: {
    //                             $expr: { $in: ["$_id", "$$productIds"] }
    //                         }
    //                     }
    //                 ],
    //                 as: "orderProducts"
    //             }
    //         },
    //         {
    //             $lookup: {
    //                 from: "returnorders",
    //                 let: { orderId: "$_id" },
    //                 pipeline: [
    //                     { $match: { $expr: { $eq: ["$orderId", "$$orderId"] } } },
    //                     { $project: { _id: 0, productId: 1 } }
    //                 ],
    //                 as: "returnorders"
    //             }
    //         },
    //         // {
    //         //     $project: {
    //         //         productIds: {
    //         //             $map: {
    //         //                 input: "$returnorders",
    //         //                 as: "ro",
    //         //                 in: "$$ro.productId"
    //         //             }
    //         //         }
    //         //     }
    //         // },
    //         {
    //             $sort: {
    //                 created_at: -1
    //             }
    //         },
    //         {
    //             $skip: skip
    //         },
    //         {
    //             $limit: limit
    //         }]).exec()
    //         const totalCount = await this.orderManagementModel.countDocuments(filter).exec();

    //         if (!cartData) {
    //             throw new Error(`cartData not found with id: ${id}`);
    //         } else {
    //             //for order status now this functionlity run on cron every hour
    //             // for (const order of cartData) {
    //             //     if (order.status === 'paid' && order.shippingId) {
    //             //         const shipmentRes = await axios.get(
    //             //             `https://api.goshippo.com/v1/tracks/shippo/SHIPPO_TRANSIT`, // TODO: replace with actual carrier/tracking_number
    //             //             {
    //             //                 headers: {
    //             //                     Authorization: process.env.SHIPPOKEY,
    //             //                     'Content-Type': 'application/json',
    //             //                 },
    //             //             }
    //             //         );

    //             //         const dates = { pickupDate: null, shippedDate: null, outForDeliveryDate: null, deliveredDate: null };
    //             //         const shipmentStatus = shipmentRes.data.tracking_status?.status;

    //             //         // ✅ always assign returnOrder, default false
    //             //         order.cancelOrder = (shipmentStatus === 'PRE_TRANSIT' || shipmentStatus === 'UNKNOWN');
    //             //         let currentStatus = shipmentStatus
    //             //         for (const event of shipmentRes.data.tracking_history) {
    //             //             const detail = event.status_details.toLowerCase();
    //             //             const status = event.status.toLowerCase();
    //             //             currentStatus = status
    //             //             if (!dates.pickupDate && detail.includes("electronic shipment information")) {
    //             //                 dates.pickupDate = new Date(event.status_date).toISOString();
    //             //             }
    //             //             if (!dates.shippedDate && (status === "transit" || detail.includes("departed from the origin"))) {
    //             //                 dates.shippedDate = new Date(event.status_date).toISOString();
    //             //             }
    //             //             if (!dates.outForDeliveryDate && (status === "transit" && detail.includes("out for delivery"))) {
    //             //                 dates.outForDeliveryDate = new Date(event.status_date).toISOString();
    //             //             }
    //             //             if (!dates.deliveredDate && status === "delivered") {
    //             //                 dates.deliveredDate = new Date(event.status_date).toISOString();
    //             //             }
    //             //         }

    //             //         // ✅ assign deliveryDates into order
    //             //         order.deliveryDates = dates;
    //             //         order.currentStatus = currentStatus
    //             //     } else {
    //             //         // ensure keys exist even if no shipment
    //             //         order.cancelOrder = false;
    //             //         order.deliveryDates = { pickupDate: null, shippedDate: null, outForDeliveryDate: null, deliveredDate: null };
    //             //     }
    //             // }


    //             // console.log(cartData)

    //             return {
    //                 message: 'order Data successfully fetched!',
    //                 statusCode: 201,
    //                 data: cartData,
    //                 returnDays: returnDays.name,
    //                 totalCount,
    //                 page,
    //                 pageSize,
    //                 totalPages: Math.ceil(totalCount / pageSize),
    //             };
    //         }

    //     } catch (error) {
    //         console.error('Error fetching orderManagementData:', error);

    //         return {
    //             message: 'An error occurred while fetching the orderManagementData',
    //             statusCode: 500,
    //             error: error.message,
    //         };
    //     }
    // }

    async findOneById(page: number, pageSize: number, id: string, order_id: string, search: string, invoiceNo: string): Promise<any> {
        try {
            const skip = (page - 1) * pageSize;
            const limit = pageSize;

            // ✅ Base filter
            const filter: any = {
                status: { $ne: "ordered" }
            };

            // ✅ User filter
            if (id) {
                filter.userId = new Types.ObjectId(id);
            }

            // ✅ Order ID filter
            if (order_id) {
                filter._id = new Types.ObjectId(order_id);
            }
            if (invoiceNo) {
                filter.invoiceNo = invoiceNo
            }

            console.log("Filter:", filter);

            const returnDays = await this.masterModel.findOne({
                dropdown_type: "return_reasons"
            });

            const pipeline: any[] = [
                { $match: filter },

                // ✅ USER LOOKUP
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } }
            ];

            // ✅ SEARCH FILTER
            if (search && search.trim() !== "") {
                const searchValue = search.trim();
                const searchRegex = { $regex: searchValue, $options: "i" };

                pipeline.push(
                    {
                        $addFields: {
                            fullName: {
                                $concat: ["$user.name", " ", "$user.lastName"]
                            },
                            mobileStr: {
                                $toString: { $ifNull: ["$user.mobileNo", ""] }
                            }
                        }
                    },
                    {
                        $match: {
                            $or: [
                                { "user.name": searchRegex },
                                { "user.lastName": searchRegex },
                                { "user.email": searchRegex },
                                { fullName: searchRegex },
                                { mobileStr: searchRegex }
                            ]
                        }
                    }
                );
            }

            // ✅ OTHER LOOKUPS
            pipeline.push(
                {
                    $lookup: {
                        from: "addresses",
                        localField: "addressId",
                        foreignField: "_id",
                        as: "address"
                    }
                },
                { $unwind: { path: "$address", preserveNullAndEmptyArrays: true } },

                {
                    $lookup: {
                        from: "cartManagement",
                        let: { cartIds: "$cartIds" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $in: ["$_id", "$$cartIds"] }
                                }
                            }
                        ],
                        as: "cartItems"
                    }
                },

                {
                    $lookup: {
                        from: "products",
                        let: { productIds: "$orderItems._id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $in: ["$_id", "$$productIds"] }
                                }
                            }
                        ],
                        as: "orderProducts"
                    }
                },

                {
                    $lookup: {
                        from: "returnorders",
                        let: { orderId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$orderId", "$$orderId"] }
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    productId: 1
                                }
                            }
                        ],
                        as: "returnorders"
                    }
                },

                { $sort: { created_at: -1, _id: -1 } },
                { $skip: skip },
                { $limit: limit }
            );

            const cartData = await this.orderManagementModel.aggregate(pipeline);

            const totalCount = await this.orderManagementModel.countDocuments(filter);

            return {
                message: "Order data fetched successfully!",
                statusCode: 200,
                data: cartData,
                returnDays: returnDays?.name || null,
                totalCount,
                page,
                pageSize,
                totalPages: Math.ceil(totalCount / pageSize)
            };

        } catch (error) {
            console.error("Error fetching orderManagementData:", error);

            return {
                message: "An error occurred while fetching the orderManagementData",
                statusCode: 500,
                error: error.message
            };
        }
    }

    async createPaymentLink(paymentManagement): Promise<any> {
        try {
            let currency = 'usd'
            let description
            let totalPrice = 0
            let cartItems = []
            let discountedPrice = 0
            // const cart = await this.cartManagementModel.findById({ _id: new ObjectId("67da66b3b74b7286d5072dd0") })
            // console.log(cart, "ccccccccccc")
            let planData
            if (paymentManagement.membershipId) {
                const response = await this.MembershipModel.findOne({ _id: new Types.ObjectId(paymentManagement.membershipId) });

                if (response) {
                    planData = response.toObject();
                }
            }
            for (const [index, itemId] of paymentManagement.cartIds.entries()) {
                // console.log(paymentManagement.products,itemId,index,"itemId")
                let cart = await this.cartManagementModel.aggregate([{
                    $match: { _id: new ObjectId(itemId) }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "productId",
                        foreignField: "_id",
                        as: "productDetails"
                    }
                },
                { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "masters", // Adjust collection name as needed
                        localField: "productDetails.category",
                        foreignField: "_id",
                        as: "productData"
                    }
                },
                { $unwind: { path: "$productData", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        userId: 1,
                        productId: 1,
                        quantity: 1,
                        minOrderQuantity: "$productDetails.minOrderQuantity",
                        maxOrderQuantity: "$productDetails.maxOrderQuantity",
                        stock: "$productDetails.stock",
                        price: "$productDetails.price",
                        productName: "$productDetails.productName",
                        productBrand: "$productData.name",
                        category: "$productDetails.category"
                    }
                }])
                totalPrice += cart[0]['price'] * cart[0]['quantity']
                console.log(cart, "ccccccccccc")
                // const productData = await this.productManagementModel.findById({ _id: new ObjectId(cart[0].productId) })
                // console.log(cart[0].minOrderQuantity > cart[0].quantity, cart[0].minOrderQuantity, cart[0].quantity, "cart[0].minOrderQuantity > cart[0].quantity")
                // console.log(cart[0].maxOrderQuantity < cart[0].quantity, cart[0].maxOrderQuantity, cart[0].quantity, "cart[0].maxOrderQuantity < cart[0].quantity")

                const prodCategoryId = cart[0]?.category;

                if (paymentManagement.membershipId) {
                    const matchedCategory = planData.product_categories.find((cat) => {
                        const catId =
                            cat?.category_id?._id || cat?.category_id || cat?.category;
                        return String(catId) === String(prodCategoryId);
                    });
                    console.log(matchedCategory, "matchedCategory")
                    if (matchedCategory) {
                        const discountPercent = matchedCategory.discount || 0;
                        const originalPrice = cart[0]['price'] * cart[0]['quantity'];
                        discountedPrice =
                            ((originalPrice * discountPercent) / 100) + discountedPrice;
                        console.log(discountedPrice, originalPrice, discountPercent, "discountedPrice")
                    }
                }
                if (cart[0].minOrderQuantity > cart[0].quantity) {
                    return { messages: `${cart[0].minOrderQuantity} Minimum order quantity required` }
                } else if (cart[0].maxOrderQuantity < cart[0].quantity) {
                    return { messages: `You can order maximum ${cart[0].maxOrderQuantity} quantity` }
                } else if (cart[0].stock < cart[0].quantity) {
                    return { messages: `Only ${cart[0].stock} items are in stock` }
                } else {
                    cartItems.push({ _id: new ObjectId(cart[0]['productId']), quantity: cart[0]['quantity'], productPrice: cart[0]['price'], productName: cart[0]['productName'], productBrand: cart[0]['productBrand'] })
                    description = description ? `${description} ,${cart[0]['productName']}` : cart[0]['productName']
                }
                // console.log(paymentManagement, "paymentManagement")
                if (index + 1 === paymentManagement.cartIds.length) {
                    let discount = 0
                    let grandTotal = totalPrice + Number(paymentManagement.deliveryCharge)
                    let couponData
                    if (paymentManagement?.coupanId) {
                        const data = await this.couponManagementModel.findOne({ couponCode: paymentManagement.coupanId })
                        couponData = data.toObject()
                        let dis = 0

                        if (couponData.discountType == "percentage") {
                            dis = (couponData.discountValue / 100) * totalPrice
                        } else {
                            dis = couponData.discountValue + discountedPrice
                        }
                        discount = couponData.maxDiscount && dis > couponData.maxDiscount ? couponData?.maxDiscount + discountedPrice : dis

                        console.log(discount, couponData, couponData.maxDiscount && dis > couponData.maxDiscount, dis, "paymentManagement1")
                        grandTotal = totalPrice + Number(paymentManagement.deliveryCharge)
                        console.log(totalPrice, discount, Number(paymentManagement.deliveryCharge), "totalPrice - discount + Number(paymentManagement.deliveryCharge)")
                    } else {
                        grandTotal = totalPrice + Number(paymentManagement.deliveryCharge)
                        discount = discountedPrice
                    }
                    discount = Math.min(discount || 0, totalPrice)
                    const orderCount = await this.orderManagementModel.countDocuments();
                    let saveData = {
                        cartIds: paymentManagement.cartIds,
                        orderItems: cartItems,
                        userId: new ObjectId(paymentManagement.userId),
                        invoiceNo: `-S-${orderCount + 1 + 17000}`,
                        totalAmount: totalPrice,
                        discountAmount: Math.min(discount || 0, totalPrice),//discount,
                        grandTotal: Math.max(grandTotal - discount, 0),
                        couponId: paymentManagement?.coupanId ? paymentManagement.coupanId : null,
                        coupanTittle: couponData?.title,
                        addressId: paymentManagement?.addressId ? new ObjectId(paymentManagement.addressId) : null,
                        deliveryCharge: Number(paymentManagement.deliveryCharge),
                        billingAddress1: paymentManagement.billingAddress1,
                        billingAddress2: paymentManagement.billingAddress2,
                        billingCity: paymentManagement.billingCity,
                        billingState: paymentManagement.billingState,
                        billingCountry: paymentManagement.billingCountry,
                        billingZipcode: paymentManagement.billingZipcode,
                        shippingId: paymentManagement.shippingId,
                        pickupDate: paymentManagement.pickupDate,
                        carrier: paymentManagement.carrier
                    }
                    console.log(saveData, "sssssssssss")
                    if (paymentManagement.paymentMethod === 'offline') {
                        saveData['paymentMethod'] = 'offline'
                        saveData['status'] = 'paid'
                    }
                    const orderManagement = new this.orderManagementModel(saveData);
                    const newOrder = await orderManagement.save();
                    console.log(totalPrice, paymentManagement.deliveryCharge, discount, "ddddddis")
                    let session
                    if (paymentManagement.paymentMethod !== 'offline') {
                        let stripePaymentDescription = ""
                        let lineItems: any[] = [];
                        let stripeCouponId
                        for (const [ind, item] of cartItems.entries()) {
                            lineItems.push({
                                price_data: {
                                    currency: currency,
                                    product_data: {
                                        name: item.productName,
                                        description: item.productName
                                    },
                                    unit_amount: Math.round(
                                        Number(item.productPrice) * 100
                                    ),
                                },

                                quantity: item.quantity,
                            });
                            if (ind == 0) {
                                stripePaymentDescription = `Shop-${item.productName}`
                            } else {
                                stripePaymentDescription = `${stripePaymentDescription},${item.productName}`
                            }
                        }
                        if (Number(paymentManagement.deliveryCharge) > 0) {
                            lineItems.push({
                                price_data: {
                                    currency: currency,
                                    product_data: {
                                        name: 'Delivery Charge',
                                        description: 'Delivery Charge'
                                    },
                                    unit_amount:
                                        Math.round(
                                            Number(paymentManagement.deliveryCharge) * 100
                                        ),
                                },
                                quantity: 1,
                            });
                        }
                        if (discount > 0) {
                            const coupon = await this.stripe.coupons.create({
                                amount_off: Math.round(discount * 100),//Math.round(Math.min(discount  || 0, totalPrice)* 100),//Math.round(discount * 100),
                                currency: currency,
                                duration: 'once',
                            });
                            stripeCouponId = coupon.id;
                        }
                        const userDetails = await this.userModel.findById(new ObjectId(paymentManagement.userId))
                        // let payableAmomunt = parseFloat(((totalPrice + Number(paymentManagement.deliveryCharge) - discount) * 100).toFixed(2))
                        let payableAmount = Math.max(0, parseFloat(((totalPrice + Number(paymentManagement.deliveryCharge) - discount) * 100).toFixed(2)));
                        session = await this.stripe.checkout.sessions.create({
                            // line_items: [
                            //     {
                            //         price_data: {
                            //             currency: currency,
                            //             product_data: {
                            //                 name: description,
                            //             },
                            //             unit_amount: payableAmount,
                            //         },
                            //         quantity: 1,
                            //     },
                            // ],
                            customer: userDetails.stripeCustomerId,
                            line_items: lineItems,
                            discounts: stripeCouponId ? [{ coupon: stripeCouponId, },] : undefined,
                            payment_intent_data: {
                                description: stripePaymentDescription,
                                metadata: {
                                    id: `${newOrder._id}`,
                                    type: 'shop'
                                }
                            },
                            mode: 'payment',
                            success_url: `${process.env.BASE_URL}/order-management/paymentSuccess/${newOrder._id}`,  // URL after successful payment
                            // cancel_url: `https://doyoursurvey.com/cancel`,    // URL if payment is canceled
                        });
                        console.log(session, "session")
                        await this.orderManagementModel.findByIdAndUpdate({ _id: new ObjectId(newOrder._id) }, { $set: { paymentSessionId: session.id || "" } })
                    } else {
                        await this.paymentSuccess(newOrder._id)
                    }

                    // return session.url;
                    if (paymentManagement.paymentMethod !== 'offline') {
                        return {
                            message: 'Order placed',
                            statusCode: 200,
                            paymentUrl: session?.url,
                            orderId: newOrder._id
                        };
                    }
                }
            }
        } catch (error) {
            console.log(error)
            throw new Error(`Error creating checkout session: ${error.message}`);
        }
    }

    async notYetShipped(page: number, pageSize: number, id: string, order_id: string): Promise<any> {
        try {
            let objectId
            const skip = (page - 1) * pageSize;
            const limit = pageSize;
            const filter: any = { status: 'paid' };//ordered
            console.log(page, pageSize, skip, "skip")
            if (id) {
                objectId = new Types.ObjectId(id);
                filter['userId'] = objectId
            }

            if (order_id) {
                objectId = new Types.ObjectId(id);
                filter['_id'] = objectId
            }
            const returnDays = await this.masterModel.findOne({ dropdown_type: 'return_reasons' })
            // const cartData = await this.orderManagementModel.find(filter).exec()
            const cartData = await this.orderManagementModel.aggregate([{ $match: filter }, {
                $lookup: {
                    from: "addresses",
                    localField: "addressId",
                    foreignField: "_id",
                    as: "address"
                }
            },
            { $unwind: { path: "$address", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "cartManagement",
                    let: { cartIds: "$cartIds" }, // cartId is assumed to be an array
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$_id", "$$cartIds"]
                                }
                            }
                        }
                    ],
                    as: "cartItems"
                }
            },
            {
                $lookup: {
                    from: "products",
                    let: { productIds: "$orderItems._id" }, // extract all product ids
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ["$_id", "$$productIds"] }
                            }
                        }
                    ],
                    as: "orderProducts"
                }
            },
            {
                $lookup: {
                    from: "returnorders",
                    let: { orderId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$orderId", "$$orderId"] } } },
                        { $project: { _id: 0, productId: 1 } }
                    ],
                    as: "returnorders"
                }
            },

            {
                $sort: {
                    created_at: -1
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }]).exec()
            const totalCount = await this.orderManagementModel.countDocuments(filter).exec();

            if (!cartData) {
                throw new Error(`cartData not found with id: ${id}`);
            } else {
                for (const order of cartData) {
                    if (order.status === 'paid' && order.shippingId) {
                        const shipmentRes = await axios.get(
                            `https://api.goshippo.com/v1/tracks/shippo/SHIPPO_TRANSIT`, // TODO: replace with actual carrier/tracking_number
                            {
                                headers: {
                                    Authorization: process.env.SHIPPOKEY,
                                    'Content-Type': 'application/json',
                                },
                            }
                        );

                        const dates = { pickupDate: null, shippedDate: null, outForDeliveryDate: null, deliveredDate: null };
                        const shipmentStatus = shipmentRes.data.tracking_status?.status;

                        // ✅ always assign returnOrder, default false
                        order.cancelOrder = (shipmentStatus === 'PRE_TRANSIT' || shipmentStatus === 'UNKNOWN');
                        let currentStatus = shipmentStatus
                        for (const event of shipmentRes.data.tracking_history) {
                            const detail = event.status_details.toLowerCase();
                            const status = event.status.toLowerCase();
                            currentStatus = status
                            if (!dates.pickupDate && detail.includes("electronic shipment information")) {
                                dates.pickupDate = new Date(event.status_date).toISOString();
                            }
                            if (!dates.shippedDate && (status === "transit" || detail.includes("departed from the origin"))) {
                                dates.shippedDate = new Date(event.status_date).toISOString();
                            }
                            if (!dates.outForDeliveryDate && (status === "transit" && detail.includes("out for delivery"))) {
                                dates.outForDeliveryDate = new Date(event.status_date).toISOString();
                            }
                            if (!dates.deliveredDate && status === "delivered") {
                                dates.deliveredDate = new Date(event.status_date).toISOString();
                            }
                        }

                        // ✅ assign deliveryDates into order
                        order.deliveryDates = dates;
                        order.currentStatus = currentStatus
                    } else {
                        // ensure keys exist even if no shipment
                        order.cancelOrder = false;
                        order.deliveryDates = { pickupDate: null, shippedDate: null, outForDeliveryDate: null, deliveredDate: null };
                    }
                }


                // console.log(cartData)

                return {
                    message: 'order Data successfully fetched!',
                    statusCode: 201,
                    data: cartData,
                    returnDays: returnDays.name,
                    totalCount,
                    page,
                    pageSize,
                    totalPages: Math.ceil(totalCount / pageSize),
                };
            }

        } catch (error) {
            console.error('Error fetching orderManagementData:', error);

            return {
                message: 'An error occurred while fetching the orderManagementData',
                statusCode: 500,
                error: error.message,
            };
        }
    }


    async paymentSuccess(id) {
        try {
            const orderData = await this.orderManagementModel.findById(id);
            console.log(orderData, "orderData")
            if (!orderData) {
                // throw new Error("Order not found")
                return {
                    message: 'Order not found',
                    statusCode: 400
                };
            } else if (orderData?.status == 'paid') {
                // throw new Error("Order already placed")
                return {
                    message: 'Order already placed',
                    statusCode: 400
                };
            } else if (orderData.pickupDate != null) {

            }
            let transaction
            if (orderData.pickupDate == null) {
                transaction = await axios.post('https://api.goshippo.com/transactions', {
                    rate: orderData.shippingId,
                    label_file_type: 'PDF',
                    async: false
                }, {
                    headers: {
                        Authorization: process.env.SHIPPOKEY,
                        'Content-Type': 'application/json'
                    }
                });
            }
            console.log(transaction?.data, "transaction")
            if (transaction?.data?.status === 'SUCCESS' || orderData.pickupDate != null) {
                const tracking = transaction?.data.tracking_number || null;
                const labelUrl = transaction?.data.label_url || null;
                const cartItems = await this.cartManagementModel.find({
                    _id: { $in: orderData.cartIds.map(p => new ObjectId(p)) },
                    // userId: new ObjectId(orderData.userId),
                });
                console.log(cartItems, "dasdadad");
                const bulkOperations = [];
                for (const cartItem of cartItems) {
                    const productIds = Array.isArray(cartItem.productId) ? cartItem.productId : [cartItem.productId];

                    for (const productId of productIds) {

                        bulkOperations.push({
                            updateOne: {
                                filter: { _id: new ObjectId(productId) },
                                update: {
                                    $inc: {
                                        stock: -cartItem.quantity, // Reduce stock
                                        buy_count: +cartItem.quantity // Increase buy_cart
                                    }
                                }
                            }
                        });
                    }
                }
                if (bulkOperations.length > 0) {
                    const update = await this.productManagementModel.bulkWrite(bulkOperations);
                    await this.cartManagementModel.deleteMany({
                        _id: { $in: orderData.cartIds.map(p => new ObjectId(p)) }
                    });
                    // const session = await this.stripe.checkout.sessions.retrieve(orderData.paymentSessionId, {
                    //     expand: ['payment_intent']
                    //   });

                    //   const paymentIntentId = session.payment_intent['id'];

                    //   const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId, {
                    //     expand: ['charges']
                    //   });
                    //   console.log(paymentIntent,"paymentIntentpaymentIntent")
                    //   const charge = paymentIntent['charges'].data[0];
                    //   console.log(charge,"chargecharge")
                    //   const last4 = charge.payment_method_details.card.last4;
                    //   const brand = charge.payment_method_details.card.brand;

                    //   console.log('Card Brand:', brand);
                    //   console.log('Last 4:', last4);
                    //   if (paymentIntent && paymentIntent.charges.data.length > 0) {
                    //     const card = paymentIntent.charges.data[0].payment_method_details.card;
                    //     console.log("Card brand:", card.brand);      // e.g., 'visa'
                    //     console.log("Last 4 digits:", card.last4);   // e.g., '4242'
                    //   }
                    const updatedOrder = await this.orderManagementModel.findByIdAndUpdate(
                        id,
                        {
                            $set: {
                                status: "paid",
                                tracking_number: tracking,
                                shipping_label_url: labelUrl
                            }
                        }, { new: true }
                    );
                    // console.log(updatedOrder, 'ttttttt')
                    const updatedIds = bulkOperations.map(op => op.updateOne.filter._id);

                    // fetch updated documents 
                    const updatedProducts = await this.productManagementModel.find({
                        _id: { $in: updatedIds }
                    });
                    this.sendMailsForLowStock(updatedProducts);
                    // Send order-related emails
                    try {
                        const user = await this.userModel.findById(orderData.userId).lean();
                        if (user) {
                            const userEmail = user.email;
                            const userName = user.name || 'Customer';
                            const amount = Number(orderData.grandTotal) || 0;
                            const paymentModeDisplay = orderData.paymentMethod === 'offline' ? 'Offline' : 'Online (Card)';
                            const orderIdStr = String(orderData.invoiceNo);
                            const orderDateTime = orderData.created_at
                                ? moment(orderData.created_at).format('MMMM D, YYYY HH:mm')
                                : moment().format('MMMM D, YYYY HH:mm');
                            const productList = orderData.orderItems || [];
                            const orderFullData = await this.orderManagementModel.aggregate([{ $match: { _id: new Types.ObjectId(id) } },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'userId',
                                    foreignField: '_id',
                                    as: 'userInfo'
                                }
                            },
                            { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },])

                            // Only send "Order placed" confirmation when shippingId is present and pickupDate is not set
                            if (userEmail) {//orderData.shippingId && !orderData.pickupDate && userEmail) {
                                // const productList = (orderData.orderItems || [])
                                //     .map((item: { productName?: string; quantity?: number }) => `${item.productName || 'Item'} x ${item.quantity ?? 1}`)
                                //     .join(', ');

                                const footerData = await this.masterModel.findOne({ dropdown_type: "footer_data" })
                                const d = sendOrderConfirmationEmail(
                                    userEmail,
                                    userName,
                                    `Ved${orderIdStr}`,
                                    productList || [],
                                    amount,
                                    paymentModeDisplay,
                                    orderFullData[0],
                                    footerData
                                );
                                console.log(d, "mail replay")
                            }

                            // Always send payment success email to user after successful payment
                            // if (userEmail) {
                            //     await sendOrderPaymentSuccessEmail(
                            //         userEmail,
                            //         userName,
                            //         orderIdStr,
                            //         amount,
                            //         paymentModeDisplay,
                            //     );
                            // }

                            // Always send new order notification to admin
                            sendNewOrderAdminEmail(
                                `Ved${orderIdStr}`,
                                userName,
                                userEmail || "",
                                amount,
                                paymentModeDisplay,
                                orderDateTime,
                                productList || [],
                                orderFullData[0]
                            );
                        }
                    } catch (emailErr) {
                        console.error('Order-related emails failed:', emailErr);
                    }
                    return {
                        message: 'Order placed',
                        statusCode: 200,
                        paymentUrl: `${process.env.FRONTEND_URL}/Shop/thankYou`
                    };
                }
            } else {
                return {
                    message: 'Failed to place order',
                    statusCode: 400
                };
            }
        } catch (error) {
            console.log(error, "eeeeeeeeee")
            // throw new Error(error.message);
            return {
                message: 'Something went wrong',
                statusCode: 400,
                error: error.message
            };
        }

    }

    sendMailsForLowStock = (products) => {
        for (const product of products) {
            console.log(product.stock, product.stock < 5, "product.stock")
            if (product.stock < 5) {
                sendLowStockEmail(
                    'info@vedichealth.org',
                    product.productName,
                    product.stock,
                    5, `${process.env.FRONTEND_URL}/admin/inventory/edit/${product._id}`)
            }
        }
    }


    async getShippingCharge(address): Promise<any> {
        try {
            let [userAddress] = await this.addressModel.aggregate([
                {
                    $match: { _id: new ObjectId(address.to) }
                },
                {
                    $lookup: {
                        from: 'users',               // Name of the target collection (must match DB name, not model)
                        localField: 'user_id',       // Field in centerModel
                        foreignField: '_id',         // Field in users collection
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                {
                    $addFields: {
                        email: '$user.email'
                    }
                }
            ])
            let fromAddress = await this.centerModel.findById({ _id: new ObjectId(address.from) })
            //             let countryArr = ['country', 'political']
            // let stateArr = ['administrative_area_level_1', 'political']
            // let cityArr = ['administrative_area_level_3', 'political']
            // let pincodeArr = ['postal_code']
            // let cityName = ''
            // let stateCode = ''
            // let countryCode = ''
            // let pincode = ''
            // const { data } = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            //     params: {
            //         latlng: `${fromAddress.latitude},${fromAddress.longitude}`,
            //         key: process.env.GOOGLE_MAPS_API_KEY
            //     }
            // });
            // const addressComponents = data.results[0];
            // addressComponents.address_components.map(e => {
            //                     if (JSON.stringify(e.types) === JSON.stringify(cityArr)) {
            //         cityName = e.short_name
            //     }
            //     if (JSON.stringify(e.types) === JSON.stringify(stateArr)) {
            //         stateCode = e.short_name
            //     } if (JSON.stringify(e.types) === JSON.stringify(countryArr)) {
            //         countryCode = e.short_name
            //     } if (JSON.stringify(e.types) === JSON.stringify(pincodeArr)) {
            //         pincode = e.short_name
            //     }
            // })
            // const shippoToAddress = {
            //     name: userAddress['name'],
            //     street1: userAddress['area'],
            //     city: userAddress['city'],
            //     state: userAddress['stateCode'],
            //     zip: userAddress['pincode'],
            //     country: userAddress['countryCode'],
            //     phone: userAddress['mobile'],
            //     email: userAddress['email']
            // }
            // const shippoToaddress = {
            //     name: fromAddress.centerName,
            //     street1: fromAddress.address,
            //     city: cityName,
            //     state: stateCode,
            //     zip: pincode,
            //     country: countryCode,
            //     phone: fromAddress.phone_number,
            //     email: fromAddress.email
            // }
            console.log(userAddress.shippoAddressId, fromAddress.shippoAddressId, 'shippoToAddress', 'shippoToaddress', " userAddress['user.email']")
            const response = await axios.post('https://api.goshippo.com/shipments',
                {
                    "parcels": [
                        {
                            "height": 12.5,
                            "distance_unit": "in",
                            "length": 12.5,
                            "width": 6,
                            "weight": 12,
                            "mass_unit": "lb"
                        }
                    ],
                    "address_from": fromAddress.shippoAddressId,
                    "address_to": userAddress.shippoAddressId,
                    "object_purpose": "PURCHASE",
                    "async": false

                }, {
                headers: {
                    Authorization: process.env.SHIPPOKEY,
                    'Content-Type': 'application/json',
                },
            });
            console.log(response.data, "responseresponse")
            // return response.data;
            return {
                message: 'Shipping charge calculate successfully',
                statusCode: 200,
                data: response.data,
            }
        } catch (error) {
            console.log(error)
            throw new Error(`Error fetching data: ${error.message}`);
        }
    }


    async getDashboardData(): Promise<any> {
        try {
            const aggregationPipeline = [
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalAmount: { $sum: '$totalAmount' },
                        totalDiscountAmount: { $sum: '$discountAmount' },
                        totalDeliveryCharge: { $sum: '$deliveryCharge' },
                    },
                },
            ];

            const result = await this.orderManagementModel.aggregate(aggregationPipeline);

            return {
                message: 'Order data for Dashboard fetched successfully',
                statusCode: 200,
                data: result.length > 0 ? result[0] : {
                    totalOrders: 0,
                    totalAmount: 0,
                    totalDiscountAmount: 0,
                    totalDeliveryCharge: 0,
                },
            };
        } catch (error) {
            throw new Error(`Error fetching dashboard data: ${error.message}`);
        }
    }
    formatDateWithTime(dateStr) {
        if (!dateStr) return "";

        return momentTime.utc(dateStr)
            .tz("America/New_York")
            .format("DD MMM, YYYY HH:mm");
    };

    async findOrderData(orderId: string): Promise<any> {
        try {

            const aggregationPipeline = [
                { $match: { _id: new Types.ObjectId(orderId) } },

                // Lookup user
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'userInfo'
                    }
                },
                { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },

                // Lookup coupon
                {
                    $lookup: {
                        from: 'coupons',
                        localField: 'couponId',
                        foreignField: 'couponCode',
                        as: 'couponInfo'
                    }
                },
                { $unwind: { path: '$couponInfo', preserveNullAndEmptyArrays: true } },

                // Lookup address
                {
                    $lookup: {
                        from: 'addresses',
                        localField: 'addressId',
                        foreignField: '_id',
                        as: 'addressInfo'
                    }
                },
                { $unwind: { path: '$addressInfo', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'returnorders',
                        localField: '_id',
                        foreignField: 'orderId',
                        as: 'returnOrders'
                    }
                },
                { $unwind: { path: '$returnOrders', preserveNullAndEmptyArrays: true } },
                // Optional: Project only needed fields
                // {
                //     $project: {
                //         invoiceNo: 1,
                //         orderItems: 1,
                //         totalAmount: 1,
                //         deliveryCharge: 1,
                //         discountAmount: 1,
                //         grandTotal: 1,
                //         status: 1,
                //         created_at: {
                //             $dateToString: { format: '%d/%m/%Y, %H:%M:%S', date: '$created_at', timezone: 'Asia/Kolkata' }
                //         },
                //         'userInfo._id': 1,
                //         'userInfo.name': 1,
                //         'userInfo.mobileNo': 1,
                //         'couponInfo.title': 1,
                //         'couponInfo.couponCode': 1,
                //         'couponInfo.discountValue': 1,
                //         'couponInfo.expiryType': 1,
                //         'couponInfo.thresholdAmount': 1,
                //         'couponInfo.maxDiscount': 1,
                //         'couponInfo.totalUserLimit': 1,
                //         'couponInfo.startDateTime': 1,
                //         'couponInfo.description': 1,
                //         'returnOrders': 1,
                //         addressInfo: 1
                //     }
                // }
            ];
            // console.log(findOrderData,"findOrderData")

            const data = await this.orderManagementModel.aggregate(aggregationPipeline).exec();
            let date = data[0].created_at;

            if (data[0]?.created_at) {
                date = this.formatDateWithTime(data[0].created_at);
            }

            const data1 = [
                { ...data[0], created_at: date },
                ...data.slice(1)
            ];
            console.log(data, "oooo")
            return {
                message: 'Order data successfully fetched!',
                statusCode: 200,
                data: data1
            };

        } catch (error) {
            console.error('Error fetching orderManagementData:', error);
            return {
                message: 'An error occurred while fetching the order data',
                statusCode: 500,
                error: error.message,
            };
        }
    }

    formatToEST = (date: string | Date) => {
        return new Intl.DateTimeFormat("en-US", {
            timeZone: "America/New_York",
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(date));
    };
    async buyAgain(cartId: any, user: any, orderItems: any) {
        try {
            const arr = cartId.map(ele => new Types.ObjectId(ele));
            const userId = new Types.ObjectId(user)

            const updated = await this.cartManagementModel.find(
                { _id: { $in: arr }, userId: userId },
            ).lean();
            let cleaned = []
            if (updated.length !== 0) {
                console.log({ _id: { $in: arr }, userId: userId }, updated, "updated")
                cleaned = updated.map(doc => {
                    const { _id, __v, ...rest } = doc;
                    return {
                        ...rest,
                        selected: 1
                        // created_at: new Date() // optional: update to current timestamp
                    };
                });
            } else {
                orderItems.map(async order => {

                    // let product = await this.productManagementModel.findById({ _id: new ObjectId(order._id) })
                    // console.log(product, order, orderItems, "proddddddd")
                    cleaned.push({ userId: new ObjectId(userId), productId: new ObjectId(order._id), quantity: order.quantity, selected: 1 })
                })
            }
            console.log(cleaned, "cleaned")
            const not = await this.cartManagementModel.insertMany(
                cleaned
            );
            await this.cartManagementModel.updateMany(
                { _id: { $nin: arr } },
                { $set: { selected: 0 } }
            );
            console.log(not, "notttttttttttt")
            return {
                message: 'Update successfully',
                statusCode: 200

            };
        } catch (error) {
            console.error('Error fetching orderManagementData:', error);
            return {
                message: 'An error occurred while the order buy',
                statusCode: 500,
                error: error.message,
            };
        }
    }

    // async cancelOrder(orderId: any): Promise<any> {
    //     try {
    //         const order = await this.orderManagementModel.aggregate([{ $match: { _id: new ObjectId(orderId) } },
    //         {
    //             $lookup: {
    //                 from: 'users',
    //                 localField: 'userId',
    //                 foreignField: '_id',
    //                 as: 'userInfo'
    //             }
    //         },
    //         { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },])
    //         const shipmentRes = await axios.get(`https://api.goshippo.com/v1/tracks/${order[0].carrier}/${order[0].tracking_number}`,
    //             {
    //                 headers: {
    //                     Authorization: process.env.SHIPPOKEY,
    //                     'Content-Type': 'application/json'
    //                 }
    //             });
    //         console.log("const shipmentStatus = ", shipmentRes.data.tracking_status?.status)
    //         const shipmentStatus = shipmentRes.data.tracking_status?.status;
    //         // if (shipmentStatus === 'QUEUED' || shipmentStatus === 'TRANSIT') 
    //         const cancellableStatuses = ['PRE_TRANSIT', 'UNKNOWN'];

    //         if (cancellableStatuses.includes(shipmentStatus)) {

    //             // order['returnOrder'] = true
    //             const update = await this.orderManagementModel.findByIdAndUpdate({ _id: new ObjectId(orderId) }, { $set: { status: 'orderCanceled' } }, { new: true })
    //             await Promise.all(
    //                 update.orderItems.map((product: any) => {
    //                     this.productManagementModel.findByIdAndUpdate(
    //                         { _id: new ObjectId(product._id) },
    //                         {
    //                             $inc: {
    //                                 stock: +product.quantity,
    //                                 buy_count: -product.quantity
    //                             }
    //                         })
    //                 })

    //             );
    //             console.log(update, order[0].userInfo, "update")
    //             if (order[0].userInfo) {
    //                 const customerName = `${order[0].userInfo.name} ${order[0]?.userInfo?.lastName}`
    //                 const orderDateEST = this.formatToEST(order[0].created_at);
    //                 const cancellationDateEST = this.formatToEST(new Date());

    //                 sendOrderCancelEmail(
    //                     order[0].userInfo.email,
    //                     customerName,
    //                     `Ved${order[0].invoiceNo}`,
    //                     order[0].orderItems,
    //                     orderDateEST,
    //                     cancellationDateEST
    //                 )
    //             }
    //             return {
    //                 message: 'Order canceled successfully',
    //                 statusCode: 200
    //             };
    //         } else {
    //             return {
    //                 message: 'An error occurred while fetching the order data',
    //                 statusCode: 500,
    //                 error: "This order is shipped you cann't cancel it now",
    //             };
    //         }

    //     } catch (error) {
    //         console.error('Error fetching orderManagementData:', error);
    //         return {
    //             message: 'An error occurred while fetching the order data',
    //             statusCode: 500,
    //             error: error.message,
    //         };
    //     }
    // }

    async cancelOrder(orderId: string): Promise<any> {
        try {
            // ✅ Fetch order with user
            const order = await this.orderManagementModel.aggregate([
                { $match: { _id: new ObjectId(orderId) } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'userInfo'
                    }
                },
                { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } }
            ]);

            if (!order.length) {
                return {
                    statusCode: 404,
                    message: "Order not found"
                };
            }

            const orderData = order[0];

            // ✅ Get shipment status from Shippo
            let shipmentStatus = 'UNKNOWN';

            try {
                if (orderData.carrier && orderData.tracking_number) {
                    const shipmentRes = await axios.get(
                        `https://api.goshippo.com/v1/tracks/${orderData.carrier}/${orderData.tracking_number}`,
                        {
                            headers: {
                                Authorization: `ShippoToken ${process.env.SHIPPOKEY}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    shipmentStatus = shipmentRes?.data?.tracking_status?.status || 'UNKNOWN';
                }
            } catch (err) {
                console.log("Tracking fetch failed, fallback to UNKNOWN");
            }

            console.log("Shipment Status:", shipmentStatus);

            // ✅ Allow cancel only before shipment
            const cancellableStatuses = ['PRE_TRANSIT', 'UNKNOWN'];

            if (!cancellableStatuses.includes(shipmentStatus)) {
                return {
                    statusCode: 400,
                    message: "This order is shipped, you can't cancel it now"
                };
            }

            // ✅ Refund label in Shippo (if exists)
            if (orderData.transactionId) {
                try {
                    await axios.post(
                        `https://api.goshippo.com/v1/transactions/${orderData.transactionId}/refund`,
                        {},
                        {
                            headers: {
                                Authorization: `ShippoToken ${process.env.SHIPPOKEY}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    console.log("Shippo label refunded successfully");
                } catch (refundErr) {
                    console.error("Shippo refund failed:", refundErr?.response?.data || refundErr.message);
                    // ⚠️ Don't block cancellation if refund fails
                    return {
                        message: 'An error occurred while fetching the order data',
                        statusCode: 500,
                        error: refundErr.message,
                    };
                }
            }

            // ✅ Update order status
            const updatedOrder = await this.orderManagementModel.findByIdAndUpdate(
                { _id: new ObjectId(orderId) },
                { $set: { status: 'orderCanceled' } },
                { new: true }
            );

            // ✅ Restore product stock
            await Promise.all(
                updatedOrder.orderItems.map((product: any) => {
                    return this.productManagementModel.findByIdAndUpdate(
                        { _id: new ObjectId(product._id) },
                        {
                            $inc: {
                                stock: +product.quantity,
                                buy_count: -product.quantity
                            }
                        }
                    );
                })
            );
            const footerData = await this.masterModel.findOne({ dropdown_type: "footer_data" })
            // ✅ Send email
            if (orderData.userInfo) {
                const customerName = `${orderData.userInfo.name} ${orderData.userInfo?.lastName}`;
                const orderDateEST = this.formatToEST(orderData.created_at);
                const cancellationDateEST = this.formatToEST(new Date());

                await sendOrderCancelEmail(
                    orderData.userInfo.email,
                    customerName,
                    `Ved${orderData.invoiceNo}`,
                    orderData.orderItems,
                    orderDateEST,
                    cancellationDateEST
                );
                // sendOrderCancelledAdminEmail(
                //     footerData?.email || "Info@vedichealth.org",
                //     `Ved${orderData.invoiceNo}`,
                //     customerName,
                //     orderData.userInfo.email,
                //     cancellationDateEST)
                sendOrderCancelledAdminEmail(
                    footerData?.email || "Info@vedichealth.org",
                    `Ved${orderData.invoiceNo}`,
                    customerName,
                    orderData.userInfo.email,
                    cancellationDateEST,
                    orderData.orderItems,
                    orderData,)

            }

            return {
                statusCode: 200,
                message: "Order cancelled successfully"
            };

        } catch (error) {
            console.error("Cancel Order Error:", error);

            return {
                statusCode: 500,
                message: "Something went wrong while cancelling order",
                error: error.message
            };
        }
    }

    async getCancelOrder(userId: any): Promise<any> {
        try {
            // const order = await this.orderManagementModel.findById({ _id: new ObjectId(userId), status: 'orderCanceled' })
            const data = await this.orderManagementModel.aggregate([{ $match: { userId: new ObjectId(userId), status: 'orderCanceled' } }, {
                $lookup: {
                    from: "addresses",
                    localField: "addressId",
                    foreignField: "_id",
                    as: "address"
                }
            },
            { $unwind: { path: "$address", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "cartManagement",
                    let: { cartIds: "$cartIds" }, // cartId is assumed to be an array
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$_id", "$$cartIds"]
                                }
                            }
                        }
                    ],
                    as: "cartItems"
                }
            },
            {
                $lookup: {
                    from: "products",
                    let: { productIds: "$orderItems._id" }, // extract all product ids
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ["$_id", "$$productIds"] }
                            }
                        }
                    ],
                    as: "orderProducts"
                }
            },
            {
                $sort: {
                    created_at: -1
                }
            }
            ]).exec()
            return {
                message: 'data fetched successfully',
                statusCode: 200,
                data
            };

        } catch (error) {
            console.error('Error fetching orderManagementData:', error);
            return {
                message: 'An error occurred while fetching the order data',
                statusCode: 500,
                error: error.message,
            };
        }
    }

    async pickupOrder(id, status): Promise<any> {
        try {

            let updateData = {}
            if (status == "orderPacked") {
                updateData['orderStatus'] = "orderPacked",
                    updateData["orderPackDate"] = new Date()
            } else if (status == "orderReady") {
                updateData['orderStatus'] = "orderReady",
                    updateData["orderReadyDate"] = new Date()
            } else if (status == "orderPickedUp") {
                updateData["orderType"] = "pickupDone"
                updateData['orderStatus'] = "orderPickedUp",
                    updateData["pickupDoneDate"] = new Date()
            }
            // const footerData = await this.masterModel.findOne({ dropdown_type: "footer_data" })

            const result = await this.orderManagementModel.findOneAndUpdate({ _id: new Types.ObjectId(id) }, { $set: updateData })
            if (result) {
                const orderData = await this.orderManagementModel.aggregate([{ $match: { _id: new Types.ObjectId(id) } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'userInfo'
                    }
                },
                { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },])
                const productList = orderData[0].orderItems || [];
                const footerData = await this.masterModel.findOne({ dropdown_type: "footer_data" })
                console.log(orderData, "orderDataorderData")
                // await sendOrderPlacedEmail(orderData[0].userInfo.email, `${orderData[0].userInfo.name} ${orderData[0].userInfo.lastName}`, orderData[0], footerData)
                if (status == "orderPacked") {
                    sendOrderPackedEmail(orderData[0].userInfo.email, `${orderData[0].userInfo.name} ${orderData[0].userInfo.lastName}`, orderData[0])
                    // sendOrderPackedAdminEmail(footerData?.email || "Info@vedichealth.org", `Ved${orderData[0].invoiceNo}`, `${orderData[0].userInfo.name} ${orderData[0].userInfo.lastName}`, orderData[0].userInfo.email, new Date().toLocaleDateString(),)
                    sendOrderPackedAdminEmail(footerData?.email || "Info@vedichealth.org", `Ved${orderData[0].invoiceNo}`, `${orderData[0].userInfo.name} ${orderData[0].userInfo.lastName}`, orderData[0].userInfo.email, new Date().toLocaleDateString(), productList || [], orderData[0])
                } else if (status == "orderReady") {
                    sendOrderReadyEmail(orderData[0].userInfo.email, `${orderData[0].userInfo.name} ${orderData[0].userInfo.lastName}`, orderData[0])
                    // sendOrderReadyAdminEmail(footerData?.email || "Info@vedichealth.org", `Ved${orderData[0].invoiceNo}`, `${orderData[0].userInfo.name} ${orderData[0].userInfo.lastName}`, orderData[0].userInfo.email, new Date().toLocaleDateString())
                    sendOrderReadyAdminEmail(footerData?.email || "Info@vedichealth.org", `Ved${orderData[0].invoiceNo}`, `${orderData[0].userInfo.name} ${orderData[0].userInfo.lastName}`, orderData[0].userInfo.email, new Date().toLocaleDateString(), productList || [], orderData[0])
                } else if (status == "orderPickedUp") {
                    const footerData = await this.masterModel.findOne({ dropdown_type: "footer_data" })
                    if (orderData[0]?.pickupDate !== null) {
                        sendOrderDeliveredEmail(orderData[0].userInfo.email, `${orderData[0].userInfo.name} ${orderData[0].userInfo.lastName}`, orderData[0], footerData)
                        // sendOrderPickupAdminEmail(footerData?.email || "Info@vedichealth.org", `Ved${orderData[0].invoiceNo}`, `${orderData[0].userInfo.name} ${orderData[0].userInfo.lastName}`, orderData[0].userInfo.email, new Date().toLocaleDateString())
                        sendOrderPickupAdminEmail(footerData?.email || "Info@vedichealth.org", `Ved${orderData[0].invoiceNo}`, `${orderData[0].userInfo.name} ${orderData[0].userInfo.lastName}`, orderData[0].userInfo.email, new Date().toLocaleDateString(), productList || [], orderData[0])
                    } else {
                        // sendOrderDispatchedAdminEmail(footerData?.email || "Info@vedichealth.org", `Ved${orderData[0].invoiceNo}`, `${orderData[0].userInfo.name} ${orderData[0].userInfo.lastName}`, orderData[0].userInfo.email, new Date().toLocaleDateString(), orderData[0]?.carrier || "Shippo")
                        sendOrderDispatchedAdminEmail(footerData?.email || "Info@vedichealth.org", `Ved${orderData[0].invoiceNo}`, `${orderData[0].userInfo.name} ${orderData[0].userInfo.lastName}`, orderData[0].userInfo.email, new Date().toLocaleDateString(), orderData[0]?.carrier || "Shippo", productList || [], orderData[0])
                    }
                }
            }

            console.log(result, updateData, "resultresult")
            return {
                message: 'Order successfully picked up.',
                statusCode: 200,
            };
        } catch (error) {
            throw new Error(`Error fetching dashboard data: ${error.message}`);
        }
    }

    async orderNowForPractitionerOffline(paymentManagement): Promise<any> {
        try {
            let currency = 'usd'
            let description = 'string'
            let totalPrice = 0
            let cartItems = []
            // const cart = await this.cartManagementModel.findById({ _id: new ObjectId("67da66b3b74b7286d5072dd0") })
            // console.log(cart, "ccccccccccc")
            let planData
            let discountedPrice = 0
            if (paymentManagement.membershipId) {
                const membership_id = new Types.ObjectId(paymentManagement.membershipId);
                const response = await this.MembershipModel.findOne({ _id: membership_id });
                if (response) {
                    planData = response.toObject();
                }
            }

            if (paymentManagement.newMembershipId) {

                const membership_id = new Types.ObjectId(paymentManagement.newMembershipId);
                const response = await this.MembershipModel.findOne({ _id: membership_id });
                // const MembershipDetails = await this.MembershipModel.findById({ _id: membership_id });

                const now = moment();
                const expiryDate = now.clone().add(response.expiring_in, 'days');
                const membershipCount = await this.membershipBuyModel.countDocuments()
                const membershipPrice = response.price
                let discount = 0
                const activeMembership = await this.membershipBuyModel.findOne({
                    user_id: new Types.ObjectId(paymentManagement.userId),
                    status: 'paid',
                    is_expired: false,
                }).sort({ date: -1 });
                if (activeMembership) {
                    const oldMembershipData = await this.MembershipModel.findById(activeMembership.membership_id)
                    const oneDayPrice = oldMembershipData.price / Number(oldMembershipData.expiring_in)
                    const totalPriceRemaning = Number(oneDayPrice) * Number(activeMembership?.expire_in)
                    console.log(oneDayPrice, totalPriceRemaning, response.price, activeMembership?.expire_in, "oneDayPrice")
                    discount = totalPriceRemaning
                    response.price = response.price - discount
                    await this.membershipBuyModel.findByIdAndUpdate(activeMembership._id, {
                        $set: { is_expired: true },
                    });
                }
                const payableAmount = Math.round(Number(response.price) * 100);
                const saveData = {
                    membership_id: membership_id,
                    invoiceNo: `-M-${membershipCount + 1 + 17000}`,
                    user_id: new Types.ObjectId(paymentManagement.userId),
                    // status: 'notPaid',
                    renewal_date: expiryDate.format('YYYY-MM-DD'),
                    expire_in: response.expiring_in,
                    status: 'paid',
                    is_expired: false,
                    membership_price: Number(membershipPrice).toFixed(2),
                    discount: discount,
                    totalPrice: Number(response.price).toFixed(2)
                };
                const updatePayload: any = {};
                // await this.membershipBuyModel.findByIdAndUpdate({ _id: id }, { $set: updatePayload });
                const memberBuyManagement = new this.membershipBuyModel(saveData);
                const membershipBuy = await memberBuyManagement.save();

                if (response) {
                    planData = response.toObject();
                }
            }
            for (const [index, itemId] of paymentManagement.cartIds.entries()) {
                // console.log(paymentManagement.products,itemId,index,"itemId")
                let cart = await this.cartManagementModel.aggregate([{
                    $match: { _id: new ObjectId(itemId) }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "productId",
                        foreignField: "_id",
                        as: "productDetails"
                    }
                },
                { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "masters", // Adjust collection name as needed
                        localField: "productDetails.category",
                        foreignField: "_id",
                        as: "productData"
                    }
                },
                { $unwind: { path: "$productData", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        userId: 1,
                        productId: 1,
                        quantity: 1,
                        minOrderQuantity: "$productDetails.minOrderQuantity",
                        maxOrderQuantity: "$productDetails.maxOrderQuantity",
                        stock: "$productDetails.stock",
                        price: "$productDetails.price",
                        productName: "$productDetails.productName",
                        productBrand: "$productData.name",
                        category: "$productDetails.category"
                    }
                }])
                totalPrice += cart[0]['price'] * cart[0]['quantity']
                console.log(cart, "ccccccccccc")
                // const productData = await this.productManagementModel.findById({ _id: new ObjectId(cart[0].productId) })
                // console.log(cart[0].minOrderQuantity > cart[0].quantity, cart[0].minOrderQuantity, cart[0].quantity, "cart[0].minOrderQuantity > cart[0].quantity")
                // console.log(cart[0].maxOrderQuantity < cart[0].quantity, cart[0].maxOrderQuantity, cart[0].quantity, "cart[0].maxOrderQuantity < cart[0].quantity")

                const prodCategoryId = cart[0]?.category;

                if (paymentManagement.membershipId) {
                    const matchedCategory = planData.product_categories.find((cat) => {
                        const catId =
                            cat?.category_id?._id || cat?.category_id || cat?.category;
                        return String(catId) === String(prodCategoryId);
                    });

                    if (matchedCategory) {
                        const discountPercent = matchedCategory.discount || 0;
                        const originalPrice = cart[0]['price'] * cart[0]['quantity'];
                        discountedPrice =
                            ((originalPrice * discountPercent) / 100) + discountedPrice;
                    }
                }
                if (cart[0].minOrderQuantity > cart[0].quantity) {
                    return { messages: `${cart[0].minOrderQuantity} Minimum order quantity required` }
                } else if (cart[0].maxOrderQuantity < cart[0].quantity) {
                    return { messages: `You can order maximum ${cart[0].maxOrderQuantity} quantity` }
                } else if (cart[0].stock < cart[0].quantity) {
                    return { messages: `Only ${cart[0].stock} items are in stock` }
                } else {
                    cartItems.push({ _id: new ObjectId(cart[0]['productId']), quantity: cart[0]['quantity'], productPrice: cart[0]['price'], productName: cart[0]['productName'], productBrand: cart[0]['productBrand'] })
                }
                // console.log(paymentManagement, "paymentManagement")
                if (index + 1 === paymentManagement.cartIds.length) {
                    let discount = 0
                    let grandTotal = totalPrice + Number(paymentManagement.deliveryCharge)
                    let couponData
                    if (paymentManagement?.coupanId) {
                        const data = await this.couponManagementModel.findOne({ couponCode: paymentManagement.coupanId })
                        couponData = data.toObject()
                        let dis = 0

                        if (couponData.discountType == "percentage") {
                            dis = (couponData.discountValue / 100) * totalPrice
                        } else {
                            dis = couponData.discountValue + discountedPrice
                        }
                        discount = couponData.maxDiscount && dis > couponData.maxDiscount ? couponData?.maxDiscount + discountedPrice : dis

                        grandTotal = totalPrice - discount + Number(paymentManagement.deliveryCharge)
                    } else {
                        grandTotal = totalPrice - discountedPrice + Number(paymentManagement.deliveryCharge)
                        discount = discountedPrice
                    }
                    const orderCount = await this.orderManagementModel.countDocuments();
                    let saveData = {
                        cartIds: paymentManagement.cartIds,
                        orderItems: cartItems,
                        userId: new ObjectId(paymentManagement.userId),
                        invoiceNo: `-S-${orderCount + 1 + 17000}`,
                        totalAmount: totalPrice,
                        discountAmount: discount,
                        grandTotal: grandTotal,
                        couponId: paymentManagement?.coupanId ? paymentManagement.coupanId : null,
                        coupanTittle: couponData?.title,
                        addressId: paymentManagement?.addressId ? new ObjectId(paymentManagement.addressId) : null,
                        deliveryCharge: Number(paymentManagement.deliveryCharge),
                        billingAddress1: paymentManagement.billingAddress1,
                        billingAddress2: paymentManagement.billingAddress2,
                        shippingId: paymentManagement.shippingId,
                        pickupDate: paymentManagement.pickupDate,
                        carrier: paymentManagement.carrier,
                        membershipId: paymentManagement.membershipId ? new ObjectId(paymentManagement.membershipId) : null
                    }
                    console.log(saveData, "sssssssssss")
                    if (paymentManagement.paymentMethod === 'offline') {
                        saveData['paymentMethod'] = 'offline'
                        // saveData['status'] = 'paid'
                    }
                    const orderManagement = new this.orderManagementModel(saveData);
                    const newOrder = await orderManagement.save();
                    console.log(totalPrice, paymentManagement.deliveryCharge, discount, "ddddddis")
                    let session
                    if (paymentManagement.paymentMethod !== 'offline') {
                        let payableAmomunt = parseFloat(((totalPrice + Number(paymentManagement.deliveryCharge) - discount) * 100).toFixed(2))
                        session = await this.stripe.checkout.sessions.create({
                            line_items: [
                                {
                                    price_data: {
                                        currency: currency,
                                        product_data: {
                                            name: description,
                                        },
                                        unit_amount: payableAmomunt,
                                    },
                                    quantity: 1,
                                },
                            ],
                            payment_intent_data: {
                                metadata: {
                                    id: `${newOrder._id}`,
                                    type: 'shop'
                                }
                            },
                            mode: 'payment',
                            success_url: `${process.env.BASE_URL}/order-management/paymentSuccessForPractitioner/${newOrder._id}`,  // URL after successful payment
                            // cancel_url: `https://doyoursurvey.com/cancel`,    // URL if payment is canceled
                        });
                        console.log(session, "session")
                        await this.orderManagementModel.findByIdAndUpdate({ _id: new ObjectId(newOrder._id) }, { $set: { paymentSessionId: session.id || "" } })
                    } else {
                        // await this.paymentSuccess(newOrder._id)
                    }

                    // return session.url;
                    if (paymentManagement.paymentMethod == 'offline') {
                        // return {
                        //     message: 'Order placed',
                        //     statusCode: 200,
                        //     paymentUrl: session?.url,
                        //     orderId: newOrder._id
                        // };
                        if (newOrder.pickupDate != null) {

                            const cartItems = await this.cartManagementModel.find({
                                _id: { $in: newOrder.cartIds.map(p => new ObjectId(p)) },
                                // userId: new ObjectId(orderData.userId),
                            });
                            console.log(cartItems, "dasdadad");
                            const bulkOperations = [];
                            for (const cartItem of cartItems) {
                                const productIds = Array.isArray(cartItem.productId) ? cartItem.productId : [cartItem.productId];

                                for (const productId of productIds) {

                                    bulkOperations.push({
                                        updateOne: {
                                            filter: { _id: new ObjectId(productId) },
                                            update: {
                                                $inc: {
                                                    stock: -cartItem.quantity, // Reduce stock
                                                    buy_count: +cartItem.quantity // Increase buy_cart
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                            if (bulkOperations.length > 0) {
                                const update = await this.productManagementModel.bulkWrite(bulkOperations);
                                await this.cartManagementModel.deleteMany({
                                    _id: { $in: newOrder.cartIds.map(p => new ObjectId(p)) }
                                });

                                const updatedOrder = await this.orderManagementModel.findByIdAndUpdate(
                                    newOrder._id,
                                    {
                                        $set: {
                                            status: "paid",
                                            // tracking_number: tracking,
                                            // shipping_label_url: labelUrl
                                        }
                                    }, { new: true }
                                );
                                // console.log(updatedOrder, 'ttttttt')
                                const updatedIds = bulkOperations.map(op => op.updateOne.filter._id);

                                // fetch updated documents 
                                const updatedProducts = await this.productManagementModel.find({
                                    _id: { $in: updatedIds }
                                });
                                this.sendMailsForLowStock(updatedProducts)
                                try {
                                    const user = await this.userModel.findById(newOrder.userId).lean();
                                    if (user) {
                                        const userEmail = user.email;
                                        const userName = user.name || 'Customer';
                                        const amount = Number(newOrder.grandTotal) || 0;
                                        const paymentModeDisplay = newOrder.paymentMethod === 'offline' ? 'Offline' : 'Online (Card)';
                                        const orderIdStr = String(newOrder.invoiceNo);
                                        const orderDateTime = newOrder.created_at
                                            ? moment(newOrder.created_at).format('MMMM D, YYYY HH:mm')
                                            : moment().format('MMMM D, YYYY HH:mm');
                                        const productList = newOrder.orderItems || [];
                                        const orderFullData = await this.orderManagementModel.aggregate([{ $match: { _id: newOrder?._id } },
                                        {
                                            $lookup: {
                                                from: 'users',
                                                localField: 'userId',
                                                foreignField: '_id',
                                                as: 'userInfo'
                                            }
                                        },
                                        { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },])
                                        // Only send "Order placed" confirmation when shippingId is present and pickupDate is not set
                                        if (userEmail) {//orderData.shippingId && !orderData.pickupDate && userEmail) {


                                            const footerData = await this.masterModel.findOne({ dropdown_type: "footer_data" })
                                            const d = sendOrderConfirmationEmail(
                                                userEmail,
                                                userName,
                                                `Ved${orderIdStr}`,
                                                productList || [],
                                                amount,
                                                paymentModeDisplay,
                                                orderFullData[0],
                                                footerData
                                            );
                                            console.log(d, "mail replay")
                                        }

                                        // Always send new order notification to admin
                                        sendNewOrderAdminEmail(
                                            `Ved${orderIdStr}`,
                                            userName,
                                            userEmail || "",
                                            amount,
                                            paymentModeDisplay,
                                            orderDateTime,
                                            productList || [],
                                            orderFullData[0]
                                        );
                                    }
                                } catch (emailErr) {
                                    console.error('Order-related emails failed:', emailErr);
                                }
                                return {
                                    message: 'Order placed',
                                    statusCode: 200,
                                    paymentUrl: `${process.env.FRONTEND_URL}/Employee-Portal/components/Thankyou`
                                };
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.log(error)
            throw new Error(`Error creating checkout session: ${error.message}`);
        }
    }


    async createPractitonerPaymentLink(paymentManagement): Promise<any> {
        try {
            let currency = 'usd'
            let description = 'string'
            let totalPrice = 0
            let cartItems = []
            // const cart = await this.cartManagementModel.findById({ _id: new ObjectId("67da66b3b74b7286d5072dd0") })
            // console.log(cart, "ccccccccccc")
            let planData
            let discountedPrice = 0
            if (paymentManagement.membershipId) {
                const response = await this.MembershipModel.findOne({ _id: new Types.ObjectId(paymentManagement.membershipId) });

                if (response) {
                    planData = response.toObject();
                }

                if (paymentManagement.newMembershipId) {
                    totalPrice += planData.price
                }
            }
            for (const [index, itemId] of paymentManagement.cartIds.entries()) {
                // console.log(paymentManagement.products,itemId,index,"itemId")
                let cart = await this.cartManagementModel.aggregate([{
                    $match: { _id: new ObjectId(itemId) }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "productId",
                        foreignField: "_id",
                        as: "productDetails"
                    }
                },
                { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "masters", // Adjust collection name as needed
                        localField: "productDetails.category",
                        foreignField: "_id",
                        as: "productData"
                    }
                },
                { $unwind: { path: "$productData", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        userId: 1,
                        productId: 1,
                        quantity: 1,
                        minOrderQuantity: "$productDetails.minOrderQuantity",
                        maxOrderQuantity: "$productDetails.maxOrderQuantity",
                        stock: "$productDetails.stock",
                        price: "$productDetails.price",
                        productName: "$productDetails.productName",
                        productBrand: "$productData.name",
                        category: "$productDetails.category"
                    }
                }])
                totalPrice += cart[0]['price'] * cart[0]['quantity']
                console.log(cart, "ccccccccccc")
                // const productData = await this.productManagementModel.findById({ _id: new ObjectId(cart[0].productId) })
                // console.log(cart[0].minOrderQuantity > cart[0].quantity, cart[0].minOrderQuantity, cart[0].quantity, "cart[0].minOrderQuantity > cart[0].quantity")
                // console.log(cart[0].maxOrderQuantity < cart[0].quantity, cart[0].maxOrderQuantity, cart[0].quantity, "cart[0].maxOrderQuantity < cart[0].quantity")

                const prodCategoryId = cart[0]?.category;

                if (paymentManagement.membershipId) {
                    const matchedCategory = planData.product_categories.find((cat) => {
                        const catId =
                            cat?.category_id?._id || cat?.category_id || cat?.category;
                        return String(catId) === String(prodCategoryId);
                    });
                    console.log(matchedCategory, "matchedCategory")
                    if (matchedCategory) {
                        const discountPercent = matchedCategory.discount || 0;
                        const originalPrice = cart[0]['price'] * cart[0]['quantity'];
                        discountedPrice =
                            ((originalPrice * discountPercent) / 100) + discountedPrice;
                        console.log(discountedPrice, discountPercent, originalPrice, "discountedPrice")
                    }
                }
                if (cart[0].minOrderQuantity > cart[0].quantity) {
                    return { messages: `${cart[0].minOrderQuantity} Minimum order quantity required` }
                } else if (cart[0].maxOrderQuantity < cart[0].quantity) {
                    return { messages: `You can order maximum ${cart[0].maxOrderQuantity} quantity` }
                } else if (cart[0].stock < cart[0].quantity) {
                    return { messages: `Only ${cart[0].stock} items are in stock` }
                } else {
                    cartItems.push({ _id: new ObjectId(cart[0]['productId']), quantity: cart[0]['quantity'], productPrice: cart[0]['price'], productName: cart[0]['productName'], productBrand: cart[0]['productBrand'] })
                }
                // console.log(paymentManagement, "paymentManagement")
                if (index + 1 === paymentManagement.cartIds.length) {
                    let discount = 0
                    let grandTotal = totalPrice + Number(paymentManagement.deliveryCharge)
                    let couponData
                    if (paymentManagement?.coupanId) {
                        const data = await this.couponManagementModel.findOne({ couponCode: paymentManagement.coupanId })
                        couponData = data.toObject()
                        let dis = 0

                        if (couponData.discountType == "percentage") {
                            dis = (couponData.discountValue / 100) * totalPrice
                        } else {
                            dis = couponData.discountValue + discountedPrice
                        }
                        discount = couponData.maxDiscount && dis > couponData.maxDiscount ? couponData?.maxDiscount : dis

                        grandTotal = totalPrice - discount + Number(paymentManagement.deliveryCharge)
                    } else {
                        grandTotal = totalPrice - discountedPrice + Number(paymentManagement.deliveryCharge)
                        discount = discountedPrice
                    }
                    const orderCount = await this.orderManagementModel.countDocuments();
                    let saveData = {
                        cartIds: paymentManagement.cartIds,
                        orderItems: cartItems,
                        userId: new ObjectId(paymentManagement.userId),
                        invoiceNo: `-S-${orderCount + 1 + 17000}`,
                        totalAmount: totalPrice,
                        discountAmount: discount,
                        grandTotal: grandTotal,
                        couponId: paymentManagement?.coupanId ? paymentManagement.coupanId : null,
                        coupanTittle: couponData?.title,
                        addressId: paymentManagement?.addressId ? new ObjectId(paymentManagement.addressId) : null,
                        deliveryCharge: Number(paymentManagement.deliveryCharge),
                        billingAddress1: paymentManagement.billingAddress1,
                        billingAddress2: paymentManagement.billingAddress2,
                        shippingId: paymentManagement.shippingId,
                        pickupDate: paymentManagement.pickupDate,
                        carrier: paymentManagement.carrier,
                        membershipId: paymentManagement.newMembershipId ? new ObjectId(paymentManagement.newMembershipId) : null
                    }
                    console.log(saveData, "sssssssssss")
                    if (paymentManagement.paymentMethod === 'offline') {
                        saveData['paymentMethod'] = 'offline'
                        saveData['status'] = 'paid'
                    }
                    const orderManagement = new this.orderManagementModel(saveData);
                    const newOrder = await orderManagement.save();
                    console.log(totalPrice, paymentManagement.deliveryCharge, discount, "ddddddis")
                    let session
                    if (paymentManagement.paymentMethod !== 'offline') {
                        let payableAmomunt = Math.max(0, parseFloat(((totalPrice + Number(paymentManagement.deliveryCharge) - discount) * 100).toFixed(2)))
                        // session = await this.stripe.checkout.sessions.create({
                        //     line_items: [
                        //         {
                        //             price_data: {
                        //                 currency: currency,
                        //                 product_data: {
                        //                     name: description,
                        //                 },
                        //                 unit_amount: payableAmomunt,
                        //             },
                        //             quantity: 1,
                        //         },
                        //     ],
                        //     payment_intent_data: {
                        //         metadata: {
                        //             id: `${newOrder._id}`,
                        //             type: 'shop'
                        //         }
                        //     },
                        //     mode: 'payment',
                        //     success_url: `${process.env.BASE_URL}/order-management/paymentSuccessForPractitioner/${newOrder._id}`,  // URL after successful payment
                        //     // cancel_url: `https://doyoursurvey.com/cancel`,    // URL if payment is canceled
                        // });
                        let lineItems: any[] = [];

                        /*
                        |--------------------------------------------------------------------------
                        | MEMBERSHIP RECURRING PRICE
                        |--------------------------------------------------------------------------
                        */

                        if (paymentManagement.newMembershipId) {
                            lineItems.push({
                                price: planData.stripePriceId,
                                quantity: 1,
                            });
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | PRODUCTS (ONE TIME)
                        |--------------------------------------------------------------------------
                        */
                        console.log(cartItems, "cartItems")
                        for (const item of cartItems) {
                            lineItems.push({
                                price_data: {
                                    currency: currency,
                                    product_data: {
                                        name: item.productName,
                                    },
                                    unit_amount: Math.round(
                                        Number(item.productPrice) * 100
                                    ),
                                },

                                quantity: item.quantity,
                            });
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | DELIVERY CHARGE
                        |--------------------------------------------------------------------------
                        */
                        const userDetails = await this.userModel.findById(new ObjectId(paymentManagement.userId))
                        if (Number(paymentManagement.deliveryCharge) > 0) {
                            lineItems.push({
                                price_data: {
                                    currency: currency,
                                    product_data: {
                                        name: 'Delivery Charge',
                                    },
                                    unit_amount:
                                        Math.round(
                                            Number(paymentManagement.deliveryCharge) * 100
                                        ),
                                },
                                quantity: 1,
                            });
                        }
                        let stripeCouponId = null;

                        if (discount > 0) {
                            const coupon = await this.stripe.coupons.create({
                                amount_off: Math.round(discount * 100),
                                currency: currency,
                                duration: 'once',
                            });
                            stripeCouponId = coupon.id;
                        }
                        /*
                        |--------------------------------------------------------------------------
                        | CREATE STRIPE SESSION
                        |--------------------------------------------------------------------------
                        */

                        session = await this.stripe.checkout.sessions.create({
                            customer: userDetails.stripeCustomerId,
                            mode: paymentManagement.newMembershipId ? 'subscription' : 'payment',
                            line_items: lineItems,
                            discounts: stripeCouponId ? [{ coupon: stripeCouponId, },] : undefined,
                            subscription_data: paymentManagement.newMembershipId
                                ? {
                                    metadata: {
                                        type: 'membership',
                                        membershipId: paymentManagement.membershipId,
                                        orderId: newOrder._id.toString(),
                                        userId: paymentManagement.userId,
                                    },
                                } : undefined,

                            payment_intent_data: !paymentManagement.newMembershipId ? {
                                metadata: {
                                    id: `${newOrder._id}`,
                                    type: 'shop',
                                },
                            }
                                : undefined,

                            success_url: `${process.env.BASE_URL}/order-management/paymentSuccessForPractitioner/${newOrder._id}`,
                            // cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
                        });
                        console.log(session, "session")
                        await this.orderManagementModel.findByIdAndUpdate({ _id: new ObjectId(newOrder._id) }, { $set: { paymentSessionId: session.id || "" } })
                    } else {
                        await this.paymentSuccess(newOrder._id)
                    }

                    // return session.url;
                    if (paymentManagement.paymentMethod !== 'offline') {
                        return {
                            message: 'Order placed',
                            statusCode: 200,
                            paymentUrl: session?.url,
                            orderId: newOrder._id
                        };
                    }
                }
            }
        } catch (error) {
            console.log(error)
            throw new Error(`Error creating checkout session: ${error.message}`);
        }
    }

    async paymentSuccessForPractitioner(id) {
        try {
            const orderData = await this.orderManagementModel.findById(id);
            console.log(orderData, "orderData")
            if (!orderData) {
                // throw new Error("Order not found")
                return {
                    message: 'Order not found',
                    statusCode: 400
                };
            } else if (orderData?.status == 'paid') {
                // throw new Error("Order already placed")
                return {
                    message: 'Order already placed',
                    statusCode: 400
                };
            } else if (orderData.pickupDate != null) {

            }
            let transaction
            if (orderData.pickupDate == null) {
                transaction = await axios.post('https://api.goshippo.com/transactions', {
                    rate: orderData.shippingId,
                    label_file_type: 'PDF',
                    async: false
                }, {
                    headers: {
                        Authorization: process.env.SHIPPOKEY,
                        'Content-Type': 'application/json'
                    }
                });
            }
            console.log(transaction?.data, "transaction")
            if (transaction?.data?.status === 'SUCCESS' || orderData.pickupDate != null) {
                const tracking = transaction?.data.tracking_number || null;
                const labelUrl = transaction?.data.label_url || null;
                const cartItems = await this.cartManagementModel.find({
                    _id: { $in: orderData.cartIds.map(p => new ObjectId(p)) },
                    // userId: new ObjectId(orderData.userId),
                });
                console.log(cartItems, "dasdadad");
                const bulkOperations = [];
                for (const cartItem of cartItems) {
                    const productIds = Array.isArray(cartItem.productId) ? cartItem.productId : [cartItem.productId];

                    for (const productId of productIds) {

                        bulkOperations.push({
                            updateOne: {
                                filter: { _id: new ObjectId(productId) },
                                update: {
                                    $inc: {
                                        stock: -cartItem.quantity, // Reduce stock
                                        buy_count: +cartItem.quantity // Increase buy_cart
                                    }
                                }
                            }
                        });
                    }
                }
                if (bulkOperations.length > 0) {
                    const update = await this.productManagementModel.bulkWrite(bulkOperations);
                    await this.cartManagementModel.deleteMany({
                        _id: { $in: orderData.cartIds.map(p => new ObjectId(p)) }
                    });
                    // const session = await this.stripe.checkout.sessions.retrieve(orderData.paymentSessionId, {
                    //     expand: ['payment_intent']
                    //   });

                    //   const paymentIntentId = session.payment_intent['id'];

                    //   const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId, {
                    //     expand: ['charges']
                    //   });
                    //   console.log(paymentIntent,"paymentIntentpaymentIntent")
                    //   const charge = paymentIntent['charges'].data[0];
                    //   console.log(charge,"chargecharge")
                    //   const last4 = charge.payment_method_details.card.last4;
                    //   const brand = charge.payment_method_details.card.brand;

                    //   console.log('Card Brand:', brand);
                    //   console.log('Last 4:', last4);
                    //   if (paymentIntent && paymentIntent.charges.data.length > 0) {
                    //     const card = paymentIntent.charges.data[0].payment_method_details.card;
                    //     console.log("Card brand:", card.brand);      // e.g., 'visa'
                    //     console.log("Last 4 digits:", card.last4);   // e.g., '4242'
                    //   }

                    if (orderData?.membershipId) {
                        const membership_id = orderData?.membershipId;
                        const response = await this.MembershipModel.findOne({ _id: membership_id });
                        console.log(response, "responseresponse")
                        // const MembershipDetails = await this.MembershipModel.findById({ _id: membership_id });
                        const membershipPrice = response.price
                        let discount = 0
                        const now = moment();
                        const expiryDate = now.clone().add(response.expiring_in, 'days');
                        const membershipCount = await this.membershipBuyModel.countDocuments()
                        const activeMembership = await this.membershipBuyModel.findOne({
                            user_id: new Types.ObjectId(orderData.userId),
                            status: 'paid',
                            is_expired: false,
                        }).sort({ date: -1 });
                        if (activeMembership) {
                            const oldMembershipData = await this.MembershipModel.findById(activeMembership.membership_id)
                            const oneDayPrice = oldMembershipData.price / Number(oldMembershipData.expiring_in)
                            const totalPriceRemaning = Number(oneDayPrice) * Number(activeMembership?.expire_in)
                            console.log(oneDayPrice, totalPriceRemaning, response.price, activeMembership?.expire_in, "oneDayPrice")
                            discount = totalPriceRemaning
                            response.price = response.price - discount
                            await this.membershipBuyModel.findByIdAndUpdate(activeMembership._id, {
                                $set: { is_expired: true },
                            });
                        }
                        const payableAmount = Math.round(Number(response.price) * 100);

                        const saveData = {
                            membership_id: membership_id,
                            invoiceNo: `-M-${membershipCount + 1 + 17000}`,
                            user_id: new Types.ObjectId(orderData.userId),
                            // status: 'notPaid',
                            renewal_date: expiryDate.format('YYYY-MM-DD'),
                            expire_in: response.expiring_in,
                            status: 'paid',
                            is_expired: false,
                            membership_price: Number(membershipPrice).toFixed(2),
                            discount: discount,
                            totalPrice: Number(response.price).toFixed(2)
                        };
                        const updatePayload: any = {};
                        // await this.membershipBuyModel.findByIdAndUpdate({ _id: id }, { $set: updatePayload });
                        const memberBuyManagement = new this.membershipBuyModel(saveData);
                        const membershipBuy = await memberBuyManagement.save();
                    }
                    let updateOrderData = {
                        status: "paid",
                        tracking_number: tracking,
                        shipping_label_url: labelUrl
                    }
                    if (orderData.pickupDate != null) {
                        // updateOrderData = {
                        //     ...updateOrderData, ...{
                        //         orderStatus: "orderReady",//"orderPickedUp",
                        //         orderPackDate: new Date(),
                        //         orderReadyDate: new Date(),
                        //         // pickupDoneDate: new Date()
                        //     }
                        // }

                    }
                    const updatedOrder = await this.orderManagementModel.findByIdAndUpdate(
                        id,
                        {
                            $set: updateOrderData
                        }, { new: true }
                    );
                    // console.log(updatedOrder, 'ttttttt')
                    const updatedIds = bulkOperations.map(op => op.updateOne.filter._id);

                    // fetch updated documents 
                    const updatedProducts = await this.productManagementModel.find({
                        _id: { $in: updatedIds }
                    });
                    this.sendMailsForLowStock(updatedProducts);
                    // Send order-related emails (same logic as paymentSuccess)
                    try {
                        const user = await this.userModel.findById(orderData.userId).lean();
                        if (user) {
                            const userEmail = user.email;
                            const userName = user.name || 'Customer';
                            const amount = Number(orderData.grandTotal) || 0;
                            const paymentModeDisplay = orderData.paymentMethod === 'offline' ? 'Offline' : 'Online (Card)';
                            const orderIdStr = String(orderData.invoiceNo);
                            const orderDateTime = orderData.created_at
                                ? moment(orderData.created_at).format('MMMM D, YYYY HH:mm')
                                : moment().format('MMMM D, YYYY HH:mm');
                            const productList = orderData.orderItems || [];
                            const orderFullData = await this.orderManagementModel.aggregate([{ $match: { _id: new Types.ObjectId(id) } },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'userId',
                                    foreignField: '_id',
                                    as: 'userInfo'
                                }
                            },
                            { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },])
                            // Only send "Order placed" confirmation when shippingId is present and pickupDate is not set
                            if (orderData.shippingId && !orderData.pickupDate && userEmail) {
                                // const productList = (orderData.orderItems || [])
                                //     .map((item: { productName?: string; quantity?: number }) => `${item.productName || 'Item'} x ${item.quantity ?? 1}`)
                                //     .join(', ');

                                const footerData = await this.masterModel.findOne({ dropdown_type: "footer_data" })
                                await sendOrderConfirmationEmail(
                                    userEmail,
                                    userName,
                                    `Ved${orderIdStr}`,
                                    productList || [],
                                    amount,
                                    paymentModeDisplay,
                                    orderFullData[0],
                                    footerData
                                );
                            }

                            // Always send new order notification to admin
                            sendNewOrderAdminEmail(
                                `Ved${orderIdStr}`,
                                userName,
                                userEmail || "",
                                amount,
                                paymentModeDisplay,
                                orderDateTime,
                                productList || [],
                                orderFullData[0]
                            );
                        }
                    } catch (emailErr) {
                        console.error('Order-related emails failed (practitioner):', emailErr);
                    }
                    return {
                        message: 'Order placed',
                        statusCode: 200,
                        paymentUrl: `${process.env.FRONTEND_URL}/Employee-Portal/components/Thankyou`
                    };
                }
            } else {
                return {
                    message: 'Failed to place order',
                    statusCode: 400
                };
            }
        } catch (error) {
            console.log(error, "eeeeeeeeee")
            // throw new Error(error.message);
            return {
                message: 'Something went wrong',
                statusCode: 400,
                error: error.message
            };
        }

    }

    // async getpaymentid(order: any): Promise<any> {
    //     try {
    //         console.log(order, "orderorderorder")
    //         const result = await this.orderManagementModel.aggregate([{ $match: { _id: new Types.ObjectId(order.orderId) } },
    //         {
    //             $lookup: {
    //                 from: 'coupons',
    //                 localField: 'couponId',
    //                 foreignField: 'couponCode',
    //                 as: 'couponData'
    //             }
    //         },
    //         { $unwind: { path: '$couponData', preserveNullAndEmptyArrays: true } },
    //         ])
    //         let orderData = result[0]
    //         if (orderData.paymentSessionId) {
    //             console.log(orderData, "orderData")

    //             const paymentIntent = await this.stripe.checkout.sessions.retrieve(orderData.paymentSessionId);
    //             // 'cs_test_a1kpK1t9F2chN7xF1hrNJUXLQdGAhNh6oZdcXm66UR0dLLTFwUkMFzvpJw'
    //             // const paymentIntent = await this.stripe.paymentIntents.retrieve('cs_test_a1mNAwE50qQSgE1mnrcJNy3HhxhOk8gStswAv2kmGDZg4iCvEPs9rFHgS9');

    //             console.log(paymentIntent.status); // e.g., 'succeeded'
    //             console.log(paymentIntent.payment_intent);
    //             let paymentIntentId = paymentIntent.payment_intent;

    //             if (typeof paymentIntentId === 'string') {
    //                 const totalAmount = order.selectedProducts?.reduce((sum, product) => sum + product.productPrice, 0) || 0;
    //                 let discount = 0
    //                 if (orderData.discountAmount) {
    //                     let dis = 0
    //                     const couponData = orderData.couponData
    //                     if (couponData.discountType == "percentage") {
    //                         dis = (couponData.discountValue / 100) * orderData.totalPrice
    //                     } else {
    //                         dis = couponData.discountValue
    //                     }
    //                     discount = couponData.maxDiscount && dis > couponData.maxDiscount ? couponData?.maxDiscount : dis
    //                 }
    //                 const refund = await this.stripe.refunds.create({
    //                     payment_intent: paymentIntentId,
    //                     amount: totalAmount - discount, // amount in cents, optional
    //                 });
    //                 console.log(refund, "refund", discount);
    //                 if (refund.status == 'succeeded') {
    //                     await Promise.all(
    //                         order.selectedProducts.map(product =>
    //                             this.productManagementModel.findByIdAndUpdate(
    //                                 { _id: ObjectId(product._id) },
    //                                 {
    //                                     $inc: {
    //                                         stock: +product.quantity,
    //                                         buy_count: -product.quantity
    //                                     }
    //                                 }
    //                             )
    //                         )
    //                     );
    //                     return {
    //                         message: 'Order data successfully fetched!',
    //                         statusCode: 200,

    //                     };
    //                 } else {
    //                     return {
    //                         message: `Order status ${refund.status}`,
    //                         statusCode: 204,

    //                     };
    //                 }
    //             } else {
    //                 console.log('Payment not completed or intent not created yet');
    //             }

    //         }
    //         else {
    //             return {
    //                 message: 'This order cannot be refunded may be payment not paid.',
    //                 statusCode: 404,

    //             };
    //         }

    //     } catch (error) {
    //         console.error('Error fetching orderManagementData:', error);
    //         return {
    //             message: 'An error occurred while fetching the order data',
    //             statusCode: 500,
    //             error: error.message,
    //         };
    //     }
    // }

    async createAdminPaymentLink(paymentManagement): Promise<any> {
        try {
            let currency = 'usd'
            let description = 'string'
            let totalPrice = 0
            let cartItems = []
            let bookedAppts = []
            let lineItems: any[] = [];
            // const cart = await this.cartManagementModel.findById({ _id: new ObjectId("67da66b3b74b7286d5072dd0") })
            // console.log(cart, "ccccccccccc")
            let planData
            if (paymentManagement.membershipId) {
                const response = await this.MembershipModel.findOne({ _id: new Types.ObjectId(paymentManagement.membershipId) });

                if (response) {
                    planData = response.toObject();
                }

                if (paymentManagement.newMembershipId) {
                    // totalPrice += planData.price
                }
            }
            if (paymentManagement.newMembershipId) {

                const membership_id = new Types.ObjectId(paymentManagement.membershipId);
                const response = await this.MembershipModel.findOne({ _id: membership_id });
                // const MembershipDetails = await this.MembershipModel.findById({ _id: membership_id });

                const now = moment();
                const membershipPrice = response.price
                let discount = 0
                const expiryDate = now.clone().add(response.expiring_in, 'days');
                const membershipCount = await this.membershipBuyModel.countDocuments()
                const activeMembership = await this.membershipBuyModel.findOne({
                    user_id: new Types.ObjectId(paymentManagement.userId),
                    status: 'paid',
                    is_expired: false,
                }).sort({ date: -1 });
                if (activeMembership) {
                    const oldMembershipData = await this.MembershipModel.findById(activeMembership.membership_id)
                    const oneDayPrice = oldMembershipData.price / Number(oldMembershipData.expiring_in)
                    const totalPriceRemaning = Number(oneDayPrice) * Number(activeMembership?.expire_in)
                    console.log(oneDayPrice, totalPriceRemaning, response.price, activeMembership?.expire_in, "oneDayPrice")
                    discount = totalPriceRemaning
                    response.price = response.price - discount
                    await this.membershipBuyModel.findByIdAndUpdate(activeMembership._id, {
                        $set: { is_expired: true },
                    });
                }
                const payableAmount = Math.round(Number(response.price) * 100);
                totalPrice += response.price
                const saveData = {
                    membership_id: membership_id,
                    invoiceNo: `-M-${membershipCount + 1 + 17000}`,
                    user_id: new Types.ObjectId(paymentManagement.userId),
                    status: 'notPaid',
                    renewal_date: expiryDate.format('YYYY-MM-DD'),
                    expire_in: response.expiring_in,
                    is_expired: false,
                    membership_price: Number(membershipPrice).toFixed(2),
                    discount: discount,
                    totalPrice: Number(response.price).toFixed(2)
                };
                const updatePayload: any = {};
                // await this.membershipBuyModel.findByIdAndUpdate({ _id: id }, { $set: updatePayload });
                const memberBuyManagement = new this.membershipBuyModel(saveData);
                const membershipBuy = await memberBuyManagement.save();

                if (response) {
                    planData = response.toObject();
                }
            }
            let discountedPrice = 0
            for (const [index, itemId] of paymentManagement.cartIds.entries()) {
                // console.log(paymentManagement.products,itemId,index,"itemId")
                let cart = await this.cartManagementModel.aggregate([{
                    $match: { _id: new ObjectId(itemId) }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "productId",
                        foreignField: "_id",
                        as: "productDetails"
                    }
                },
                { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "masters", // Adjust collection name as needed
                        localField: "productDetails.category",
                        foreignField: "_id",
                        as: "productData"
                    }
                },
                { $unwind: { path: "$productData", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        userId: 1,
                        productId: 1,
                        quantity: 1,
                        type: 1,
                        appointmentId: 1,
                        minOrderQuantity: "$productDetails.minOrderQuantity",
                        maxOrderQuantity: "$productDetails.maxOrderQuantity",
                        stock: "$productDetails.stock",
                        price: "$productDetails.price",
                        productName: "$productDetails.productName",
                        productBrand: "$productData.name",
                        category: "$productDetails.category"
                    }
                }])
                if (cart[0]?.type !== "appointment") {
                    totalPrice += cart[0]['price'] * cart[0]['quantity']
                    console.log(cart, "ccccccccccc")
                    // const productData = await this.productManagementModel.findById({ _id: new ObjectId(cart[0].productId) })
                    // console.log(cart[0].minOrderQuantity > cart[0].quantity, cart[0].minOrderQuantity, cart[0].quantity, "cart[0].minOrderQuantity > cart[0].quantity")
                    // console.log(cart[0].maxOrderQuantity < cart[0].quantity, cart[0].maxOrderQuantity, cart[0].quantity, "cart[0].maxOrderQuantity < cart[0].quantity")

                    const prodCategoryId = cart[0]?.category;

                    if (paymentManagement.membershipId) {
                        const matchedCategory = planData.product_categories.find((cat) => {
                            const catId =
                                cat?.category_id?._id || cat?.category_id || cat?.category;
                            return String(catId) === String(prodCategoryId);
                        });
                        console.log(matchedCategory, "matchedCategory")
                        if (matchedCategory) {
                            const discountPercent = matchedCategory.discount || 0;
                            const originalPrice = cart[0]['price'] * cart[0]['quantity'];
                            discountedPrice =
                                ((originalPrice * discountPercent) / 100) + discountedPrice;
                            console.log(discountedPrice, discountPercent, originalPrice, "discountedPrice")
                        }
                    }
                    if (cart[0].minOrderQuantity > cart[0].quantity) {
                        return { messages: `${cart[0].minOrderQuantity} Minimum order quantity required` }
                    } else if (cart[0].maxOrderQuantity < cart[0].quantity) {
                        return { messages: `You can order maximum ${cart[0].maxOrderQuantity} quantity` }
                    } else if (cart[0].stock < cart[0].quantity) {
                        return { messages: `Only ${cart[0].stock} items are in stock` }
                    } else {
                        cartItems.push({ _id: new ObjectId(cart[0]['productId']), quantity: cart[0]['quantity'], productPrice: cart[0]['price'], productName: cart[0]['productName'], productBrand: cart[0]['productBrand'] })
                    }
                } else {

                    const appointments = await this.appointmentModel.findById({ _id: new Types.ObjectId(cart[0].appointmentId) });
                    if (appointments.status == "paid") {
                        return { messages: `The appointment payment already received. Please remove appointment from cart then buy.` }
                    }
                    bookedAppts.push(cart[0].appointmentId)
                    if (appointments._id) {
                        lineItems.push({
                            //     price: appointments.price,
                            //     quantity: 1,
                            // });
                            price_data: {
                                currency: currency,
                                product_data: {
                                    name: "Appointment",
                                    description: "Appointment"
                                },
                                unit_amount: Math.round(
                                    Number(appointments.price) * 100
                                ),
                            },

                            quantity: 1,
                        })
                    }

                }
                if (index + 1 === paymentManagement.cartIds.length) {
                    let discount = 0
                    let grandTotal = totalPrice + Number(paymentManagement.deliveryCharge)
                    let couponData
                    if (paymentManagement?.coupanId) {
                        const data = await this.couponManagementModel.findOne({ couponCode: paymentManagement.coupanId })
                        couponData = data.toObject()
                        let dis = 0

                        if (couponData.discountType == "percentage") {
                            dis = (couponData.discountValue / 100) * totalPrice
                        } else {
                            dis = couponData.discountValue + discountedPrice
                        }
                        discount = couponData.maxDiscount && dis > couponData.maxDiscount ? couponData?.maxDiscount + discountedPrice : dis

                        console.log(discount, couponData.maxDiscount && dis > couponData.maxDiscount, dis, "paymentManagement")
                        console.log(couponData, "couponData")
                        grandTotal = totalPrice - discount + Number(paymentManagement.deliveryCharge)
                    } else if (paymentManagement?.adminDiscount) {
                        discount = paymentManagement?.adminDiscount ? Number(paymentManagement?.adminDiscount || 0) + discountedPrice : discountedPrice

                        grandTotal = totalPrice - discount + Number(paymentManagement.deliveryCharge)

                    } else {
                        grandTotal = totalPrice - discountedPrice + Number(paymentManagement.deliveryCharge)
                        discount = discountedPrice
                    }
                    const orderCount = await this.orderManagementModel.countDocuments();
                    let saveData = {
                        cartIds: paymentManagement.cartIds,
                        orderItems: cartItems,
                        userId: new ObjectId(paymentManagement.userId),
                        invoiceNo: `-S-${orderCount + 1 + 17000}`,
                        totalAmount: totalPrice,
                        discountAmount: discount,
                        adminDiscount: Number(paymentManagement?.adminDiscount || 0),
                        grandTotal: grandTotal,
                        couponId: paymentManagement?.coupanId ? paymentManagement.coupanId : null,
                        coupanTittle: couponData?.title,
                        addressId: paymentManagement?.addressId ? new ObjectId(paymentManagement.addressId) : null,
                        deliveryCharge: Number(paymentManagement.deliveryCharge),
                        billingAddress1: paymentManagement.billingAddress1,
                        billingAddress2: paymentManagement.billingAddress2,
                        billingCity: paymentManagement.billingCity,
                        billingState: paymentManagement.billingState,
                        billingCountry: paymentManagement.billingCountry,
                        billingZipcode: paymentManagement.billingZipcode,
                        shippingId: paymentManagement.shippingId,
                        pickupDate: paymentManagement.pickupDate,
                        carrier: paymentManagement.carrier,
                        membershipId: paymentManagement.newMembershipId ? new ObjectId(paymentManagement.newMembershipId) : null,
                        appointmentId: bookedAppts.length > 0 ? new ObjectId(bookedAppts[0]) : null
                    }
                    console.log(saveData, "sssssssssss")
                    if (paymentManagement.paymentMethod === 'offline') {
                        saveData['paymentMethod'] = 'offline'
                        saveData['status'] = 'paid'
                    }
                    const orderManagement = new this.orderManagementModel(saveData);
                    const newOrder = await orderManagement.save();
                    console.log(totalPrice, paymentManagement.deliveryCharge, discount, "ddddddis")
                    let session
                    if (paymentManagement.paymentMethod !== 'offline') {
                        let payableAmomunt = parseFloat(((totalPrice + Number(paymentManagement.deliveryCharge) - discount) * 100).toFixed(2))
                        // session = await this.stripe.checkout.sessions.create({
                        //     line_items: [
                        //         {
                        //             price_data: {
                        //                 currency: currency,
                        //                 product_data: {
                        //                     name: description,
                        //                 },
                        //                 unit_amount: payableAmomunt,
                        //             },
                        //             quantity: 1,
                        //         },
                        //     ],
                        //     payment_intent_data: {
                        //         metadata: {
                        //             id: `${newOrder._id}`,
                        //             type: 'shop'
                        //         }
                        //     },
                        //     mode: 'payment',
                        //     success_url: `${process.env.BASE_URL}/order-management/paymentSuccessForAdmin/${newOrder._id}`,  // URL after successful payment
                        //     // cancel_url: `https://doyoursurvey.com/cancel`,    // URL if payment is canceled
                        // });


                        /*
                        |--------------------------------------------------------------------------
                        | MEMBERSHIP RECURRING PRICE
                        |--------------------------------------------------------------------------
                        */

                        if (paymentManagement.newMembershipId) {
                            lineItems.push({
                                price: planData.stripePriceId,
                                quantity: 1,
                            });
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | PRODUCTS (ONE TIME)
                        |--------------------------------------------------------------------------
                        */
                        let stripePaymentDescription = ""
                        for (const [ind, item] of cartItems.entries()) {
                            lineItems.push({
                                price_data: {
                                    currency: currency,
                                    product_data: {
                                        name: item.productName,
                                        description: item.productName
                                    },
                                    unit_amount: Math.round(
                                        Number(item.productPrice) * 100
                                    ),
                                },

                                quantity: item.quantity,
                            });
                            if (ind == 0) {
                                stripePaymentDescription = `Shop-${item.productName}`
                            } else {
                                stripePaymentDescription = `${stripePaymentDescription},${item.productName}`
                            }
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | DELIVERY CHARGE
                        |--------------------------------------------------------------------------
                        */
                        const userDetails = await this.userModel.findById(new ObjectId(paymentManagement.userId))
                        if (Number(paymentManagement.deliveryCharge) > 0) {
                            lineItems.push({
                                price_data: {
                                    currency: currency,
                                    product_data: {
                                        name: 'Delivery Charge',
                                        description: 'Delivery Charge'
                                    },
                                    unit_amount:
                                        Math.round(
                                            Number(paymentManagement.deliveryCharge) * 100
                                        ),
                                },
                                quantity: 1,
                            });
                        }
                        let stripeCouponId = null;

                        if (discount > 0) {
                            const coupon = await this.stripe.coupons.create({
                                amount_off: Math.round(discount * 100),
                                currency: currency,
                                duration: 'once',
                            });
                            stripeCouponId = coupon.id;
                        }
                        /*
                        |--------------------------------------------------------------------------
                        | CREATE STRIPE SESSION
                        |--------------------------------------------------------------------------
                        */

                        session = await this.stripe.checkout.sessions.create({
                            customer: userDetails.stripeCustomerId,
                            mode: paymentManagement.newMembershipId ? 'subscription' : 'payment',
                            line_items: lineItems,
                            discounts: stripeCouponId ? [{ coupon: stripeCouponId, },] : undefined,
                            subscription_data: paymentManagement.NewMembershipId
                                ? {
                                    metadata: {
                                        type: 'membership',
                                        membershipId: paymentManagement.membershipId,
                                        orderId: newOrder._id.toString(),
                                        userId: paymentManagement.userId,
                                    },
                                } : undefined,

                            payment_intent_data: !paymentManagement.newMembershipId ? {
                                description: stripePaymentDescription,
                                metadata: {
                                    id: `${newOrder._id}`,
                                    type: 'shop',
                                },
                            }
                                : undefined,

                            success_url: `${process.env.BASE_URL}/order-management/paymentSuccessForAdmin/${newOrder._id}`,
                            cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
                        });
                        console.log(session, "session")
                        await this.orderManagementModel.findByIdAndUpdate({ _id: new ObjectId(newOrder._id) }, { $set: { paymentSessionId: session.id || "" } })
                    } else {
                        await this.paymentSuccess(newOrder._id)
                    }

                    // return session.url;
                    if (paymentManagement.paymentMethod !== 'offline') {
                        return {
                            message: 'Order placed',
                            statusCode: 200,
                            paymentUrl: session?.url,
                            orderId: newOrder._id
                        };
                    }
                }
            }
        } catch (error) {
            console.log(error)
            throw new Error(`Error creating checkout session: ${error.message}`);
        }
    }

    async paymentSuccessForAdmin(id) {
        try {
            const orderData = await this.orderManagementModel.findById(id);
            console.log(orderData, "orderData")
            if (!orderData) {
                // throw new Error("Order not found")
                return {
                    message: 'Order not found',
                    statusCode: 400
                };
            } else if (orderData?.status == 'paid') {
                // throw new Error("Order already placed")
                return {
                    message: 'Order already placed',
                    statusCode: 400
                };
            } else if (orderData.pickupDate != null) {

            }
            let transaction
            if (orderData.pickupDate == null) {
                transaction = await axios.post('https://api.goshippo.com/transactions', {
                    rate: orderData.shippingId,
                    label_file_type: 'PDF',
                    async: false
                }, {
                    headers: {
                        Authorization: process.env.SHIPPOKEY,
                        'Content-Type': 'application/json'
                    }
                });
            }
            console.log(transaction?.data, "transaction")
            if (transaction?.data?.status === 'SUCCESS' || orderData.pickupDate != null) {
                const tracking = transaction?.data.tracking_number || null;
                const labelUrl = transaction?.data.label_url || null;
                const cartItems = await this.cartManagementModel.find({
                    _id: { $in: orderData.cartIds.map(p => new ObjectId(p)) },
                    // userId: new ObjectId(orderData.userId),
                });
                console.log(cartItems, "dasdadad");
                const bulkOperations = [];
                for (const cartItem of cartItems) {
                    const productIds = Array.isArray(cartItem.productId) ? cartItem.productId : [cartItem.productId];

                    for (const productId of productIds) {

                        bulkOperations.push({
                            updateOne: {
                                filter: { _id: new ObjectId(productId) },
                                update: {
                                    $inc: {
                                        stock: -cartItem.quantity, // Reduce stock
                                        buy_count: +cartItem.quantity // Increase buy_cart
                                    }
                                }
                            }
                        });
                    }
                }
                if (bulkOperations.length > 0) {
                    const update = await this.productManagementModel.bulkWrite(bulkOperations);
                    await this.cartManagementModel.deleteMany({
                        _id: { $in: orderData.cartIds.map(p => new ObjectId(p)) }
                    });
                    // const session = await this.stripe.checkout.sessions.retrieve(orderData.paymentSessionId, {
                    //     expand: ['payment_intent']
                    //   });

                    //   const paymentIntentId = session.payment_intent['id'];

                    //   const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId, {
                    //     expand: ['charges']
                    //   });
                    //   console.log(paymentIntent,"paymentIntentpaymentIntent")
                    //   const charge = paymentIntent['charges'].data[0];
                    //   console.log(charge,"chargecharge")
                    //   const last4 = charge.payment_method_details.card.last4;
                    //   const brand = charge.payment_method_details.card.brand;

                    //   console.log('Card Brand:', brand);
                    //   console.log('Last 4:', last4);
                    //   if (paymentIntent && paymentIntent.charges.data.length > 0) {
                    //     const card = paymentIntent.charges.data[0].payment_method_details.card;
                    //     console.log("Card brand:", card.brand);      // e.g., 'visa'
                    //     console.log("Last 4 digits:", card.last4);   // e.g., '4242'
                    //   }

                    const membership_id = orderData.membershipId;
                    if (membership_id) {
                        const response = await this.MembershipModel.findOne({ _id: membership_id });
                        // const MembershipDetails = await this.MembershipModel.findById({ _id: membership_id });
                        console.log(response, "response")
                        const now = moment();
                        const membershipPrice = response.price
                        let discount = 0
                        const expiryDate = now.clone().add(response?.expiring_in, 'days');
                        const membershipCount = await this.membershipBuyModel.countDocuments()
                        const activeMembership = await this.membershipBuyModel.findOne({
                            user_id: new Types.ObjectId(orderData.userId),
                            status: 'paid',
                            is_expired: false,
                        }).sort({ date: -1 });
                        if (activeMembership) {
                            const oldMembershipData = await this.MembershipModel.findById(activeMembership.membership_id)
                            const oneDayPrice = oldMembershipData.price / Number(oldMembershipData.expiring_in)
                            const totalPriceRemaning = Number(oneDayPrice) * Number(activeMembership?.expire_in)
                            console.log(oneDayPrice, totalPriceRemaning, response.price, activeMembership?.expire_in, "oneDayPrice")
                            discount = totalPriceRemaning
                            response.price = response.price - discount
                            await this.membershipBuyModel.findByIdAndUpdate(activeMembership._id, {
                                $set: { is_expired: true },
                            });
                        }

                        const payableAmount = Math.round(Number(response.price) * 100);
                        const saveData = {
                            membership_id: membership_id,
                            invoiceNo: `-M-${membershipCount + 1 + 17000}`,
                            user_id: new Types.ObjectId(orderData.userId),
                            // status: 'notPaid',
                            renewal_date: expiryDate.format('YYYY-MM-DD'),
                            expire_in: response.expiring_in,
                            status: 'paid',
                            is_expired: false,
                            membership_price: Number(membershipPrice).toFixed(2),
                            discount: discount,
                            totalPrice: Number(response.price).toFixed(2)
                        };
                        const updatePayload: any = {};
                        // await this.membershipBuyModel.findByIdAndUpdate({ _id: id }, { $set: updatePayload });
                        const memberBuyManagement = new this.membershipBuyModel(saveData);
                        const membershipBuy = await memberBuyManagement.save();
                    }
                    if (orderData?.appointmentId) {
                        const appointments = await this.appointmentModel.findOneAndUpdate(
                            { _id: new Types.ObjectId(orderData?.appointmentId) },
                            { $set: { status: "paid" } },
                            { new: true }
                        );
                        console.log("data", appointments, "appointmentsappointmentsappointments");
                        if (appointments) {
                            try {
                                const user = await this.userModel.findById(appointments.userId).lean();
                                const employee = await this.employeeModel.findById(appointments.employeeId).lean();
                                const practitionerUser = employee?.userId ? await this.userModel.findById(employee.userId).lean() : null;
                                const center = appointments.centerId ? await this.centerModel.findById(appointments.centerId).lean() : null;
                                const venueOrLink = center ? (center.address || center.centerName || 'See appointment details') : 'See appointment details';
                                const mode = 'In-Person';
                                const dateStr = moment(appointments.date).format('MMMM D, YYYY');
                                const timeStr: string = String(appointments.time || 'See appointment details');
                                if (user?.email) {
                                    await sendAppointmentConfirmationEmail(
                                        user.email,
                                        user.name || 'Customer',
                                        practitionerUser?.name || 'Practitioner',
                                        dateStr,
                                        timeStr,
                                        mode,
                                        venueOrLink,
                                    );
                                }
                            } catch (emailErr) {
                                console.error('Appointment confirmation email failed:', emailErr);
                            }
                        }
                    }
                    let updateOrderData = {
                        status: "paid",
                        tracking_number: tracking,
                        shipping_label_url: labelUrl
                    }
                    if (orderData.pickupDate != null) {
                        // updateOrderData = {
                        //     ...updateOrderData, ...{
                        //         orderStatus: "orderReady",
                        //         orderPackDate: new Date(),
                        //         orderReadyDate: new Date(),
                        //         // pickupDoneDate: new Date()
                        //     }
                        // }

                    }
                    const updatedOrder = await this.orderManagementModel.findByIdAndUpdate(
                        id,
                        {
                            $set: updateOrderData,
                        }, { new: true }
                    );
                    // console.log(updatedOrder, 'ttttttt')
                    const updatedIds = bulkOperations.map(op => op.updateOne.filter._id);

                    // fetch updated documents 
                    const updatedProducts = await this.productManagementModel.find({
                        _id: { $in: updatedIds }
                    });
                    this.sendMailsForLowStock(updatedProducts);
                    // Send order-related emails (same logic as paymentSuccess)
                    try {
                        const user = await this.userModel.findById(orderData.userId).lean();
                        if (user) {
                            const userEmail = user.email;
                            const userName = user.name || 'Customer';
                            const amount = Number(orderData.grandTotal) || 0;
                            const paymentModeDisplay = orderData.paymentMethod === 'offline' ? 'Offline' : 'Online (Card)';
                            const orderIdStr = String(orderData.invoiceNo);
                            const orderDateTime = orderData.created_at
                                ? moment(orderData.created_at).format('MMMM D, YYYY HH:mm')
                                : moment().format('MMMM D, YYYY HH:mm');
                            const productList = orderData.orderItems || [];
                            const orderFullData = await this.orderManagementModel.aggregate([{ $match: { _id: new Types.ObjectId(id) } },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'userId',
                                    foreignField: '_id',
                                    as: 'userInfo'
                                }
                            },
                            { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },])
                            // Only send "Order placed" confirmation when shippingId is present and pickupDate is not set
                            if (orderData.shippingId && !orderData.pickupDate && userEmail) {
                                // const productList = (orderData.orderItems || [])
                                //     .map((item: { productName?: string; quantity?: number }) => `${item.productName || 'Item'} x ${item.quantity ?? 1}`)
                                //     .join(', ');

                                const footerData = await this.masterModel.findOne({ dropdown_type: "footer_data" })
                                await sendOrderConfirmationEmail(
                                    userEmail,
                                    userName,
                                    `Ved${orderIdStr}`,
                                    productList || [],
                                    amount,
                                    paymentModeDisplay,
                                    orderFullData[0],
                                    footerData
                                );
                            }

                            // Always send payment success email to user after successful payment
                            // if (userEmail) {
                            //     await sendOrderPaymentSuccessEmail(
                            //         userEmail,
                            //         userName,
                            //         `Ved${orderIdStr}`,
                            //         amount,
                            //         paymentModeDisplay,
                            //     );
                            // }

                            // Always send new order notification to admin
                            sendNewOrderAdminEmail(
                                `Ved${orderIdStr}`,
                                userName,
                                userEmail || "",
                                amount,
                                paymentModeDisplay,
                                orderDateTime,
                                productList || [],
                                orderFullData[0]
                            );
                        }
                    } catch (emailErr) {
                        console.error('Order-related emails failed (practitioner):', emailErr);
                    }
                    return {
                        message: 'Order placed',
                        statusCode: 200,
                        paymentUrl: `${process.env.FRONTEND_URL}/admin/orders/newOrder/ThankYou`
                    };
                }
            } else {
                return {
                    message: 'Failed to place order',
                    statusCode: 400
                };
            }
        } catch (error) {
            console.log(error, "eeeeeeeeee")
            // throw new Error(error.message);
            return {
                message: 'Something went wrong',
                statusCode: 400,
                error: error.message
            };
        }

    }

    async orderNowForAdminOffline(paymentManagement): Promise<any> {
        try {
            let currency = 'usd'
            let description = 'string'
            let totalPrice = 0
            let cartItems = []
            let bookedAppts = []
            // const cart = await this.cartManagementModel.findById({ _id: new ObjectId("67da66b3b74b7286d5072dd0") })
            // console.log(cart, "ccccccccccc")
            let planData
            let discountedPrice = 0
            if (paymentManagement.membershipId) {

                const membership_id = new Types.ObjectId(paymentManagement.membershipId);
                const response = await this.MembershipModel.findOne({ _id: membership_id });
                // const MembershipDetails = await this.MembershipModel.findById({ _id: membership_id });

                const now = moment();
                const membershipPrice = response.price
                let discount = 0
                const expiryDate = now.clone().add(response.expiring_in, 'days');
                const membershipCount = await this.membershipBuyModel.countDocuments()
                const activeMembership = await this.membershipBuyModel.findOne({
                    user_id: new Types.ObjectId(paymentManagement.userId),
                    status: 'paid',
                    is_expired: false,
                }).sort({ date: -1 });
                if (activeMembership) {
                    const oldMembershipData = await this.MembershipModel.findById(activeMembership.membership_id)
                    const oneDayPrice = oldMembershipData.price / Number(oldMembershipData.expiring_in)
                    const totalPriceRemaning = Number(oneDayPrice) * Number(activeMembership?.expire_in)
                    console.log(oneDayPrice, totalPriceRemaning, response.price, activeMembership?.expire_in, "oneDayPrice")
                    discount = totalPriceRemaning
                    response.price = response.price - discount
                    await this.membershipBuyModel.findByIdAndUpdate(activeMembership._id, {
                        $set: { is_expired: true },
                    });
                }
                const payableAmount = Math.round(Number(response.price) * 100);

                const saveData = {
                    membership_id: membership_id,
                    invoiceNo: `-M-${membershipCount + 1 + 17000}`,
                    user_id: new Types.ObjectId(paymentManagement.userId),
                    // status: 'notPaid',
                    renewal_date: expiryDate.format('YYYY-MM-DD'),
                    expire_in: response.expiring_in,
                    status: 'paid',
                    is_expired: false,
                    membership_price: Number(membershipPrice).toFixed(2),
                    discount: discount,
                    totalPrice: Number(response.price).toFixed(2)
                };
                const updatePayload: any = {};
                // await this.membershipBuyModel.findByIdAndUpdate({ _id: id }, { $set: updatePayload });
                const memberBuyManagement = new this.membershipBuyModel(saveData);
                const membershipBuy = await memberBuyManagement.save();

                if (response) {
                    planData = response.toObject();
                }
            }
            for (const [index, itemId] of paymentManagement.cartIds.entries()) {
                // console.log(paymentManagement.products,itemId,index,"itemId")

                let cart = await this.cartManagementModel.aggregate([{
                    $match: { _id: new ObjectId(itemId) }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "productId",
                        foreignField: "_id",
                        as: "productDetails"
                    }
                },
                { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "masters", // Adjust collection name as needed
                        localField: "productDetails.category",
                        foreignField: "_id",
                        as: "productData"
                    }
                },
                { $unwind: { path: "$productData", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        userId: 1,
                        productId: 1,
                        quantity: 1,
                        type: 1,
                        appointmentId: 1,
                        minOrderQuantity: "$productDetails.minOrderQuantity",
                        maxOrderQuantity: "$productDetails.maxOrderQuantity",
                        stock: "$productDetails.stock",
                        price: "$productDetails.price",
                        productName: "$productDetails.productName",
                        productBrand: "$productData.name",
                        category: "$productDetails.category"
                    }
                }])
                if (cart[0]?.type !== "appointment") {
                    totalPrice += cart[0]['price'] * cart[0]['quantity']
                    console.log(cart, "ccccccccccc")
                    // const productData = await this.productManagementModel.findById({ _id: new ObjectId(cart[0].productId) })
                    // console.log(cart[0].minOrderQuantity > cart[0].quantity, cart[0].minOrderQuantity, cart[0].quantity, "cart[0].minOrderQuantity > cart[0].quantity")
                    // console.log(cart[0].maxOrderQuantity < cart[0].quantity, cart[0].maxOrderQuantity, cart[0].quantity, "cart[0].maxOrderQuantity < cart[0].quantity")

                    const prodCategoryId = cart[0]?.category;

                    if (paymentManagement.membershipId) {
                        const matchedCategory = planData.product_categories.find((cat) => {
                            const catId =
                                cat?.category_id?._id || cat?.category_id || cat?.category;
                            return String(catId) === String(prodCategoryId);
                        });

                        if (matchedCategory) {
                            const discountPercent = matchedCategory.discount || 0;
                            const originalPrice = cart[0]['price'] * cart[0]['quantity'];
                            discountedPrice =
                                ((originalPrice * discountPercent) / 100) + discountedPrice;
                        }
                    }
                    if (cart[0].minOrderQuantity > cart[0].quantity) {
                        return { messages: `${cart[0].minOrderQuantity} Minimum order quantity required` }
                    } else if (cart[0].maxOrderQuantity < cart[0].quantity) {
                        return { messages: `You can order maximum ${cart[0].maxOrderQuantity} quantity` }
                    } else if (cart[0].stock < cart[0].quantity) {
                        return { messages: `Only ${cart[0].stock} items are in stock` }
                    } else {
                        cartItems.push({ _id: new ObjectId(cart[0]['productId']), quantity: cart[0]['quantity'], productPrice: cart[0]['price'], productName: cart[0]['productName'], productBrand: cart[0]['productBrand'] })
                    }
                } else {

                    const appointments = await this.appointmentModel.findById({ _id: new Types.ObjectId(cart[0].appointmentId) });
                    if (appointments.status == "paid") {
                        return { messages: `The appointment payment already received. Please remove appointment from cart then buy.` }
                    }
                    bookedAppts.push(cart[0].appointmentId)

                }
                // console.log(paymentManagement, "paymentManagement")
                if (index + 1 === paymentManagement.cartIds.length) {
                    console.log(totalPrice, discountedPrice, "totalPrice - discountedPrice ")
                    let discount = 0
                    let grandTotal = totalPrice + Number(paymentManagement.deliveryCharge)
                    let couponData
                    if (paymentManagement?.coupanId) {
                        const data = await this.couponManagementModel.findOne({ couponCode: paymentManagement.coupanId })
                        couponData = data.toObject()
                        let dis = 0

                        if (couponData.discountType == "percentage") {
                            dis = (couponData.discountValue / 100) * totalPrice
                        } else {
                            dis = couponData.discountValue + discountedPrice
                        }
                        discount = couponData.maxDiscount && dis > couponData.maxDiscount ? couponData?.maxDiscount + discountedPrice : dis

                        grandTotal = totalPrice - discount + Number(paymentManagement.deliveryCharge)
                    } else if (paymentManagement?.adminDiscount) {

                        discount = paymentManagement?.adminDiscount ? Number(paymentManagement?.adminDiscount || 0) + discountedPrice : discountedPrice
                        grandTotal = totalPrice - discount + Number(paymentManagement.deliveryCharge)

                    } else {
                        grandTotal = totalPrice - discountedPrice + Number(paymentManagement.deliveryCharge)
                        discount = discountedPrice
                    }
                    const orderCount = await this.orderManagementModel.countDocuments();
                    let saveData = {
                        cartIds: paymentManagement.cartIds,
                        orderItems: cartItems,
                        userId: new ObjectId(paymentManagement.userId),
                        invoiceNo: `-S-${orderCount + 1 + 17000}`,
                        totalAmount: totalPrice,
                        discountAmount: discount,
                        adminDiscount: Number(paymentManagement?.adminDiscount),
                        grandTotal: grandTotal,
                        couponId: paymentManagement?.coupanId ? paymentManagement.coupanId : null,
                        coupanTittle: couponData?.title,
                        addressId: paymentManagement?.addressId ? new ObjectId(paymentManagement.addressId) : null,
                        deliveryCharge: Number(paymentManagement.deliveryCharge),
                        billingAddress1: paymentManagement.billingAddress1,
                        billingAddress2: paymentManagement.billingAddress2,
                        billingCity: paymentManagement.billingCity,
                        billingState: paymentManagement.billingState,
                        billingCountry: paymentManagement.billingCountry,
                        billingZipcode: paymentManagement.billingZipcode,
                        shippingId: paymentManagement.shippingId,
                        pickupDate: paymentManagement.pickupDate,
                        carrier: paymentManagement.carrier,
                        membershipId: paymentManagement.membershipId ? new ObjectId(paymentManagement.membershipId) : null
                    }
                    console.log(saveData, "sssssssssss")
                    if (paymentManagement.paymentMethod === 'offline') {
                        saveData['paymentMethod'] = 'offline'
                        // saveData['status'] = 'paid'
                    }
                    const orderManagement = new this.orderManagementModel(saveData);
                    const newOrder = await orderManagement.save();
                    console.log(totalPrice, paymentManagement.deliveryCharge, discount, "ddddddis")
                    let session
                    if (paymentManagement.paymentMethod !== 'offline') {
                        let payableAmomunt = parseFloat(((totalPrice + Number(paymentManagement.deliveryCharge) - discount) * 100).toFixed(2))
                        session = await this.stripe.checkout.sessions.create({
                            line_items: [
                                {
                                    price_data: {
                                        currency: currency,
                                        product_data: {
                                            name: description,
                                        },
                                        unit_amount: payableAmomunt,
                                    },
                                    quantity: 1,
                                },
                            ],
                            payment_intent_data: {
                                metadata: {
                                    id: `${newOrder._id}`,
                                    type: 'shop'
                                }
                            },
                            mode: 'payment',
                            success_url: `${process.env.BASE_URL}/order-management/paymentSuccessForAdmin/${newOrder._id}`,  // URL after successful payment
                            // cancel_url: `https://doyoursurvey.com/cancel`,    // URL if payment is canceled
                        });
                        console.log(session, "session")
                        await this.orderManagementModel.findByIdAndUpdate({ _id: new ObjectId(newOrder._id) }, { $set: { paymentSessionId: session.id || "" } })
                    } else {
                        // await this.paymentSuccess(newOrder._id)
                    }

                    // return session.url;
                    if (paymentManagement.paymentMethod == 'offline') {
                        // return {
                        //     message: 'Order placed',
                        //     statusCode: 200,
                        //     paymentUrl: session?.url,
                        //     orderId: newOrder._id
                        // };
                        if (newOrder.pickupDate != null) {

                            const cartItems = await this.cartManagementModel.find({
                                _id: { $in: newOrder.cartIds.map(p => new ObjectId(p)) },
                                // userId: new ObjectId(orderData.userId),
                            });
                            console.log(cartItems, "dasdadad");
                            const bulkOperations = [];
                            for (const cartItem of cartItems) {
                                const productIds = Array.isArray(cartItem.productId) ? cartItem.productId : [cartItem.productId];

                                for (const productId of productIds) {

                                    bulkOperations.push({
                                        updateOne: {
                                            filter: { _id: new ObjectId(productId) },
                                            update: {
                                                $inc: {
                                                    stock: -cartItem.quantity, // Reduce stock
                                                    buy_count: +cartItem.quantity // Increase buy_cart
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                            if (bulkOperations.length > 0) {
                                const update = await this.productManagementModel.bulkWrite(bulkOperations);
                                const appointmentId = bookedAppts[0];
                                const appointments = await this.appointmentModel.findOneAndUpdate(
                                    { _id: new Types.ObjectId(appointmentId) },
                                    { $set: { status: "paid" } },
                                    { new: true }
                                );
                                await this.cartManagementModel.deleteMany({
                                    _id: { $in: newOrder.cartIds.map(p => new ObjectId(p)) }
                                });

                                const updatedOrder = await this.orderManagementModel.findByIdAndUpdate(
                                    newOrder._id,
                                    {
                                        $set: {
                                            status: "paid",
                                            // orderStatus: "orderReady",
                                            // orderPackDate: new Date(),
                                            // orderReadyDate: new Date(),
                                            // pickupDoneDate: new Date(),
                                            // tracking_number: tracking,
                                            // shipping_label_url: labelUrl
                                        }
                                    }, { new: true }
                                );
                                // console.log(updatedOrder, 'ttttttt')
                                const updatedIds = bulkOperations.map(op => op.updateOne.filter._id);

                                // fetch updated documents 
                                const updatedProducts = await this.productManagementModel.find({
                                    _id: { $in: updatedIds }
                                });
                                this.sendMailsForLowStock(updatedProducts)
                                try {
                                    const user = await this.userModel.findById(newOrder.userId).lean();
                                    if (user) {
                                        const userEmail = user.email;
                                        const userName = user.name || 'Customer';
                                        const amount = Number(newOrder.grandTotal) || 0;
                                        const paymentModeDisplay = newOrder.paymentMethod === 'offline' ? 'Offline' : 'Online (Card)';
                                        const orderIdStr = String(newOrder.invoiceNo);
                                        const orderDateTime = newOrder.created_at
                                            ? moment(newOrder.created_at).format('MMMM D, YYYY HH:mm')
                                            : moment().format('MMMM D, YYYY HH:mm');
                                        const productList = newOrder.orderItems || [];
                                        const orderFullData = await this.orderManagementModel.aggregate([{ $match: { _id: newOrder?._id } },
                                        {
                                            $lookup: {
                                                from: 'users',
                                                localField: 'userId',
                                                foreignField: '_id',
                                                as: 'userInfo'
                                            }
                                        },
                                        { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },])
                                        // Only send "Order placed" confirmation when shippingId is present and pickupDate is not set
                                        if (userEmail) {//orderData.shippingId && !orderData.pickupDate && userEmail) {
                                            // const productList = (orderData.orderItems || [])
                                            //     .map((item: { productName?: string; quantity?: number }) => `${item.productName || 'Item'} x ${item.quantity ?? 1}`)
                                            //     .join(', ');

                                            const footerData = await this.masterModel.findOne({ dropdown_type: "footer_data" })
                                            const d = sendOrderConfirmationEmail(
                                                userEmail,
                                                userName,
                                                `Ved${orderIdStr}`,
                                                productList || [],
                                                amount,
                                                paymentModeDisplay,
                                                orderFullData[0],
                                                footerData
                                            );
                                            console.log(d, "mail replay")
                                        }

                                        // Always send new order notification to admin
                                        sendNewOrderAdminEmail(
                                            `Ved${orderIdStr}`,
                                            userName,
                                            userEmail || "",
                                            amount,
                                            paymentModeDisplay,
                                            orderDateTime,
                                            productList || [],
                                            orderFullData[0]
                                        );
                                    }
                                } catch (emailErr) {
                                    console.error('Order-related emails failed:', emailErr);
                                }
                                return {
                                    message: 'Order placed',
                                    statusCode: 200,
                                    paymentUrl: `${process.env.FRONTEND_URL}/admin/orders/newOrder/ThankYou`
                                };
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.log(error)
            throw new Error(`Error creating checkout session: ${error.message}`);
        }
    }


    async updatePickupDateAndSendMail(orderId: any, newPickupDate: string) {
        try {
            // ✅ Update pickupDate
            console.log(newPickupDate, "newPickupDate")
            const updatedOrder = await this.orderManagementModel.findByIdAndUpdate(
                { _id: new Types.ObjectId(orderId) },
                { pickupDate: newPickupDate },
                { new: true }
            );
            const emailId = await this.orderManagementModel.aggregate(
                [{ $match: { _id: new Types.ObjectId(orderId) } },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userDetails"
                    }
                },
                { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } }
                ])

            if (!updatedOrder) {
                throw new Error('Order not found');
            }
            console.log(updatedOrder, "updatedOrder")
            const footerData = await this.masterModel.findOne({ dropdown_type: "footer_data" })
            // ✅ Send Email
            sendPickupDateUpdateEmail(emailId[0].userDetails.email, newPickupDate);
            // sendOrderPickupDateUpdatedAdminEmail(
            //     footerData?.email || "Info@vedichealth.org",
            //     `Ved${emailId[0].invoiceNo}`,
            //     `${emailId[0].userInfo.name} ${emailId[0].userInfo.lastName}`,
            //     emailId[0].userDetails.email,
            //     newPickupDate,)
                sendOrderPickupDateUpdatedAdminEmail(footerData?.email || "Info@vedichealth.org",
                `Ved${emailId[0].invoiceNo}`,
                `${emailId[0].userInfo.name} ${emailId[0].userInfo.lastName}`,
                emailId[0].userDetails.email,
                newPickupDate,
  updatedOrder.orderItems || [], updatedOrder)

            // return updatedOrder;
            return {
                message: 'Order successfully picked changed',
                statusCode: 200,
                // orderId: newOrder._id
            };
            // }

        } catch (error) {
            console.error('Service Error:', error);
            throw error;
        }
    }

}


