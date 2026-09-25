// // src/cron.service.ts
// import { Injectable } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';
// import axios from 'axios';
// import { HttpException, HttpStatus } from '@nestjs/common';
// import { Product, ZohoTokenDocument, ZohoToken,ZohoTokenSchema } from '../../schema/schema';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';


// @Injectable()
// export class CronService {
//     // constructor(@InjectModel(ZohoToken.name) private productModel: Model<ZohoTokenDocument>) { }

//     constructor(@InjectModel(ZohoToken.name) private productModel: Model<ZohoTokenDocument>) {
//         console.log(this.productModel);  // Log model to check if it's injected correctly
//       }

//     // A cron job that runs every minute
//     @Cron(CronExpression.EVERY_MINUTE)
//     async handleCron(productData: Partial<ZohoToken>): Promise<ZohoToken> {
//         console.log('This cron job runs every minute');

//         try {

//             const response = await axios.post('https://accounts.zoho.in/oauth/v2/token', null, {
//                 params: {
//                     refresh_token: '1000.77749d4cafa7e9b05b5dff22f2247391.400c2244c84d7e1105e9c2c333763b9c',
//                     client_id: '1000.IAZ5QVUUM9H1RE1T8Q505QD6ARBEJQ',
//                     client_secret: '0a674c0619ff7345c0baa71c5f08a14c1921863f05',
//                     grant_type: 'refresh_token',
//                 },
//             });
//             console.log(response.data, "response.data")
//             const accessToken = response.data.access_token;

//             if (!accessToken) {
//                 throw new HttpException('Failed to refresh access token', HttpStatus.INTERNAL_SERVER_ERROR);
//             }
//             if (accessToken) {
//                 // const createdProduct = new this.productModel(accessToken);
//                 // console.log(createdProduct,"createdProductcreatedProduct",Product)
//                 // return createdProduct.save();
//             }
//             return accessToken; // Return the new access token
//         } catch (error) {
//             console.error('Error refreshing access token', error);
//             throw new HttpException('Failed to refresh access token', HttpStatus.INTERNAL_SERVER_ERROR);
//         }
//     }

//     // A cron job that runs at midnight every day
//     @Cron('0 0 * * *')
//     handleDailyCron() {
//         console.log('This cron job runs at midnight every day');
//     }

//     // A cron job that runs every 5 seconds (just an example)
//     @Cron('*/5 * * * * *')
//     handleEveryFiveSeconds() {
//         console.log('This cron job runs every 5 seconds');
//     }
// }


import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ZohoToken, User, address, CenterManagement, orderManagement, Master, WaitlistManagement,cartManagement } from '../../schema/schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';
import * as qs from 'qs';
import Stripe from 'stripe';
import axios from 'axios';
import { Types } from 'mongoose';
import { sendNoSlotAvailableMail, sendOrderDeliveredAdminEmail, sendOrderDeliveredEmail } from '../nodemailer/nodemailer.controller';
let { ObjectId } = require('mongoose').Types;

@Injectable()
export class cronService {
    private stripe: Stripe;
    private readonly clientId = 'YOUR_CLIENT_ID';
    private readonly clientSecret = 'YOUR_CLIENT_SECRET';
    private readonly zohoTokenUrl = 'https://accounts.zoho.in/oauth/v2/token';

