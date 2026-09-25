import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
let { ObjectId } = require('mongoose').Types;
import * as path from 'path';

import { Product, ProductSchema, ProductDocument, Master, MasterDocument, review, reviewDocument } from '../../schema/schema';
import { response } from 'express';
import { match } from 'assert';


@Injectable()
export class ProductService {
  // constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) { }
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Master.name) private masterModel: Model<MasterDocument>,
    @InjectModel(review.name) private reviewModel: Model<reviewDocument>
  ) { }

  async create1(productData: Partial<Product>): Promise<Product> {
    const createdProduct = new this.productModel(productData);
    return createdProduct.save();
  }

async toggleShowStatus(productId: Types.ObjectId) {
  try {
    // Find current product
    const product = await this.productModel.findById(productId);
    if (!product) {
      return { message: 'Product not found', statusCode: 404 };
    }

    // Toggle is_show value
    const newStatus = !product.is_show;

    const updatedProduct = await this.productModel.findByIdAndUpdate(
      productId,
      { $set: { is_show: newStatus, modified: new Date() } },
      { new: true }
    );

    return {
      message: `Product visibility updated to ${newStatus ? 'visible' : 'hidden'}`,
      statusCode: 200,
      data: updatedProduct,
    };
  } catch (error) {
    console.error('Error updating is_show status:', error);
    return {
      message: 'An error occurred while updating visibility',
      statusCode: 500,
      error: error.message,
    };
  }
}


  async findAll(
    page: number,
    pageSize: number,
    title?: string,
    category?: Types.ObjectId[],
    subCategory?: Types.ObjectId[],
    brand?: Types.ObjectId[],
    sortBy?: string,
    sortOrder?: string,
    stockRemaining?:number
  ) {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const filter: any = {
      is_deleted: 0,
      price: { $gt: 0 },  // Price must be greater than 0
      stock: { $gt: 0 }  // Stock must be greater than or equal to 0
    };

    if (title) {
      const regex = new RegExp(title, 'i');
     filter.$or = [
   { productName: regex },
   { sku_id: regex }   // 👈 allow searching by SKU ID
 ];
    }

    if (category && category.length > 0) {
      filter.category = { $in: category.map(id => new Types.ObjectId(id)) };
    }
     if (stockRemaining||stockRemaining==0) {
      filter.stock = { $lte:stockRemaining};
    }

    if (subCategory && subCategory.length > 0) {
      filter.subCategory = { $in: subCategory.map(id => new Types.ObjectId(id)) };
    }

    if (brand && brand.length > 0) {
      filter.brand = { $in: brand.map(id => new Types.ObjectId(id)) };
    }

    const aggregationPipeline: any[] = [
      { $match: filter },

      // Lookup Category Name
      {
        $lookup: {
          from: 'masters',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryDetails',
        }
      },
      { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },

      // Lookup Subcategory Name
      {
        $lookup: {
          from: 'masters',
          localField: 'subCategory',
          foreignField: '_id',
          as: 'subcategoryDetails',
        }
      },
      { $unwind: { path: '$subcategoryDetails', preserveNullAndEmptyArrays: true } },

      // Lookup Brand Name
      {
        $lookup: {
          from: 'masters',
          localField: 'brand',
          foreignField: '_id',
          as: 'brandDetails',
        }
      },
      { $unwind: { path: '$brandDetails', preserveNullAndEmptyArrays: true } },

      // Lookup Item Type Name
      {
        $lookup: {
          from: 'masters',
          localField: 'itemType',
          foreignField: '_id',
          as: 'itemTypeDetails',
        }
      },
      { $unwind: { path: '$itemTypeDetails', preserveNullAndEmptyArrays: true } },

     
   

      // Format Data
      {
        $project: {
          _id: 1,
          title: 1,
          productName: 1,
          buy_one_get_one: 1,
          sku_id: 1,
          category: 1,
          subCategory: 1,
          itemType: 1,
          brand: '$brandDetails.name',
          price: 1,
          cost: 1,
          mrp: 1,
          discounted_price: 1,
          length: 1,
          width: 1,
          height: 1,
          stock: 1,
          buy_count: 1,
          coverImage: 1,
          additionalImages: 1,
          ingredients: 1,
          product_description: 1,
          maxOrderQuantity: 1,
          is_show:1,
          minOrderQuantity: 1,
          inventory_status: 1,
          categoryName: '$categoryDetails.name',
          subcategoryName: '$subcategoryDetails.name',
          brandName: '$brandDetails.name',
          itemTypeName: '$itemTypeDetails.name',
          date: {
            $dateToString: { format: '%d/%m/%Y, %H:%M:%S', date: '$created', timezone: 'Asia/Kolkata' }
          },
          modified: {
            $dateToString: { format: '%d/%m/%Y, %H:%M:%S', date: '$modified', timezone: 'Asia/Kolkata' }
          }
        }
      }
    ];

    // Sorting logic
    if (sortBy && sortOrder) {
      const sortField = sortBy === 'price' ? 'price' : 'buy_count';
      const sortDirection = sortOrder === 'asc' ? 1 : -1;
      aggregationPipeline.push({ $sort: { [sortField]: sortDirection } });
    }

    // if (title) {
    //   const regex = new RegExp(title, 'i');
    //   aggregationPipeline.push({
    //     $match: {
    //       $or: [
    //         { productName: regex },
    //         { brandName: regex },
    //         { categoryName: regex }
    //       ]
    //     }
    //   });
    // }

    aggregationPipeline.push({ $skip: skip }, { $limit: limit });

    const products = await this.productModel.aggregate(aggregationPipeline);
    const totalCount = await this.productModel.countDocuments(filter).exec();

    const hostUrl = `http://localhost:3008`;
    const productsWithUrls = products.map(product => ({
      ...product,
      imageUrl: product.coverImage ? `${hostUrl}/${product.coverImage.replace(/\\/g, '/')}` : null,
    }));

    return {
      message: 'Products successfully fetched!',
      statusCode: 201,
      productsWithUrls,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }




  async findOneById(id: string): Promise<any> {
    try {
      const objectId = new Types.ObjectId(id);

      const product = await this.productModel.aggregate([
        { $match: { _id: objectId } },

        // Lookup Category Name
        {
          $lookup: {
            from: 'masters',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryDetails',
          }
        },
        { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },

        // Lookup Subcategory Name
        {
          $lookup: {
            from: 'masters',
            localField: 'subCategory',
            foreignField: '_id',
            as: 'subcategoryDetails',
          }
        },
        { $unwind: { path: '$subcategoryDetails', preserveNullAndEmptyArrays: true } },

        // Lookup Brand Name
        {
          $lookup: {
            from: 'masters',
            localField: 'brand',
            foreignField: '_id',
            as: 'brandDetails',
          }
        },
        { $unwind: { path: '$brandDetails', preserveNullAndEmptyArrays: true } },

        // Lookup Item Type
        {
          $lookup: {
            from: 'masters',
            localField: 'itemType',
            foreignField: '_id',
            as: 'itemTypeDetails',
          }
        },
        { $unwind: { path: '$itemTypeDetails', preserveNullAndEmptyArrays: true } },

      

        // Format Data
        {
          $project: {
            _id: 1,
            productName: 1,
            buy_one_get_one: 1,
            sku_id: 1,
            price: 1,
            cost: 1,
            mrp: 1,
            discounted_price: 1,
            length: 1,
            width: 1,
            height: 1,
            weight: 1,
            stock: 1,
            coverImage: 1,
            is_show:1,
            additionalImages: 1,
            ingredients: 1,  // Includes both _id and name
            product_description: 1,
            maxOrderQuantity: 1,
            minOrderQuantity: 1,
            inventory_status: 1,
            category: '$categoryDetails._id',
            categoryName: '$categoryDetails.name',
            subcategory: '$subcategoryDetails._id',
            subcategoryName: '$subcategoryDetails.name',
            brandName: '$brandDetails.name',
            brand: '$brandDetails._id',
            itemType: '$itemTypeDetails._id',
            itemTypeName: '$itemTypeDetails.name',

            created: {
              $dateToString: { format: '%d/%m/%Y, %H:%M:%S', date: '$date', timezone: 'Asia/Kolkata' }
            },
            modified: {
              $dateToString: { format: '%d/%m/%Y, %H:%M:%S', date: '$modified', timezone: 'Asia/Kolkata' }
            }
          }
        }
      ]);
      console.log(product, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")

      if (!product.length) {
        throw new Error(`Product not found with id: ${id}`);
      }

      const hostUrl = `http://localhost:3008`;
      product[0]['imageUrl'] = product[0].coverImage ? `${hostUrl}/${product[0].coverImage.replace(/\\/g, '/')}` : null;

      return {
        message: 'Product successfully fetched!',
        statusCode: 201,
        product: product[0],
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      return {
        message: 'An error occurred while fetching the product',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  // i want create api for delete image from uploads file based on image name or url and also delet from table 

  async findById(id: string): Promise<Product | null> {
    try {
      return await this.productModel.findById(new Types.ObjectId(id));
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  async updateProduct(id: string, productUpdates: Partial<Product>): Promise<any> {
    try {
      console.log('Updating product with ID:', id, 'Updates:', productUpdates);

      const objectId = new Types.ObjectId(id);

      // Update product
      const updatedProduct = await this.productModel.findByIdAndUpdate(
        objectId,
        { $set: productUpdates },
        { new: true, runValidators: true }
      );

      return { message: 'Product successfully updated!', statusCode: 200, data: updatedProduct };
    } catch (error) {
      console.error('Error updating product:', error);
      return { message: 'An error occurred while updating the product', statusCode: 500, error: error.message };
    }
  }





  async softDeleteProduct(productId: Types.ObjectId) {
    const updatedProduct = await this.productModel.findOneAndUpdate(
      { _id: productId, is_deleted: 0 }, // Ensure we only update non-deleted products
      { $set: { is_deleted: 1, modified: new Date() } },
      { new: true } // Return the updated document
    );

    if (!updatedProduct) {
      return {
        message: 'Product not found or already deleted',
        statusCode: 404,
      };
    }

    return {
      message: 'Product deleted successfully',
      statusCode: 200,
      data: updatedProduct,
    };
  }


  async getAllProductsByCategories() {
    try {
      const productsByCategory = await this.productModel.aggregate([
        {
          $match: {
            is_deleted: 0,
            price: { $gt: 0 }, // Ensures price is greater than 0
            stock: { $gte: 0 } // Ensures stock is greater than or equal to 0
          }
        },
        {
          $lookup: {
            from: 'masters',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryDetails',
          },
        },
        {
          $lookup: {
            from: 'masters',
            localField: 'brand',
            foreignField: '_id',
            as: 'brandDetails',
          },
        },
        {
          $lookup: {
            from: 'reviews',
            localField: '_id',
            foreignField: 'product_id',
            as: 'reviewDetails',
          },
        },
        {
          $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: '$brandDetails', preserveNullAndEmptyArrays: true },
        },
       
       

        {
          $addFields: {
            averageRating: {
              $cond: {
                if: { $gt: [{ $size: "$reviewDetails" }, 0] },
                then: { $avg: "$reviewDetails.rating" },
                else: 0
              }
            }
          }
        },
       
        {
          $project: {
            _id: 1,
            title: 1,
            productName: 1,
            buy_one_get_one: 1,
            price: 1,
            mrp: 1,
            cost: 1,
            discounted_price: 1,
            length: 1,
            width: 1,
            height: 1,
            sku_id: 1,
            coverImage: 1,
            additionalImages: 1,
            ingredients: 1,
            product_description: 1,
            maxOrderQuantity: 1,
            minOrderQuantity: 1,
            inventory_status: 1,
            is_show:1,
            category_id: '$categoryDetails._id', // Grouping by category_id
            categoryName: '$categoryDetails.name',
            brand: '$brandDetails.name',
            rating: { $round: ["$averageRating", 1] },
            date: {
              $dateToString: {
                format: '%d/%m/%Y, %H:%M:%S',
                date: '$date',
                timezone: 'Asia/Kolkata'
              }
            },
            modified: {
              $dateToString: {
                format: '%d/%m/%Y, %H:%M:%S',
                date: '$modified',
                timezone: 'Asia/Kolkata'
              }
            }
          }
        },
        {
          $group: {
            _id: '$category_id', // Grouping by category_id instead of categoryName
            categoryName: { $first: '$categoryName' }, // Retain categoryName for reference
            products: { $push: '$$ROOT' },
          },
        },
        {
          $project: {
            _id: 0,
            category_id: '$_id',
            categoryName: 1,
            products: { $slice: ['$products', 8] }, // Limit to 8 products per category
          },
        },
      ]);

      const formattedResponse = {};
      productsByCategory.forEach((categoryData) => {
        formattedResponse[categoryData.category_id] = {
          categoryName: categoryData.categoryName,
          products: categoryData.products
        };
      });

      return {
        message: 'Products fetched successfully!',
        statusCode: 200,
        data: formattedResponse,
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        message: 'An error occurred while fetching products',
        statusCode: 500,
        error: error.message,
      };
    }
  }



  /////////////////////////////   REVIEWS    /////////////////////////////////////////////

  async addReview(reviewData: Partial<review>): Promise<review> {
    try {
      const createdReview = new this.reviewModel(reviewData);
      return await createdReview.save();
    } catch (error) {
      console.error('Error saving review:', error);
      throw new Error('Database error while saving review.');
    }
  }

  // Add this method to check if review exists
  async findReviewByUserAndProduct(userId: Types.ObjectId, productId: Types.ObjectId): Promise<review | null> {
    return this.reviewModel.findOne({ user_id: userId, product_id: productId });
  }


  async getReviews(productId: string, userId: string, page: number, limit: number): Promise<{ data: any[], total: number }> {
    try {
      const objectId = productId ? new Types.ObjectId(productId) : null;
      const user_id = userId ? new Types.ObjectId(userId) : null;

      let filter: any = { is_deleted: 0 };
      if (objectId) filter.product_id = objectId;
      if (user_id) filter.user_id = user_id;

      const skip = (page - 1) * limit;

      const result = await this.reviewModel.aggregate([
        { $match: filter },

        // -- lookups here (unchanged) --
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "userDetails"
          }
        },
        { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "products",
            localField: "product_id",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "masters",
            localField: "productDetails.category",
            foreignField: "_id",
            as: "categoryDetails"
          }
        },
        { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "masters",
            localField: "productDetails.brand",
            foreignField: "_id",
            as: "brandDetails"
          }
        },
        { $unwind: { path: "$brandDetails", preserveNullAndEmptyArrays: true } },

        {
          $project: {
            _id: 1,
            user_id: 1,
            product_id: 1,
            review: 1,
            rating: 1,
            is_approved: 1,
            additionalImages: 1,
            userName: "$userDetails.name",
            productDetails: {
              _id: "$productDetails._id",
              productName: "$productDetails.productName",
              sku_id: "$productDetails.sku_id",
              price: "$productDetails.price",
              mrp: "$productDetails.mrp",
              coverImage: "$productDetails.coverImage",
              category: "$productDetails.category",
              brand: "$productDetails.brand",
              category_name: "$categoryDetails.name",
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
            },
            date: {
              $dateToString: { format: "%d/%m/%Y, %H:%M:%S", date: "$date", timezone: "Asia/Kolkata" }
            },
            modified: {
              $dateToString: { format: "%d/%m/%Y, %H:%M:%S", date: "$modified", timezone: "Asia/Kolkata" }
            }
          }
        },

        // Pagination using $facet
        {
          $facet: {
            data: [
              { $skip: skip },
              { $limit: limit }
            ],
            totalCount: [
              { $count: 'count' }
            ]
          }
        }
      ]);

      const data = result[0]?.data || [];
      const total = result[0]?.totalCount[0]?.count || 0;

      return { data, total };
    } catch (error) {
      console.error('Error fetching paginated reviews:', error);
      throw new Error('Database error while fetching reviews.');
    }
  }


  async getReviewByProductId(productId: string): Promise<any> {
    try {
      const objectId = new Types.ObjectId(productId);
      console.log(objectId, "Product ID")
      const reviews = await this.reviewModel.aggregate([
        { $match: { product_id: objectId, is_deleted: 0 } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
            oneStarCount: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
            twoStarCount: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
            threeStarCount: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
            fourStarCount: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
            fiveStarCount: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } }
          }
        }
      ]);
      // console.log(reviews, "RRRRRRRRRRRRRRRRRRRRRRRRRR")
      // If no reviews found, return default values
      const reviewData = reviews[0] || {};
      const totalReviews = reviewData.totalReviews || 0;
      const averageRating = reviewData.averageRating ? reviewData.averageRating.toFixed(1) : 0;
      const oneStarPercentage = totalReviews ? ((reviewData.oneStarCount / totalReviews) * 100).toFixed(2) : 0;
      const twoStarPercentage = totalReviews ? ((reviewData.twoStarCount / totalReviews) * 100).toFixed(2) : 0;
      const threeStarPercentage = totalReviews ? ((reviewData.threeStarCount / totalReviews) * 100).toFixed(2) : 0;
      const fourStarPercentage = totalReviews ? ((reviewData.fourStarCount / totalReviews) * 100).toFixed(2) : 0;
      const fiveStarPercentage = totalReviews ? ((reviewData.fiveStarCount / totalReviews) * 100).toFixed(2) : 0;

      const reviewSummary = {
        reviews,
        averageRating,
        totalReviews,
        oneStarPercentage,
        twoStarPercentage,
        threeStarPercentage,
        fourStarPercentage,
        fiveStarPercentage
      };
      return {
        message: 'Review summary fetched successfully!',
        statusCode: 200,
        reviewSummary
      };
    } catch (error) {
      console.error('Error fetching review summary:', error);
      return {
        message: 'An error occurred while fetching review summary',
        statusCode: 500,
        error: error.message,
      };
    }
  }




  ////////////////////////////////    DELETE IMAGE   ////////////////////////////////

