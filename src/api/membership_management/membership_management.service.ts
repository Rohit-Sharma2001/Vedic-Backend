// src/modules/membership_management/membership_management.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MembershipManagement, MembershipManagementDocument, YogaVideos, YogaVideosDocument } from 'src/schema/schema';
@Injectable()
export class MembershipManagementService {
  constructor(
    @InjectModel(MembershipManagement.name) private membershipModel: Model<MembershipManagementDocument>,
    @InjectModel(YogaVideos.name) private yogaVideoModel: Model<YogaVideosDocument>,
  ) { }

  async create(data: Partial<MembershipManagement>) {
    const newPlan = new this.membershipModel(data);
    return await newPlan.save();
  }

  async findAll(page = 1, pageSize = 10,userMembershipId="") {
    const skip = (page - 1) * pageSize;
    const filter = { is_deleted: 0 };
    const totalCount = await this.membershipModel.countDocuments(filter);

    const hostUrl = `http://localhost:3008`;

    const results = await this.membershipModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .sort({ created_date: -1 })
      .lean();

    const resultsWithUrls = results.map((plan) => ({
      ...plan,
      imageUrl: plan.image ? `${hostUrl}/${plan.image.replace(/\\/g, '/')}` : null,
    }));
    let userMembershipDetails={}
    if (userMembershipId!=""){
       userMembershipDetails= await this.membershipModel.findById(new Types.ObjectId(userMembershipId))
    }

    return {
      message: 'Membership plans fetched successfully!',
      statusCode: 200,
      result: resultsWithUrls,
      totalCount,
      page,
      userMembershipDetails,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }

  async findOneById(id: string,userMembershipId:string) {
    const objectId = new Types.ObjectId(id);
    const result = await this.membershipModel.findById(objectId).lean();

    if (!result) {
      return { message: 'Membership plan not found', statusCode: 404 };
    }
    let userMembershipDetails={}
    if (userMembershipId!=""){
       userMembershipDetails= await this.membershipModel.findById(new Types.ObjectId(userMembershipId))
    }

    const hostUrl = `http://localhost:3008`;
    result['imageUrl'] = result.image
      ? `${hostUrl}/${result.image.replace(/\\/g, '/')}`
      : null;

    return {
      message: 'Membership plan fetched successfully!',
      statusCode: 200,
      result,
      userMembershipDetails,
    };
  }

  async update(id: string, updates: Partial<MembershipManagement>) {
  const objectId = new Types.ObjectId(id);
  updates.modified_date = new Date();

  // ✅ Convert course & yoga video IDs
  if (updates.courses && updates.courses.length > 0) {
    updates.courses = updates.courses.map((e) => new Types.ObjectId(e));
  }

  if (updates.yoga_videos && updates.yoga_videos.length > 0) {
    updates.yoga_videos = updates.yoga_videos.map((e) => new Types.ObjectId(e));
  }

  // 🟢 NEW: Convert product categories (array of objects)
  if (updates.product_categories && updates.product_categories.length > 0) {
    updates.product_categories = updates.product_categories.map((item: any) => ({
      category_id: new Types.ObjectId(item.category_id),
      discount: Number(item.discount) || 0, // default to 0% if invalid
    }));
  }
  // updates.stripeProductId='prod_UT4ASNLwNpGIyj'
  // updates.stripePriceId='price_1TU823BjjJXHo5B6xHI8uvqc'

  // 🔹 Update document
  await this.membershipModel.updateOne({ _id: objectId }, { $set: updates });

  const updated = await this.membershipModel.findById(objectId).lean();

  // Keep yoga video logic
  if (updates.yoga_videos && updates.yoga_videos.length > 0) {
    await this.yogaVideoModel.updateMany(
      { _id: { $in: updates.yoga_videos } },
      { $set: { is_exclusive: true } },
    );
  }

  return {
    message: 'Membership plan updated successfully!',
    statusCode: 200,
    result: updated,
  };
}


  async delete(id: string) {
    const objectId = new Types.ObjectId(id);
    await this.membershipModel.updateOne(
      { _id: objectId },
      { $set: { is_deleted: 1, modified_date: new Date() } },
    );

    return { message: 'Membership plan deleted successfully!', statusCode: 200 };
  }

  async togglePlanStatus(id) {
    if (!id) {
      return { statusCode: 400, message: 'Plan ID is required.' };
    }

    const plan = await this.membershipModel.findById(id);
    if (!plan) {
      return { statusCode: 404, message: 'Membership plan not found.' };
    }

    plan.status = plan.status === 1 ? 0 : 1;
    plan.modified_date = new Date();

    await plan.save();

    return {
      statusCode: 200,
      message: `Plan status updated successfully.`,
      newStatus: plan.status,
    };
  }

  async setBestValue(id: string) {
    if (!id) {
      return { statusCode: 400, message: 'Plan ID is required.' };
    }

    const plan = await this.membershipModel.findById(id);
    if (!plan) {
      return { statusCode: 404, message: 'Membership plan not found.' };
    }

    // Step 1: Reset all plans to is_bestvalue = 0
    await this.membershipModel.updateMany({}, { $set: { is_bestvalue: 0 } });

    // Step 2: Set selected plan's is_bestvalue = 1
    plan.is_bestvalue = 1;
    plan.modified_date = new Date();
    await plan.save();

    return {
      statusCode: 200,
      message: 'Best Value plan updated successfully!',
      bestValuePlanId: plan._id,
    };
  }

}
