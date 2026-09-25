import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
let { ObjectId } = require('mongoose').Types;

import { cartManagement, cartManagementSchema, CartDocument, Product, ProductDocument } from '../../schema/schema';

@Injectable()
export class cartManagementService {
    constructor(@InjectModel(cartManagement.name) private cartManagementModel: Model<CartDocument>,
        @InjectModel(Product.name) private productManagementModel: Model<ProductDocument>,
    ) { }

    // async addCart(cartManagementData: Partial<cartManagement>): Promise<{ createdCartManagement: cartManagement; count: number }> {
    //     const userId = new Types.ObjectId(cartManagementData.userId);
    //     const productId = new Types.ObjectId(cartManagementData.productId);
    //     const product_data = await this.productManagementModel.findById(productId)

    //     console.log(product_data, "productId")
    //     const cart_data = await this.cartManagementModel.findOne({
    //         userId: userId,
    //         productId: productId
    //     })
    //     console.log(cart_data, "cart_data")
    //     const updatedCount = Number(cart_data.quantity) + Number(cartManagementData.quantity)
    //     if (cart_data && product_data) {
    //         if (cart_data.quantity <) {

    //         }
    //     }
    //     // Find and update or create if not exists
    //     const createdCartManagement = await this.cartManagementModel.findOneAndUpdate(
    //         {
    //             userId: userId,
    //             productId: productId
    //         },
    //         {
    //             $inc: { quantity: cartManagementData.quantity } // Increment quantity
    //         },
    //         { returnDocument: "after", upsert: true, new: true }
    //     ).exec(); // Ensure it's awaited properly

    //     // Get updated cart count
    //     const count = await this.cartManagementModel.countDocuments({ userId: userId });

    //     return { createdCartManagement, count };
    // }
    async addCart(cartManagementData: Partial<cartManagement>): Promise<any> {
        try {
            const userId = new Types.ObjectId(cartManagementData.userId);
            const productId = new Types.ObjectId(cartManagementData.productId);

            const product_data = await this.productManagementModel.findById(productId);
            console.log(product_data, "product_data")
            if (!product_data) {
                // throw new Error("Product not found");
                return {
                    message: "Product not found",
                    statusCode: 204,
                    error: ''
                };
            }
            const cart_data = await this.cartManagementModel.findOne({
                userId: userId,
                productId: productId,
            });

            const existingQty = cart_data ? Number(cart_data.quantity) : 0;
            const addedQty = Number(cartManagementData.quantity) || 0;
            const updatedCount = existingQty + addedQty;

            if (updatedCount > product_data.stock) {
                return {
                    message: `Cannot add to cart. Available stock is only ${product_data.stock}.`,
                    statusCode: 204,
                    error: `Cannot add to cart. Available stock is only ${product_data.stock}.`
                };
                // throw new Error(
                //     `Cannot add to cart. Available stock is only ${product_data.stock}.`
                // );
            }

            if (updatedCount < product_data.minOrderQuantity) {
                // throw new Error(
                //     `Minimum order quantity is ${product_data.minOrderQuantity}.`
                // );
                return {
                    message: `Minimum order quantity is ${product_data.minOrderQuantity}.`,
                    statusCode: 204,
                    error: `Minimum order quantity is ${product_data.minOrderQuantity}`
                };
            }

            if (updatedCount > product_data.maxOrderQuantity) {
                // throw new Error(
                //     `Maximum order quantity is ${product_data.maxOrderQuantity}.`
                // );
                return {
                    message: `Maximum order quantity is ${product_data.maxOrderQuantity}.`,
                    statusCode: 204,
                    error: `Maximum order quantity is ${product_data.maxOrderQuantity}.`
                };
            }

            // ✅ Passed validations → upsert into cart
            const createdCartManagement = await this.cartManagementModel.findOneAndUpdate(
                {
                    userId: userId,
                    productId: productId,
                },
                {
                    $inc: { quantity: addedQty }, // Increment quantity
                },
                { returnDocument: "after", upsert: true, new: true }
            )
                .exec();

            // Get updated cart count for the user
            const count = await this.cartManagementModel.countDocuments({ userId: userId });

            return { createdCartManagement, count };
        } catch (error) {
            console.error('Error fetching cartManagementData:', error);
            return {
                message: 'An error occurred while fetching the cartManagementData',
                statusCode: 500,
                error: error.message,
            };
        }
    }


