// src/modules/membership_management/membership_management.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MembershipBuyHistroy, MembershipBuyHistroyDocument, MembershipManagement, MembershipManagementDocument, User, UserDocument,Master,MasterDocument } from 'src/schema/schema';
import Stripe from 'stripe';
import * as moment from 'moment';
import { sendMembershipCancellationMail, sendMembershipPurchaseConfirmationMail, sendMembershipPurchaseAdminMail, sendMembershipCancellationAdminMail } from 'src/middlewares/nodemailer/nodemailer.controller';

@Injectable()
export class MembershipBuyHistroyService {
  private stripe: Stripe;
  constructor(
    @InjectModel(MembershipBuyHistroy.name) private membershipBuyModel: Model<MembershipBuyHistroyDocument>,
    @InjectModel(MembershipManagement.name) private membershipModel: Model<MembershipManagementDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Master.name) private masterModel: Model<MasterDocument>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      // apiVersion: '2023-10-16',a
    });
  }

  async createPaymentLink(data: Partial<any>) {
    const currency = 'usd';
    const description = 'string';
    const membership_id = new Types.ObjectId(data._id);
    const MembershipDetails = await this.membershipModel.findById({ _id: membership_id });
    let discount = 0
    const membershipPrice = MembershipDetails.price
    const activeMembership = await this.membershipBuyModel
      .findOne({
        user_id: new Types.ObjectId(data.user_id),
        status: 'paid',
        is_expired: false,
      })
      .sort({ date: -1 });
    console.log(activeMembership, "activeMembership")
    if (
      activeMembership &&
      activeMembership.membership_id.toString() !== membership_id._id.toString()
      // &&
      // activeMembership.membership_id?.toString() === membership_id._id?.toString()
    ) {
      return await this.upgradePlan(data.user_id, data._id)
      console.log("aya")
      const oldMembershipData = await this.membershipModel.findById(activeMembership.membership_id)
      const oneDayPrice = oldMembershipData.price / Number(oldMembershipData.expiring_in)
      const totalPriceRemaning = Number(oneDayPrice) * Number(activeMembership?.expire_in)
      console.log(oneDayPrice, totalPriceRemaning, MembershipDetails.price, activeMembership?.expire_in, "oneDayPrice")
      discount = totalPriceRemaning
      MembershipDetails.price = MembershipDetails.price - discount
      console.log(MembershipDetails.price, "MembershipDetails.price")
    }
    const now = moment();
    const expiryDate = now.clone().add(MembershipDetails.expiring_in, 'days');
    const membershipCount = await this.membershipBuyModel.countDocuments()

    const payableAmount = Math.round(Number(MembershipDetails.price) * 100);
    const saveData = {
      membership_id: membership_id,
      invoiceNo: `-M-${membershipCount + 1 + 17000}`,
      user_id: new Types.ObjectId(data.user_id),
      status: 'notPaid',
      renewal_date: expiryDate.format('YYYY-MM-DD'),
      expire_in: MembershipDetails.expiring_in,
      membership_price: Number(membershipPrice).toFixed(2),
      discount: discount,
      totalPrice: Number(MembershipDetails.price).toFixed(2)
    };

    const memberManagement = new this.membershipBuyModel(saveData);
    const newOrder = await memberManagement.save();

    // const session = await this.stripe.checkout.sessions.create({
    //   line_items: [
    //     {
    //       price_data: {
    //         currency: currency,
    //         product_data: {
    //           name: description,
    //         },
    //         unit_amount: payableAmount,
    //       },
    //       quantity: 1,
    //     },
    //   ],
    //   mode: 'payment',
    //   success_url: `${process.env.BASE_URL}/membership_buy_management/paymentSuccess/${newOrder._id}`, // URL after successful payment
    //   // cancel_url: `https://doyoursurvey.com/cancel`,    // URL if payment is canceled
    // });
    const userDetails = await this.userModel.findById(new Types.ObjectId(data.user_id))
    console.log(userDetails, data, "userDetails")

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',

      // customer_email: user.email,
      customer: userDetails.stripeCustomerId,
      line_items: [
        {
          price: MembershipDetails.stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        orderId: newOrder._id.toString(),
        type: 'membership',
        membershipId: MembershipDetails._id.toString(),
      },
      subscription_data: {
        metadata: {
          userId: data.user_id,
          emailId: userDetails.email,
          membershipId: MembershipDetails._id.toString(),
          membershipName: MembershipDetails.plan_name,
          orderId: newOrder._id.toString(),
          type: 'membership'
        },
      },

      success_url: `${process.env.BASE_URL}/membership_buy_management/paymentSuccess/${newOrder._id}`,

      // cancel_url: `${process.env.BASE_URL}/membership_buy_management/paymentCancel/${newOrder._id}`,
    });

    await this.membershipBuyModel.findByIdAndUpdate(
      { _id: newOrder._id },
      { $set: { paymentSessionId: session.id || '' } },
    );

    return {
      message: 'Memberships placed',
      statusCode: 200,
      paymentUrl: session.url,
      orderId: newOrder._id,
    };
  }


  async paymentSuccess(id: string) {
    try {
      const orderData = await this.membershipBuyModel.findById(id);
      console.log(orderData, 'orderData');

      if (!orderData) {
        return {
          message: 'Membership not found',
          statusCode: 400,
        };
      } else if (orderData?.status === 'paid') {
        return {
          message: 'Membership already placed',
          statusCode: 400,
        };
      }

      const membershipDetails = await this.membershipModel.findById(orderData.membership_id);
      const planDuration = Number(membershipDetails?.expiring_in || orderData.expire_in || 0);

      const updatePayload: any = { status: 'paid', is_expired: false };

      // If user already has an active membership of the SAME plan, extend its end date
      const activeMembership = await this.membershipBuyModel
        .findOne({
          user_id: orderData.user_id,
          status: 'paid',
          is_expired: false,
        })
        .sort({ date: -1 });

      if (
        activeMembership &&
        activeMembership._id.toString() !== orderData._id.toString() &&
        activeMembership.membership_id?.toString() === orderData.membership_id?.toString()
      ) {

        // const baseStartDate = activeMembership.date || new Date();


        // Extend from the current expiry date
        // const currentExpiry = moment(baseStartDate).add(
        //   Number(activeMembership.expire_in || planDuration),
        //   'days',
        // );

        // const newExpiry = currentExpiry.clone().add(planDuration, 'days');
        // const newExpireInDays = newExpiry.diff(moment(baseStartDate), 'days');

        // updatePayload.date = baseStartDate;
        // updatePayload.expire_in = newExpireInDays;
        // updatePayload.renewal_date = newExpiry.toDate();

        // Mark the previous active entry as expired so only the renewed one stays active
        await this.membershipBuyModel.findByIdAndUpdate(activeMembership._id, {
          $set: { is_expired: true },
        });
      }

      // Mark THIS order as paid (and extended if renewal)
      const newMembershipDetails = await this.membershipBuyModel.findByIdAndUpdate({ _id: id }, { $set: updatePayload });

      // Ensure all other memberships for the user are marked expired (only the latest stays active)
      await this.membershipBuyModel.updateMany(
        {
          user_id: orderData.user_id,
          _id: { $ne: orderData._id },
        },
        {
          $set: { is_expired: true },
        },
      );
      const userDetails = await this.userModel.findById(new Types.ObjectId(orderData.user_id))
      const footerData = await this.masterModel.findOne({ dropdown_type: "footer_data" })

      sendMembershipPurchaseConfirmationMail(
        userDetails?.email || "",
        `${userDetails?.name || ""} ${userDetails?.lastName || ""}`,
        {
          planName: membershipDetails.plan_name,
          duration: `${membershipDetails?.expiring_in} Days`,
          startDate: new Date(newMembershipDetails?.date).toLocaleDateString("en-US", {
            timeZone: "America/New_York",
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),
          endDate: new Date(newMembershipDetails?.renewal_date).toLocaleDateString("en-US", {
            timeZone: "America/New_York",
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),
          amountPaid: `$ ${membershipDetails.price}`,
          invoiceNo: `Ved${newMembershipDetails.invoiceNo}`
        })
      sendMembershipPurchaseAdminMail(
        footerData.email || 'admin@vedichealth.org',
        `${userDetails?.name || ""} ${userDetails?.lastName || ""}`,
        userDetails?.email || "",
        {
          planName: membershipDetails.plan_name,
          duration: `${membershipDetails?.expiring_in} Days`,
          startDate: new Date(newMembershipDetails?.date).toLocaleDateString("en-US", {
            timeZone: "America/New_York",
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),
          endDate: new Date(newMembershipDetails?.renewal_date).toLocaleDateString("en-US", {
            timeZone: "America/New_York",
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),
          amountPaid: `$ ${membershipDetails.price}`,
          invoiceNo: `Ved${newMembershipDetails.invoiceNo}`
        }
      );
      return {
        message: 'Memberships placed',
        statusCode: 200,
        paymentUrl: `${process.env.FRONTEND_URL}/Memberships/Thankyou/${id}`,
      };
    } catch (error) {
      console.log(error, 'eeeeeeeeee');
      // throw new Error(error.message);
      return {
        message: 'Something went wromg',
        statusCode: 400,
        error: error.message
      };
    }
  }


  async paymentHistory(page: number, pageSize: number, id: string,membership_id:string) {
    const skip = (page - 1) * pageSize;

    const match: any = {};
    if (id) match.user_id = new Types.ObjectId(id);
    if(membership_id){
      match.membership_id=new Types.ObjectId(membership_id)
    }

    const result = await this.membershipBuyModel.aggregate([
      { $match: match },
      {
        $facet: {
          data: [
            { $sort: { date: -1 } },
            {
              $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user',
              },
            },
            { $unwind: '$user' },
            {
              $lookup: {
                from: 'membershipmanagements',
                localField: 'membership_id',
                foreignField: '_id',
                as: 'membership',
              },
            },
            { $unwind: '$membership' },
            { $skip: skip },
            { $limit: pageSize },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ]);

    const data = result?.[0]?.data ?? [];
    const total = result?.[0]?.total?.[0]?.count ?? 0;

    return {
      message: 'Memberships fetched',
      statusCode: 200,
      membershipData: data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }


  // async getUserSubscriptionDetails(user_id: string) {
  //   try {
  //     if (!user_id || !Types.ObjectId.isValid(user_id)) {
  //       return {
  //         message: 'Invalid user ID',
  //         statusCode: 400,
  //       };
  //     }

  //     const userId = new Types.ObjectId(user_id);

  //     // Get user details (include contact + stripe id so invoice can show it)
  //     const user = await this.userModel
  //       .findById(userId)
  //       .select('name email mobileNo stripeCustomerId')
  //       .lean();
  //     if (!user) {
  //       return {
  //         message: 'User not found',
  //         statusCode: 404,
  //       };
  //     }

  //     // Get current active membership (most recent paid, not expired)
  //     const currentMembership = await this.membershipBuyModel
  //       .findOne({
  //         user_id: userId,
  //         status: 'paid',
  //         is_expired: false,
  //       })
  //       .sort({ date: -1 })
  //       .populate({
  //         path: 'membership_id',
  //         model: 'MembershipManagement',
  //         select:
  //           '_id plan_name plan_description tier price image expiring_in is_bestvalue plan_details',
  //       })
  //       .lean();

  //     let currentPlan = null;
  //     let planStartingDate = null;
  //     let planExpiringInDays = null;
  //     let nextPaymentDate = null;
  //     let expirationDate = null;

  //     if (currentMembership) {
  //       const membershipDetails = currentMembership.membership_id as any;
  //       const purchaseDate = moment(currentMembership.date);
  //       const expireInDays = currentMembership.expire_in || membershipDetails?.expiring_in || 30;

  //       // Calculate expiration date (purchase date + expire_in days)
  //       expirationDate = purchaseDate.clone().add(expireInDays, 'days');
  //       const daysUntilExpiration = expirationDate.diff(moment(), 'days');

  //       // Next payment date is the renewal_date, or expiration date if renewal_date is not set
  //       const renewalDate = currentMembership.renewal_date
  //         ? moment(currentMembership.renewal_date)
  //         : expirationDate.clone();

  //       currentPlan = {
  //         _id: membershipDetails?._id,
  //         plan_name: membershipDetails?.plan_name || 'N/A',
  //         plan_description: membershipDetails?.plan_description || '',
  //         price: membershipDetails?.price || 0,
  //         image: membershipDetails?.image || null,
  //         tier: membershipDetails?.tier || 0,
  //         is_bestvalue: membershipDetails?.is_bestvalue || 0,
  //       };

  //       planStartingDate = currentMembership.date
  //         ? moment(currentMembership.date).format('DD MMM YYYY')
  //         : null;
  //       planExpiringInDays = daysUntilExpiration > 0 ? daysUntilExpiration : 0;
  //       nextPaymentDate = renewalDate.format('DD MMMM YYYY');

  //       // If membership has actually expired, mark it as expired
  //       if (daysUntilExpiration <= 0 && !currentMembership.is_expired) {
  //         await this.membershipBuyModel.findByIdAndUpdate(
  //           currentMembership._id,
  //           { $set: { is_expired: true } }
  //         );
  //         // Set currentPlan to null since it's expired
  //         currentPlan = null;
  //         planStartingDate = null;
  //         planExpiringInDays = null;
  //         nextPaymentDate = null;
  //       }
  //     }

  //     // Get all plans with higher price than current plan
  //     const currentPlanPrice = currentPlan?.price || 0;
  //     const higherPlans = await this.membershipModel
  //       .find({
  //         price: { $gt: currentPlanPrice },
  //         is_deleted: 0,
  //         status: 1,
  //       })
  //       .select('_id plan_name plan_description tier price image is_bestvalue plan_details')
  //       .sort({ price: 1 })
  //       .lean();

  //     const hostUrl = process.env.BASE_URL || 'http://localhost:3008';
  //     const formattedHigherPlans = higherPlans.map((plan) => ({
  //       _id: plan._id,
  //       plan_name: plan.plan_name,
  //       plan_description: plan.plan_description || '',
  //       tier: plan.tier,
  //       price: plan.price,
  //       image: plan.image ? `${plan.image.replace(/\\/g, '/')}` : null,
  //       is_bestvalue: plan.is_bestvalue || 0,
  //       plan_details: plan.plan_details || [],
  //     }));

  //     // Get all invoices (payment history) for the user
  //     const invoices = await this.membershipBuyModel
  //       .find({
  //         user_id: userId,
  //         status: 'paid',
  //       })
  //       .populate({
  //         path: 'membership_id',
  //         model: 'MembershipManagement',
  //         select: 'plan_name plan_description price image expiring_in tier is_bestvalue plan_details',
  //       })
  //       .sort({ date: -1 })
  //       .lean();

  //     const formattedInvoices = invoices.map((invoice: any) => {
  //       const membership = invoice.membership_id as any;
  //       const purchaseDate = invoice.date ? moment(invoice.date) : null;
  //       const quantity = 1;
  //       const unitPrice = Number(membership?.price || 0);
  //       const subtotal = unitPrice * quantity;
  //       const discount = 0; // no discount stored on membership invoices yet
  //       const total = Math.max(subtotal - discount, 0);

  //       // Generate a readable invoice number using year + last 6 chars of id
  //       const invoiceNumber = purchaseDate
  //         ? `INV-${purchaseDate.format('YYYY')}-${invoice._id.toString().slice(-6).toUpperCase()}`
  //         : `INV-${invoice._id.toString().slice(-6).toUpperCase()}`;

  //       return {
  //         // legacy fields (keep existing consumers working)
  //         _id: invoice._id,
  //         date: purchaseDate ? purchaseDate.format('DD MMMM YYYY') : null,
  //         name: user.name,
  //         amount: unitPrice,
  //         status: invoice.status === 'paid' ? 'Paid' : 'Pending',
  //         plan_name: membership?.plan_name || 'N/A',

  //         // richer invoice payload for UI
  //         invoiceNumber,
  //         invoiceDate: purchaseDate ? purchaseDate.format('DD MMM YYYY') : null,
  //         invoiceAmount: total,
  //         customer: {
  //           id: user.stripeCustomerId || userId.toString(),
  //           name: user.name,
  //           email: user.email,
  //           mobile: user['mobileNo'] || null,
  //         },
  //         membership: {
  //           id: membership?._id || null,
  //           name: membership?.plan_name || 'N/A',
  //           description: membership?.plan_description || '',
  //           tier: membership?.tier ?? null,
  //           image: membership?.image ? `${membership.image.replace(/\\/g, '/')}` : null,
  //           details: membership?.plan_details || [],
  //           unitPrice,
  //           quantity,
  //           subtotal,
  //           discount,
  //           total,
  //           expiringInDays: invoice?.expire_in ?? membership?.expiring_in ?? null,
  //           purchaseDate: purchaseDate ? purchaseDate.format('DD MMM YYYY') : null,
  //           renewalDate: invoice?.renewal_date
  //             ? moment(invoice.renewal_date).format('DD MMM YYYY')
  //             : null,
  //         },
  //         payment: {
  //           sessionId: invoice?.paymentSessionId || null,
  //         },
  //         totals: {
  //           subtotal,
  //           discount,
  //           total,
  //         },
  //       };
  //     });

  //     return {
  //       message: 'User subscription details fetched successfully!',
  //       statusCode: 200,
  //       data: {
  //         currentPlan: currentPlan
  //           ? {
  //               ...currentPlan,
  //               image: currentPlan.image
  //                 ? `${currentPlan.image.replace(/\\/g, '/')}`
  //                 : null,
  //               planStartingDate,
  //               planExpiringInDays,
  //               nextPaymentDate,
  //               expirationWarning: planExpiringInDays <= 30 && planExpiringInDays > 0,
  //             }
  //           : null,
  //         allSubscriptionPlans: formattedHigherPlans,
  //         invoices: formattedInvoices,
  //       },
  //     };
  //   } catch (error) {
  //     console.error('Error fetching user subscription details:', error);
  //     return {
  //       message: 'Failed to fetch user subscription details',
  //       statusCode: 500,
  //       error: error.message,
  //     };
  //   }
  // }

  async getUserSubscriptionDetails(user_id: string) {
    try {
      if (!user_id || !Types.ObjectId.isValid(user_id)) {
        return {
          message: 'Invalid user ID',
          statusCode: 400,
        };
      }

      const userId = new Types.ObjectId(user_id);

      // 🔹 Helper for EST conversion
      const toEST = (date: any) =>
        moment.utc(date).tz("America/New_York");

      const nowEST = moment().tz("America/New_York").startOf("day");

      // Get user
      const user = await this.userModel
        .findById(userId)
        .select('name lastName email mobileNo stripeCustomerId')
        .lean();

      if (!user) {
        return {
          message: 'User not found',
          statusCode: 404,
        };
      }

      // 🔹 Get current active membership
      const currentMembership = await this.membershipBuyModel
        .findOne({
          user_id: userId,
          status: 'paid',
          is_expired: false,
        })
        .sort({ date: -1 })
        .populate({
          path: 'membership_id',
          model: 'MembershipManagement',
          select:
            '_id plan_name plan_description tier price image expiring_in is_bestvalue plan_details cancelAtPeriodEnd',
        })
        .lean();

      let currentPlan = null;
      let planStartingDate = null;
      let planExpiringInDays = null;
      let nextPaymentDate = null;
      console.log(currentMembership?.cancelAtPeriodEnd, "currentMembership?.cancelAtPeriodEnd")
      if (currentMembership) {
        const membershipDetails = currentMembership.membership_id as any;

        const purchaseDate = toEST(currentMembership.date);
        const expireInDays =
          currentMembership.expire_in ||
          membershipDetails?.expiring_in ||
          30;

        const expirationDate = purchaseDate.clone().add(expireInDays, 'days');

        const daysUntilExpiration = expirationDate
          .clone()
          .startOf("day")
          .diff(nowEST, "days");

        const renewalDate = currentMembership.renewal_date
          ? toEST(currentMembership.renewal_date).format("MM/DD/YYYY")
          : expirationDate.clone();

        currentPlan = {
          _id: membershipDetails?._id,
          plan_name: membershipDetails?.plan_name || 'N/A',
          plan_description: membershipDetails?.plan_description || '',
          price: membershipDetails?.price || 0,
          image: membershipDetails?.image || null,
          tier: membershipDetails?.tier || 0,
          is_bestvalue: membershipDetails?.is_bestvalue || 0,
          cancelAtPeriodEnd: currentMembership?.cancelAtPeriodEnd || false,
          membershipBuyId: currentMembership._id
        };

        planStartingDate = purchaseDate.format('MM/DD/YYYY');
        planExpiringInDays = daysUntilExpiration > 0 ? daysUntilExpiration : 0;
        nextPaymentDate = renewalDate//.format('DD MMMM YYYY');

        // 🔴 Auto expire
        if (daysUntilExpiration <= 0 && !currentMembership.is_expired) {
          await this.membershipBuyModel.findByIdAndUpdate(
            currentMembership._id,
            { $set: { is_expired: true } }
          );

          currentPlan = null;
          planStartingDate = null;
          planExpiringInDays = null;
          nextPaymentDate = null;
        }
      }

      // 🔹 Higher plans
      const currentPlanPrice = currentPlan?.price || 0;

      const higherPlans = await this.membershipModel
        .find({
          price: { $gt: currentPlanPrice },
          is_deleted: 0,
          status: 1,
        })
        .select('_id plan_name plan_description tier price image is_bestvalue plan_details')
        .sort({ price: 1 })
        .lean();

      const formattedHigherPlans = higherPlans.map((plan) => ({
        _id: plan._id,
        plan_name: plan.plan_name,
        plan_description: plan.plan_description || '',
        tier: plan.tier,
        price: plan.price,
        image: plan.image ? `${plan.image.replace(/\\/g, '/')}` : null,
        is_bestvalue: plan.is_bestvalue || 0,
        plan_details: plan.plan_details || [],
      }));

      // 🔹 Invoices
      const invoices = await this.membershipBuyModel
        .find({
          user_id: userId,
          status: 'paid',
        })
        .populate({
          path: 'membership_id',
          model: 'MembershipManagement',
          select: 'plan_name plan_description price image expiring_in tier is_bestvalue plan_details',
        })
        .sort({ date: -1 })
        .lean();
      // console.log(invoices,"invoicesinvoices")
      const formattedInvoices = invoices.map((invoice: any) => {
        console.log(invoice, "invoiceinvoice")
        const membership = invoice.membership_id as any;

        const purchaseDate = invoice.date
          ? toEST(invoice.date)
          : null;

        const quantity = 1;
        const unitPrice = Number(membership?.price || 0);
        const subtotal = unitPrice * quantity;
        const discount = invoice?.discount || 0;
        const total = Math.max(subtotal - discount, 0);
        console.log(membership, discount, invoice?.discount, "gggggggggggg")

        const invoiceNumber = invoice.invoiceNo ? `Ved${invoice.invoiceNo}` : purchaseDate
          ? `INV-${purchaseDate.format('YYYY')}-${invoice._id
            .toString()
            .slice(-6)
            .toUpperCase()}`
          : `INV-${invoice._id.toString().slice(-6).toUpperCase()}`;

        return {
          _id: invoice._id,
          date: purchaseDate ? purchaseDate.format("MM/DD/YYYY") : null,
          name: user.name,
          amount: unitPrice,
          status: invoice.status === 'paid' ? 'Paid' : 'Pending',
          plan_name: membership?.plan_name || 'N/A',

          invoiceNumber,
          invoiceDate: purchaseDate
            ? purchaseDate.format('MM-DD-YYYY')
            : null,
          invoiceAmount: total,

          customer: {
            id: user.stripeCustomerId || userId.toString(),
            name: user.name,
            lastName: user?.lastName || "",
            email: user.email,
            mobile: user['mobileNo'] || null,
          },

          membership: {
            id: membership?._id || null,
            name: membership?.plan_name || 'N/A',
            description: membership?.plan_description || '',
            tier: membership?.tier ?? null,
            image: membership?.image
              ? `${membership.image.replace(/\\/g, '/')}`
              : null,
            details: membership?.plan_details || [],
            unitPrice,
            quantity,
            subtotal,
            discount,
            total,
            expiringInDays:
              invoice?.expire_in ?? membership?.expiring_in ?? null,
            purchaseDate: purchaseDate
              ? purchaseDate.format('MM-DD-YYYY')
              : null,
            renewalDate: invoice?.renewal_date
              ? toEST(invoice.renewal_date).format("MM/DD/YYYY")
              : null,
          },

          payment: {
            sessionId: invoice?.paymentSessionId || null,
          },

          totals: {
            subtotal,
            discount,
            total,
          },
        };
      });

      return {
        message: 'User subscription details fetched successfully!',
        statusCode: 200,
        data: {
          currentPlan: currentPlan
            ? {
              ...currentPlan,
              image: currentPlan.image
                ? `${currentPlan.image.replace(/\\/g, '/')}`
                : null,
              planStartingDate,
              planExpiringInDays,
              nextPaymentDate,
              expirationWarning:
                planExpiringInDays <= 30 &&
                planExpiringInDays > 0,
            }
            : null,

          allSubscriptionPlans: formattedHigherPlans,
          invoices: formattedInvoices,
        },
      };
    } catch (error) {
      console.error('Error fetching user subscription details:', error);
      return {
        message: 'Failed to fetch user subscription details',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  async upgradePlan(user_id: string, new_plan_id: string) {
    const userId = new Types.ObjectId(user_id);
    const newPlanId = new Types.ObjectId(new_plan_id);
    let discount = 0
    // fetch the new plan
    const newPlan = await this.membershipModel.findById(newPlanId);
    if (!newPlan) {
      return { statusCode: 400, message: 'New plan not found' };
    }

    // Find current active membership
    const currentMembership = await this.membershipBuyModel
      .findOne({ user_id: userId, status: 'paid', is_expired: false })
      .sort({ date: -1 });

    if (!currentMembership) {
      return { statusCode: 400, message: "View available plan details and purchase one to start enjoying member benefits.", title: "You don't have an active membership plan." };
    }

    // Validate tier (newPlan must have higher tier)
    const oldPlan = await this.membershipModel.findById(currentMembership.membership_id);
    if (!oldPlan) {
      return { statusCode: 400, message: 'Old plan not found' };
    }
    if (newPlan.tier >= oldPlan.tier) {
      return {
        statusCode: 400,
        message: 'You can only upgrade to a higher tier than your current plan.', title: "Are you sure you want to upgrade your plan"
      };
    }


    // CREATE A NEW UPGRADE ORDER
    const expiryDate = moment().add(newPlan.expiring_in, 'days');
    const membershipCount = await this.membershipBuyModel.countDocuments()
    // const upgradeRecord = new this.membershipBuyModel({
    //   membership_id: newPlanId,
    //   invoiceNo: `-M-${membershipCount + 1 + 17000}`,
    //   user_id: userId,
    //   status: 'notPaid',
    //   expire_in: newPlan.expiring_in,
    //   renewal_date: expiryDate.format('YYYY-MM-DD'),
    // });
    // const newOrder = await upgradeRecord.save();
    const membershipPrice = newPlan.price

    console.log(currentMembership, "activeMembership")
    if (currentMembership && currentMembership.membership_id.toString() !== newPlan._id.toString()) {
      console.log("aya")
      const oldMembershipData = await this.membershipModel.findById(currentMembership.membership_id)
      const oneDayPrice = oldMembershipData.price / Number(oldMembershipData.expiring_in)
      const totalPriceRemaning = Number(oneDayPrice) * Number(currentMembership?.expire_in)
      console.log(oneDayPrice, totalPriceRemaning, newPlan.price, currentMembership?.expire_in, "oneDayPrice")
      discount = totalPriceRemaning
      newPlan.price = newPlan.price - discount
      console.log(newPlan.price, "MembershipDetails.price")
    }

    // const saveData = {
    //   membership_id: newPlan,
    //   invoiceNo: `-M-${membershipCount + 1 + 17000}`,
    //   user_id: userId,
    //   status: 'notPaid',
    //   renewal_date: expiryDate.format('YYYY-MM-DD'),
    //   expire_in: newPlan.expiring_in,
    //   membership_price: Number(membershipPrice).toFixed(2),
    //   discount: discount,
    //   totalPrice: Number(newPlan.price).toFixed(2)
    // };

    // const memberManagement = new this.membershipBuyModel(saveData);
    // const newOrder = await memberManagement.save();

    // create stripe checkout session
    const payableAmount = parseFloat((Number(newPlan.price) * 100).toFixed(2));
    console.log(currentMembership.stripeSubscriptionId, 'stripeSubscriptionId');
    const subscription = await this.stripe.subscriptions.retrieve(currentMembership.stripeSubscriptionId);
    const subscriptionItemId = subscription.items.data[0].id;
    // const session = await this.stripe.checkout.sessions.create({
    //   line_items: [
    //     {
    //       price_data: {
    //         currency: 'usd',
    //         product_data: { name: newPlan.plan_name || 'Membership Upgrade' },
    //         unit_amount: payableAmount,
    //       },
    //       quantity: 1,
    //     },
    //   ],
    //   mode: 'payment',
    //   success_url: `${process.env.BASE_URL}/membership_buy_management/paymentSuccess/${newOrder._id}`,
    // });

    if (subscription.cancel_at_period_end) {

      await this.stripe.subscriptions.update(
        currentMembership.stripeSubscriptionId,
        {
          cancel_at_period_end: false,
        }
      );

    }
    const updatedSubscription = await this.stripe.subscriptions.update(currentMembership.stripeSubscriptionId,
      {
        items: [
          {
            id: subscriptionItemId,
            price: newPlan.stripePriceId,
          },
        ],
        // proration_behavior: 'create_prorations',
        proration_behavior: 'always_invoice',

        payment_behavior: 'pending_if_incomplete',
        metadata: {
          type: 'membership',
          userId: user_id,
          oldMembershipId: currentMembership.membership_id.toString(),
          newMembershipId: newPlanId.toString(),
        },
      }
    );

    /*
    | CHECK STRIPE SUCCESS
    */

    if (!updatedSubscription || updatedSubscription.status !== 'active') {
      return {
        statusCode: 400,
        message: 'Stripe subscription update failed',
      };
    }

    /*
    | SAVE MEMBERSHIP
    */
    /*
 | GET LATEST INVOICE
 */

    let paymentDetails = null;

    if (updatedSubscription.latest_invoice) {

      const invoice = await this.stripe.invoices.retrieve(
        updatedSubscription.latest_invoice as string
      );

      if (invoice.payment_intent) {

        const paymentIntent =
          await this.stripe.paymentIntents.retrieve(
            invoice.payment_intent as string
          );

        if (paymentIntent.latest_charge) {

          const charge = await this.stripe.charges.retrieve(
            paymentIntent.latest_charge as string
          );

          paymentDetails = charge.payment_method_details;
        }
      }
    }

    const saveData = {
      membership_id: newPlan._id,
      invoiceNo: `-M-${membershipCount + 1 + 17000}`,
      user_id: userId,
      status: 'paid',
      renewal_date: expiryDate.format('YYYY-MM-DD'),
      expire_in: newPlan.expiring_in,
      membership_price: Number(membershipPrice).toFixed(2),
      discount: discount,
      totalPrice: Number(newPlan.price).toFixed(2),
      stripeSubscriptionId: updatedSubscription.id,
      paymentType: 'upgrade',
      is_expired: false,
      paymentDetails
    };
    /*
     | CREATE NEW MEMBERSHIP
     */

    const newMembership = await this.membershipBuyModel.create(saveData);

    /*
    | EXPIRE OLD MEMBERSHIP
    */

    await this.membershipBuyModel.updateMany(
      {
        user_id: userId,
        _id: { $ne: newMembership._id },
      },
      {
        $set: { is_expired: true },
      },
    );


    return {
      message: 'Plan upgraded successfully',
      statusCode: 200,
      data: newMembership,
      paymentUrl: `${process.env.FRONTEND_URL}/Memberships/Thankyou/${newMembership._id}`
    };

    // await this.membershipBuyModel.findByIdAndUpdate(newOrder._id, {
    //   $set: { paymentSessionId: session.id || '' },
    // });

    // return {
    //   message: 'Upgrade initiated',
    //   statusCode: 200,
    //   paymentUrl: session.url,
    //   orderId: newOrder._id,
    // };
    return {
      message: 'Plan upgrade initiated',
      statusCode: 200,
    };
  }


  async cancelMemberShip(user_id: string, plan_id: string) {
    try {
      const userId = new Types.ObjectId(user_id);
      const planId = new Types.ObjectId(plan_id);

      // fetch the new plan
      // const newPlan = await this.membershipBuyModel.findById(planId);

      // if (!newPlan) {
      //   return { statusCode: 400, message: 'New plan not found' };
      // }

      // Find current active membership
      const currentMembership = await this.membershipBuyModel.findOne({ _id: planId, user_id: userId, status: 'paid', is_expired: false });
      console.log(currentMembership, "currentMembership")
      if (!currentMembership) {
        return { statusCode: 400, message: "Something went wrong" };
      } else {
        const result = await this.stripe.subscriptions.update(
          currentMembership.stripeSubscriptionId,
          {
            cancel_at_period_end: true,
          }
        );
        console.log(result, "yyyyyyyy")
        await this.membershipBuyModel.findByIdAndUpdate(
          currentMembership._id,
          {
            $set: {
              cancelAtPeriodEnd: true,
            },
          },
        );
        const userData = await this.userModel.findById(userId)
        sendMembershipCancellationMail(userData.email, `${userData.name} ${userData.lastName}`)
        const footerData = await this.masterModel.findOne({ dropdown_type: "footer_data" })
        const membershipDetails = await this.membershipModel.findById(currentMembership.membership_id);
        sendMembershipCancellationAdminMail(
          footerData.email || 'admin@vedichealth.org',
          `${userData.name} ${userData.lastName}`,
          userData.email,
          {
            planName: membershipDetails.plan_name,
            startDate: new Date(currentMembership?.date).toLocaleDateString("en-US", {
            timeZone: "America/New_York",
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),
            amountPaid: `$ ${membershipDetails.price}`,
            invoiceNo: `Ved${currentMembership.invoiceNo}`
          })
        return { statusCode: 200, message: "Membership canceled successfully" };
      }
    } catch (error) {
      console.log(error, 'eeeeeeeeee');
      // throw new Error(error.message);
      return {
        message: 'Something went wromg',
        statusCode: 400,
        error: error.message
      };
    }
  }

  async getMemberShipByPaymentId(id: string, user_id: string) {
    try {
      const userId = new Types.ObjectId(user_id);
      const planId = new Types.ObjectId(id);

      // fetch the new plan
      const newPlan = await this.membershipBuyModel.findById(planId);

      if (!newPlan) {
        return { statusCode: 400, message: 'New plan not found' };
      }

      // Find current active membership
      const currentMembership = await this.membershipBuyModel.findOne({ _id: planId, user_id: userId, is_expired: false });

      if (!currentMembership) {
        return { statusCode: 400, message: "Something went wrong" };
      } else {
        return { statusCode: 200, message: "Membership find successfully", data: currentMembership };
      }
    } catch (error) {
      console.log(error, 'eeeeeeeeee');
      // throw new Error(error.message);
      return {
        message: 'Something went wromg',
        statusCode: 400,
        error: error.message
      };
    }
  }

}