    constructor(
        private readonly httpService: HttpService,
        @InjectModel(ZohoToken.name) private readonly tokenModel: Model<ZohoToken>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(address.name) private readonly addressModel: Model<address>,
        @InjectModel(CenterManagement.name) private readonly centerManagementModel: Model<address>,
        @InjectModel(orderManagement.name) private orderManagementModel: Model<orderManagement>,
        @InjectModel(Master.name) private masterModel: Model<Master>,
        @InjectModel(WaitlistManagement.name) private waitListModel: Model<WaitlistManagement>,
        @InjectModel(cartManagement.name) private cartModel: Model<cartManagement>,
    ) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }

    // Refresh token logic
    async refreshAccessToken(): Promise<void> {
        // Get the stored token
        const token = await this.tokenModel.findOne();
        console.log(token, "tokentoken")
        // Check if token exists and if it's expired
        if (token && new Date() >= token.expiresAt) {
            const data = qs.stringify({
                grant_type: 'refresh_token',
                // client_id: this.clientId,
                // client_secret: this.clientSecret,
                refresh_token: token.refreshToken,
                client_id: '1000.IAZ5QVUUM9H1RE1T8Q505QD6ARBEJQ',
                client_secret: '0a674c0619ff7345c0baa71c5f08a14c1921863f05',
            });

            // Request a new access token from Zoho
            const response = await lastValueFrom(
                this.httpService.post(this.zohoTokenUrl, data, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                }),
            );
            console.log(response, "responseresponse")
            const newAccessToken = response.data.access_token;
            const expiresIn = response.data.expires_in;

            // Calculate the new expiration time
            const expiresAt = new Date(Date.now() + expiresIn * 1000);

            // Update token in MongoDB
            await this.tokenModel.updateOne({}, {
                accessToken: newAccessToken,
                expiresAt,
            });



            // console.log(createdProduct,"createdProductcreatedProduct",Product)


            console.log('Access token refreshed and updated in MongoDB');
        }
    }

    // Cron job to refresh token every hour
    @Cron(CronExpression.EVERY_30_MINUTES)
    async handleCron() {
        await this.refreshAccessToken();
    }

    // Get the current access token
    async getAccessToken(): Promise<string> {
        const token = await this.tokenModel.findOne();
        return token ? token.accessToken : null;
    }

    @Cron('45 9 * * *')
    async updateStripeId() {
        // await this.refreshAccessToken();
        const userWithOutStripe = await this.userModel.find({ role: "member", stripeCustomerId: { $exists: false } })
        // userWithOutStripe && userWithOutStripe.length > 0
        console.log(userWithOutStripe, "userWithOutStripe")
        for (const user of userWithOutStripe) {
            // userWithOutStripe.map(user=>{
            const customer = await this.stripe.customers.create({
                email: user.email.trim().toLocaleLowerCase(),
                name: user.name,
                metadata: { userId: user._id.toString() },
            });
            console.log(customer)
            await this.userModel.findByIdAndUpdate({ _id: user._id }, { stripeCustomerId: customer.id })
            user.save();
        }
    }

    @Cron('24 16 * * *')
    async updateAddressShippoId() {
        const cxAddress = await this.addressModel.find({
            shippoAddressId: { $exists: false },
            // state: null
            // primary:1
        });

        for (const suscribeData of cxAddress) {
            try {

                let setAddress = `${suscribeData?.flatNo},${suscribeData?.area},${suscribeData.city},${suscribeData.state},${suscribeData.pincode}`;

                const location = await axios.get(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(setAddress)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
                );

                if (!location.data.results || location.data.results.length === 0) {
                    console.log(`Invalid address for ID: ${suscribeData._id}`);
                    continue; // skip this record
                }
                console.log(location.data.results[0]?.address_components, "location.data.results")
                const stateValue = suscribeData?.stateCode
                    ? suscribeData.stateCode
                    : location.data.results[0]?.address_components?.find(c =>
                        c.types.includes("administrative_area_level_1")
                    )?.short_name;

                const validated = await axios.post(
                    'https://api.goshippo.com/addresses/',
                    {
                        name: suscribeData.name,
                        street1: `${suscribeData.flatNo}`,
                        street2: `${suscribeData.area}`,
                        city: suscribeData.city,
                        state: stateValue,
                        zip: suscribeData.pincode,
                        country: suscribeData.countryCode,
                        phone: suscribeData.mobile,
                        longitude: location.data.results[0].geometry.location.lng,
                        latitude: location.data.results[0].geometry.location.lat,
                        validate: true,
                        email: 'info@vedichealth.org',
                        is_residential: false,
                    },
                    {
                        headers: {
                            Authorization: `${process.env.SHIPPOKEY}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                console.log(validated.data?.validation_results, "lllllllllll")
                console.log({
                    name: suscribeData.name,
                    street1: `${suscribeData.flatNo}`,
                    street2: `${suscribeData.area}`,
                    city: suscribeData.city,
                    state: stateValue,
                    zip: suscribeData.pincode,
                    country: suscribeData.countryCode,
                    phone: suscribeData.mobile,
                    longitude: location.data.results[0].geometry.location.lng,
                    latitude: location.data.results[0].geometry.location.lat,
                    validate: true,
                    email: 'info@vedichealth.org',
                    is_residential: false,
                })
                if (validated.data?.validation_results?.is_valid) {
                    await this.addressModel.findByIdAndUpdate(
                        suscribeData._id,
                        { shippoAddressId: validated.data.object_id }
                    );
                } else {
                    await this.addressModel.findByIdAndUpdate(
                        suscribeData._id,
                        { is_deleted: 1 }
                    );
                }

            } catch (error) {
                console.error(
                    `Error processing address ID: ${suscribeData._id}`,
                    error?.response?.data || error.message
                );

                // Optional: mark as failed instead of breaking
                await this.addressModel.findByIdAndUpdate(
                    suscribeData._id,
                    { is_deleted: 1 }
                );

                continue; // 🔥 this ensures loop continues
            }
        }
    }

    // async updateAddressShippoId() {
    //     // await this.refreshAccessToken();
    //     const cxAddress = await this.addressModel.find({ shippoAddressId: { $exists: false },is_deleted:0})

    //     for (const suscribeData of cxAddress) {

    //         let setAddress = `${suscribeData?.flatNo},${suscribeData?.area},${suscribeData.city},${suscribeData.state},${suscribeData.pincode}`;
    //         const location = await axios.get(
    //             `https://maps.googleapis.com/maps/api/geocode/json?address=%7B${setAddress}%7D&key=${process.env.GOOGLE_MAPS_API_KEY}`,
    //         );
    //         if (location.data.results.length == 0) {
    //             throw new Error('Please enter a valid address');
    //         }
    //         console.log(location.data.results[0], "location.data.results")
    //         console.log(suscribeData['state']?suscribeData['stateCode']:location.data.results[0].state,"kkkkkkkkkkk")
    //         const validated = await axios.post(
    //             'https://api.goshippo.com/addresses/',
    //             {
    //                 name: suscribeData.name,
    //                 street1: `${suscribeData['flatNo']},${suscribeData['area']}`,
    //                 // street2: `${suscribeData['area']}`,
    //                 city: suscribeData['city'],
    //                 state: suscribeData['state']?suscribeData['stateCode']:location.data.results[0].state,
    //                 zip: suscribeData['pincode'],
    //                 country: suscribeData['country'],
    //                 phone: suscribeData['mobile'],
    //                 longitude: location.data.results[0].geometry.location.lng,
    //                 latitude: location.data.results[0].geometry.location.lat,
    //                 validate: true,
    //                 email: 'info@vedichealth.org',
    //                 is_residential: false,
    //             },
    //             {
    //                 headers: {
    //                     Authorization: `${process.env.SHIPPOKEY}`,
    //                     'Content-Type': 'application/json',
    //                 },
    //             },
    //         );
    //         console.log( {
    //                 name: suscribeData.name,
    //                 street1: `${suscribeData['flatNo']},${suscribeData['area']}`,
    //                 // street2: `${suscribeData['area']}`,
    //                 city: suscribeData['city'],
    //                 state: suscribeData['stateCode']?suscribeData['stateCode']:location.data.results[0].state,
    //                 zip: suscribeData['pincode'],
    //                 country: suscribeData['countryCode'],
    //                 phone: suscribeData['mobile'],
    //                 longitude: location.data.results[0].geometry.location.lng,
    //                 latitude: location.data.results[0].geometry.location.lat,
    //                 validate: true,
    //                 email: 'info@vedichealth.org',
    //                 is_residential: false,
    //             },"lllllllllll")
    //         console.log(
    //             validated.data,
    //             validated.data.validation_results,
    //             validated.data.object_id,"validate"
    //         );
    //         const data={

    //                 shippoAddressId: validated.data.object_id,
    //                 state: suscribeData['stateCode']?suscribeData['stateCode']:location.data.results[0].state,
    //                 stateCode: suscribeData['stateCode']?suscribeData['stateCode']:location.data.results[0].state,
    //         }
    //         if (validated.data.validation_results.is_valid) {
    //             const createdAddress = await this.addressModel.findByIdAndUpdate({ _id: suscribeData._id },{shippoAddressId: validated.data.object_id});
    //             // return createdAddress.save();
    //         }else{
    //         const createdAddress = await this.addressModel.findByIdAndUpdate({ _id: suscribeData._id },{is_deleted:1});
    //         continue
    //         }
    //     }
    // }

    @Cron('30 18 * * *')
    async updateCenterShippoId() {
        // await this.refreshAccessToken();
        const centerData = await this.centerManagementModel.find({ shippoAddressId: { $exists: false } })

        for (const centerManagementData of centerData) {

            const validated = await axios.post('https://api.goshippo.com/addresses/', {
                name: centerManagementData['centerName'],
                street1: centerManagementData['address'],
                city: centerManagementData['city'],
                state: centerManagementData['state'],
                zip: centerManagementData['pincode'],
                country: centerManagementData['country'],
                phone: centerManagementData['mobile'],
                longitude: centerManagementData['longitude'],
                latitude: centerManagementData['latitude'],
                email: centerManagementData['email'],
                validate: true,
                is_residential: false
            }, {
                headers: {
                    Authorization: `${process.env.SHIPPOKEY}`,
                    'Content-Type': 'application/json'
                }
            });
            if (validated.data.validation_results.is_valid) {
                const createdCenterManagement = this.centerManagementModel.findByIdAndUpdate({ _id: centerManagementData._id }, { shippoAddressId: validated.data.object_id });
                // return createdCenterManagement.save();
            }
        }
    }

    @Cron(CronExpression.EVERY_HOUR)
    async updateOrderStatus() {
        try {
            // let objectId
            // const skip = (page - 1) * pageSize;
            // const limit = pageSize;
            const filter: any = { status: { $ne: 'ordered' } }//{ status: 'paid' };
            // console.log(page, pageSize, skip, "skip")
            // if (id) {
            //     objectId = new Types.ObjectId(id);
            //     filter['userId'] = objectId
            // }

            // if (order_id) {
            //     objectId = new Types.ObjectId(id);
            //     filter['_id'] = objectId
            // }
            // if (order_type && order_type == 'not_shipped') {
            //     // e.pickupDate === null || e.pickupOrder !== 'pickupDone'
            //     filter['$and'] = [
            //         {
            //             $or: [
            //                 { pickupDate: null },
            //                 { pickupOrder: { $ne: "pickupDone" } }
            //             ]
            //         },
            //         { "deliveryDates.shippedDate": null }
            //     ]
            // }
            const returnDays = await this.masterModel.findOne({ dropdown_type: 'return_reasons' })
            // const cartData = await this.orderManagementModel.find(filter).exec()
            // console.log(filter)
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
                // {
                //     $project: {
                //         productIds: {
                //             $map: {
                //                 input: "$returnorders",
                //                 as: "ro",
                //                 in: "$$ro.productId"
                //             }
                //         }
                //     }
                // },
                // {
                //     $sort: {
                //         created_at: -1
                //     }
                // },
                // {
                //     $skip: skip
                // },
                // {
                //     $limit: limit
                // }
            ]).exec()
            const totalCount = await this.orderManagementModel.countDocuments(filter).exec();

            if (!cartData) {
                throw new Error(`cartData not found with id`);
            } else {
                // for (const order of cartData) {
                //     if (order.status === 'paid' && order.shippingId) {
                //         const shipmentRes = await axios.get(
                //             `https://api.goshippo.com/v1/tracks/shippo/SHIPPO_TRANSIT`, // TODO: replace with actual carrier/tracking_number
                //             {
                //                 headers: {
                //                     Authorization: process.env.SHIPPOKEY,
                //                     'Content-Type': 'application/json',
                //                 },
                //             }
                //         );

                //         const dates = { pickupDate: null, shippedDate: null, outForDeliveryDate: null, deliveredDate: null };
                //         const shipmentStatus = shipmentRes.data.tracking_status?.status;

                //         // ✅ always assign returnOrder, default false
                //         order.cancelOrder = (shipmentStatus === 'PRE_TRANSIT' || shipmentStatus === 'UNKNOWN');
                //         let currentStatus = shipmentStatus
                //         for (const event of shipmentRes.data.tracking_history) {
                //             const detail = event.status_details.toLowerCase();
                //             const status = event.status.toLowerCase();
                //             currentStatus = status
                //             if (!dates.pickupDate && detail.includes("electronic shipment information")) {
                //                 dates.pickupDate = new Date(event.status_date).toISOString();
                //             }
                //             if (!dates.shippedDate && (status === "transit" || detail.includes("departed from the origin"))) {
                //                 dates.shippedDate = new Date(event.status_date).toISOString();
                //             }
                //             if (!dates.outForDeliveryDate && (status === "transit" && detail.includes("out for delivery"))) {
                //                 dates.outForDeliveryDate = new Date(event.status_date).toISOString();
                //             }
                //             if (!dates.deliveredDate && status === "delivered") {
                //                 dates.deliveredDate = new Date(event.status_date).toISOString();
                //             }
                //         }

                //         // ✅ assign deliveryDates into order
                //         order.deliveryDates = dates;
                //         order.currentStatus = currentStatus
                //         console.log("ho gya",order)
                //          await this.orderManagementModel.findOneAndUpdate({_id:order._id},{$set:{deliveryDates:dates,currentStatus:currentStatus}}).exec();

                //     } else {
                //         // ensure keys exist even if no shipment
                //         order.cancelOrder = false;
                //         order.deliveryDates = { pickupDate: null, shippedDate: null, outForDeliveryDate: null, deliveredDate: null };
                //     }
                // }
                for (const order of cartData) {

                    // ✅ Skip API if already delivered
                    if (
                        order.status === 'paid' &&
                        order.shippingId &&
                        order.currentStatus !== 'delivered'
                    ) {

                        const shipmentRes = await axios.get(
                            `https://api.goshippo.com/v1/tracks/shippo/${order.shippingId}`,
                            {
                                headers: {
                                    Authorization: process.env.SHIPPOKEY,
                                    'Content-Type': 'application/json',
                                },
                            }
                        );

                        const dates = {
                            pickupDate: null,
                            shippedDate: null,
                            outForDeliveryDate: null,
                            deliveredDate: null
                        };

                        const shipmentStatus = shipmentRes.data.tracking_status?.status;

                        order.cancelOrder =
                            shipmentStatus === 'PRE_TRANSIT' || shipmentStatus === 'UNKNOWN';

                        let currentStatus = shipmentStatus?.toLowerCase();

                        for (const event of shipmentRes.data.tracking_history || []) {
                            const detail = (event.status_details || "").toLowerCase();
                            const status = (event.status || "").toLowerCase();

                            currentStatus = status;

                            if (!dates.pickupDate && detail.includes("electronic shipment information")) {
                                dates.pickupDate = new Date(event.status_date).toISOString();
                            }

                            if (!dates.shippedDate &&
                                (status === "transit" || detail.includes("departed from the origin"))) {
                                dates.shippedDate = new Date(event.status_date).toISOString();
                            }

                            if (!dates.outForDeliveryDate &&
                                status === "transit" &&
                                detail.includes("out for delivery")) {
                                dates.outForDeliveryDate = new Date(event.status_date).toISOString();
                            }

                            if (!dates.deliveredDate && status === "delivered") {
                                const orderData = await this.orderManagementModel.aggregate([{ $match: { _id: new Types.ObjectId(order._id) } },
                                {
                                    $lookup: {
                                        from: 'users',
                                        localField: 'userId',
                                        foreignField: '_id',
                                        as: 'userInfo'
                                    }
                                },
                                { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },])
                                const footerData = await this.masterModel.findOne({ dropdown_type: "footer_data" })
                                sendOrderDeliveredEmail(orderData[0].userInfo.email, `${orderData[0].userInfo.name} ${orderData[0].userInfo.lastName || ""}`, orderData[0], footerData)
                                sendOrderDeliveredAdminEmail(footerData.email || 'admin@vedichealth.org', `${orderData[0].userInfo.name} ${orderData[0]?.userInfo?.lastName || ""}`, orderData[0].userInfo.email, orderData[0], footerData)
                                dates.deliveredDate = new Date(event.status_date).toISOString();
                            }
                        }

                        order.deliveryDates = dates;
                        order.currentStatus = currentStatus;

                        await this.orderManagementModel.findOneAndUpdate(
                            { _id: order._id },
                            { $set: { deliveryDates: dates, currentStatus: currentStatus } }
                        ).exec();

                    } else {
                        // ✅ Already delivered OR no shipping
                        order.cancelOrder = false;

                        if (!order.deliveryDates) {
                            order.deliveryDates = {
                                pickupDate: null,
                                shippedDate: null,
                                outForDeliveryDate: null,
                                deliveredDate: null
                            };
                        }
                    }
                }


                // console.log(cartData)

                return {
                    message: 'order Data successfully fetched!',
                    statusCode: 201,
                    data: cartData,
                    returnDays: returnDays.name,
                    totalCount,
                    // page,
                    // pageSize,
                    // totalPages: Math.ceil(totalCount / pageSize),
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

    @Cron(CronExpression.EVERY_HOUR)
    async updatecustomerId() {
        try {
            const users = await this.userModel.find({ vedicCustomerId: { $exists: false } })
            for (const [ind, user] of users.entries()) {
                const vedicCustomerId = `VH${String(ind + 1).padStart(5, "0")}`;
                const update = await this.userModel.findByIdAndUpdate({ _id: user._id }, { $set: { vedicCustomerId: vedicCustomerId } })
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
    @Cron('0 23 * * *', {
        timeZone: 'America/New_York',
    })
    async notifyNoSlotsAvailable() {
        try {
            // ✅ Get today's date in EST
            const now = new Date();

            const startOfDay = new Date(
                now.toLocaleString("en-US", { timeZone: "America/New_York" })
            );
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(startOfDay);
            endOfDay.setHours(23, 59, 59, 999);

            // ✅ Get waitlist users for today
            const waitList = await this.waitListModel.aggregate([
                {
                    $match: {
                        date: { $gte: startOfDay, $lte: endOfDay },
                        notifiedNoSlot: { $ne: true } // ✅ avoid duplicate emails
                    }
                },

                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: "$user" },

                {
                    $lookup: {
                        from: "servicesmanagements",
                        localField: "serviceId",
                        foreignField: "_id",
                        as: "service"
                    }
                },
                { $unwind: "$service" },

                {
                    $lookup: {
                        from: "employees",
                        localField: "employeeId",
                        foreignField: "_id",
                        as: "employee"
                    }
                },
                { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },

                {
                    $lookup: {
                        from: "users",
                        localField: "employee.userId",
                        foreignField: "_id",
                        as: "employeeUser"
                    }
                },
                { $unwind: { path: "$employeeUser", preserveNullAndEmptyArrays: true } }
            ]);

            for (const e of waitList) {
                const formattedDate = new Date(e.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "America/New_York"
                });

                await sendNoSlotAvailableMail(
                    e.user.email,
                    `${e.user.name} ${e.user.lastName || ""}`,
                    e.service.name,
                    `${e.employeeUser?.name || ""} ${e.employeeUser?.lastName || ""}`,
                    formattedDate
                );

                // ✅ mark as notified
                await this.waitListModel.updateOne(
                    { _id: e._id },
                    { $set: { notifiedNoSlot: true } }
                );
            }

            console.log("✅ End-of-day no-slot emails sent");

        } catch (error) {
            console.error("❌ Cron error:", error);
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
        timeZone: 'America/New_York',
    })
    async clearCart() {
try {
    await this.cartModel.deleteMany({})

    } catch (error) {
            console.error("❌ Cron error:", error);
        }
    }
}
