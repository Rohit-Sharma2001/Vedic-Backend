import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
let { ObjectId } = require('mongoose').Types;

import { YogaVideos, YogaVideosDocument, Master, MasterDocument, MembershipBuyHistroy, MembershipBuyHistroyDocument } from '../../schema/schema';

@Injectable()
export class YogaVideosService {
  constructor(@InjectModel(YogaVideos.name) private yogaVideosModel: Model<YogaVideosDocument>,
    @InjectModel(Master.name) private masterModel: Model<MasterDocument>,
    @InjectModel(MembershipBuyHistroy.name) private membershipBuyModel: Model<MembershipBuyHistroyDocument>) { }

  async create1(articleData: Partial<YogaVideos>) {
    try {
      const addVideo = new this.yogaVideosModel(articleData);
      return await addVideo.save();
    } catch (error) {
      console.error('Error creating video:', error);
      return {
        message: 'An error occurred while creating the video.',
        statusCode: 500,
        error: error.message,
      };
    }
  }


async findAll(page, pageSize): Promise<any> {
  try {
    const result = await this.masterModel.aggregate([
      {
        $match: {
          dropdown_type: "yogaVideoCategory",
        },
      },
      {
        $lookup: {
          from: "yogavideos",
          let: { masterId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$categoryId", "$$masterId"] },
                // ✅ removed: status: 1
              },
            },
            {
              $lookup: {
                from: "employees",
                localField: "employeeId",
                foreignField: "_id",
                as: "employeeData",
              },
            },
            { $unwind: { path: "$employeeData", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "users",
                localField: "employeeData.userId",
                foreignField: "_id",
                as: "employee",
              },
            },
            { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },
          ],
          as: "videos",
        },
      },

      // ✅ remove this if you want categories even with zero videos
      // { $match: { "videos.0": { $exists: true } } },
    ]);

    if (!result) {
      return { message: "Result not found", statusCode: 404 };
    }

    return { message: "Result successfully fetched!", statusCode: 201, result };
  } catch (error) {
    console.error("Error fetching result:", error);
    return {
      message: "An error occurred while fetching the result",
      statusCode: 500,
      error: error.message,
    };
  }
}


  async findById(categoryId, videoId, page, pageSize): Promise<any> {
    try {
      const mainFilter = { dropdown_type: "yogaVideoCategory" }
      if (categoryId) {
        mainFilter['_id'] = new Types.ObjectId(categoryId);
      }

      console.log(mainFilter, "objectIdobjectId")
      let videoPipelineMatch = {
        $expr: { $eq: ["$categoryId", "$$masterId"] },
      };

      if (videoId) videoPipelineMatch['_id'] = new Types.ObjectId(videoId);
      const result = await this.masterModel.aggregate([
        { $match: mainFilter },
        {
          $lookup: {
            from: "yogavideos",
            let: { masterId: "$_id" },
            pipeline: [
              {
                $match: videoPipelineMatch
              },
              {
                $lookup: {
                  from: "employees",
                  localField: "employeeId",
                  foreignField: "_id",
                  as: "employeeData"
                }
              },
              { $unwind: { path: "$employeeData", preserveNullAndEmptyArrays: true } },
              {
                $lookup: {
                  from: "users",
                  localField: "employeeData.userId",
                  foreignField: "_id",
                  as: "employee"
                }
              },
              { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },
            ],
            as: "videos"
          }
        }
      ]);

      if (!result) {
        return {
          message: 'Result not found',
          statusCode: 404,
        };
      }
      console.log(result, "result")
      // const hostUrl = `http://localhost:3008`;
      // result['imageUrl'] = result.coverImage ? `${hostUrl}/${result.coverImage.replace(/\\/g, '/')}` : null;

      return {
        message: 'Result successfully fetched!',
        statusCode: 201,
        result,
      };
    } catch (error) {
      console.error('Error fetching result:', error);
      return {
        message: 'An error occurred while fetching the result',
        statusCode: 500,
        error: error.message,
      };
    }
  }

// file: src/modules/yoga_videos/yoga_videos.service.ts

