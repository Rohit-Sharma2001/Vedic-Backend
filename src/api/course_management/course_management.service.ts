// src/modules/course_management/course_management.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CourseManagement, CourseManagementDocument, CourseRating, CourseRatingDocument, CoursesBuyHistroy, CoursesBuyHistroyDocument, MembershipBuyHistroy, MembershipBuyHistroyDocument, MembershipManagement, MembershipManagementDocument } from 'src/schema/schema';
import Stripe from 'stripe';

@Injectable()
export class CourseManagementService {
  private stripe: Stripe;
  constructor(
    @InjectModel(CourseManagement.name) private readonly courseModel: Model<CourseManagementDocument>,
    @InjectModel(CourseRating.name) private readonly courseRatingModel: Model<CourseRatingDocument>,
    @InjectModel(CoursesBuyHistroy.name) private readonly courseBuyModel: Model<CoursesBuyHistroyDocument>,
    @InjectModel(MembershipBuyHistroy.name) private readonly membershipBuyModel: Model<MembershipBuyHistroyDocument>,
    @InjectModel(MembershipManagement.name) private readonly membershipModel: Model<MembershipManagementDocument>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      // apiVersion: '2023-10-16',
    });
  }

  private async buildRatingSummary(courseIds: Types.ObjectId[]) {
    if (!courseIds.length) return {};

    const ratings = await this.courseRatingModel.aggregate([
      { $match: { course_id: { $in: courseIds } } },
      {
        $group: {
          _id: '$course_id',
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
          userIds: { $addToSet: '$user_id' },
        },
      },
    ]);

    return ratings.reduce((acc, curr) => {
      acc[curr._id.toString()] = {
        averageRating: Number(curr.averageRating?.toFixed(2)) || 0,
        totalRatings: curr.totalRatings || 0,
        userIds: curr.userIds || [],
      };
      return acc;
    }, {} as Record<string, { averageRating: number; totalRatings: number; userIds: Types.ObjectId[] }>);
  }

  async createCourse(data: Partial<CourseManagement>): Promise<any> {
    try {
      const newCourse = new this.courseModel(data);
      const saved = await newCourse.save();
      return {
        message: 'Course successfully added!',
        statusCode: 201,
        data: saved,
      };
    } catch (error) {
      console.error('Error creating course:', error);
      return { message: 'Failed to add course', statusCode: 500, error: error.message };
    }
  }

  async rateCourse(data: { course_id: string; user_id: string; rating: number }) {
    try {
      const { course_id, user_id, rating } = data;

      if (!Types.ObjectId.isValid(course_id) || !Types.ObjectId.isValid(user_id)) {
        return { message: 'Invalid course_id or user_id', statusCode: 400 };
      }

      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return { message: 'Rating must be between 1 and 5', statusCode: 400 };
      }

      const courseExists = await this.courseModel.exists({ _id: new Types.ObjectId(course_id) });
      if (!courseExists) {
        return { message: 'Course not found', statusCode: 404 };
      }

      const alreadyRated = await this.courseRatingModel.findOne({
        course_id: new Types.ObjectId(course_id),
        user_id: new Types.ObjectId(user_id),
      });

      if (alreadyRated) {
        return { message: 'User has already rated this course', statusCode: 400 };
      }

      const ratingDoc = new this.courseRatingModel({
        course_id: new Types.ObjectId(course_id),
        user_id: new Types.ObjectId(user_id),
        rating,
      });

      await ratingDoc.save();

      const ratingMap = await this.buildRatingSummary([new Types.ObjectId(course_id)]);

      return {
        message: 'Rating submitted successfully',
        statusCode: 201,
        data: ratingMap[course_id] || { averageRating: rating, totalRatings: 1, userIds: [new Types.ObjectId(user_id)] },
      };
    } catch (error) {
      console.error('Error rating course:', error);
      return { message: 'Failed to rate course', statusCode: 500, error: error.message };
    }
  }

  async getAllCourses(page = 1, pageSize = 10): Promise<any> {
    try {
      const skip = (page - 1) * pageSize;
      const result = await this.courseModel
        .find()
        .populate('categoryId', 'name')
        .populate('courseContent.lectures.videoCategoryId', 'name')
        .populate('courseContent.lectures.videoId', 'name')
        .populate('courseContent.lectures.documentId', 'name')


        .skip(skip)
        .limit(pageSize)
        .exec();

      const ratingMap = await this.buildRatingSummary(
        result.map((c) => new Types.ObjectId((c as any)._id)),
      );
      const resultWithRatings = result.map((course) => {
        const rating = ratingMap[course._id.toString()] || { averageRating: 0, totalRatings: 0, userIds: [] };
        return { ...course.toObject(), rating };
      });

      const totalCount = await this.courseModel.countDocuments();

      return {
        message: 'Courses fetched successfully!',
        statusCode: 200,
        result: resultWithRatings,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    } catch (error) {
      console.error('Error fetching courses:', error);
      return { message: 'Failed to fetch courses', statusCode: 500, error: error.message };
    }
  }

  async getCourseById(id: string, user_id?: string): Promise<any> {
    try {
      const course = await this.courseModel
        .findById(id)
        .populate('categoryId', 'name')
        .populate('courseContent.lectures.videoCategoryId', 'name')
        .populate({
          path: 'courseContent.lectures.videoId',
          select: 'name description duration coverImage video employeeId categoryId levelId status',
          populate: [
            { path: 'categoryId', select: 'name' },
            { path: 'levelId', select: 'name' },
            { path: 'employeeId', select: 'name' },
          ],
        })
        .populate({
          path: 'courseContent.lectures.documentId',
          select: 'name file status _id createdAt modifiedAt',
        })
        .exec();

      if (!course) {
        return { message: 'Course not found', statusCode: 404 };
      }
      const ratingMap = await this.buildRatingSummary([
        new Types.ObjectId(String(course._id)),
      ]);
      const rating = ratingMap[course._id.toString()] || { averageRating: 0, totalRatings: 0, userIds: [] };

      // ✅ Check access details for the user
      let accessInfo = {
        isPurchased: false,
        accessReason: null as 'purchase' | 'membership' | null,
        purchasedDirectly: false,
        accessibleViaMembership: false,
        userMembershipDetails: null as any,
      };

      // ✅ Find all memberships that include this course (for all users)
      const membershipsWithCourse = await this.membershipModel.find({
        courses: new Types.ObjectId(id),
        is_deleted: 0,
        status: 1,
      }).select('_id plan_name plan_description tier price image is_bestvalue').lean();

      // ✅ Check if user has access
      if (user_id && Types.ObjectId.isValid(user_id)) {
        // Check direct purchase
        const existingPurchase = await this.courseBuyModel.findOne({
          user_id: new Types.ObjectId(user_id),
          course_id: new Types.ObjectId(id),
          status: 'paid',
        });

        if (existingPurchase) {
          accessInfo.isPurchased = true;
          accessInfo.accessReason = 'purchase';
          accessInfo.purchasedDirectly = true;
        } else {
          // Check membership access
          const [membership] = await this.membershipBuyModel.aggregate([
            {
              $match: {
                user_id: new Types.ObjectId(user_id),
                is_expired: false,
                status: 'paid',
              },
            },
            {
              $lookup: {
                from: 'membershipmanagements',
                localField: 'membership_id',
                foreignField: '_id',
                as: 'membershipDetails',
              },
            },
            { $unwind: '$membershipDetails' },
            {
              $lookup: {
                from: 'membershipmanagements',
                let: {
                  currentTier: '$membershipDetails.tier',
                  targetCourse: new Types.ObjectId(id),
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $lte: ['$tier', '$$currentTier'] },
                          { $gt: [{ $size: { $ifNull: ['$courses', []] } }, 0] },
                          { $in: ['$$targetCourse', '$courses'] },
                        ],
                      },
                    },
                  },
                ],
                as: 'accessibleMemberships',
              },
            },
          ]);

          if (membership?.accessibleMemberships && membership.accessibleMemberships.length > 0) {
            accessInfo.isPurchased = true;
            accessInfo.accessReason = 'membership';
            accessInfo.accessibleViaMembership = true;
            accessInfo.userMembershipDetails = {
              purchasedMembership: {
                _id: membership.membershipDetails._id,
                plan_name: membership.membershipDetails.plan_name,
                plan_description: membership.membershipDetails.plan_description,
                tier: membership.membershipDetails.tier,
                price: membership.membershipDetails.price,
                image: membership.membershipDetails.image,
              },
              accessibleMemberships: membership.accessibleMemberships.map((m: any) => ({
                _id: m._id,
                plan_name: m.plan_name,
                plan_description: m.plan_description,
                tier: m.tier,
                price: m.price,
                image: m.image,
                is_bestvalue: m.is_bestvalue,
              })),
            };
          }
        }
      }

      return {
        message: 'Course fetched successfully!',
        statusCode: 200,
        data: {
          ...course.toObject(),
          isPurchased: accessInfo.isPurchased,
          rating,
          accessDetails: {
            accessReason: accessInfo.accessReason,
            purchasedDirectly: accessInfo.purchasedDirectly,
            accessibleViaMembership: accessInfo.accessibleViaMembership,
            userMembershipDetails: accessInfo.userMembershipDetails,
          },
          availableInMemberships: membershipsWithCourse.map((m) => ({
            _id: m._id,
            plan_name: m.plan_name,
            plan_description: m.plan_description,
            tier: m.tier,
            price: m.price,
            image: m.image,
            is_bestvalue: m.is_bestvalue,
          })),
        },
      };
    } catch (error) {
      console.error('Error fetching course:', error);
      return {
        message: 'Failed to fetch course',
        statusCode: 500,
        error: error.message,
      };
    }
  }



  async updateCourse(id: string, updates: Partial<CourseManagement>): Promise<any> {
    try {
      const updated = await this.courseModel.findByIdAndUpdate(
        id,
        { ...updates, modified: new Date() },
        { new: true },
      );

      if (!updated) {
        return { message: 'Course not found', statusCode: 404 };
      }

      return { message: 'Course successfully updated!', statusCode: 200, data: updated };
    } catch (error) {
      console.error('Error updating course:', error);
      return { message: 'Failed to update course', statusCode: 500, error: error.message };
    }
  }

  async deleteCourse(id: string): Promise<any> {
    try {
      const deleted = await this.courseModel.findByIdAndDelete(id);

      if (!deleted) {
        return { message: 'Course not found', statusCode: 404 };
      }

      return { message: 'Course deleted successfully!', statusCode: 200 };
    } catch (error) {
      console.error('Error deleting course:', error);
      return { message: 'Failed to delete course', statusCode: 500, error: error.message };
    }
  }

  async toggleCourseStatus(id: string): Promise<any> {
    try {
      const course = await this.courseModel.findById(id);

      if (!course) {
        return { message: 'Course not found', statusCode: 404 };
      }

      // ✅ Toggle status (1 ↔ 0)
      course.status = course.status === 1 ? 0 : 1;
      course.modified = new Date();

      await course.save();

      const statusText = course.status === 1 ? 'activated' : 'deactivated';

      return {
        message: `Course successfully ${statusText}!`,
        statusCode: 200,
        data: course,
      };
    } catch (error) {
      console.error('Error toggling course status:', error);
      return {
        message: 'Failed to update status',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  async createPaymentLink(data: Partial<any>) {
    let currency = 'usd'
    let description = 'string'
    const courses_id = new Types.ObjectId(data._id)
    const coursesDetails = await this.courseModel.findById({ _id: courses_id })

    const saveData = {
      course_id: courses_id,
      user_id: new Types.ObjectId(data.user_id),
      status: 'notPaid',

    }
    const coursesBuyManagement = new this.courseBuyModel(saveData);

    const newCourses = await coursesBuyManagement.save();
    let payableAmomunt = parseFloat(((Number(coursesDetails.price) * 100).toFixed(2)))
    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: coursesDetails.courseName,
            },
            unit_amount: payableAmomunt,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
       description: coursesDetails.courseName,
       metadata: {
            id: `${newCourses._id}`,
            type:'course'
          }},
      mode: 'payment',
      success_url: `${process.env.BASE_URL}/course_management/paymentSuccess/${newCourses._id}`,  // URL after successful payment
      // cancel_url: `https://doyoursurvey.com/cancel`,    // URL if payment is canceled
    });
    console.log(session, "session")
    await this.courseBuyModel.findByIdAndUpdate({ _id: newCourses._id }, { $set: { paymentSessionId: session.id || "" } })

    // return session.url;
    return {
      message: 'course placed',
      statusCode: 200,
      paymentUrl: session.url,
      orderId: newCourses._id
    };
    // const newPlan = new this.membershipBuyModel(data);
    // return await newPlan.save();
  }


  async paymentSuccess(id: string) {
    try {
      const coursesBuyData = await this.courseBuyModel.findById(id);
      console.log(coursesBuyData, "courseData")
      if (!coursesBuyData) {
        // throw new Error("Order not found")
        return {
          message: 'course not found',
          statusCode: 400
        };
      } else if (coursesBuyData?.status == 'paid') {
        // throw new Error("Order already placed")
        return {
          message: 'Course already Buyed',
          statusCode: 400
        };
      }
      await this.courseBuyModel.findByIdAndUpdate({ _id: id }, { $set: { status: "paid" } })

      return {
        message: 'Course placed',
        statusCode: 200,
        paymentUrl: `${process.env.FRONTEND_URL}/YogaClasses/Yoga-Courses/Thankyou`
      };

    } catch (error) {
      console.log(error, "eeeeeeeeee")
      // throw new Error(error.message);
      return {
                    message: 'Something went wromg',
                    statusCode: 400,
                    error:error.message
                };
    }
  }

  async getAllCourseTransactions(page = 1, pageSize = 10): Promise<any> {
    try {
      const skip = (page - 1) * pageSize;

      const transactions = await this.courseBuyModel
        .find()
        .populate({
          path: 'course_id',
          model: 'CourseManagement',
          select: 'courseName price categoryId',
          populate: { path: 'categoryId', select: 'name' },
        })
        .populate({
          path: 'user_id',
          model: 'User',
          select: 'name email mobileNo',
        })
        .sort({ date: -1 })
        .skip(skip)
        .limit(pageSize)
        .exec();

      const totalCount = await this.courseBuyModel.countDocuments();

      const formatted = transactions.map((t) => {
        const user =
          t.user_id && typeof t.user_id === 'object' && 'name' in t.user_id
            ? (t.user_id as any)
            : null;

        const course =
          t.course_id && typeof t.course_id === 'object' && 'courseName' in t.course_id
            ? (t.course_id as any)
            : null;

        return {
          transactionId: t._id,
          user: user
            ? {
              name: user.name,
              email: user.email,
              mobileNo: user.mobileNo,
            }
            : null,
          course: course
            ? {
              name: course.courseName,
              price: course.price,
              category: course.categoryId?.name || null,
            }
            : null,
          paymentStatus: t.status,
          paymentSessionId: (t as any).paymentSessionId || null,
          createdAt: (t as any).date || null,
        };
      });

      return {
        result: formatted,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
        pageSize,
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error(error.message);
    }
  }

  async getCourseAndMembership(user_id?: string): Promise<any> {
    try {    
      const [membership] = await this.membershipBuyModel.aggregate([
        {
          $match: {
            user_id: new Types.ObjectId(user_id),
            is_expired: false,
            status: 'paid',
          },
        },
        {
          $lookup: {
            from: 'membershipmanagements',
            localField: 'membership_id',
            foreignField: '_id',
            as: 'membershipDetails',
          },
        }, { $unwind: '$membershipDetails' },
        {
          $lookup: {
            from: 'membershipmanagements',
            let: {
              currentTier: '$membershipDetails.tier',
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $and: [
                      { $lte: ['$tier', '$$currentTier'] },
                    ],
                  },
                }
              },
              {
                $lookup: {
                  from: 'courses',
                  localField: 'courses',      // courses array in membershipmanagements
                  foreignField: '_id',         // _id in courses collection
                  as: 'coursesDetails',
                },
              },
            ],
            as: 'memberships',
          },
        },
      ]);

      const courses = await this.courseBuyModel.aggregate([{ $match: { user_id: new Types.ObjectId(user_id), status: 'paid' } },
      {
        $lookup: {
          from: 'courses',
          localField: 'course_id',
          foreignField: '_id',
          as: 'course'
        }
      }])
      return {
        message: 'User course fetched successfully!',
        statusCode: 200,
        data: {
          courses,
          membership
        },
      };
    } catch (error) {
      console.error('Error fetching course:', error);
      return {
        message: 'Failed to fetch course',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  async increaseViewCount(id: string): Promise<any> {
  try {
    const updated = await this.courseModel.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 }, modified: new Date() },
      { new: true }
    );

    if (!updated) {
      return { message: 'Course not found', statusCode: 404 };
    }

    return {
      message: 'View count updated!',
      statusCode: 200,
      data: updated,
    };
  } catch (error) {
    return {
      message: 'Failed to update view count',
      statusCode: 500,
      error: error.message,
    };
  }
}