    // async findOneById(page: number, pageSize: number, id: string, productId: string, selected: Number): Promise<any> {
    //     try {
    //         const objectId = new Types.ObjectId(id);
    //         const skip = (page - 1) * pageSize;
    //         const limit = pageSize;
    //         let matchCond = { userId: objectId };

    //         if (productId) {
    //             let pID = new Types.ObjectId(productId);
    //             matchCond['productId'] = pID;
    //         }


    //         if (selected) {
    //             let pID = new Types.ObjectId(productId);
    //             matchCond['selected'] = 1;
    //         }
    //         const cartData = await this.cartManagementModel.aggregate([
    //             { $match: matchCond },

    //             // Lookup product details
    //             {
    //                 $lookup: {
    //                     from: "products",
    //                     localField: "productId",
    //                     foreignField: "_id",
    //                     as: "productDetails"
    //                 }
    //             },
    //             { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },

    //             // Lookup category details
    //             {
    //                 $lookup: {
    //                     from: "masters", // Adjust collection name as needed
    //                     localField: "productDetails.category",
    //                     foreignField: "_id",
    //                     as: "categoryDetails"
    //                 }
    //             },
    //             { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },

    //             // Lookup brand details
    //             {
    //                 $lookup: {
    //                     from: "masters", // Adjust collection name as needed
    //                     localField: "productDetails.brand",
    //                     foreignField: "_id",
    //                     as: "brandDetails"
    //                 }
    //             },
    //             { $unwind: { path: "$brandDetails", preserveNullAndEmptyArrays: true } },

    //             // Project required fields

    //             {
    //                 $project: {
    //                     _id: 1,
    //                     productId: 1,
    //                     userId: 1,
    //                     quantity: 1,
    //                     status: 1,
    //                     selected: 1,
    //                     productDetails: {
    //                         _id: "$productDetails._id",
    //                         productName: "$productDetails.productName",
    //                         buy_one_get_one: "$productDetails.buy_one_get_one",
    //                         sku_id: "$productDetails.sku_id",
    //                         price: "$productDetails.price",
    //                         coverImage: "$productDetails.coverImage",
    //                         category: "$productDetails.category",
    //                         brand: "$productDetails.brand",
    //                         category_name: "$categoryDetails.name", // Add category name
    //                         brand_name: "$brandDetails.name",
    //                         subCategory: "$productDetails.subCategory",
    //                         itemType: "$productDetails.itemType",
    //                         stock: "$productDetails.stock",
    //                         buy_count: "$productDetails.buy_count",
    //                         minOrderQuantity: "$productDetails.minOrderQuantity",
    //                         maxOrderQuantity: "$productDetails.maxOrderQuantity",
    //                         product_description: "$productDetails.product_description",
    //                         ingredients: "$productDetails.ingredients",
    //                         additionalImages: "$productDetails.additionalImages",
    //                         weight: "$productDetails.weight",
    //                         is_deleted: "$productDetails.is_deleted",
    //                         date: "$productDetails.date",
    //                         modified: "$productDetails.modified",
    //                         imageUrl: "$productDetails.imageUrl",
    //                     }
    //                 }
    //             },

    //             { $skip: skip },
    //             { $limit: limit }
    //         ]).exec();

    //         const totalCount = await this.cartManagementModel.countDocuments(matchCond).exec();

    //         const hostUrl = `http://localhost:3008`;
    //         let data = cartData.map(e => ({
    //             ...e,
    //             productDetails: {
    //                 ...e.productDetails,
    //                 imageUrl: e?.productDetails?.coverImage
    //                     ? `${hostUrl}/${e.productDetails.coverImage.replace(/\\/g, '/')}`
    //                     : null
    //             }
    //         }));

    //         return {
    //             message: 'Cart Data successfully fetched!',
    //             statusCode: 201,
    //             data,
    //             totalCount,
    //             page,
    //             pageSize,
    //             totalPages: Math.ceil(totalCount / pageSize),
    //         };

    //     } catch (error) {
    //         console.error('Error fetching cartManagementData:', error);
    //         return {
    //             message: 'An error occurred while fetching the cartManagementData',
    //             statusCode: 500,
    //             error: error.message,
    //         };
    //     }
    // }