async deleteImageFromReview(productId: string, imageName: string): Promise<any> {
    try {
      const objectId = new Types.ObjectId(productId);

      // Find the product (only what we need)
      const product = await this.productModel.findOne({ _id: objectId }).select({ additionalImages: 1 });

      if (!product) return null;

      const currentImages: string[] = Array.isArray(product.additionalImages) ? product.additionalImages : [];
      if (!currentImages.length) return null;

      // Build a robust match set: accept filename, relative path, absolute path, URL, Windows/Linux slashes
      const safeBasename = (value: string) => {
        if (!value) return '';
        // If it's a URL, extract pathname first
        try {
          const u = new URL(value);
          const pathname = (u.pathname || '').replace(/^\/+/, '');
          return path.basename(pathname);
        } catch {
          return path.basename(value);
        }
      };

      const basename = safeBasename(imageName);
      const candidates = new Set<string>();

      const addCandidate = (v: string) => {
        if (typeof v === 'string' && v.trim()) candidates.add(v);
      };

      addCandidate(imageName);
      addCandidate(imageName.replace(/\\/g, '/'));
      addCandidate(imageName.replace(/\//g, '\\'));

      if (basename) {
        addCandidate(basename);
        addCandidate(`uploads/images/${basename}`);
        addCandidate(`uploads\\images\\${basename}`);
      }

      // If client sent a URL, also try its pathname variants
      try {
        const u = new URL(imageName);
        const pathname = (u.pathname || '').replace(/^\/+/, '');
        addCandidate(pathname);
        addCandidate(pathname.replace(/\\/g, '/'));
        addCandidate(pathname.replace(/\//g, '\\'));
      } catch {
        // ignore
      }

      const shouldRemove = (stored: string) => {
        if (!stored) return false;
        if (candidates.has(stored)) return true;
        if (!basename) return false;
        // Also remove any stored value that ends with the filename (covers full URL / absolute paths)
        return (
          stored === basename ||
          stored.endsWith(`/${basename}`) ||
          stored.endsWith(`\\${basename}`)
        );
      };

      const nextImages = currentImages.filter((img) => !shouldRemove(img));
      if (nextImages.length === currentImages.length) return null;

      const updatedProduct = await this.productModel.findOneAndUpdate(
        { _id: objectId },
        { $set: { additionalImages: nextImages, modified: new Date() } },
        { new: true }
      );

      return updatedProduct;
    } catch (error) {
      throw new Error('Database error while deleting image.');
    }
  }



  async bulkCreate(data: any[]): Promise<Product[]> {
    const products = data.map((row) => ({
      productName: row.name,
      title: row.fieldType,
      sku_id: row.sku || '',
      brand: row.brand ? new Types.ObjectId("67e3d55a2909f0850f54bbda") : null,
      category: row.collection ? new Types.ObjectId(row.collection) : null,
      itemType: row.product_type ? new Types.ObjectId(row.product_type) : null,
      price: row.price ? parseFloat(row.price) : 0,
      weight: row.weight ? parseFloat(row.weight) : 0,
      product_description: row.description || '',
      stock: row.inventory === 'InStock' ? 1 : 0,
      coverImage: row.productImageUrl ? row.productImageUrl.split(';')[0] : '',
      additionalImages: row.productImageUrl
        ? row.productImageUrl.split(';').map((url) => url.trim())
        : [],
      minOrderQuantity: row.minOrderQuantity ? parseInt(row.minOrderQuantity) : 1,
      maxOrderQuantity: row.maxOrderQuantity ? parseInt(row.maxOrderQuantity) : 10,
      is_deleted: 0,
      date: new Date(),
      modified: new Date(),
    }));

    return this.productModel.insertMany(products);
  }


  async updateMrpForAllProducts(): Promise<any> {
    try {
      // Find all non-deleted products (optional condition)
      const allProducts = await this.productModel.find({});

      const updates = [];

      for (const product of allProducts) {
        const price = product.price || 0;
        const mrp = price + 1;

        const updatedProduct = await this.productModel.findByIdAndUpdate(
          product._id,
          { $set: { mrp, modified: new Date() } },
          { new: true }
        );

        updates.push(updatedProduct);
      }

      return {
        status: true,
        message: `${updates.length} products updated with MRP.`,
        updatedProducts: updates
      };
    } catch (error) {
      console.error("Error updating MRP for all products:", error);
      return {
        status: false,
        message: "An error occurred while updating MRP.",
        error: error.message
      };
    }
  }






}