async findVideoById(videoId, user_id, page, pageSize): Promise<any> {
  try {
    const result = await this.yogaVideosModel.aggregate([
      {
        $match: { _id: new Types.ObjectId(videoId) },
      },
      {
        $lookup: {
          from: "yogavideos",
          let: { categoryId: "$categoryId", currentVideoId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$categoryId", "$$categoryId"] },
                    { $ne: ["$_id", "$$currentVideoId"] }, // exclude current video
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "employees",
                localField: "employeeId",
                foreignField: "_id",
                as: "employeeData",
              },
            },
            { $unwind: { path: "$employeeData", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "users",
                localField: "employeeData.userId",
                foreignField: "_id",
                as: "employee",
              },
            },
            { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },
          ],
          as: "relatedVideo",
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeData",
        },
      },
      { $unwind: { path: "$employeeData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "employeeData.userId",
          foreignField: "_id",
          as: "employee",
        },
      },
      { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },

      // ✅ NEW: bring the category name using categoryId
      {
        $lookup: {
          from: "masters",
          let: { catId: "$categoryId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$catId"] } } },
            { $project: { _id: 0, name: 1 } },
          ],
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

      // existing level join
      {
        $lookup: {
          from: "masters",
          let: { levelId: "$levelId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$levelId"] } } },
            { $project: { _id: 0, name: 1 } },
          ],
          as: "level",
        },
      },
      { $unwind: { path: "$level", preserveNullAndEmptyArrays: true } },

      // ✅ NEW: flatten friendly names
      { $addFields: { categoryName: "$category.name", levelName: "$level.name" } },
    ]);

    if (!result || result.length === 0) {
      return {
        message: 'Result not found',
        statusCode: 404,
      };
    }

    console.log(result[0].relatedVideo, "result");

    const yogaLevels = await this.masterModel.find({ dropdown_type: 'yoga_level' });

    if (!yogaLevels) {
      return {
        message: 'Please add yoga levels first.',
        statusCode: 404,
      };
    }

    let isPurchased = false;

    if (user_id) {
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
              targetVideo: new Types.ObjectId(videoId),
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $lte: ['$tier', '$$currentTier'] },
                      { $gt: [{ $size: { $ifNull: ['$yoga_videos', []] } }, 0] },
                    ],
                  },
                },
              },
              {
                $lookup: {
                  from: 'yogavideos',
                  localField: 'yoga_videos',
                  foreignField: '_id',
                  as: 'yoga_videos',
                },
              },
              {
                $match: {
                  $expr: {
                    $anyElementTrue: {
                      $map: {
                        input: '$yoga_videos',
                        as: 'video',
                        in: {
                          $and: [
                            { $eq: ['$$video.is_exclusive', true] },
                            { $eq: ['$$video._id', '$$targetVideo'] },
                          ],
                        },
                      },
                    },
                  },
                },
              },
            ],
            as: 'memberships',
          },
        }
      ]);

      console.log(membership, "membership");
      if (membership?.memberships && membership.memberships.length > 0) {
        isPurchased = true;
      }
    }

    return {
      message: 'Result successfully fetched!',
      statusCode: 201,
      result,
      yogaLevels,
      isPurchased
    };
  } catch (error) {
    console.error('Error fetching result:', error);
    return {
      message: 'An error occurred while fetching the result',
      statusCode: 500,
      error: error.message,
    };
  }
}


  async updateVideoDetails(_id, videoData): Promise<any> {
    try {
      const updatedVideo = await this.yogaVideosModel.findByIdAndUpdate(
        { _id: new Types.ObjectId(_id) },
        { $set: videoData },
        { new: true }
      );

      return {
        message: 'Video successfully updated!',
        statusCode: 201,
        updatedVideo,
      };
    } catch (error) {
      console.error('Error updating video:', error);
      return {
        message: 'An error occurred while updating the video',
        statusCode: 500,
        error: error.message,
      };
    }
  }


  async deleteVideoById(_id: Types.ObjectId): Promise<any> {
    try {
      const deletedVideo = await this.yogaVideosModel.findByIdAndDelete(_id);

      if (!deletedVideo) {
        return {
          message: 'Video not found',
          statusCode: 404,
        };
      }

      return {
        message: 'Video successfully deleted!',
        statusCode: 200,
        deletedVideo,
      };
    } catch (error) {
      console.error('Error deleting video:', error);
      return {
        message: 'An error occurred while deleting the video',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  async toggleVideoStatus(_id: Types.ObjectId): Promise<any> {
    try {
      const video = await this.yogaVideosModel.findById(_id);

      if (!video) {
        return {
          message: 'Video not found',
          statusCode: 404,
        };
      }

      // Current and next status
      const currentStatus = video.status;
      const newStatus = currentStatus === 0 ? 1 : 0;

      // If enabling (0 → 1), enforce max 4 per category
      if (newStatus === 1) {
        const activeVideos = await this.yogaVideosModel.countDocuments({
          categoryId: video.categoryId,
          status: 1,
        });

        if (activeVideos >= 4) {
          return {
            message: 'Only 4 videos in this category can be listed on the Landing Page.',
            statusCode: 400,
          };
        }
      }

      const updatedVideo = await this.yogaVideosModel.findByIdAndUpdate(
        _id,
        { $set: { status: newStatus } },
        { new: true }
      );

      return {
        message: `Video status successfully toggled to ${newStatus}`,
        statusCode: 200,
        updatedVideo,
      };
    } catch (error) {
      console.error('Error toggling video status:', error);
      return {
        message: 'An error occurred while toggling video status',
        statusCode: 500,
        error: error.message,
      };
    }
  }
  
  async findVideosByUserid(user_id, page, pageSize): Promise<any> {
    try {
      let isPurchased = false
      // const [membership] = await this.membershipBuyModel.aggregate([
      //   {
      //     $match: {
      //       user_id: new Types.ObjectId(user_id),
      //       is_expired: false,
      //       status: 'paid',
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: 'membershipmanagements',
      //       localField: 'membership_id',
      //       foreignField: '_id',
      //       as: 'membershipDetails',
      //     },
      //   }, { $unwind: '$membershipDetails' },
      //   {
      //     $lookup: {
      //       from: 'membershipmanagements',
      //       let: {
      //         currentTier: '$membershipDetails.tier',
      //       },
      //       pipeline: [
      //         {
      //           $match: {
      //             $expr: {
      //               $and: [
      //                 { $lte: ['$tier', '$$currentTier'] },
      //                 { $gt: [{ $size: { $ifNull: ['$yoga_videos', []] } }, 0] },
      //               ],
      //             },
      //           },
      //         },
      //         {
      //           $lookup: {
      //             from: 'yogavideos',
      //             localField: 'yoga_videos',
      //             foreignField: '_id',
      //             as: 'yoga_videos',
      //           },
      //         },
      //         {
      //           $match: {
      //             $expr: {
      //               $anyElementTrue: {
      //                 $map: {
      //                   input: '$yoga_videos',
      //                   as: 'video',
      //                   in: {
      //                     $and: [
      //                       { $eq: ['$$video.is_exclusive', true] },
      //                     ],
      //                   },
      //                 },
      //               },
      //             },
      //           },
      //         },
      //       ],
      //       as: 'memberships',
      //     },
      //   }
      // ]);

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
            from: 'yogavideos',
            let: {
              currentTier: '$membershipDetails.tier',
            },
            pipeline: [
              {
                $lookup: {
                  from: 'membershipmanagements',
                  let: { currentTier: '$$currentTier' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $lte: ['$tier', '$$currentTier'] },
                            { $gt: [{ $size: { $ifNull: ['$yoga_videos', []] } }, 0] },
                          ],
                        },
                      },
                    },
                  ],
                  as: 'allowedMemberships',
                },
              },
              {
                $match: {
                  $expr: {
                    $or: [
                      // 🟢 Include non-exclusive videos always
                      { $eq: ['$is_exclusive', false] },
                      // 🔒 Include exclusive videos only if in allowed memberships
                      {
                        $and: [
                          { $eq: ['$is_exclusive', true] },
                          {
                            $in: ['$_id', {
                              $reduce: {
                                input: '$allowedMemberships',
                                initialValue: [],
                                in: { $concatArrays: ['$$value', '$$this.yoga_videos'] },
                              },
                            }],
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            ],
            as: 'accessibleVideos',
          },
        },
      ]);

      console.log(membership, "membership")
      if (membership?.length > 0) {
        isPurchased = true
      }

      return {
        message: 'Result successfully fetched!',
        statusCode: 201,membership,
        // result,
        // yogaLevels,
        isPurchased
      };
    } catch (error) {
      console.error('Error fetching result:', error);
      return {
        message: 'An error occurred while fetching the result',
        statusCode: 500,
        error: error.message,
      };
    }
  }

}