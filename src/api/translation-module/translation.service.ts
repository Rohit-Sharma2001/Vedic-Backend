import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
let { ObjectId } = require('mongoose').Types;
 
import { translationManagement, translationsSchema } from '../../schema/schema';

@Injectable()
export class TranslationService {
  constructor(@InjectModel(translationManagement.name) private translationModel: Model<translationManagement>) { }

  async create1(testimonialData: Partial<translationManagement>): Promise<translationManagement> {
    const createdTestimonial = new this.translationModel(testimonialData);
    // console.log(createdTestimonial,"createdTestimonialcreatedTestimonial",Product)
    return createdTestimonial.save();
  }

  async findAll(

    code?: string,
    
  ) {
   
  
    const filter: any = {};
  
    if (code) {
      filter.code = code;
    }
  
   
    const testimonial = await this.translationModel
      .find(filter).select({key:1,value:1})
      .exec();
      let obj={}
     testimonial.forEach((ele:any)=>{
      obj[ele.key]=ele.value
     })
    return {
      message: 'Testimonial successfully fetched!',
      statusCode: 200,
      trans:obj
    };
  }
}