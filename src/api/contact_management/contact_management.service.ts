import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ContactManagement, ContactManagementDocument } from '../../schema/schema';
let { ObjectId } = require('mongoose').Types;
@Injectable()
export class ContactManagementService {
    constructor(@InjectModel(ContactManagement.name) private contactModel: Model<ContactManagementDocument>) { }

    async create(blogData: Partial<ContactManagement>): Promise<ContactManagement> {
        const createdblog = new this.contactModel(blogData);
        return createdblog.save();
    }

    async findAll(page: number, pageSize: number,centerName?: string) {
        const skip = (page - 1) * pageSize;  
        const limit = pageSize;  
      
        const filter: any = {};
      
       
        if (centerName) {
          filter.centerName = centerName; 
        }
      
        const ContactManagement = await this.contactModel
          .find(filter)
          .skip(skip)
          .limit(limit)
          .exec();
      
        const totalCount = await this.contactModel.countDocuments(filter).exec();
    
        // Add image URLs to CenterManagement
      const hostUrl = `http://localhost:3008`; // Base URL for image serving
      const ContactManagementWithUrls = ContactManagement.map(product => {
        return {
          ...product.toObject(),
          imageUrl: product.file ? `${hostUrl}/${product.file.replace(/\\/g, '/')}` : null, // Append the URL
        };
      });
      
        return {
          message: 'BlogManagement successfully fetched!',
          statusCode: 201,
          ContactManagementWithUrls,
          totalCount,
          page,
          pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
        };
      }

    async findOneById(id: string): Promise<any> {
        try {
            const objectId = new Types.ObjectId(id);

            const contactManagementData = await this.contactModel.findOne({ _id: objectId }).exec();

            if (!contactManagementData) {
                throw new Error(`contactManagementData not found with id: ${id}`);
            }
            console.log(contactManagementData.file, "opopopopopopopoop")
            const hostUrl = `http://localhost:3008`;
            if (contactManagementData.file) {
                // Format the file path to use forward slashes
                contactManagementData['imageUrl'] = `${hostUrl}/${contactManagementData.file.replace(/\\/g, '/')}`;
                console.log('Image URL:', contactManagementData['imageUrl']);
            } else {
                contactManagementData['imageUrl'] = null; // Handle cases where no file is present
            }

            return {
                message: 'contactManagementData successfully fetched!',
                statusCode: 201,
                contactManagementData,
            };
        } catch (error) {
            console.error('Error fetching contactManagementData:', error);

            return {
                message: 'An error occurred while fetching the contactManagementData',
                statusCode: 500,
                error: error.message,
            };
        }
    }

//     async find(id: string): Promise<any> {
//         try {
//             const objectId = new Types.ObjectId(id);

//             const blogManagementData = await this.blogModel.findOne({ _id: objectId }).exec();

//             if (!blogManagementData) {
//                 throw new Error(`blogManagementData not found with id: ${id}`);
//             }
//             console.log(blogManagementData.file, "opopopopopopopoop")
//             const hostUrl = `http://localhost:3008`;
//             if (blogManagementData.file) {
//                 // Format the file path to use forward slashes
//                 blogManagementData['imageUrl'] = `${hostUrl}/${blogManagementData.file.replace(/\\/g, '/')}`;
//                 console.log('Image URL:', blogManagementData['imageUrl']);
//             } else {
//                 blogManagementData['imageUrl'] = null; // Handle cases where no file is present
//             }

//             return {
//                 message: 'centerManagementData successfully fetched!',
//                 statusCode: 201,
//                 blogManagementData,
//             };
//         } catch (error) {
//             console.error('Error fetching centerManagementData:', error);

//             return {
//                 message: 'An error occurred while fetching the centerManagementData',
//                 statusCode: 500,
//                 error: error.message,
//             };
//         }
//     }

