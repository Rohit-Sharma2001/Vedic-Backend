// subscribe-email.service.ts

import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';

import {
    sendSubscribeEmails
} from 'src/middlewares/nodemailer/nodemailer.controller';


import {
    GroupForEmail, GroupForEmailDocument,
    GroupingEmails, GroupingEmailsDocument,
    User, UserDocument,
    suscribe, suscribeDocument
} from '../../schema/schema';

@Injectable()
export class GroupForEmailService {
    constructor(
        @InjectModel(GroupForEmail.name) private readonly groupForEmailModel: Model<GroupForEmailDocument>,

        @InjectModel(GroupingEmails.name) private readonly groupingEmailsModel: Model<GroupingEmailsDocument>,

        @InjectModel(User.name) private readonly usersModel: Model<UserDocument>,

        @InjectModel(suscribe.name) private suscribeModel: Model<suscribeDocument>,
    ) { }

    // ================= ADD GROUP =================

    async addGroup(
        data: Partial<GroupForEmail>,
    ): Promise<GroupForEmail> {
        const exists =
            await this.groupForEmailModel.findOne({
                groupName: data.groupName,
            });

        if (exists) {
            throw new BadRequestException(
                'Group already exists',
            );
        }

        const createdGroup =
            new this.groupForEmailModel({
                ...data,
            });

        return createdGroup.save();
    }

    // ================= GET ALL GROUPS =================

    async getAllGroups(): Promise<
        GroupForEmail[]
    > {
        return await this.groupForEmailModel
            .find()
            .sort({ _id: -1 });
    }

    // ================= GET SINGLE GROUP =================

    async getSingleGroup(
        id: string,
    ): Promise<GroupForEmail> {
        const data =
            await this.groupForEmailModel.findById(id);

        if (!data) {
            throw new NotFoundException(
                'Group not found',
            );
        }

        return data;
    }

    // ================= UPDATE GROUP =================

    // ================= SERVICE =================

    async updateGroup(
        groupId: string,
        updatedData: Partial<GroupForEmail>,
    ): Promise<GroupForEmail | null> {
        try {
            // Convert to ObjectId
            const objectId = new Types.ObjectId(
                groupId,
            );

            // Check duplicate group name
            if (updatedData.groupName) {
                const duplicate =
                    await this.groupForEmailModel.findOne({
                        groupName:
                            updatedData.groupName,
                        _id: { $ne: objectId },
                    });

                if (duplicate) {
                    throw new Error(
                        'Group name already exists',
                    );
                }
            }

            // Remove id from update object
            delete updatedData.id;

            // Update group
            const result =
                await this.groupForEmailModel.findOneAndUpdate(
                    {
                        _id: objectId,
                    },
                    {
                        $set: {
                            ...updatedData,
                            modified: new Date(),
                        },
                    },
                    {
                        new: true,
                    },
                );

            return result;
        } catch (error) {
            console.error(
                'Error in updateGroup:',
                error,
            );

            throw new Error(
                'Database update failed',
            );
        }
    }

    // ================= SERVICE =================
    async deleteGroup(
        groupId: string,
    ): Promise<boolean> {
        try {
            const result =
                await this.groupForEmailModel.findOneAndDelete(
                    {
                        _id: groupId,
                    },
                );

            return result ? true : false;
        } catch (error) {
            console.error(
                'Error in deleteGroup:',
                error,
            );

            throw new Error(
                'Database query failed',
            );
        }
    }

    // ================= ADD EMAIL IN GROUP =================

    // ================= ADD OR UPDATE EMAIL IN GROUP =================

