import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserFamily, UserFamilyDocument } from '../../schema/schema';
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

@Injectable()
export class userFamilyService {

    constructor(
        @InjectModel(UserFamily.name) private userFamilyModel: Model<UserFamilyDocument>
    ) { }

    async create(userFamilyData: Partial<UserFamily>): Promise<any> {
        try { 
            const { email, phone, relation, firstName, lastName, gender, userId } = userFamilyData;
            if (!email || !phone || !relation || !firstName || !lastName || !gender || !userId) {
                return { status: false, message: "Please send all required field" };
            }
            const newUserFamilyData = { ...userFamilyData, userId: new Types.ObjectId(userId) }
            const createdUserFamily = new this.userFamilyModel(newUserFamilyData);
            await createdUserFamily.save();

            return { status: true, message: "User Family Registered" };
        } catch (error) {
            console.error("Error creating user Family:", error);
            return { status: false, message: "An error occurred while creating the user Family.", error };
        }
    }

    async find(userData: Partial<UserFamily>): Promise<any> {
        try {
            const { userId } = userData;
            if (!userId) {
                return { status: false, message: "Please send required field" };
            }
            const newUserData = { userId: new Types.ObjectId(userId) }
            const userFamilyData = await this.userFamilyModel.find(newUserData);
           console.log(userFamilyData,"userFamilyData")
            return { status: true, message: "User Family fatched",userFamilyData };
        } catch (error) {
            console.error("Error fatch user Family:", error);
            return { status: false, message: "An error occurred while fatch the user Family.", error };
        }
    }

    async update(userFamilyData: Partial<UserFamily> & { id?: string }): Promise<any> {
        try {
            const { id } = userFamilyData;
            if (!id) {
                return { status: false, message: "Please send required field" };
            }

            if (!Types.ObjectId.isValid(id)) {
                return { status: false, message: "Invalid ObjectId format" };
            }

            const updateData: any = { ...userFamilyData };
            delete updateData.id;

            if (updateData.userId) {
                updateData.userId = new Types.ObjectId(updateData.userId as any);
            }

            const updated = await this.userFamilyModel.findByIdAndUpdate(
                new Types.ObjectId(id),
                updateData,
                { new: true }
            );

            if (!updated) {
                return { status: false, message: "User Family not found" };
            }

            return { status: true, message: "User Family updated", userFamilyData: updated };
        } catch (error) {
            console.error("Error updating user Family:", error);
            return { status: false, message: "An error occurred while updating the user Family.", error };
        }
    }

    async delete(id: string): Promise<any> {
        try {
            if (!id) {
                return { status: false, message: "Please send required field" };
            }

            if (!Types.ObjectId.isValid(id)) {
                return { status: false, message: "Invalid ObjectId format" };
            }

            const deleted = await this.userFamilyModel.findByIdAndDelete(new Types.ObjectId(id));

            if (!deleted) {
                return { status: false, message: "User Family not found" };
            }

            return { status: true, message: "User Family deleted" };
        } catch (error) {
            console.error("Error deleting user Family:", error);
            return { status: false, message: "An error occurred while deleting the user Family.", error };
        }
    }
}