    async update(id: any, contactManagement: Partial<ContactManagement>): Promise<any> {  // Return type is updated to 'any' for flexible response
        try {
          const objectId = new Types.ObjectId(id);
          const updatedContactManagement = await this.contactModel.updateOne(
            {_id:objectId},
            { $set: contactManagement }, // Use `$set` to update specific fields
            { new: true, runValidators: true } // Return the updated document and validate schema
          );
      
          if (!updatedContactManagement) {
            return {
              message: 'Contact not found with the provided id',
              statusCode: 404,
              error: `No Contact found with id: ${id}`,
            };
          }
      
          // Return success message with updated product
          return {
            message: 'Contact successfully updated!',
            statusCode: 201,
            updatedContactManagement,
          };
        } catch (error) {
          console.error('Error updating Contact in the database:', error);
      
          // Return error response
          return {
            message: 'An error occurred while updating the Contact',
            statusCode: 500,
            error: error.message,
          };
        }
      }

//       async deleteBlogManagement(id: any) {
//         // The update query
//         console.log(id,"uiui")
//         const deletedData = await this.blogModel.deleteOne(
//           { _id: new ObjectId(id) },
//           // data, // Return the updated document
//         );
//         console.log(deletedData,"deletedData")
//         return {
//           message: 'File deleted successfully',
//           // filePath: file.path,
//           };
//       }

//       async findOneContantById(id: string): Promise<any> {
//         try {
//             const objectId = new Types.ObjectId(id);

//             const blogContantManagementData = await this.blogContantModel.findOne({ _id: objectId }).exec();

//             if (!blogContantManagementData) {
//                 throw new Error(`blogManagementData not found with id: ${id}`);
//             }
//             console.log(blogContantManagementData.file, "opopopopopopopoop")
//             const hostUrl = `http://localhost:3008`;
//             if (blogContantManagementData.file) {
//                 // Format the file path to use forward slashes
//                 blogContantManagementData['imageUrl'] = `${hostUrl}/${blogContantManagementData.file.replace(/\\/g, '/')}`;
//                 console.log('Image URL:', blogContantManagementData['imageUrl']);
//             } else {
//               blogContantManagementData['imageUrl'] = null; // Handle cases where no file is present
//             }

//             return {
//                 message: 'blogContantManagementData successfully fetched!',
//                 statusCode: 201,
//                 blogContantManagementData,
//             };
//         } catch (error) {
//             console.error('Error fetching blogContantManagementData:', error);

//             return {
//                 message: 'An error occurred while fetching the blogContantManagementData',
//                 statusCode: 500,
//                 error: error.message,
//             };
//         }
//     }

//     async updateBlogContant(id: any, blogContentManagement: Partial<BlogContentManagement>): Promise<any> {  // Return type is updated to 'any' for flexible response
//       try {
//         console.log(id,"AAAAAAAAAAAAAAAAAAA",blogContentManagement)
//         const objectId = new Types.ObjectId(id);
//         const updatedBlogManagement = await this.blogContantModel.updateOne(
//           {_id:objectId},
//           { $set: blogContentManagement }, // Use `$set` to update specific fields
//           { new: true, runValidators: true } // Return the updated document and validate schema
//         );
    
//         if (!updatedBlogManagement) {
//           return {
//             message: 'Product not found with the provided id',
//             statusCode: 404,
//             error: `No product found with id: ${id}`,
//           };
//         }
    
//         // Return success message with updated product
//         return {
//           message: 'Blog contant successfully updated!',
//           statusCode: 201,
//           updatedBlogManagement,
//         };
//       } catch (error) {
//         console.error('Error updating blog in the database:', error);
    
//         // Return error response
//         return {
//           message: 'An error occurred while updating the Blog contant',
//           statusCode: 500,
//           error: error.message,
//         };
//       }
//     }

//     async createContent(blogData: Partial<BlogContentManagement>): Promise<BlogContentManagement> {
//       const createdblog = new this.blogContantModel(blogData);
//       return createdblog.save();
//   }
}