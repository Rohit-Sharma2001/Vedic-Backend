// import { Controller, Get, Post, Body, UploadedFile,UploadedFiles, Request, Put, Param, UseInterceptors, Query, Response } from '@nestjs/common';
import { Controller, Get, Post, Body, UploadedFile, UploadedFiles, Request, Put, Delete, Param, UseInterceptors, Query, Response, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './inventory.service';
import { Product, review } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';
import { Express } from 'express';
import * as xlsx from 'xlsx';

import * as fs from 'fs';
import * as path from 'path';
const normalizePath = (p?: string) => (typeof p === 'string' ? p.replace(/\\/g, '/') : p);
const dedupe = (arr: string[]) => Array.from(new Set(arr.map(normalizePath).filter(Boolean)));
@Controller('product')
@UseInterceptors(Base64Interceptor)
export class ProductController {
  constructor(private readonly productServices: ProductService) { }

@Post('add')
async create(
  @Request() req: Request,
  @UploadedFiles() files: { coverImage?: Express.Multer.File[]; additionalImages?: Express.Multer.File[] },
  @Body('data') data: string,
) {
  try {
    if (!data) throw new Error('Encrypted data is missing');

    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    let product: Partial<Product> = JSON.parse(decodedData);

    if (product.brand) product.brand = new Types.ObjectId(product.brand);
    if (product.category) product.category = new Types.ObjectId(product.category);
    if (product.subCategory) product.subCategory = new Types.ObjectId(product.subCategory);
    if (product.itemType) product.itemType = new Types.ObjectId(product.itemType);

    if (files?.coverImage?.[0]) {
      product.coverImage = normalizePath(files.coverImage[0].path);
    }

    if (files?.additionalImages?.length) {
      const incoming = files.additionalImages.map((f) => f.path);
      product.additionalImages = dedupe(incoming);
    }

    const createdProduct = await this.productServices.create1(product);
    return { message: 'Product successfully added!', statusCode: 201, data: createdProduct };
  } catch (error) {
    return { message: 'Invalid encrypted data format or server error.', statusCode: 400, error: error.message };
  }
}

  


  @Post('allProducts')
  async findAll(@Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const product: Partial<Product> = JSON.parse(decodedData);
      console.log(product, "product");

      const page = product['page'] || 1;
      const pageSize = product['pageSize'] || 10;
      const title = product['title'];

      // Ensure category, sub_category and brand are arrays
      const category = product['category']
        ? Array.isArray(product['category'])
          ? product['category'].map(id => new Types.ObjectId(id))
          : [new Types.ObjectId(product['category'])]
        : [];

        const subCategory = product['subcategory']
        ? Array.isArray(product['subcategory'])
          ? product['subcategory'].map(id => new Types.ObjectId(id))
          : [new Types.ObjectId(product['subcategory'])]
        : [];

      const brand = product['brand']
        ? Array.isArray(product['brand'])
          ? product['brand'].map(id => new Types.ObjectId(id))
          : [new Types.ObjectId(product['brand'])]
        : [];

      const sortBy = product['sortBy']; // 'price' or 'buy_count'
      const sortOrder = product['sortOrder'];
      const stockRemaining=product['stockLesserThan'] // 'asc' or 'desc'

      return this.productServices.findAll(page, pageSize, title, category, subCategory, brand, sortBy, sortOrder,stockRemaining);
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        message: 'An error occurred while fetching the products',
        statusCode: 500,
        error: error.message,
      };
    }
  }


  @Post('toggleShowStatus')
async toggleShowStatus(@Body('data') data: any) {
  try {
    // Decode base64 encoded request
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const parsed = JSON.parse(decodedData);
    const productId = parsed['id'];

    if (!Types.ObjectId.isValid(productId)) {
      return { message: 'Invalid product ID format', statusCode: 400 };
    }

    // Toggle the is_show field using service
    return await this.productServices.toggleShowStatus(new Types.ObjectId(productId));
  } catch (error) {
    console.error('Error toggling product show status:', error);
    return {
      message: 'An error occurred while toggling show status',
      statusCode: 500,
      error: error.message,
    };
  }
}


  
  @Post('view')
  async findOne(@Body('data') data: any) {
    try {

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const product: Partial<Product> = JSON.parse(decodedData);
      const id = product['id'];

      console.log(`Fetching product with id: ${id}`);

      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }


      return this.productServices.findOneById(id);

    } catch (error) {
      console.error('Error fetching product:', error);
      return {
        message: 'An error occurred while fetching the product',
        statusCode: 500,
        error: error.message,
      };
    }
  }


 @Post('update/:id')
