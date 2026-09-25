
import { Controller, Get, Post, Body, UploadedFile, UploadedFiles, Request, Put, Param, UseInterceptors, Query, Response } from '@nestjs/common';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';
import { Express } from 'express';
import { BlogManagement, BlogContentManagement } from '../../schema/schema';
import { BlogManagementService } from './blog_management.service'

@Controller('blog_management')
@UseInterceptors(Base64Interceptor)
export class BlogManagementController {
  constructor(private readonly blogManagementService: BlogManagementService) { }
  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      console.log('Request Body:', req.body);  // Log the request body
      console.log('Encrypted Data Received:', data);  // Log the encrypted data


      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      // Decode base64 encoded data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const blogManagement: Partial<BlogManagement> = JSON.parse(decodedData);

      console.log('Decoded blogManagement:', blogManagement);



      if (files.file && files.file[0]) {
        blogManagement['file'] = files.file[0].path;
      }

      console.log(blogManagement, "aaaaaaaaaaaaaa")

      // Call the service to create the CenterManagement
      const createdBlogManagement = await this.blogManagementService.create(blogManagement);

      // Return a success message
      return {
        message: 'BlogManagement successfully added!',
        statusCode: 201,
        data: createdBlogManagement
      };
    } catch (error) {
      console.error('Error decoding or parsing encrypted data:', error);
      return {
        message: 'Invalid encrypted data format or server error.',
        statusCode: 400,
        error: error.message
      };
    }
  }

  @Post('view')
  async findOne(@Body('data') data: any) {
    try {

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const blogName: Partial<BlogManagement> = JSON.parse(decodedData);
      const id = blogName['id'];

      console.log(`Fetching centerName with id: ${id}`);

      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }


      return this.blogManagementService.findOneById(id);

    } catch (error) {
      console.error('Error fetching product:', error);
      return {
        message: 'An error occurred while fetching the product',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('viewAll')
  async find(@Body('data') data: any) {
    try {

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const BlogManagement: Partial<BlogManagement> = JSON.parse(decodedData);
      console.log(BlogManagement, "CenterManagement");

      const page = BlogManagement['page'] || 1;
      const pageSize = BlogManagement['pageSize'] || 10;


      const centerName = BlogManagement['centerName'];


      return this.blogManagementService.findAll(page, pageSize, centerName);


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
    @UploadedFiles() files: { file?: Express.Multer.File[]; },
    @Body('data') data: string
  ) {
    try {
      console.log('Request Body:', req.body);
      console.log('Encrypted Data Received:', data);

      if (!data) {
        throw new Error('Encrypted data is missing or undefined');
      }

      let decodedData;
      try {
        decodedData = Buffer.from(data, 'base64').toString('utf-8');
        console.log('Decoded Data String:', decodedData);
      } catch (decodeError) {
        throw new Error('Failed to decode base64 data');
      }

      let blogManagement: Partial<BlogManagement>;
      try {
        blogManagement = JSON.parse(decodedData);
        console.log('Parsed Product Updates:', blogManagement);
      } catch (parseError) {
        throw new Error('Invalid JSON in decoded data');
      }

      // Handle the uploaded file if exists
      if (files.file && files.file[0]) {
        blogManagement['file'] = files.file[0].path;
      }
      // Call the service to update the product
      const updatedProduct = await this.blogManagementService.updateBlog(id, blogManagement);

      return {
        message: 'Blog successfully updated!',
        statusCode: 200,
        data: updatedProduct,
      };
    } catch (error) {
      console.error('Error updating product:', error.message);
      return {
        message: 'Error updating Blog',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('delete')
  async deleteProduct(@Body('data') data: any) {
    try {
      // Decode the encrypted data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const blogManagement: Partial<BlogManagement> = JSON.parse(decodedData);
      const id = blogManagement['id'];

      console.log(`Deleting blogManagement with id: ${id}`);

      // Validate the id
      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      // Call the service to delete the centerManagement
      return this.blogManagementService.deleteBlogManagement(id);

    } catch (error) {
      console.error('Error deleting blogManagement:', error);
      return {
        message: 'An error occurred while deleting the blogManagement',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('addContent')
  async createContant(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      console.log('Request Body:', req.body);  // Log the request body
      console.log('Encrypted Data Received:', data);  // Log the encrypted data


      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      // Decode base64 encoded data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const blogContentManagement: Partial<BlogContentManagement> = JSON.parse(decodedData);

      console.log('Decoded blogManagement:', blogContentManagement);



      if (files.file && files.file[0]) {
        blogContentManagement['file'] = files.file[0].path;
      }

      console.log(blogContentManagement, "aaaaaaaaaaaaaa")

      // Call the service to create the CenterManagement
      const createdBlogManagement = await this.blogManagementService.createContent(blogContentManagement);

      // Return a success message
      return {
        message: 'BlogManagement successfully added!',
        statusCode: 201,
        data: createdBlogManagement
      };
    } catch (error) {
      console.error('Error decoding or parsing encrypted data:', error);
      return {
        message: 'Invalid encrypted data format or server error.',
        statusCode: 400,
        error: error.message
      };
    }
  }

  @Post('viewContent')
  async findOneContent(@Body('data') data: any) {
    try {

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const blogContantName: Partial<BlogContentManagement> = JSON.parse(decodedData);
      const id = blogContantName['id'];

      console.log(`Fetching centerName with id: ${id}`);

      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }


      return this.blogManagementService.findOneContantById(id);

    } catch (error) {
      console.error('Error fetching product:', error);
      return {
        message: 'An error occurred while fetching the product',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('updateContent/:id')
  async updateBlogContant(
    @Param('id') id: string,
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[]; },
    @Body('data') data: string
  ) {
    try {
      console.log('Request Body:', req.body);
      console.log('Encrypted Data Received:', data);

      if (!data) {
        throw new Error('Encrypted data is missing or undefined');
      }

      let decodedData;
      try {
        decodedData = Buffer.from(data, 'base64').toString('utf-8');
        console.log('Decoded Data String:', decodedData);
      } catch (decodeError) {
        throw new Error('Failed to decode base64 data');
      }

      let blogContentManagement: Partial<BlogContentManagement>;
      try {
        blogContentManagement = JSON.parse(decodedData);
        console.log('Parsed Product Updates:', blogContentManagement);
      } catch (parseError) {
        throw new Error('Invalid JSON in decoded data');
      }

      // Handle the uploaded file if exists
      if (files.file && files.file[0]) {
        blogContentManagement['file'] = files.file[0].path;
      }
      // Call the service to update the product
      const updatedProduct = await this.blogManagementService.updateBlogContant(id, blogContentManagement);

      return {
        message: 'Blog successfully updated!',
        statusCode: 200,
        data: updatedProduct,
      };
    } catch (error) {
      console.error('Error updating product:', error.message);
      return {
        message: 'Error updating Blog',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  // @Post('updateFeaturedPost/:id')
  // async updateFeaturedPost(
  //   @Param('id') id: string,
  //   @Request() req: Request,
  //   @Body('data') data: string
  // ) {
  //   try {
  //     console.log('Request Body:', req.body);
  //     console.log('Encrypted Data Received:', data);

  //     // if (!data) {
  //     //   throw new Error('Encrypted data is missing or undefined');
  //     // }

  //     let decodedData;
  //     try {
  //       decodedData = Buffer.from(data, 'base64').toString('utf-8');
  //       console.log('Decoded Data String:', decodedData);
  //     } catch (decodeError) {
  //       throw new Error('Failed to decode base64 data');
  //     }

  //     let isFeaturedPosttManagement: Partial<BlogManagement>;
  //     try {
  //       isFeaturedPosttManagement = JSON.parse(decodedData);
  //       console.log('Parsed isFeaturedPost Updates:', isFeaturedPosttManagement);
  //     } catch (parseError) {
  //       throw new Error('Invalid JSON in decoded data');
  //     }

  //     // Call the service to update the product
  //     const updatedProduct = await this.blogManagementService.updateFeaturedPost(id, isFeaturedPosttManagement);

  //     return {
  //       message: 'isFeaturedPost successfully updated!',
  //       statusCode: 200,
  //       data: updatedProduct,
  //     };
  //   } catch (error) {
  //     console.error('Error updating isFeaturedPost:', error.message);
  //     return {
  //       message: 'Error updating isFeaturedPost',
  //       statusCode: 400,
  //       error: error.message,
  //     };
  //   }
  // }

  @Post('updateFeaturedPost/:id')
  async updateFeaturedPost(
    @Param('id') id: string,
    @Request() req: Request,
    @Body('data') data: string
  ) {
    try {
      console.log('Request Body:', req.body);
      console.log('Encrypted Data Received:', data);

      if (!data) {
        throw new Error('Encrypted data is missing or undefined');
      }

      let decodedData;
      try {
        decodedData = Buffer.from(data, 'base64').toString('utf-8');
        console.log('Decoded Data String:', decodedData);
      } catch (decodeError) {
        throw new Error('Failed to decode base64 data');
      }

      let blogManagement: Partial<BlogManagement>;
      try {
        blogManagement = JSON.parse(decodedData);
        console.log('Parsed FeaturedPost Updates:', blogManagement);
      } catch (parseError) {
        throw new Error('Invalid JSON in decoded data');
      }

      // Call the service to update the product
      const updatedProduct = await this.blogManagementService.updateFeaturedPost(id, blogManagement);

      return {
        message: 'FeaturedPost successfully updated!',
        statusCode: 200,
        data: updatedProduct,
      };
    } catch (error) {
      console.error('Error updating FeaturedPost:', error.message);
      return {
        message: 'Error updating FeaturedPost',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('comment')
  async addComment(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload: any = JSON.parse(decodedData);
      const { article_id, user_id, comment } = payload;

      if (!Types.ObjectId.isValid(article_id) || !Types.ObjectId.isValid(user_id)) {
        return { message: 'Invalid ObjectId format', statusCode: 400 };
      }
      if (!comment || typeof comment !== 'string') {
        return { message: 'Comment text is required', statusCode: 400 };
      }

      const updated = await this.blogManagementService.addComment(article_id, user_id, comment);

      if (!updated) {
        return { message: 'Article not found', statusCode: 404 };
      }

      return {
        message: 'Comment added successfully',
        statusCode: 201,
        data: updated,
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      return {
        message: 'Failed to add comment',
        statusCode: 500,
        error: error.message,
      };
    }
  }
  @Post('deleteComment')
    async deleteComment(@Body('data') data: any) {
      try {
        const decodedData = Buffer.from(data, 'base64').toString('utf-8');
        const result = JSON.parse(decodedData);
        const articleId = result.id;
        const commentId = result.commentId
  
        if (!Types.ObjectId.isValid(articleId)) {
          return {
            message: 'Invalid ObjectId format',
            statusCode: 400,
          };
        }
  
        return await this.blogManagementService.deleteComment(articleId, commentId);
      } catch (error) {
        console.error('Error deleting result:', error);
        return {
          message: 'An error occurred while deleting the result',
          statusCode: 500,
          error: error.message,
        };
      }
    }

    @Post('like')
async likeOrUnlike(@Body('data') data: string) {
  try {
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const payload: any = JSON.parse(decodedData);
    const { article_id, user_id } = payload;

    if (!Types.ObjectId.isValid(article_id) || !Types.ObjectId.isValid(user_id)) {
      return { message: 'Invalid ObjectId format', statusCode: 400 };
    }

    const result = await this.blogManagementService.toggleLike(article_id, user_id);
    if (!result?.data) return { message: 'Article not found', statusCode: 404 };

    return {
      message: result.action === 'liked' ? 'Article liked' : 'Article unliked',
      statusCode: 200,
      action: result.action,
      likesCount: result.likesCount,
      data: result.data,
    };
  } catch (error) {
    console.error('Error toggling like:', error);
    return {
      message: 'Failed to toggle like',
      statusCode: 500,
      error: error.message,
    };
  }
}

}