async getTrendingCourses(): Promise<any> {
  try {
    // Top 4 viewed
    const mostViewed = await this.courseModel
      .find()
      .sort({ viewCount: -1 })
      .limit(4)
      .select('courseName price icon_file viewCount categoryId status')
      .populate('categoryId', 'name');

    // Top 4 purchased
    const purchasedAgg = await this.courseBuyModel.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: '$course_id',
          purchaseCount: { $sum: 1 },
        },
      },
      { $sort: { purchaseCount: -1 } },
      { $limit: 4 },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      {
        $lookup: {
          from: 'masters',
          localField: 'course.categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: '$course._id',
          courseName: '$course.courseName',
          price: '$course.price',
          icon_file: '$course.icon_file',
          viewCount: '$course.viewCount',
          status: '$course.status',
          category: '$category.name',
          purchases: '$purchaseCount',
        },
      },
    ]);

    const ratingIds = Array.from(
      new Set([
        ...mostViewed.map((c) => c._id?.toString()),
        ...purchasedAgg.map((c: any) => c._id?.toString()),
      ]).values(),
    )
      .filter(Boolean)
      .map((id) => new Types.ObjectId(id));
    const ratingMap = await this.buildRatingSummary(ratingIds);

    const mostViewedWithRatings = mostViewed.map((course) => {
      const rating = ratingMap[course._id.toString()] || { averageRating: 0, totalRatings: 0, userIds: [] };
      return { ...course.toObject(), rating };
    });

    const mostPurchasedWithRatings = purchasedAgg.map((course: any) => {
      const rating = ratingMap[course._id.toString()] || { averageRating: 0, totalRatings: 0, userIds: [] };
      return { ...course, rating };
    });

    return {
      message: 'Trending courses fetched successfully!',
      statusCode: 200,
      data: {
        mostViewed: mostViewedWithRatings,
        mostPurchased: mostPurchasedWithRatings,
      },
    };
  } catch (error) {
    return {
      message: 'Failed to fetch trending courses',
      statusCode: 500,
      error: error.message,
    };
  }
}



}