async update(
  @Param('id') id: string,
  @Request() req: Request,
  @UploadedFiles() files: { coverImage?: Express.Multer.File[]; additionalImages?: Express.Multer.File[] },
  @Body('data') data: string,
) {
  try {
    if (!data) throw new Error('Encrypted data is missing or undefined');

    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const productUpdates: Partial<Product> = JSON.parse(decodedData);

    const convertToObjectId = (field: any) =>
      Types.ObjectId.isValid(field) ? new Types.ObjectId(field) : field;

    ['_id', 'brand', 'category', 'subCategory', 'itemType'].forEach((key) => {
      if (productUpdates[key]) productUpdates[key] = convertToObjectId(productUpdates[key]);
    });

    if (files?.coverImage?.[0]) {
      productUpdates.coverImage = normalizePath(files.coverImage[0].path);
    }

    const existingProduct = await this.productServices.findById(id);
    if (!existingProduct) return { message: 'Product not found', statusCode: 404 };

    if (files?.additionalImages?.length) {
      const merged = [
        ...(existingProduct.additionalImages || []),
        ...files.additionalImages.map((f) => f.path),
      ];
      productUpdates.additionalImages = dedupe(merged); // ✅ key fix
    }

    const updatedProduct = await this.productServices.updateProduct(id, productUpdates);
    return { message: 'Product successfully updated!', statusCode: 200, data: updatedProduct };
  } catch (error) {
    return { message: 'Error updating product', statusCode: 400, error: error.message };
  }
}



  @Post('deleteProduct')
  async deleteProduct(@Body('data') data: any) {
    try {
      // Decode Base64 request data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const product = JSON.parse(decodedData);
      const productId = product['id'];

      console.log(`Soft deleting product with id: ${productId}`);

      // Validate ObjectId
      if (!Types.ObjectId.isValid(productId)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      // Call the service to update `is_deleted`
      return this.productServices.softDeleteProduct(new Types.ObjectId(productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      return {
        message: 'An error occurred while deleting the product',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Get('by-categories')
  async getAllProductsByCategories() {
    try {
      return this.productServices.getAllProductsByCategories();
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        message: 'An error occurred while fetching products',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  ///////////////////////////////////    REVIEWS   //////////////////////////////////

@Post('add-review')
async createReview(
  @Request() req: Request,
  @UploadedFiles() files: { additionalImages?: Express.Multer.File[] },  // ✅ already here
  @Body('data') data: string,
) {
  try {
    if (!data) throw new Error('Encrypted data is missing');

    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    let review: Partial<review> = JSON.parse(decodedData);

    // Convert ObjectIds
    if (review.user_id) review.user_id = new Types.ObjectId(review.user_id);
    if (review.product_id) review.product_id = new Types.ObjectId(review.product_id);

    // ✅ Handle multiple images
    if (files?.additionalImages && files?.additionalImages.length > 0) {
      review.additionalImages = files.additionalImages.map(file => file.path);
    }

    // ✅ Prevent duplicate review
    const existingReview = await this.productServices.findReviewByUserAndProduct(
      review.user_id,
      review.product_id,
    );
    if (existingReview) {
      return { message: 'You have already reviewed this product.', statusCode: 409 };
    }

    const createdReview = await this.productServices.addReview(review);
    return { message: 'Review successfully added!', statusCode: 201, data: createdReview };

  } catch (error) {
    return { message: 'Error adding review', statusCode: 400, error: error.message };
  }
}


  @Post('get-reviews')
  async getReviewsByProductId(@Body('data') data: string) {
    try {
      if (!data) throw new Error('Encrypted data is missing');

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const requestData = JSON.parse(decodedData);

      const { product_id, user_id, page = 1, limit = 10 } = requestData;

      const reviews = await this.productServices.getReviews(product_id, user_id, parseInt(page), parseInt(limit));

      if (!reviews.data.length) {
        return {
          message: 'No reviews found for this product.',
          statusCode: 404,
          data: [],
          total: 0,
          page,
          limit
        };
      }

      return {
        message: 'Reviews fetched successfully!',
        statusCode: 200,
        data: reviews.data,
        total: reviews.total,
        page,
        limit,
        totalPages: Math.ceil(reviews.total / limit)
      };
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return {
        message: 'An error occurred while fetching reviews',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  //getReviewByProductId
  @Post('getReviewRating')
  async getReviewByProductId(@Body('data') data: string) {
    try {
      if (!data) throw new Error('Encrypted data is missing');

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const requestData = JSON.parse(decodedData);

      const { product_id} = requestData;

      const reviews = await this.productServices.getReviewByProductId(product_id);

      if (!reviews.reviewSummary) {
        return {
          message: 'No reviews found for this product.',
          statusCode: 404,
          data: []
        };
      }

      return {
        message: 'Reviews fetched successfully!',
        statusCode: 200,
        data: reviews.reviewSummary
      };
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return {
        message: 'An error occurred while fetching reviews',
        statusCode: 500,
        error: error.message,
      };
    }
  }


  /////////////////////////////////////////  DELETE IMAGE ////////////////////////////////


  @Post('delete-image')
  async deleteImage(@Body('data') data: string) {
    try {
      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      // Decode base64 encoded data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      let requestData = JSON.parse(decodedData);

      if (!requestData.imageName || !requestData.productId) {
        throw new Error('Image name and product ID are required');
      }

      const productId = requestData['productId'];
      let imageName = requestData['imageName'];

      // Ensure we only take the filename (remove 'uploads\\images\\' from the path)
      const extractedImageName = path.basename(imageName);
      console.log(extractedImageName, "KKKKKKKKKKKKKKKK");

      // Remove entry from DB
      // Pass basename so the delete payload is stable across Windows/Linux and URL/path formats
      // (service also handles URL/path, but basename is the safest)
      const updatedReview = await this.productServices.deleteImageFromReview(productId, extractedImageName);

      if (!updatedReview) {
        return {
          message: 'Image not found or already deleted',
          statusCode: 404,
        };
      }

      // ✅ Fix: Use process.cwd() to avoid 'dist' issue
      const baseDir = process.cwd(); // Gets project root directory
      const imagePath = path.join(baseDir, 'uploads/images', extractedImageName);

      console.log(imagePath, "<<<<<<<<<<<<<< Corrected Image Path");

      // Verify correct path before deleting
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Remove the image file
        console.log(imagePath, "<<<<<<<<<<<<<<< File Deleted Successfully");
      } else {
        console.log(imagePath, "<<<<<<<<<<<<<<< File Not Found - Skipping Deletion");
      }

      return {
        message: 'Image deleted successfully',
        statusCode: 200,
      };
    } catch (error) {
      console.error('Error deleting image:', error);
      return {
        message: 'An error occurred while deleting the image',
        statusCode: 500,
        error: error.message,
      };
    }
  }


  @Post('bulk-upload')
  @UseInterceptors(FileInterceptor('file'))
  async bulkUpload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { message: 'No file uploaded', statusCode: 400 };
    }

    try {
      // Read file buffer and convert to JSON
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Process and save data
      const result = await this.productServices.bulkCreate(sheetData);
      return {
        message: 'Products successfully uploaded',
        statusCode: 201,
        data: result,
      };
    } catch (error) {
      console.error('Error processing file:', error);
      return {
        message: 'Error processing file',
        statusCode: 500,
        error: error.message,
      };
    }
  }



  @Post("updateAllMrp")
  async updateAllProductMrp(): Promise<any> {
    return await this.productServices.updateMrpForAllProducts();
  }





}