    async addEmailInGroup(data: any) {
        try {
            console.log('Service Data:', data);

            // ================= VALIDATE GROUP ID =================

            if (
                !data.group ||
                !Types.ObjectId.isValid(data.group)
            ) {
                throw new Error(
                    'Valid Group ID is required',
                );
            }

            // ================= CONVERT TO OBJECT ID =================

            const groupObjectId = new Types.ObjectId(data.group);
            const userId = new Types.ObjectId(data.id);


            // ================= CHECK GROUP =================

            const groupExists =
                await this.groupForEmailModel.findById(
                    groupObjectId,
                );

            console.log(
                'Group Exists:',
                groupExists,
            );

            if (!groupExists) {
                throw new Error(
                    'Group not found',
                );
            }

            // // ================= CHECK USER =================

            // const userExists =
            //     await this.usersModel.findOne({
            //         _id: userId,
            //     });

            // console.log(
            //     'User Exists:',
            //     userExists,
            // );

            // let userEmail = userExists ? userExists.email : null;

            //  const subscriberExists =
            //     await this.suscribeModel.findOne({
            //         _id: userId,
            //     });

            // console.log(
            //     'Subscriber Exists:',
            //     subscriberExists,
            // );

            // let subscriberEmail = subscriberExists ? subscriberExists.email : null;

            // ================= CHECK EXISTING EMAIL =================

            const existingEmail =
                await this.groupingEmailsModel.findOne({
                    userId: userId,
                });

            // ================= UPDATE EXISTING =================

            if (existingEmail) {
                const updatedData =
                    await this.groupingEmailsModel.findByIdAndUpdate(
                        existingEmail._id,
                        {
                            groupId:
                                groupObjectId,

                            // SAVE NULL IF USER NOT FOUND
                            userId: userId ? userId
                                : null,

                            modified:
                                new Date(),
                        },
                        {
                            new: true,
                        },
                    );

                return {
                    message:
                        'Group updated successfully for this email',
                    data: updatedData,
                };
            }

            // ================= CREATE NEW =================

            const createdData =
                new this.groupingEmailsModel({
                    groupId: groupObjectId,

                    // SAVE NULL IF USER NOT FOUND
                    userId: userId ? userId
                        : null,

                    email: data.email,
                    date: new Date(),
                    modified: new Date(),
                });

            const savedData =
                await createdData.save();

            return {
                message:
                    'Email added successfully in group',
                data: savedData,
            };
        } catch (error) {
            console.error(
                'Service Error:',
                error,
            );

            throw new Error(
                error.message ||
                'Database operation failed',
            );
        }
    }

async addBulkEmailsInGroup(data: {
    group: string;
    users: { userId: string; email: string }[];
}) {
    try {
        console.log('Bulk Service Data:', data);

        // ================= VALIDATE GROUP ID =================

        if (!data.group || !Types.ObjectId.isValid(data.group)) {
            throw new Error('Valid Group ID is required');
        }

        if (!data.users || data.users.length === 0) {
            throw new Error('No users provided');
        }

        // ================= DEDUPLICATE INCOMING USERS =================
        // Same userId may appear multiple times in payload — keep only first occurrence

        const seen = new Set<string>();
        const uniqueUsers = data.users.filter(u => {
            if (!u.userId || seen.has(u.userId)) return false;
            seen.add(u.userId);
            return true;
        });

        if (uniqueUsers.length === 0) {
            throw new Error('No valid unique users provided');
        }

        // ================= CONVERT TO OBJECT ID =================

        const groupObjectId = new Types.ObjectId(data.group);

        // ================= CHECK GROUP =================

        const groupExists = await this.groupForEmailModel.findById(groupObjectId);

        if (!groupExists) {
            throw new Error('Group not found');
        }

        // ================= PROCESS EACH USER =================

        const results = await Promise.all(
            uniqueUsers.map(async (user) => {
                try {
                    if (!user.userId || !Types.ObjectId.isValid(user.userId)) {
                        return {
                            email: user.email,
                            status: 'skipped',
                            reason: 'Invalid user ID',
                        };
                    }

                    const userId = new Types.ObjectId(user.userId);

                    // ================= CHECK EXISTING =================
                    // Check by BOTH groupId + userId to allow same user in different groups

                    const existingEmail = await this.groupingEmailsModel.findOne({
                        groupId: groupObjectId,
                        userId,
                    });

                    // ================= UPDATE IF EXISTS =================

                    if (existingEmail) {
                        await this.groupingEmailsModel.findByIdAndUpdate(
                            existingEmail._id,
                            {
                                groupId: groupObjectId,
                                userId,
                                email: user.email,
                                modified: new Date(),
                            },
                            { new: true },
                        );

                        return {
                            email: user.email,
                            status: 'updated',
                        };
                    }

                    // ================= CREATE NEW =================

                    const created = new this.groupingEmailsModel({
                        groupId: groupObjectId,
                        userId,
                        email: user.email,
                        status: 1,
                        date: new Date(),
                        modified: new Date(),
                    });

                    await created.save();

                    return {
                        email: user.email,
                        status: 'created',
                    };
                } catch (err) {
                    return {
                        email: user.email,
                        status: 'failed',
                        reason: err.message,
                    };
                }
            }),
        );

        // ================= SUMMARY =================

        const summary = {
            total: uniqueUsers.length,
            created: results.filter(r => r.status === 'created').length,
            updated: results.filter(r => r.status === 'updated').length,
            skipped: results.filter(r => r.status === 'skipped').length,
            failed:  results.filter(r => r.status === 'failed').length,
        };

        console.log('Bulk Insert Summary:', summary);

        return { summary, results };
    } catch (error) {
        console.error('Bulk Service Error:', error);
        throw new Error(error.message || 'Database operation failed');
    }
}
    // ================= GET EMAILS BY GROUP ID =================