    async findOneById(page: number, pageSize: number, id: string, productId: string, selected: Number): Promise<any> {
        try {
            const objectId = new Types.ObjectId(id);
            const skip = (page - 1) * pageSize;

            const matchCond: any = {
                userId: objectId,
                status: 'notBuyed'
            };

            if (productId) {
                matchCond.productId = new Types.ObjectId(productId);
            }

            if (selected !== undefined && selected !== null) {
                matchCond.selected = selected;
            }

            const cartData = await this.cartManagementModel.aggregate([

                {
                    $match: matchCond
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                {
                    $unwind: {
                        path: '$productDetails',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'masters',
                        localField: 'productDetails.category',
                        foreignField: '_id',
                        as: 'categoryDetails'
                    }
                },
                {
                    $unwind: {
                        path: '$categoryDetails',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'masters',
                        localField: 'productDetails.brand',
                        foreignField: '_id',
                        as: 'brandDetails'
                    }
                },
                {
                    $unwind: {
                        path: '$brandDetails',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'appointmentmanagements',
                        localField: 'appointmentId',
                        foreignField: '_id',
                        as: 'appointmentDetails'
                    }
                },
                {
                    $unwind: {
                        path: '$appointmentDetails',
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $lookup: {
                        from: 'users',
                        localField: 'appointmentDetails.userId',
                        foreignField: '_id',
                        as: 'appointmentUser'
                    }
                },
                {
                    $unwind: {
                        path: '$appointmentUser',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'employees',
                        localField: 'appointmentDetails.employeeId',
                        foreignField: '_id',
                        as: 'appointmentEmployee'
                    }
                },
                {
                    $unwind: {
                        path: '$appointmentEmployee',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'servicesmanagements',
                        localField: 'appointmentDetails.serviceId',
                        foreignField: '_id',
                        as: 'appointmentService'
                    }
                },
                {
                    $unwind: {
                        path: '$appointmentService',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'appointmentEmployee.userId',
                        foreignField: '_id',
                        as: 'employeeUser'
                    }
                },
                {
                    $unwind: {
                        path: '$employeeUser',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'centermanagements',
                        localField: 'appointmentDetails.centerId',
                        foreignField: '_id',
                        as: 'appointmentCenter'
                    }
                },
                {
                    $unwind: {
                        path: '$appointmentCenter',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        _id: 1,
                        productId: 1,
                        appointmentId: 1,
                        userId: 1,
                        quantity: 1,
                        status: 1,
                        selected: 1,
                        type: 1,
                        appointmentDate: '$appointmentDetails.date',
                        productDetails: {
                            $cond: [
                                { $eq: ['$type', 'shop'] },
                                {
                                    _id: '$productDetails._id',
                                    productName: '$productDetails.productName',
                                    buy_one_get_one: '$productDetails.buy_one_get_one',
                                    sku_id: '$productDetails.sku_id',
                                    price: '$productDetails.price',
                                    coverImage: '$productDetails.coverImage',
                                    category: '$productDetails.category',
                                    brand: '$productDetails.brand',
                                    category_name: '$categoryDetails.name',
                                    brand_name: '$brandDetails.name',
                                    subCategory: '$productDetails.subCategory',
                                    itemType: '$productDetails.itemType',
                                    stock: '$productDetails.stock',
                                    buy_count: '$productDetails.buy_count',
                                    minOrderQuantity: '$productDetails.minOrderQuantity',
                                    maxOrderQuantity: '$productDetails.maxOrderQuantity',
                                    product_description:
                                        '$productDetails.product_description',
                                    ingredients: '$productDetails.ingredients',
                                    additionalImages:
                                        '$productDetails.additionalImages',
                                    weight: '$productDetails.weight',
                                    is_deleted: '$productDetails.is_deleted',
                                    date: '$productDetails.date',
                                    modified: '$productDetails.modified',
                                    imageUrl: '$productDetails.coverImage'
                                },
                                null
                            ]
                        },

                        appointmentDetails: {
                            $cond: [
                                { $eq: ['$type', 'appointment'] },
                                {
                                    _id: '$appointmentDetails._id',
                                    appointmentDate: '$appointmentDetails.date',
                                    appointmentTime: '$appointmentDetails.time',
                                    duration: '$appointmentDetails.duration',
                                    totalAmount: '$appointmentDetails.price',
                                    status: '$appointmentDetails.status',
                                    apptStatus: '$appointmentDetails.apptStatus',

                                    service: {
                                        _id: '$appointmentService._id',
                                        serviceName: '$appointmentService.name',
                                        price: '$appointmentDetails.price'
                                    },

                                    employee: {
                                        _id: '$appointmentEmployee._id',
                                        firstName: '$employeeUser.name',
                                        lastName: '$employeeUser.lastName'
                                    },
                                    center: {
                                        _id: '$appointmentCenter._id',
                                        centerName: '$appointmentCenter.centerName'
                                    },

                                    customer: {
                                        _id: '$appointmentUser._id',
                                        firstName: '$appointmentUser.firstName',
                                        lastName: '$appointmentUser.lastName',
                                        mobileNo: '$appointmentUser.mobileNo'
                                    }
                                },
                                null
                            ]
                        }
                    }
                },

                {
                    $skip: skip
                },
                {
                    $limit: pageSize
                }

            ]);

            const totalCount = await this.cartManagementModel.countDocuments(
                matchCond
            );

            const hostUrl = `http://localhost:3008`;

            const data = cartData.map((item) => {

                if (
                    item.type === 'shop' &&
                    item.productDetails?.coverImage
                ) {
                    item.productDetails.imageUrl =
                        `${hostUrl}/${item.productDetails.coverImage.replace(/\\/g, '/')}`;
                }

                return item;
            });

            return {
                message: 'Cart Data successfully fetched!',
                statusCode: 200,
                data,
                totalCount,
                page,
                pageSize,
                totalPages: Math.ceil(totalCount / pageSize)
            };

        } catch (error) {
            console.error('Error fetching cart data:', error);

            return {
                message: 'An error occurred while fetching cart data',
                statusCode: 500,
                error: error.message
            };
        }
    }

    async selectItem(id: any, user: string) {


        const arr = id.map(ele => new Types.ObjectId(ele));
        const userId = new Types.ObjectId(user)

        const updated = await this.cartManagementModel.updateMany(
            { _id: { $in: arr }, userId: userId },
            { $set: { selected: 1 } }
        );
        const not = await this.cartManagementModel.updateMany(
            { _id: { $nin: arr } },
            { $set: { selected: 0 } }
        );
        return {
            message: 'Update successfully',
            statusCode: 201

        };
    }

    async deleteCartItem(id: any, userId: any) {

        const userObjectid = new Types.ObjectId(userId);
        // The update query
        console.log(id, "uiui")
        const deletedData = await this.cartManagementModel.deleteOne(
            { _id: new ObjectId(id) },
        );

        // Get updated cart count
        const count = await this.cartManagementModel.countDocuments({ userId: userObjectid });
        console.log(deletedData, "deletedData")
        return {
            message: 'File deleted successfully',
            statusCode: 201,
            count

        };
    }

    async findCount(userId: string) {
        try {
            const UserObjectId = new Types.ObjectId(userId);
            const count = await this.cartManagementModel.countDocuments({ userId: UserObjectId });
            console.log(count, UserObjectId, "UserObjectId")
            return {
                message: 'Cart Data successfully fetched!',
                statusCode: 200,
                count,

            };
        } catch (error) {
            console.error('Error fetching cart count:', error);
            throw new Error('An error occurred while fetching the cart count');
        }
    }

    async findUserCartForNonLogin(page: number, pageSize: number, productIds: any, selected: Number): Promise<any> {
        try {
            // const objectId = new Types.ObjectId(id);
            const skip = (page - 1) * pageSize;
            const limit = pageSize;
            let matchCond = {};

            if (productIds) {
                let pID = productIds.map(e => new Types.ObjectId(e))
                matchCond['_id'] = { $in: pID }// pID[0];
            }
            console.log(matchCond, "matchCond")

            // if (selected) {
            //     let pID = new Types.ObjectId(productId);
            //     matchCond['selected'] = 1;
            // }
            const cartData = await this.productManagementModel.aggregate([
                { $match: matchCond },

                // Lookup product details
                {
                    $lookup: {
                        from: "products",
                        localField: "_id",
                        foreignField: "_id",
                        as: "productDetails"
                    }
                },
                { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },

                // Lookup category details
                {
                    $lookup: {
                        from: "masters", // Adjust collection name as needed
                        localField: "productDetails.category",
                        foreignField: "_id",
                        as: "categoryDetails"
                    }
                },
                { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },

                // Lookup brand details
                {
                    $lookup: {
                        from: "masters", // Adjust collection name as needed
                        localField: "productDetails.brand",
                        foreignField: "_id",
                        as: "brandDetails"
                    }
                },
                { $unwind: { path: "$brandDetails", preserveNullAndEmptyArrays: true } },

                // Project required fields

                {
                    $project: {
                        _id: 1,
                        productId: "$_id",
                        quantity: 1,
                        status: 1,
                        selected: 1,
                        productDetails: {
                            _id: "$productDetails._id",
                            productName: "$productDetails.productName",
                            buy_one_get_one: "$productDetails.buy_one_get_one",
                            sku_id: "$productDetails.sku_id",
                            price: "$productDetails.price",
                            coverImage: "$productDetails.coverImage",
                            category: "$productDetails.category",
                            brand: "$productDetails.brand",
                            category_name: "$categoryDetails.name", // Add category name
                            brand_name: "$brandDetails.name",
                            subCategory: "$productDetails.subCategory",
                            itemType: "$productDetails.itemType",
                            stock: "$productDetails.stock",
                            buy_count: "$productDetails.buy_count",
                            minOrderQuantity: "$productDetails.minOrderQuantity",
                            maxOrderQuantity: "$productDetails.maxOrderQuantity",
                            product_description: "$productDetails.product_description",
                            ingredients: "$productDetails.ingredients",
                            additionalImages: "$productDetails.additionalImages",
                            weight: "$productDetails.weight",
                            is_deleted: "$productDetails.is_deleted",
                            date: "$productDetails.date",
                            modified: "$productDetails.modified",
                            imageUrl: "$productDetails.imageUrl",
                        }
                    }
                },

            ]).exec();
            console.log(cartData, "cartData")
            const totalCount = await this.cartManagementModel.countDocuments(matchCond).exec();

            const hostUrl = `http://localhost:3008`;
            let data = cartData.map(e => ({
                ...e,
                productDetails: {
                    ...e.productDetails,
                    imageUrl: e?.productDetails?.coverImage
                        ? `${hostUrl}/${e.productDetails.coverImage.replace(/\\/g, '/')}`
                        : null
                }
            }));

            return {
                message: 'Cart Data successfully fetched!',
                statusCode: 201,
                data,
                totalCount,
                page,
                pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
            };

        } catch (error) {
            console.error('Error fetching cartManagementData:', error);
            return {
                message: 'An error occurred while fetching the cartManagementData',
                statusCode: 500,
                error: error.message,
            };
        }
    }
    async addCartForNonLogin(cartManagementData): Promise<any> {
        try {
            const userId = new Types.ObjectId(cartManagementData.userId);
            let matchCond = {}
            // if (cartManagementData.productIds) {
            //    let pID =  cartManagementData.productIds.map(e=>new Types.ObjectId(e))                
            //     matchCond['_id'] = { $in: pID }// pID[0];
            // }
            // cartManagementData.productIds.map(e=>{
            for (const [index, product] of cartManagementData.productIds.entries()) {
                const productId = new Types.ObjectId(product.productId);

                const product_data = await this.productManagementModel.findById(productId);
                console.log(product_data, "product_data")
                if (!product_data) {
                    // throw new Error("Product not found");
                    return {
                        message: "Product not found",
                        statusCode: 204,
                        error: ''
                    };
                }
                const cart_data = await this.cartManagementModel.findOne({
                    userId: userId,
                    productId: productId,
                });

                const existingQty = cart_data ? Number(cart_data.quantity) : 0;
                const addedQty = Number(cartManagementData.quantity) || 0;
                let updatedCount = existingQty + addedQty;

                if (updatedCount > product_data.stock) {
                    // return {
                    //     message: `Cannot add to cart. Available stock is only ${product_data.stock}.`,
                    //     statusCode: 204,
                    //     error:''
                    // };
                    updatedCount = product_data.stock
                }

                if (updatedCount < product_data.minOrderQuantity) {

                    // return {
                    //     message: `Minimum order quantity is ${product_data.minOrderQuantity}.`,
                    //     statusCode: 204,
                    //     error:''
                    // };
                    updatedCount = product_data.minOrderQuantity
                }

                if (updatedCount > product_data.maxOrderQuantity) {

                    // return {
                    //     message: `Maximum order quantity is ${product_data.maxOrderQuantity}.`,
                    //     statusCode: 204,
                    //     error:''
                    // };
                    updatedCount = product_data.maxOrderQuantity
                }

                // ✅ Passed validations → upsert into cart
                const createdCartManagement = await this.cartManagementModel.findOneAndUpdate(
                    {
                        userId: userId,
                        productId: productId,
                    },
                    {
                        $inc: { quantity: updatedCount }, // Increment quantity
                    },
                    { returnDocument: "after", upsert: true, new: true }
                )
                    .exec();
                if (cartManagementData.productIds.length == index + 1) {
                    // Get updated cart count for the user
                    const count = await this.cartManagementModel.countDocuments({ userId: userId });

                    return { createdCartManagement, count };
                }
            }
        } catch (error) {
            console.error('Error fetching cartManagementData:', error);
            return {
                message: 'An error occurred while fetching the cartManagementData',
                statusCode: 500,
                error: error.message,
            };
        }
    }
}