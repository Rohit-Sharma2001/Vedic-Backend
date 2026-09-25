import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
let { ObjectId } = require('mongoose').Types;
import Stripe from 'stripe';
import {
    sendRefundProcessedEmail
} from '../../middlewares/nodemailer/nodemailer.controller';
import { Master, MasterSchema, MasterDocument, returnOrder, returnOrderDocument, ProductDocument, Product, orderManagement, OrderDocument } from '../../schema/schema';

@Injectable()
export class returnOrderService {
  private stripe: Stripe;
  constructor(
    @InjectModel(returnOrder.name) private returnOrderModel: Model<returnOrderDocument>,
    @InjectModel(Master.name) private masterModel: Model<MasterDocument>,
    @InjectModel(Product.name) private productManagementModel: Model<ProductDocument>,
    @InjectModel(orderManagement.name) private orderManagementModel: Model<OrderDocument>
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      // apiVersion: '2023-10-16',
    });
  }

  // async applyforReturn(order): Promise<any> {
  //   try {
  //     console.log(order, "oooooooooooo")
  //     const saveData = {
  //       // userId: new ObjectId(order.userId),
  //       orderId: new Types.ObjectId(order.orderId),
  //       productId: [new Types.ObjectId(order.productId)],
  //       products: [order.products],
  //       // reason: order.reason,
  //       // otherReason: order.otherReason,
  //       // comment: order.comment, 
  //     };
  //     console.log(saveData, "saveData")

  //     const orderManagement = new this.returnOrderModel(saveData);
  //     let returnData = orderManagement.save();
  //     return {
  //       message: 'Return Order saved successfully',
  //       statusCode: 200,
  //       data: returnData
  //     };

  //   } catch (error) {
  //     throw new Error(`Error fetching return order: ${error.message}`);
  //   }
  // }

  async applyforReturn(order): Promise<any> {
    try {
      const orderId = new Types.ObjectId(order.orderId);
      const productId = new Types.ObjectId(order.productId);

      // Check if return already exists for this orderId + productId
      const existing = await this.returnOrderModel.findOne({
        orderId,
        productId: { $in: [productId] }
      });

      if (existing) {
        return {
          message: 'Return already requested for this product in the order',
          statusCode: 400,
          data: existing,
        };
      }

      let returnData;

      // Check if orderId exists but with different productId
      const existingOrder = await this.returnOrderModel.findOne({ orderId });

      if (existingOrder) {
        // Push new productId and product
        returnData = await this.returnOrderModel.findByIdAndUpdate(
          existingOrder._id,
          {
            $push: {
              productId: productId,
              products: order.products
            }
          },
          { new: true } // return updated doc
        );
      } else {
        // Else create new return order
        const saveData = {
          orderId,
          productId: [productId],
          products: [order.products],
        };

        const orderManagement = new this.returnOrderModel(saveData);
        returnData = await orderManagement.save();
      }
      console.log(order.products, "order.products")

      // await Promise.all(
      // order.products.map(product => 
      await this.productManagementModel.findByIdAndUpdate(
        new ObjectId(order.products._id),
        {
          $inc: {
            stock: order.products.quantity,      // increase stock
            buy_count: -order.products.quantity, // decrease buy_count
          },
        },
        { new: true }
      )
      // )
      // );

      return {
        message: existingOrder ? 'Return product added to existing return order' : 'Return Order saved successfully',
        statusCode: 201,
        data: returnData,
      };
    } catch (error) {
      throw new Error(`Error applying for return: ${error.message}`);
    }
  }



  async getReturnOrderAtAdmin(id): Promise<any> {
    try {
      let filter = {}
      if (id) {
        filter['_id'] = new Types.ObjectId(id)
      }
      console.log(filter, "fffffff")
      const result = await this.returnOrderModel.aggregate([
        { $match: filter }, {
          $lookup: {
            from: "products",
            let: {
              productIds: {
                $map: {
                  input: "$productId",
                  as: "id",
                  in: { $toObjectId: "$$id" }
                }
              }
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$productIds"]
                  }
                }
              }
            ],
            as: "productItem"
          }
        },
        {
          $lookup: {
            from: "ordermanagements",
            localField: "orderId",
            foreignField: "_id",
            as: "orderDetails"
          }
        },
        { $unwind: { path: "$orderDetails", preserveNullAndEmptyArrays: true } },
        // { $sort: { created_at: -1 } }
      ]);

      return {
        message: 'Return Order fatched successfully',
        statusCode: 200,
        data: result
      };
    } catch (error) {
      throw new Error(`Error fetching Return Order data: ${error.message}`);
    }
  }

  async returnApprove(order): Promise<any> {
    try {
      const result = await this.returnOrderModel.findOneAndUpdate({ _id: new ObjectId(order._id) },
        {
          $set: {
            status: 'approved'
          },
        });

      return {
        message: 'Order placed for return approvel',
        statusCode: 200,
        data: result
      };
    } catch (error) {
      throw new Error(`Error fetching dashboard data: ${error.message}`);
    }
  }


  async getUserReturnOrder(order): Promise<any> {
    try {

      const result = await this.orderManagementModel.aggregate([
        { $match: { userId: new Types.ObjectId(order.user), status: "paid" } },
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
            localField: "_id",
            foreignField: "orderId",
            as: "returnData"
          }
        },
        {
          $match: {
            "returnData.0": { $exists: true }
          }
        },
        {
          $sort: {
            created_at: -1
          }
        }
      ]).exec();

      return {
        message: 'Return Order fatched successfully',
        statusCode: 200,
        data: result
      };
    } catch (error) {
      throw new Error(`Error fetching Return Order data: ${error.message}`);
    }
  }