  async removeUserFromGroup(data: { group: string; userId: string }) {
    try {
        if (!data.group) throw new Error('Valid Group ID is required');
        if (!data.userId) throw new Error('Valid User ID is required');

        const groupObjectId = new Types.ObjectId(data.group);
        const userObjectId  = new Types.ObjectId(data.userId);

        const groupExists = await this.groupForEmailModel.findById(groupObjectId);
        if (!groupExists) throw new Error('Group not found');

        const record = await this.groupingEmailsModel.findOne({
            groupId: groupObjectId,
            userId:  userObjectId,
        });

        if (!record) throw new Error('User not found in this group');

        await this.groupingEmailsModel.findByIdAndDelete(record._id);

        return {
            message: 'User removed from group successfully',
            userId:  data.userId,
            group:   data.group,
        };

    } catch (error) {
        console.error('Remove User From Group Error:', error);
        throw new Error(error.message || 'Failed to remove user from group');
    }
}

    async getEmailsByGroupId(groupId: string) {
        const groupObjectId = new Types.ObjectId(groupId);

        const data = await this.groupingEmailsModel.aggregate([
            {
                $match: {
                    groupId: groupObjectId,
                },
            },

            // ================= USERS TABLE JOIN =================
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userData',
                },
            },

            // ================= SUBSCRIBES TABLE JOIN =================
            {
                $lookup: {
                    from: 'suscribes',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'subscribeData',
                },
            },

            // ================= GROUP TABLE JOIN =================
            {
                $lookup: {
                    from: 'groupforemails', // actual mongo collection name
                    localField: 'groupId',
                    foreignField: '_id',
                    as: 'groupData',
                },
            },

            // ================= UNWIND =================
            {
                $unwind: {
                    path: '$groupData',
                    preserveNullAndEmptyArrays: true,
                },
            },

            // ================= FINAL EMAIL LOGIC =================
            {
                $addFields: {
                    finalEmail: {
                        $cond: {
                            if: {
                                $gt: [
                                    { $size: '$userData' },
                                    0,
                                ],
                            },
                            then: {
                                $arrayElemAt: [
                                    '$userData.email',
                                    0,
                                ],
                            },
                            else: {
                                $cond: {
                                    if: {
                                        $gt: [
                                            {
                                                $size:
                                                    '$subscribeData',
                                            },
                                            0,
                                        ],
                                    },
                                    then: {
                                        $arrayElemAt: [
                                            '$subscribeData.email',
                                            0,
                                        ],
                                    },
                                    else: '$email',
                                    // else: null,
                                },
                            },
                        },
                    },
                },
            },

            // ================= PROJECT =================
            {
                $project: {
                    _id: 1,
                    groupId: 1,
                    userId: 1,

                    email: '$finalEmail',

                    // originalEmail: '$email',

                    groupName:
                        '$groupData.groupName',

                    status: 1,
                    date: 1,
                },
            },

            // ================= SORT =================
            {
                $sort: {
                    _id: -1,
                },
            },
        ]);

        return data;
    }

    // ================= SEND MAIL TO GROUP =================

    async sendMailToGroup(data: any) {

        // ================= VALIDATE =================

        console.log('Data received in service >>>>>>>>>>>>>>>>>>>>>>>>>>>', data);

        if (
            !data?.emails ||
            !Array.isArray(data.emails) ||
            !data.emails.length
        ) {
            throw new BadRequestException(
                'Emails are required',
            );
        }

        if (!data?.subject) {
            throw new BadRequestException(
                'Subject is required',
            );
        }

        if (!data?.html) {
            throw new BadRequestException(
                'HTML content is required',
            );
        }

        // ================= FILTER EMAILS =================

        const emails = data.emails.filter(
            (email: string) => email,
        );

        // ================= SEND MAIL =================

        const result =
            await sendSubscribeEmails(
                emails,
                data.subject,
                data.html,
            );

        return {
            success: true,
            totalEmails: emails.length,
            result,
        };
    }

async uploadEmailImage(data: any) {
    console.log(data,"path")
    //  return{sucess: true ,data}
    const hostUrl = process.env.BASE_URL || 'http://localhost:3008';

        return `${hostUrl}/${data.file.replace(/\\/g, '/')}`
        // {
        //   message: 'Payment not completed',
        //   statusCode: 400,
        //   imahe: `${hostUrl}/${data.file.replace(/\\/g, '/')}` ,
        // };
}


}