//Old API refund api
  // async applyForReturnByAdmin(order: any): Promise<any> {
  //   try {
  //     console.log(order, "orderorderorder");
  //     const [orderData] = await this.orderManagementModel.aggregate([
  //       { $match: { _id: new Types.ObjectId(order.orderId) } },
  //       {
  //         $lookup: {
  //           from: 'coupons',
  //           localField: 'couponId',
  //           foreignField: 'couponCode',
  //           as: 'couponData'
  //         }
  //       },
  //       { $unwind: { path: '$couponData', preserveNullAndEmptyArrays: true } }
  //     ]);

  //     if (orderData?.paymentSessionId&&order?.paymentMethod=='online') {
  //       // return {
  //       //   message: 'This order cannot be refunded, maybe payment not paid.',
  //       //   statusCode: 404
  //       // };
  //     // }

  //     const session = await this.stripe.checkout.sessions.retrieve(orderData.paymentSessionId);
  //     const paymentIntentId = session?.payment_intent;

  //     if (typeof paymentIntentId !== 'string') {
  //       return {
  //         message: 'Payment not completed or intent not created yet.',
  //         statusCode: 400
  //       };
  //     }
  //   }
  //     // Calculate total & discount
  //     // const totalAmount = order.selectedProducts?.reduce((sum, p) => sum + p.productPrice, 0) || 0;
  //     const { totalAmount, productIds } = order.selectedProducts?.reduce(
  //       (acc, p) => {
  //         acc.totalAmount += p.productPrice;
  //         acc.productIds.push(new Types.ObjectId(p._id));
  //         return acc;
  //       },
  //       { totalAmount: 0, productIds: [] }
  //     ) || { totalAmount: 0, productIds: [] };

  //     let discount = 0;

  //     const coupon = orderData.couponData;
  //     if (orderData.discountAmount && coupon) {
  //       const baseDiscount = coupon.discountType === "percentage"
  //         ? (coupon.discountValue / 100) * orderData.totalPrice
  //         : coupon.discountValue;

  //       discount = coupon.maxDiscount
  //         ? Math.min(baseDiscount, coupon.maxDiscount)
  //         : baseDiscount;
  //     }
  //     console.log(totalAmount, discount, "totalAmount - discount")
  //     // Process refund
  //     // const refund = await this.stripe.refunds.create({
  //     //   payment_intent: paymentIntentId,
  //     //   amount: totalAmount - discount
  //     // });

  //     // if (refund.status !== 'succeeded') {
  //     //   return {
  //     //     message: `Refund failed with status: ${refund.status}`,
  //     //     statusCode: 400
  //     //   };
  //     // }

  //     // Revert stock/buy_count
  //     await Promise.all(
  //       order.selectedProducts.map(product => {
  //         console.log(product, "pppppppp");

  //         return this.productManagementModel.findByIdAndUpdate(
  //           { _id: new Types.ObjectId(product._id) },
  //           {
  //             $inc: {
  //               stock: +product.quantity,
  //               buy_count: -product.quantity
  //             }
  //           }
  //         );
  //       })
  //     );

  //     const saveData = {
  //       orderId: new ObjectId(order.orderId),
  //       productId: productIds,
  //       products: order.selectedProducts,
  //       status: 'orderReturned'
  //     }
  //     await this.returnOrderModel.findOneAndUpdate(
  //       { orderId: new Types.ObjectId(order.orderId) },
  //       {
  //         $set: { status: 'orderReturned' },
  //         $addToSet: {
  //           productId: { $each: productIds },
  //           products: { $each: order.selectedProducts }
  //         }
  //       },
  //       { upsert: true, new: true }
  //     );
  //     return {
  //       message: 'Order returned and stock reverted successfully.',
  //       statusCode: 200
  //     };

  //   } catch (error) {
  //     console.error('Error in getpaymentid:', error);
  //     return {
  //       message: 'An error occurred while processing the refund.',
  //       statusCode: 500,
  //       error: error?.message || error
  //     };
  //   }
  // }
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
  async applyForReturnByAdmin(order: any): Promise<any> {
  try {
    
    const [orderData] = await this.orderManagementModel.aggregate([
      { $match: { _id: new Types.ObjectId(order.orderId) } },
      {
        $lookup: {
          from: 'coupons',
          localField: 'couponId',
          foreignField: 'couponCode',
          as: 'couponData'
        }
      },
      { $unwind: { path: '$couponData', preserveNullAndEmptyArrays: true } },
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

    if (!orderData) {
      return { message: 'Order not found', statusCode: 404 };
    }

    // ❌ Prevent duplicate refund
    if (orderData.isRefunded) {
      return {
        message: 'Refund already processed for this order',
        statusCode: 400
      };
    }

    let paymentIntentId: string | null = null;

    // =========================
    // ✅ STRIPE REFUND PROCESS
    // =========================
    console.log(orderData,"orderDataorderData")
    if (orderData?.paymentSessionId && orderData?.paymentMethod === 'online'&&orderData.grandTotal!==0) {
      const session = await this.stripe.checkout.sessions.retrieve(
        orderData.paymentSessionId
      );

      if (session.payment_status !== 'paid') {
        return {
          message: 'Payment not completed. Cannot refund.',
          statusCode: 400
        };
      }

      paymentIntentId = session.payment_intent as string;

      if (!paymentIntentId) {
        return {
          message: 'PaymentIntent not found.',
          statusCode: 400
        };
      }
    }

    // =========================
    // ✅ CALCULATE REFUND AMOUNT
    // =========================
    const { totalAmount, productIds } =
      order.selectedProducts?.reduce(
        (acc, p) => {
          acc.totalAmount += p.productPrice;
          acc.productIds.push(new Types.ObjectId(p._id));
          return acc;
        },
        { totalAmount: 0, productIds: [] }
      ) || { totalAmount: 0, productIds: [] };

    let discount = 0;
    const coupon = orderData.couponData;

    if (orderData.discountAmount && coupon) {
      const baseDiscount =
        coupon.discountType === 'percentage'
          ? (coupon.discountValue / 100) * orderData.totalPrice
          : coupon.discountValue;

      discount = coupon.maxDiscount
        ? Math.min(baseDiscount, coupon.maxDiscount)
        : baseDiscount;
    }else if (orderData.adminDiscount){
      discount = orderData.adminDiscount
    }

    // Final refund amount
    const refundAmount = Math.max(totalAmount - discount, 0);
console.log(refundAmount,totalAmount , discount,"refundAmount")
    // =========================
    // ✅ STRIPE REFUND CALL
    // =========================
    let refundResponse: any = null;

    if (paymentIntentId) {
      const refundAmountInPaise = Math.round(refundAmount * 100); // ⚠️ important

      refundResponse = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: refundAmountInPaise
      });

      if (refundResponse.status !== 'succeeded') {
        return {
          message: `Refund failed: ${refundResponse.status}`,
          statusCode: 400
        };
      }
    }

    // =========================
    // ✅ REVERT STOCK
    // =========================
    await Promise.all(
      order.selectedProducts.map((product) =>
        this.productManagementModel.findByIdAndUpdate(
          { _id: new Types.ObjectId(product._id) },
          {
            $inc: {
              stock: +product.quantity,
              buy_count: -product.quantity
            }
          }
        )
      )
    );

    // =========================
    // ✅ SAVE RETURN DATA
    // =========================
    await this.returnOrderModel.findOneAndUpdate(
      { orderId: new Types.ObjectId(order.orderId) },
      {
        $set: { status: 'orderReturned' },
        $addToSet: {
          productId: { $each: productIds },
          products: { $each: order.selectedProducts }
        }
      },
      { upsert: true, new: true }
    );

    // =========================
    // ✅ UPDATE ORDER STATUS
    // =========================
    await this.orderManagementModel.findByIdAndUpdate(order.orderId, {
      $set: {
        isRefunded: paymentIntentId ? true : false,
        refundId: refundResponse?.id || null,
        refundAmount: refundAmount
      }
    });
    console.log(orderData.userInfo,"order.userInfo")
                if (orderData.userInfo) {
                    const customerName = `${orderData.userInfo.name} ${orderData?.userInfo?.lastName}`
                    const orderDateEST = this.formatToEST(orderData.created_at);
                    const cancellationDateEST = this.formatToEST(new Date());
                     
                    sendRefundProcessedEmail(
                        orderData.userInfo.email,
                        customerName,
                        `Ved${orderData.invoiceNo}`,
                        orderData.orderItems,
                        refundAmount.toString(),
                        cancellationDateEST                        
                    )
                  
                }

    return {
      message: paymentIntentId
        ? 'Refund processed and order returned successfully.'
        : 'Order returned successfully.',
      statusCode: 200
    };

  } catch (error) {
    console.error('Error in applyForReturnByAdmin:', error);
    return {
      message: 'An error occurred while processing the refund.',
      statusCode: 500,
      error: error?.message || error
    };
  }
}

  async findOneById(page: number, pageSize: number, id: string, order_id: string): Promise<any> {
    try {
      let objectId
      const skip = (page - 1) * pageSize;
      const limit = pageSize;
      const filter: any = {};
      console.log(page, pageSize, skip, "skip")
      if (id) {
        objectId = new Types.ObjectId(id);
        filter['order.userId'] = objectId
      }

      if (order_id) {
        objectId = new Types.ObjectId(order_id);
        filter['OrderId'] = objectId
      }
      // const cartData = await this.orderManagementModel.find(filter).exec()
      // const cartData = await this.orderManagementModel.aggregate([{ $match: filter }, {
      //   $lookup: {
      //     from: "addresses",
      //     localField: "addressId",
      //     foreignField: "_id",
      //     as: "address"
      //   }
      // },
      // { $unwind: { path: "$address", preserveNullAndEmptyArrays: true } },
      // {
      //   $lookup: {
      //     from: "cartmanagements",
      //     let: { cartIds: "$cartIds" }, // cartId is assumed to be an array
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $in: ["$_id", "$$cartIds"]
      //           }
      //         }
      //       }
      //     ],
      //     as: "cartItems"
      //   }
      // },
      // {
      //   $lookup: {
      //     from: "products",
      //     let: { productIds: "$orderItems._id" }, // extract all product ids
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: { $in: ["$_id", "$$productIds"] }
      //         }
      //       }
      //     ],
      //     as: "productItem"
      //   }
      // },
      // {
      //   $lookup: {
      //     from: "returnorders",
      //     let: { orderId: "$_id" }, // pass the order’s _id
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: { $eq: ["$orderId", "$$orderId"] }
      //         }
      //       },
      //       {
      //         $project: {
      //           _id: 0,          // remove _id
      //           productId: 1     // keep only productId
      //         }
      //       }
      //     ],
      //     as: "returnItem"
      //   }
      // }, {
      //   $addFields: {
      //     returnItem: {
      //       $reduce: {
      //         input: "$returnItem",
      //         initialValue: [],
      //         in: { $concatArrays: ["$$value", ["$$this.productId"]] }
      //       }
      //     }
      //   }
      // },
      // {
      //   $sort: {
      //     created_at: -1
      //   }
      // },
      // {
      //   $skip: skip
      // },
      // {
      //   $limit: limit
      // }]).exec()
      const cartData = await this.returnOrderModel.aggregate([
        {
          $match: filter
        },

        {
          $lookup: {
            from: "ordermanagements",
            localField: "orderId",
            foreignField: "_id",
            as: "order"
          }
        },

        { $unwind: "$order" },

        {
          $match: {
            "order.status": "paid",
            // ...(id && { "order.userId": new Types.ObjectId(id) })
          }
        },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "productItem"
          }
        },

        // { $unwind: { path: "$productItem", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "addresses",
            localField: "order.addressId",
            foreignField: "_id",
            as: "address"
          }
        },

        { $unwind: { path: "$address", preserveNullAndEmptyArrays: true } },

        {
          $sort: {
            "order.created_at": -1
          }
        },

        { $skip: skip },
        { $limit: limit }
      ])
      const totalCount = await this.orderManagementModel.countDocuments(filter).exec();
      console.log([
        {
          $match: filter
        },

        {
          $lookup: {
            from: "ordermanagements",
            localField: "orderId",
            foreignField: "_id",
            as: "order"
          }
        },

        { $unwind: "$order" },

        // {
        //   $match: {
        //     "order.status": "paid",
        //     // ...(id && { "order.userId": new Types.ObjectId(id) })
        //   }
        // },

        // {
        //   $lookup: {
        //     from: "addresses",
        //     localField: "order.addressId",
        //     foreignField: "_id",
        //     as: "address"
        //   }
        // },

        // { $unwind: { path: "$address", preserveNullAndEmptyArrays: true } },

        // {
        //   // $sort: {
        //   //   "order.created_at": -1
        //   // }
        // },

        { $skip: skip },
        { $limit: limit }
      ])
      console.log(cartData, filter, "cartData")
      if (!cartData) {
        throw new Error(`cartData not found with id: ${id}`);
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

        //         const dates = { pickupDate: null, shippedDate: null, deliveredDate: null };
        //         const shipmentStatus = shipmentRes.data.tracking_status?.status;

        //         // ✅ always assign returnOrder, default false
        //         order.returnOrder = (shipmentStatus === 'QUEUED' || shipmentStatus === 'TRANSIT');

        //         for (const event of shipmentRes.data.tracking_history) {
        //             const detail = event.status_details.toLowerCase();
        //             const status = event.status.toLowerCase();

        //             if (!dates.pickupDate && detail.includes("electronic shipment information")) {
        //                 dates.pickupDate = new Date(event.status_date).toISOString();
        //             }
        //             if (!dates.shippedDate && (status === "transit" || detail.includes("departed from the origin"))) {
        //                 dates.shippedDate = new Date(event.status_date).toISOString();
        //             }
        //             if (!dates.deliveredDate && status === "delivered") {
        //                 dates.deliveredDate = new Date(event.status_date).toISOString();
        //             }
        //         }

        //         // ✅ assign deliveryDates into order
        //         order.deliveryDates = dates;
        //     } else {
        //         // ensure keys exist even if no shipment
        //         order.returnOrder = false;
        //         order.deliveryDates = { pickupDate: null, shippedDate: null, deliveredDate: null };
        //     }
        // }


        // console.log(cartData)

        return {
          message: 'order Data successfully fetched!',
          statusCode: 201,
          data: cartData,
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

  // async approveReturnByAdmin(order: any): Promise<any> {
  //   try {
  //     console.log(order, "orderorderorder");
  //     const [orderData] = await this.orderManagementModel.aggregate([
  //       { $match: { _id: new Types.ObjectId(order.orderId) } },
  //       {
  //         $lookup: {
  //           from: 'coupons',
  //           localField: 'couponId',
  //           foreignField: 'couponCode',
  //           as: 'couponData'
  //         }
  //       },
  //       { $unwind: { path: '$couponData', preserveNullAndEmptyArrays: true } }
  //     ]);

  //     if (!orderData?.paymentSessionId) {
  //       return {
  //         message: 'This order cannot be refunded, maybe payment not paid.',
  //         statusCode: 404
  //       };
  //     }
  //     await Promise.all(
  //       order.selectedProducts.map(product => {
  //         this.productManagementModel.findByIdAndUpdate(
  //           { _id: new ObjectId(product._id) },
  //           {
  //             $inc: {
  //               stock: +product.quantity,
  //               buy_count: -product.quantity
  //             }
  //           })
  //       })

  //     );
  //     return {
  //       message: 'Order refunded and stock reverted successfully.',
  //       statusCode: 200
  //     };
  //   } catch (error) {
  //     console.error('Error in getpaymentid:', error);
  //     return {
  //       message: 'An error occurred while processing the refund.',
  //       statusCode: 500,
  //       error: error?.message || error
  //     };
  //   }
  // }
}