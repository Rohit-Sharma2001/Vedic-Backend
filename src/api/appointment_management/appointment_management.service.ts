import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    AppointmentManagement, AppointmentManagementDocument, ServicesManagement, ServicesManagementDocument, ServicePrice, ServicePriceDocument, cartManagement, CartDocument,
    Employee, EmployeeDocument, EmployeeReview, EmployeeReviewDocument, User, UserDocument, Master, MasterDocument, CenterManagement, CenterManagementDocument, WaitlistManagement, WaitlistManagementDocument
} from 'src/schema/schema';
// import * as moment from 'moment';
import * as moment from 'moment-timezone';
import { DeleteResult, ObjectId } from 'mongodb';
import Stripe from 'stripe';
import axios from 'axios';
import { sendAppointmentCancelledByAdminEmail, sendAppointmentCancelledByUserEmail, sendAppointmentCancelledNotificationAdminEmail, sendAppointmentCompletedEmail, sendAppointmentCompletedNotificationAdminEmail, sendAppointmentConfirmationEmail, sendAppointmentRescheduledEmail, sendAppointmentRescheduledNotificationAdminEmail, sendAppointmentScheduledNotificationAdminEmail, sendSlotAvailableMail } from 'src/middlewares/nodemailer/nodemailer.controller';

@Injectable()
export class AppointmentManagementService {
    private stripe: Stripe;
    private readonly EST = 'America/New_York';
    constructor(
        @InjectModel(AppointmentManagement.name) private appointmentModel: Model<AppointmentManagementDocument>,
        @InjectModel(ServicesManagement.name) private servicesManagementModel: Model<ServicesManagementDocument>,
        @InjectModel(ServicePrice.name) private servicePriceModel: Model<ServicePriceDocument>,
        @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
        @InjectModel(EmployeeReview.name) private reviewModel: Model<EmployeeReviewDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Master.name) private masterModel: Model<MasterDocument>,
        @InjectModel(CenterManagement.name) private centerModel: Model<CenterManagementDocument>,
        @InjectModel(WaitlistManagement.name) private waitListModel: Model<WaitlistManagementDocument>,
        @InjectModel(cartManagement.name) private cartManagementModel: Model<CartDocument>,
    ) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            // apiVersion: '2023-10-16', 
        });
    }

    async create(data: any) {
        console.log(data, "llllllllllll")
        const result = await this.appointmentModel.insertMany(data)
        for (const appt of data) {
            const user = await this.userModel.findById(appt.userId).lean();
            const employee = await this.employeeModel.findById(appt.employeeId).lean();
            const practitionerUser = employee?.userId ? await this.userModel.findById(employee.userId).lean() : null;
            const center = appt.centerId ? await this.centerModel.findById(appt.centerId).lean() : null;
            const venueOrLink = center ? (center.address || center.centerName || 'See appointment details') : 'See appointment details';
            const mode = 'In-Person';
            const dateStr = moment(appt.date).format('MMMM D, YYYY');
            const timeStr: string = String(appt.time || 'See appointment details');
            const footerData = await this.masterModel.findOne({ dropdown_type: "footer_data" })
            if (user?.email) {
                sendAppointmentConfirmationEmail(
                    user.email,
                    `${user.name} ${user?.lastName || ""}`,
                    practitionerUser?.name || 'Practitioner',
                    dateStr,
                    timeStr,
                    mode,
                    venueOrLink,
                );
            }
            sendAppointmentScheduledNotificationAdminEmail(
                footerData?.email || "Info@vedichealth.org",
                //   appointmentId: string,
                `${user?.name} ${user?.lastName || ""}`,
                user.email,
                practitionerUser?.name || 'Practitioner',
                dateStr,
                timeStr,
            )
        }
        return result
        // return new this.appointmentModel(data).save();
    }

    async deleteBreak(id: string): Promise<DeleteResult> {
        return await this.appointmentModel.deleteOne({
            _id: new Types.ObjectId(id),
            type: 'break',
        });
    }


    async editBreak(data: any) {
        try {
            return await this.appointmentModel.findOneAndUpdate(
                { _id: data._id, type: 'break' }, // ensure only breaks are edited
                { $set: data },
                { new: true }
            );
        } catch (error) {
            throw new Error('Failed to update break');
        }
    }
    async editBreakFromAdmin(breakId, payload: any) {
        try {

            const breakRecord = await this.appointmentModel.findById(breakId);

            if (!breakRecord) {
                return {
                    message: 'Break not found',
                    statusCode: 404
                };
            }

            if (breakRecord.type !== 'break') {
                return {
                    message: 'Invalid break record',
                    statusCode: 400
                };
            }

            const breakDate = moment.utc(
                payload.date || breakRecord.date
            );

            const breakTime = payload.time || breakRecord.time;

            const breakDuration =
                Number(payload.duration) ||
                Number(breakRecord.duration);

            const breakStart = moment.utc(
                `${breakDate.format('YYYY-MM-DD')} ${breakTime}`,
                'YYYY-MM-DD HH:mm'
            );

            const breakEnd = breakStart
                .clone()
                .add(breakDuration, 'minutes');

            const dateStart = breakDate.clone().startOf('day').toDate();
            const dateEnd = breakDate.clone().endOf('day').toDate();

            const [appointments, employeeBreaks] = await Promise.all([

                this.appointmentModel.find({
                    _id: { $ne: breakRecord._id },
                    employeeId: breakRecord.employeeId,
                    type: 'appointment',
                    status: {
                        $nin: ['cancelled', 'notPaid']
                    },
                    date: {
                        $gte: dateStart,
                        $lte: dateEnd
                    }
                }),

                this.appointmentModel.find({
                    _id: { $ne: breakRecord._id },
                    employeeId: breakRecord.employeeId,
                    type: 'break',
                    date: {
                        $gte: dateStart,
                        $lte: dateEnd
                    }
                })

            ]);

            const blockedSlots = [
                ...appointments,
                ...employeeBreaks
            ].map((item: any) => {

                const slotStart = moment.utc(
                    `${moment.utc(item.date).format('YYYY-MM-DD')} ${item.time}`,
                    'YYYY-MM-DD HH:mm'
                );

                const slotEnd = slotStart
                    .clone()
                    .add(Number(item.duration || 0), 'minutes');

                return {
                    start: slotStart.valueOf(),
                    end: slotEnd.valueOf()
                };
            });

            const overlaps = blockedSlots.some((slot: any) => {

                return (
                    breakStart.valueOf() < slot.end &&
                    breakEnd.valueOf() > slot.start
                );

            });

            if (overlaps) {
                return {
                    message: 'Break time overlaps with appointment or another break',
                    statusCode: 400
                };
            }

            await this.appointmentModel.updateOne(
                {
                    _id: breakId
                },
                {
                    $set: {
                        note:
                            payload.note ??
                            breakRecord.note,

                        date:
                            payload.date
                                ? breakDate.toDate()
                                : breakRecord.date,

                        time:
                            payload.time ??
                            breakRecord.time,

                        duration:
                            payload.duration ??
                            breakRecord.duration,

                        updated_at: new Date()
                    }
                }
            );

            const updatedBreak =
                await this.appointmentModel.findById(breakId);

            return {
                message: 'Break updated successfully',
                statusCode: 200,
                data: updatedBreak
            };

        } catch (err) {

            console.log(err);

            return {
                message: 'Something went wrong',
                statusCode: 500,
                error: err.message
            };

        }
    }

    async find(data: any) {
        console.log(data, "ccccccccccccc", ([{ $match: { ...data } }]))
        const result = await this.appointmentModel.aggregate([
            { $match: data },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'employeeId',
                    foreignField: '_id',
                    as: 'employee'
                }
            },
            {
                $lookup: {
                    from: 'servicesmanagements',
                    localField: 'serviceId',
                    foreignField: '_id',
                    as: 'service'
                }
            },

            {
                $lookup: {
                    from: 'userfamilies',
                    localField: 'familyMemberId',
                    foreignField: '_id',
                    as: 'userfamily'
                }
            },
            { $unwind: { path: '$userfamily', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'employee.userId',
                    foreignField: '_id',
                    as: 'employee.userDetails'
                }
            },
            {
                $lookup: {
                    from: 'centermanagements',
                    localField: 'centerId',
                    foreignField: '_id',
                    as: 'centerData'
                }
            },
            { $unwind: { path: '$employee.userDetails', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$centerData', preserveNullAndEmptyArrays: true } }
        ])
        console.log(result, "kjjjjj")
        const cardAccept = await this.masterModel.findOne({ dropdown_type: 'appointment_accept_card' })
        if (result.length > 0) {
            return {
                message: 'Data find successfully',
                statusCode: 200,
                data: result,
                isAcceptCard: cardAccept?.status || false
            }
        } else {
            return {
                message: 'No Data Found',
                statusCode: 204
            }
        }
    }
    private async getEmployeeReviews(employeeId: string | Types.ObjectId) {
        const id = typeof employeeId === 'string' ? new Types.ObjectId(employeeId) : employeeId;

        // 👇 Debug log here
        console.log("Looking for reviews of employee_id:", id.toString());

        const reviews = await this.reviewModel.find({
            $or: [
                { employee_id: id },                       // ObjectId case
                { employee_id: id.toString() }             // String case
            ]
        })
            .populate('user_id', 'name email')
            .exec();

        if (!reviews.length) {
            console.log("No reviews found for employee_id:", id.toString()); // 👈 log empty case too
            return { reviews: [], average: null };
        }

        const avg = (field: keyof EmployeeReview) =>
            parseFloat(
                (
                    reviews.reduce((sum, r) => sum + (r[field] as number), 0) / reviews.length
                ).toFixed(2)
            );

        return {
            reviews,
            average: {
                overall_review: avg('overall_review'),
                punctuality: avg('punctuality'),
                value: avg('value'),
                service: avg('service'),
            },
        };
    }



    async findByUser(filter) {
        console.log(filter, 'filter')
        return this.appointmentModel.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'employeeId',
                    foreignField: '_id',
                    as: 'employee',
                },
            },
            {
                $unwind: { path: '$employee', preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'employee.userId',
                    foreignField: '_id',
                    as: 'employee.userDetails',
                },
            },
            {
                $unwind: { path: '$employee.userDetails', preserveNullAndEmptyArrays: true },
            },

            {
                $lookup: {
                    from: 'servicesmanagements',
                    localField: 'serviceId',
                    foreignField: '_id',
                    as: 'service',
                },
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    familyMemberLookupId: {
                        $let: {
                            vars: {
                                fieldType: { $type: '$familyMemberId' },
                            },
                            in: {
                                $switch: {
                                    branches: [
                                        {
                                            case: { $eq: ['$$fieldType', 'objectId'] },
                                            then: '$familyMemberId',
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ['$$fieldType', 'string'] },
                                                    {
                                                        $regexMatch: {
                                                            input: '$familyMemberId',
                                                            regex: '^[0-9a-fA-F]{24}$',
                                                        },
                                                    },
                                                ],
                                            },
                                            then: { $toObjectId: '$familyMemberId' },
                                        },
                                    ],
                                    default: null,
                                },
                            },
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: 'userfamilies',
                    localField: 'familyMemberLookupId',
                    foreignField: '_id',
                    as: 'familyMember',
                },
            },
            {
                $unwind: { path: '$familyMember', preserveNullAndEmptyArrays: true },
            },
            {
                $unset: 'familyMemberLookupId',
            },
            {
                $lookup: {
                    from: 'centermanagements',
                    localField: 'centerId',
                    foreignField: '_id',
                    as: 'centerData',
                },
            },
            {
                $unwind: { path: '$centerData', preserveNullAndEmptyArrays: true },
            },
            {
                $unset: 'centerDataLookupId',
            },
        ]);
    }


    // async checkAvailableSlot(data: Partial<any>) {
    //         const { serviceId, employeeId, date, userId } = data;

    //         if (!serviceId || !employeeId || !date) {
    //             return { message: 'Missing required fields: serviceId, employeeId, date' };
    //         }

    //         const dateStart = new Date(`${date}T00:00:00`);
    //         const dateEnd = new Date(`${date}T23:59:59.999`);


    //         const appointments = await this.appointmentModel.find({
    //             // serviceId: new Types.ObjectId(serviceId),
    //             employeeId: new Types.ObjectId(employeeId),
    //             date: { $gte: dateStart, $lte: dateEnd }
    //         });

    //         console.log("Appointments Found:", appointments);

    //         // 2. Fetch service and duration
    //         const service = await this.servicePriceModel.aggregate([
    //             {
    //                 $match: { serviceId: new Types.ObjectId(serviceId), userId: new Types.ObjectId(userId) }
    //             },
    //             {
    //                 $lookup: {
    //                     from: 'servicesmanagements',
    //                     localField: 'serviceId',
    //                     foreignField: '_id',
    //                     as: 'service'
    //                 }
    //             },
    //             { $unwind: '$service' }
    //         ]);

    //         if (!service.length) {
    //             return { message: 'Service pricing info not found', service };
    //         }

    //         const employeeData = await this.employeeModel.aggregate([{ $match: { _id: new Types.ObjectId(employeeId) } }, {
    //             $lookup: {
    //                 from: 'users',
    //                 localField: 'userId',
    //                 foreignField: '_id',
    //                 as: 'userDetails'
    //             }
    //         }, { $unwind: '$userDetails' }])
    //         const getDayShort = (dateString) => {
    //             const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    //             const date = new Date(dateString);
    //             return days[date.getDay()].slice(0, 3); // take first 3 chars
    //         };
    //         if (date && !employeeData[0].working_days.includes(getDayShort(dateStart))) {
    //             return {
    //                 message: 'employee not working on this day'
    //             };
    //         }
    //         const duration = Number(service[0].duration) || 30; // in minutes
    //         const cleanup = service[0].service.cleanup_time || 0;
    //         const totalTime = (duration + cleanup) * 60 * 1000;

    //         // console.log("Service Duration (min):", duration);
    //         console.log("Cleanup Time (min):", cleanup, employeeData);
    //         // console.log('total Time', totalTime, duration + cleanup)

    //         // 3. Working hours
    //         const workingStart = new Date(`${date}T${employeeData[0].working_time_start}`);
    //         const workingEnd = new Date(`${date}T${employeeData[0].working_time_end}`);

    //         // console.log(workingStart, workingEnd, "timeeeeeeeeee")
    //         // 4. Prepare blocked slots with adjusted times
    //         const blockedSlots = appointments.map(appt => {
    //             const raw = new Date(`${moment(appt.date).format('YYYY-MM-DD')}T${appt.time}`);
    //             const hasTime = raw.getUTCHours() + raw.getUTCMinutes() > 0;
    //             const start = hasTime ? raw : new Date(raw.setUTCHours(10, 0, 0)); // default to 10:00 AM

    //             const apptDuration = (Number(appt.duration) || duration) * 60 * 1000;
    //             const end = new Date(start.getTime() + apptDuration + cleanup * 60 * 1000);

    //             return { start, end };
    //         });

    //         // console.log("Blocked Slots:", blockedSlots.map(b => ({
    //         //     start: b.start.toISOString(),
    //         //     end: b.end.toISOString()
    //         // })));

    //         // 5. Generate available slots
    //         const availableSlots: { start: Date; end: Date }[] = [];
    //         let slotStart = new Date(workingStart);

    //         while (slotStart.getTime() + totalTime <= workingEnd.getTime()) {
    //             const slotEnd = new Date(slotStart.getTime() + totalTime);

    //             const overlaps = blockedSlots.some(blocked => {
    //                 return slotStart < blocked.end && slotEnd > blocked.start;
    //             });

    //             if (!overlaps) {
    //                 availableSlots.push({ start: new Date(slotStart), end: new Date(slotEnd) });
    //             }

    //             slotStart = new Date(slotStart.getTime() + (Number(duration) + cleanup) * 60 * 1000); // move by 15 minutes
    //         }

    //         return {
    //             message: 'Available slots fetched successfully',
    //             slots: availableSlots.map(slot => ({
    //                 startTime: slot.start.toISOString(),
    //                 endTime: slot.end.toISOString()
    //             })),
    //             employeeData: employeeData[0],
    //             serviceDetails: service[0]
    //         };
    //     }



    // getDayShort = (dateString) => {
    //     const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    //     const date = new Date(dateString);
    //     return days[date.getDay()].slice(0, 3); // take first 3 chars
    // };

    getDayShort = (dateString) => {
        return moment.tz(dateString, 'YYYY-MM-DD', 'America/New_York')
            .format('ddd'); // Mon, Tue, Wed
    };


    // ye chal rha tha normal time zone me
    //     async checkAvailableSlot(data: any) {
    //         const { slotsPayload } = data;
    //         const newSlotsPayload=[]
    //         for (const appt of slotsPayload){
    //             if(appt.employeeId=='any'){
    //               const servriceEmp=   await this.servicePriceModel.aggregate([
    //                 {$match: {
    //                         serviceId: new Types.ObjectId(appt.serviceId)}},{
    //                     $lookup: {
    //                     from: 'employees',
    //                     localField: 'userId',
    //                     foreignField: 'userId',
    //                     as: 'employees'
    //                 }
    //             }, { $unwind: '$employees' }]
    //                     )
    //                     console.log(servriceEmp,"servriceEmp")
    //                     if(servriceEmp.length>0){
    //                 for(const service of servriceEmp){
    //                    newSlotsPayload.push({"serviceId":appt.serviceId,
    //                     "employeeId":service.employees._id.toString(),"userId":appt.userId,"date":appt.date}) 
    //                 }}
    //             }else{
    //                 newSlotsPayload.push(appt)
    //             }

    //         }
    //         console.log(newSlotsPayload,"newSlotsPayload")
    //         let slots = []
    //         for (const [index,appointment] of newSlotsPayload.entries()) {

    //             console.log(appointment, "appointmentK")
    //             if (!appointment.serviceId || !appointment.employeeId || !appointment.date) {
    //                 return { message: 'Missing required fields: serviceId, employeeId, date' };
    //             }

    //             const dateStart = new Date(`${appointment.date}T00:00:00`);
    //             const dateEnd = new Date(`${appointment.date}T23:59:59.999`);


    //             console.log(dateStart, "dateStart")
    //             // ✅ Fetch all booked appointments for this employee on this date
    //             const appointments = await this.appointmentModel.find({
    //                 employeeId: new Types.ObjectId(appointment.employeeId),
    //                 type: 'appointment', // ensure it's an actual booking
    //                 status: { $nin: ['cancelled', 'notPaid'] }, // only exclude cancelled
    //                 date: { $gte: dateStart, $lte: dateEnd },
    //             });
    //             const employeeBreak = await this.appointmentModel.find({
    //                 employeeId: new Types.ObjectId(appointment.employeeId),
    //                 type: 'break', // ensure it's an actual booking
    //                 date: { $gte: dateStart, $lte: dateEnd },
    //             });
    //             // ✅ Fetch all booked appointments for this USER on this date
    //             const userAppointments = await this.appointmentModel.find({
    //                 userId: new Types.ObjectId(appointment.userId),
    //                 type: 'appointment',
    //                 status: { $nin: ['cancelled', 'notPaid'] },
    //                 date: { $gte: dateStart, $lte: dateEnd },
    //             });


    //             console.log("Appointments Found:", appointments);
    //             const employeeData = await this.employeeModel.aggregate([{ $match: { _id: new Types.ObjectId(appointment.employeeId) } }, {
    //                 $lookup: {
    //                     from: 'users',
    //                     localField: 'userId',
    //                     foreignField: '_id',
    //                     as: 'userDetails'
    //                 }
    //             }, { $unwind: '$userDetails' }])
    // console.log(employeeData[0].working_days.includes(this.getDayShort(dateStart)),"!employeeData[0].working_days.includes(this.getDayShort(dateStart)")
    //             if (appointment.date && !employeeData[0].working_days.includes(this.getDayShort(dateStart))) {
    //                 // return {
    //                 //     message: 'employee not working on this day'
    //                 // };
    //                 if (index+1 == newSlotsPayload.length&&slots.length==0) {
    //                 return {
    //                     message: 'No slots available this day',
    //                     // slots
    //                 };
    //             }
    //                 continue
    //             }

    //             // 2. Fetch service and duration
    //             const service = await this.servicePriceModel.aggregate([
    //                 {
    //                     $match: {
    //                         serviceId: new Types.ObjectId(appointment.serviceId),
    //                         userId: new Types.ObjectId(employeeData[0].userId) // ✅ use practitioner’s userId from employee record
    //                     }

    //                 },
    //                 {
    //                     $lookup: {
    //                         from: 'servicesmanagements',
    //                         localField: 'serviceId',
    //                         foreignField: '_id',
    //                         as: 'service'
    //                     }
    //                 },
    //                 { $unwind: '$service' }
    //             ]);

    //             if (!service.length) {
    //                 continue
    //                 // return { message: 'Service pricing info not found', service };
    //             }


    //             const duration = Number(service[0].duration) || 60; // in minutes
    //             const cleanup = service[0].service.cleanup_time || 0;
    //             const totalTime = (duration + cleanup) * 60 * 1000;

    //             // console.log("Service Duration (min):", duration);
    //             console.log("Cleanup Time (min):", cleanup, employeeData);
    //             // console.log('total Time', totalTime, duration + cleanup)

    //             // 3. Working hours
    //             const workingStart = new Date(`${appointment.date}T${employeeData[0].working_time_start}`);
    //             const workingEnd = new Date(`${appointment.date}T${employeeData[0].working_time_end}`);

    //             console.log(employeeBreak, "timeeeeeeeeee")
    //             // 4. Prepare blocked slots with adjusted times
    //             // ✅ Combine both employee and user blocked slots
    //             const allBlockedAppointments = [...appointments, ...userAppointments, ...employeeBreak];

    //             const blockedSlots = allBlockedAppointments.map(appt => {
    //                 const start = moment(`${moment(appt.date).format('YYYY-MM-DD')}T${appt.time}`).toDate();

    //                 const apptDuration = (Number(appt.duration) || duration) * 60 * 1000;
    //                 const end = new Date(start.getTime() + apptDuration + cleanup * 60 * 1000);
    //                 return { start, end };
    //             });

    //             console.log("Blocked Slots for", appointment.userId, blockedSlots.map(b => ({
    //                 start: b.start.toISOString(),
    //                 end: b.end.toISOString()
    //             })));


    //             // 5. Generate available slots
    //             const availableSlots: { start: Date; end: Date }[] = [];
    //             let slotStart = new Date(workingStart);

    //             while (slotStart.getTime() + totalTime <= workingEnd.getTime()) {
    //                 const slotEnd = new Date(slotStart.getTime() + totalTime);

    //                 const overlaps = blockedSlots.some(blocked => {
    //                     return slotStart < blocked.end && slotEnd > blocked.start;
    //                 });

    //                 if (!overlaps) {
    //                     availableSlots.push({ start: new Date(slotStart), end: new Date(slotEnd) });
    //                 }

    //                 slotStart = new Date(slotStart.getTime() + (Number(duration) + cleanup) * 60 * 1000); // move by 15 minutes
    //             }
    //             const employeeReviews = await this.getEmployeeReviews(appointment.employeeId);

    //             slots.push({
    //                 slots: availableSlots.map(slot => ({
    //                     startTime: slot.start.toISOString(),
    //                     endTime: slot.end.toISOString()
    //                 })),
    //                 employeeData: employeeData[0],
    //                 serviceDetails: service[0],
    //                 reviews: {
    //                     message: 'Reviews fetched successfully!',
    //                     statusCode: 200,
    //                     average: employeeReviews.average,
    //                     data: employeeReviews.reviews,   // 👈 match by-employee API
    //                 }
    //             });
    //             console.log(index,slots.length ,newSlotsPayload.length,"lllllk")
    //             if (index+1 == newSlotsPayload.length) {
    //                 return {
    //                     message: 'Available slots fetched successfully',
    //                     slots
    //                 };
    //             }
    //         }
    //     }

    async checkAvailableSlot(data: any) {
        try {
            const { slotsPayload } = data;
            const newSlotsPayload = [];
            // 🔹 Step 1: Expand "any" employee
            for (const appt of slotsPayload) {
                if (appt.employeeId === 'any') {
                    const serviceEmp = await this.servicePriceModel.aggregate([
                        { $match: { serviceId: new Types.ObjectId(appt.serviceId) } },
                        {
                            $lookup: {
                                from: 'employees',
                                localField: 'userId',
                                foreignField: 'userId',
                                as: 'employees',
                            },
                        },
                        { $unwind: '$employees' },
                    ]);

                    for (const service of serviceEmp) {
                        newSlotsPayload.push({
                            serviceId: appt.serviceId,
                            employeeId: service.employees._id.toString(),
                            userId: appt.userId,
                            date: appt.date,
                        });
                    }
                } else {
                    newSlotsPayload.push(appt);
                }
            }

            console.log(slotsPayload, newSlotsPayload, "slotsPayload")
            const slots = [];

            // 🔹 Step 2: Process each request
            for (const [index, appointment] of newSlotsPayload.entries()) {
                if (!appointment.serviceId || !appointment.employeeId || !appointment.date) {
                    return { message: 'Missing required fields' };
                }

                // ✅ UTC day range (safe)
                const dateStart = moment.utc(appointment.date).startOf('day').toDate();
                const dateEnd = moment.utc(appointment.date).endOf('day').toDate();
                console.log(dateStart, dateEnd, "kjkkkj")
                // 🔹 Step 3: Fetch bookings
                const [appointments, employeeBreak, userAppointments] = await Promise.all([
                    this.appointmentModel.find({
                        employeeId: new Types.ObjectId(appointment.employeeId),
                        type: 'appointment',
                        status: { $nin: ['cancelled', 'notPaid'] },
                        date: { $gte: dateStart, $lte: dateEnd },
                    }),
                    this.appointmentModel.find({
                        employeeId: new Types.ObjectId(appointment.employeeId),
                        type: 'break',
                        date: { $gte: dateStart, $lte: dateEnd },
                    }),
                    this.appointmentModel.find({
                        userId: new Types.ObjectId(appointment.userId),
                        type: 'appointment',
                        status: { $nin: ['cancelled', 'notPaid'] },
                        date: { $gte: dateStart, $lte: dateEnd },
                    }),
                ]);

                // 🔹 Step 4: Employee
                const employeeData = await this.employeeModel.aggregate([
                    { $match: { _id: new Types.ObjectId(appointment.employeeId) } },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userId',
                            foreignField: '_id',
                            as: 'userDetails',
                        },
                    },
                    { $unwind: '$userDetails' },
                ]);
                console.log(employeeData, "employeeDataemployeeData")
                if (!employeeData.length) continue;
                // if (!employeeData.length && index + 1 !== newSlotsPayload.length) {
                //     continue
                // } else
                //     if (index + 1 === newSlotsPayload.length) {
                //         console.log("availableSlots", slots, index + 1, newSlotsPayload.length, "availableSlotsavailableSlotsavailableSlots")
                //         return {
                //             message: 'Available slots fetched successfully',
                //             slots,
                //         };
                //     }
                console.log(employeeData, "employeeDataemployeeData1")

                const employee = employeeData[0];
                console.log(appointment.date, "appointment.date")
                // ❌ Not working day
                const dayShort = this.getDayShort(appointment.date);
                if (!employee.working_days.includes(dayShort)) continue;
                // if (!employee.working_days.includes(dayShort)&&index + 1 !== newSlotsPayload.length) {
                //     continue
                // }else
                // if (index + 1 === newSlotsPayload.length) {
                //     // console.log("availableSlots",slots,index + 1 , newSlotsPayload.length,"availableSlotsavailableSlotsavailableSlots")
                //     return {
                //         message: 'Available slots fetched successfully',
                //         slots,
                //     };
                // }

                console.log(dayShort, "dayShort")
                // 🔹 Step 5: Service
                const service = await this.servicePriceModel.aggregate([
                    {
                        $match: {
                            serviceId: new Types.ObjectId(appointment.serviceId),
                            userId: new Types.ObjectId(employee.userId),
                        },
                    },
                    {
                        $lookup: {
                            from: 'servicesmanagements',
                            localField: 'serviceId',
                            foreignField: '_id',
                            as: 'service',
                        },
                    },
                    { $unwind: '$service' },
                ]);
                console.log(service, "service")
                if (!service.length) continue;
                // if (!service.length&&index + 1 !== newSlotsPayload.length) {
                //     continue
                // }else
                // if (index + 1 === newSlotsPayload.length) {
                //     console.log("availableSlots",slots,index + 1 , newSlotsPayload.length,"availableSlotsavailableSlotsavailableSlots")
                //     return {
                //         message: 'Available slots fetched successfully',
                //         slots,
                //     };
                // }

                const duration = Number(service[0].duration) || 60;
                const cleanup = service[0].service.cleanup_time || 0;
                const totalTime = (duration + cleanup) * 60 * 1000;

                // ✅ Working hours → EST → UTC timestamp
                const workingStart = moment.tz(
                    `${appointment.date} ${employee.working_time_start}`,
                    'YYYY-MM-DD HH:mm',
                    'America/New_York'
                ).valueOf();

                const workingEnd = moment.tz(
                    `${appointment.date} ${employee.working_time_end}`,
                    'YYYY-MM-DD HH:mm',
                    'America/New_York'
                ).valueOf();

                // 🔹 Step 6: Blocked Slots (🔥 FIXED)
                const allBlocked = [...appointments, ...userAppointments, ...employeeBreak];

                const blockedSlots = allBlocked.map((appt) => {
                    // ✅ FIX: force correct EST interpretation
                    const start = moment
                        .tz(
                            `${moment.utc(appt.date).format('YYYY-MM-DD')} ${appt.time}`,
                            'YYYY-MM-DD HH:mm',
                            'America/New_York'
                        )
                        .valueOf();

                    const apptDuration = (Number(appt.duration) || duration) * 60 * 1000;
                    const end = start + apptDuration + cleanup * 60 * 1000;

                    return { start, end };
                });

                // 🔹 Step 7: Generate Slots
                const availableSlots = [];
                let slotStart = workingStart;

                while (slotStart + totalTime <= workingEnd) {
                    const slotEnd = slotStart + totalTime;

                    // ✅ PERFECT OVERLAP CHECK
                    const overlaps = blockedSlots.some((blocked) => {
                        return slotStart < blocked.end && slotEnd > blocked.start;
                    });

                    console.log(availableSlots, "slotsslots")
                    if (!overlaps) {
                        availableSlots.push({
                            startTime: new Date(slotStart).toISOString(),
                            endTime: new Date(slotEnd).toISOString(),
                        });
                    }

                    slotStart += (duration + cleanup) * 60 * 1000;
                }

                // 🔹 Step 8: Reviews
                const employeeReviews = await this.getEmployeeReviews(appointment.employeeId);

                slots.push({
                    slots: availableSlots,
                    employeeData: employee,
                    serviceDetails: service[0],
                    reviews: {
                        message: 'Reviews fetched successfully!',
                        statusCode: 200,
                        average: employeeReviews.average,
                        data: employeeReviews.reviews,
                    },
                });

                if (index + 1 === newSlotsPayload.length) {
                    return {
                        message: 'Available slots fetched successfully',
                        slots,
                    };
                }
            }
        } catch (error) {
            console.error(error);
            return {
                message: 'Something went wrong',
                error: error.message,
            };
        }
    }


    // async checkAvailableSlot(data: any) {
    //     const { slotsPayload } = data;
    //     let slots = []
    //     for (const appointment of slotsPayload) {

    //         console.log(appointment, "appointmentk")
    //         if (!appointment.serviceId || !appointment.employeeId || !appointment.date) {
    //             return { message: 'Missing required fields: serviceId, employeeId, date' };
    //         }

    //         const dateStart = new Date(`${appointment.date}T00:00:00`);
    //         const dateEnd = new Date(`${appointment.date}T23:59:59.999`);


    //         console.log(dateStart, "dateStart")
    //         // ✅ Fetch all booked appointments for this employee on this date
    //         const appointments = await this.appointmentModel.find({
    //             employeeId: new Types.ObjectId(appointment.employeeId),
    //             type: 'appointment', // ensure it's an actual booking
    //             status: { $nin: ['cancelled', 'notPaid'] }, // only exclude cancelled
    //             date: { $gte: dateStart, $lte: dateEnd },
    //         });
    //         const employeeBreak = await this.appointmentModel.find({
    //             employeeId: new Types.ObjectId(appointment.employeeId),
    //             type: 'break', // ensure it's an actual booking
    //             date: { $gte: dateStart, $lte: dateEnd },
    //         });
    //         // ✅ Fetch all booked appointments for this USER on this date
    //         const userAppointments = await this.appointmentModel.find({
    //             userId: new Types.ObjectId(appointment.userId),
    //             type: 'appointment',
    //             status: { $nin: ['cancelled', 'notPaid'] },
    //             date: { $gte: dateStart, $lte: dateEnd },
    //         });


    //         console.log("Appointments Found:", appointments);
    //         const employeeData = await this.employeeModel.aggregate([{ $match: { _id: new Types.ObjectId(appointment.employeeId) } }, {
    //             $lookup: {
    //                 from: 'users',
    //                 localField: 'userId',
    //                 foreignField: '_id',
    //                 as: 'userDetails'
    //             }
    //         }, { $unwind: '$userDetails' }])

    //         if (appointment.date && !employeeData[0].working_days.includes(this.getDayShort(dateStart))) {
    //             return {
    //                 message: 'employee not working on this day'
    //             };
    //         }

    //         // 2. Fetch service and duration
    //         const service = await this.servicePriceModel.aggregate([
    //             {
    //                 $match: {
    //                     serviceId: new Types.ObjectId(appointment.serviceId),
    //                     userId: new Types.ObjectId(employeeData[0].userId) // ✅ use practitioner’s userId from employee record
    //                 }

    //             },
    //             {
    //                 $lookup: {
    //                     from: 'servicesmanagements',
    //                     localField: 'serviceId',
    //                     foreignField: '_id',
    //                     as: 'service'
    //                 }
    //             },
    //             { $unwind: '$service' }
    //         ]);

    //         if (!service.length) {
    //             return { message: 'Service pricing info not found', service };
    //         }


    //         const duration = Number(service[0].duration) || 60; // in minutes
    //         const cleanup = service[0].service.cleanup_time || 0;
    //         const totalTime = (duration + cleanup) * 60 * 1000;

    //         // console.log("Service Duration (min):", duration);
    //         console.log("Cleanup Time (min):", cleanup, employeeData);
    //         // console.log('total Time', totalTime, duration + cleanup)

    //         // 3. Working hours
    //         const workingStart = new Date(`${appointment.date}T${employeeData[0].working_time_start}`);
    //         const workingEnd = new Date(`${appointment.date}T${employeeData[0].working_time_end}`);

    //         console.log(employeeBreak, "timeeeeeeeeee")
    //         // 4. Prepare blocked slots with adjusted times
    //         // ✅ Combine both employee and user blocked slots
    //         const allBlockedAppointments = [...appointments, ...userAppointments, ...employeeBreak];

    //         const blockedSlots = allBlockedAppointments.map(appt => {
    //             const start = moment(`${moment(appt.date).format('YYYY-MM-DD')}T${appt.time}`).toDate();

    //             const apptDuration = (Number(appt.duration) || duration) * 60 * 1000;
    //             const end = new Date(start.getTime() + apptDuration + cleanup * 60 * 1000);
    //             return { start, end };
    //         });

    //         console.log("Blocked Slots for", appointment.userId, blockedSlots.map(b => ({
    //             start: b.start.toISOString(),
    //             end: b.end.toISOString()
    //         })));


    //         // 5. Generate available slots
    //         const availableSlots: { start: Date; end: Date }[] = [];
    //         let slotStart = new Date(workingStart);

    //         while (slotStart.getTime() + totalTime <= workingEnd.getTime()) {
    //             const slotEnd = new Date(slotStart.getTime() + totalTime);

    //             const overlaps = blockedSlots.some(blocked => {
    //                 return slotStart < blocked.end && slotEnd > blocked.start;
    //             });

    //             if (!overlaps) {
    //                 availableSlots.push({ start: new Date(slotStart), end: new Date(slotEnd) });
    //             }

    //             slotStart = new Date(slotStart.getTime() + (Number(duration) + cleanup) * 60 * 1000); // move by 15 minutes
    //         }
    //         const employeeReviews = await this.getEmployeeReviews(appointment.employeeId);

    //         slots.push({
    //             slots: availableSlots.map(slot => ({
    //                 startTime: slot.start.toISOString(),
    //                 endTime: slot.end.toISOString()
    //             })),
    //             employeeData: employeeData[0],
    //             serviceDetails: service[0],
    //             reviews: {
    //                 message: 'Reviews fetched successfully!',
    //                 statusCode: 200,
    //                 average: employeeReviews.average,
    //                 data: employeeReviews.reviews,   // 👈 match by-employee API
    //             }
    //         });

    //         if (slots.length == slotsPayload.length) {
    //             return {
    //                 message: 'Available slots fetched successfully',
    //                 slots
    //             };
    //         }
    //     }
    // }

    // async getUnavailableDatesInMonth(data: any) {
    //     const finalResult = []
    //     for (const [index, empData] of data.slotsPayload.entries()) {
    //         const { serviceId, employeeId, date, userId } = empData;

    //         const inputDate = new Date(date);
    //         const year = inputDate.getUTCFullYear();
    //         const month = inputDate.getUTCMonth();

    //         const firstDay = new Date(Date.UTC(year, month, 1));
    //         const lastDay = new Date(Date.UTC(year, month + 1, 0));

    //         const today = new Date();
    //         today.setUTCHours(0, 0, 0, 0); // normalize

    //         const unavailableDates: string[] = [];

    //         // const appointments = await this.appointmentModel.distinct("date", {
    //         //     employeeId: new Types.ObjectId(employeeId),
    //         //     date: { $gte: today, $lte: lastDay }
    //         // });
    //         // const formatedAppointmentdates = appointments.map(d => new Date(d).toISOString().split("T")[0]);
    //         const employeeData = await this.employeeModel.aggregate([{ $match: { _id: new Types.ObjectId(employeeId) } }])
    //         for (let day = new Date(firstDay); day <= lastDay; day.setUTCDate(day.getUTCDate() + 1)) {
    //             const dayStr = day.toISOString().split('T')[0]; // "YYYY-MM-DD"

    //             // ✅ Skip past dates
    //             if (day < today) {
    //                 continue;
    //             }
    //             console.log(dayStr, "dayStr")
    //             // if (formatedAppointmentdates.includes(dayStr)) {


    //             if (date && !employeeData[0].working_days.includes(this.getDayShort(dayStr))) {
    //                 unavailableDates.push(dayStr);
    //                 continue
    //             }

    //             const slotsResult = await this.checkAvailableSlot({
    //                 slotsPayload: [{
    //                     serviceId,
    //                     employeeId,
    //                     userId,
    //                     date: dayStr,
    //                 }]
    //             });
    //             console.log(slotsResult, dayStr, !slotsResult?.slots, "uuuuuuuuu")
    //             // If no slots, mark date as unavailable
    //             if (!slotsResult?.slots || slotsResult.slots[0].slots.length === 0) {
    //                 unavailableDates.push(dayStr);
    //             }
    //         }

    //         finalResult.push({
    //             serviceId,
    //             employeeId,
    //             userId, unavailableDates
    //         })
    //         console.log(index + 1, data.slotsPayload.length, "index + 1 == finalResult.length")
    //         if (index + 1 == data.slotsPayload.length) {
    //             return finalResult
    //         }
    //     }
    // }
    // async getUnavailableDatesInMonth(data: any) {
    //     const today = new Date();
    //     today.setUTCHours(0, 0, 0, 0); // normalize start of day

    //     const finalResult: any[] = [];

    //     // 1️⃣ Pre-fetch employee data for all employeeIds at once
    //     const employeeIds = data.slotsPayload.map((p: any) => new Types.ObjectId(p.employeeId));
    //     const employees = await this.employeeModel
    //         .find({ _id: { $in: employeeIds } }, { _id: 1, working_days: 1 })
    //         .lean();

    //     const employeeMap = new Map(employees.map(e => [e._id.toString(), e]));

    //     // 2️⃣ Process slotsPayload in parallel
    //     await Promise.all(
    //         data.slotsPayload.map(async (empData: any) => {
    //             const { serviceId, employeeId, date, userId } = empData;

    //             const inputDate = new Date(date);
    //             const year = inputDate.getUTCFullYear();
    //             const month = inputDate.getUTCMonth();

    //             const firstDay = new Date(Date.UTC(year, month, 1));
    //             const lastDay = new Date(Date.UTC(year, month + 1, 0));

    //             const unavailableDates: string[] = [];
    //             const emp = employeeMap.get(employeeId.toString());

    //             // 3️⃣ Loop through month days
    //             for (let day = new Date(firstDay); day <= lastDay; day.setUTCDate(day.getUTCDate() + 1)) {
    //                 const dayStr = day.toISOString().split("T")[0];

    //                 // Skip past dates
    //                 if (day < today) continue;

    //                 // Not employee working day → unavailable
    //                 if (date && emp && !emp.working_days.includes(this.getDayShort(dayStr))) {
    //                     unavailableDates.push(dayStr);
    //                     continue;
    //                 }
    //                 console.log(dayStr,"dayStr")
    //                 // 4️⃣ Check available slots
    //                 const slotsResult = await this.checkAvailableSlot({
    //                     slotsPayload: [
    //                         { serviceId, employeeId, userId, date: dayStr }
    //                     ]
    //                 });

    //                 if (!slotsResult?.slots || slotsResult.slots[0].slots.length === 0) {
    //                     unavailableDates.push(dayStr);
    //                 }
    //             }

    //             finalResult.push({ serviceId, employeeId, userId, unavailableDates });
    //         })
    //     );

    //     return finalResult;
    // }


    // without any employee
    //     async getUnavailableDatesInMonth(data: any) {
    //         try{
    //     const tz = "America/New_York";

    //     // ✅ Today in EST
    //     const today = moment.tz(tz).startOf("day");

    //     const finalResult: any[] = [];

    //     // 1️⃣ Pre-fetch employees
    //     const employeeIds = data.slotsPayload.map(
    //         (p: any) => new Types.ObjectId(p.employeeId)
    //     );

    //     const employees = await this.employeeModel
    //         .find({ _id: { $in: employeeIds } }, { _id: 1, working_days: 1 })
    //         .lean();

    //     const employeeMap = new Map(
    //         employees.map((e) => [e._id.toString(), e])
    //     );

    //     // 2️⃣ Process all employees
    //     await Promise.all(
    //         data.slotsPayload.map(async (empData: any) => {
    //             const { serviceId, employeeId, date, userId } = empData;

    //             // ✅ Input date in EST
    //             const inputDate = moment.tz(date, "YYYY-MM-DD", tz);

    //             const firstDay = inputDate.clone().startOf("month");
    //             const lastDay = inputDate.clone().endOf("month");

    //             const unavailableDates: string[] = [];
    //             const emp = employeeMap.get(employeeId.toString());

    //             // 3️⃣ Loop days in EST
    //             let current = firstDay.clone();

    //             while (current.isSameOrBefore(lastDay)) {

    //                 const dayStr = current.format("YYYY-MM-DD");

    //                 // ❌ Skip past dates
    //                 if (current.isBefore(today)) {
    //                     current.add(1, "day");
    //                     continue;
    //                 }

    //                 // ❌ Not working day
    //                 if (
    //                     emp &&
    //                     !emp.working_days.includes(
    //                         current.format("ddd") // Mon, Tue, etc
    //                     )
    //                 ) {
    //                     unavailableDates.push(dayStr);
    //                     current.add(1, "day");
    //                     continue;
    //                 }
    // console.log(dayStr,"dayStr")
    //                 // 4️⃣ Check slots
    //                 const slotsResult = await this.checkAvailableSlot({
    //                     slotsPayload: [
    //                         { serviceId, employeeId, userId, date: dayStr }
    //                     ]
    //                 });

    //                 if (
    //                     !slotsResult?.slots ||
    //                     slotsResult.slots[0]?.slots?.length === 0
    //                 ) {
    //                     unavailableDates.push(dayStr);
    //                 }

    //                 current.add(1, "day");
    //             }

    //             finalResult.push({
    //                 serviceId,
    //                 employeeId,
    //                 userId,
    //                 unavailableDates,
    //             });
    //         })
    //     );

    //     return finalResult;
    // }catch(err){
    //     console.log(err,"error")
    // }
    // }

    async getUnavailableDatesInMonth(data: any) {
        try {

            const tz = "America/New_York";
            const today = moment.tz(tz).startOf("day");

            const finalResult: any[] = [];

            // 🔹 Pre-fetch specific employees
            const employeeIds = data.slotsPayload
                .filter((p: any) => p.employeeId !== "any")
                .map((p: any) => new Types.ObjectId(p.employeeId));

            const employees = await this.employeeModel
                .find({ _id: { $in: employeeIds } }, { _id: 1, working_days: 1 })
                .lean();

            const employeeMap = new Map(
                employees.map((e) => [e._id.toString(), e])
            );

            await Promise.all(
                data.slotsPayload.map(async (empData: any) => {
                    const { serviceId, employeeId, date, userId } = empData;

                    const inputDate = moment.tz(date, "YYYY-MM-DD", tz);
                    const firstDay = inputDate.clone().startOf("month");
                    const lastDay = inputDate.clone().endOf("month");

                    const unavailableDates: string[] = [];

                    // 🔹 If "any", fetch all employees for service
                    let employeesToCheck: any[] = [];

                    if (employeeId === "any") {
                        employeesToCheck = await this.employeeModel.find(
                            { services: new Types.ObjectId(serviceId) },
                            { _id: 1, working_days: 1 }
                        ).lean();
                    } else {
                        const emp = employeeMap.get(employeeId.toString());
                        if (emp) employeesToCheck = [emp];
                    }

                    let current = firstDay.clone();

                    while (current.isSameOrBefore(lastDay)) {

                        const dayStr = current.format("YYYY-MM-DD");

                        // ❌ Skip past dates
                        if (current.isBefore(today)) {
                            current.add(1, "day");
                            continue;
                        }

                        // ❌ No employees found
                        if (!employeesToCheck.length) {
                            unavailableDates.push(dayStr);
                            current.add(1, "day");
                            continue;
                        }

                        let isAvailable = false;

                        // 🔥 Check all employees (or single if specific)
                        for (const emp of employeesToCheck) {

                            // ❌ Skip non-working day
                            if (
                                emp?.working_days &&
                                !emp.working_days.includes(current.format("ddd"))
                            ) {
                                continue;
                            }
                            let slotsResult
                            // if(employeeId!=="any"){
                            slotsResult = await this.checkAvailableSlot({
                                slotsPayload: [
                                    {
                                        serviceId,
                                        employeeId: emp._id,
                                        userId,
                                        date: dayStr,
                                    },
                                ],
                            });
                            // }else{
                            //        slotsResult = await this.checkAvailableSlotForAnyEmployee({
                            //         slotsPayload: [
                            //             {
                            //                 serviceId,
                            //                 employeeId: emp._id,
                            //                 userId,
                            //                 date: dayStr,
                            //             },
                            //         ],
                            //     })
                            //     }

                            console.log(dayStr, firstDay, employeesToCheck, current.format("ddd"), "dayStr")

                            if (slotsResult?.slots?.[0]?.slots?.length > 0) {
                                isAvailable = true;
                                break; // ✅ stop if one employee is available
                            }
                        }

                        // ❌ If no employee available → mark unavailable
                        if (!isAvailable) {
                            unavailableDates.push(dayStr);
                        }

                        current.add(1, "day");
                    }

                    finalResult.push({
                        serviceId,
                        employeeId,
                        userId,
                        unavailableDates,
                    });
                })
            );

            return finalResult;

        } catch (err) {
            console.log(err, "error");
            throw err;
        }
    }

    async checkAvailableSlotForAnyEmployee(data: any) {
        try {
            const { slotsPayload } = data;
            const newSlotsPayload = [];
            // 🔹 Step 1: Expand "any" employee
            for (const appt of slotsPayload) {
                if (appt.employeeId === 'any') {
                    console.log("aya,", appt.serviceId)
                    const serviceEmp = await this.servicePriceModel.aggregate([
                        { $match: { serviceId: new Types.ObjectId(appt.serviceId) } },
                        {
                            $lookup: {
                                from: 'employees',
                                localField: 'userId',
                                foreignField: 'userId',
                                as: 'employees',
                            },
                        },
                        { $unwind: '$employees' },
                    ]);
                    console.log(serviceEmp, "serviceEmp")
                    for (const service of serviceEmp) {
                        newSlotsPayload.push({
                            serviceId: appt.serviceId,
                            employeeId: service.employees._id.toString(),
                            userId: appt.userId,
                            date: appt.date,
                        });
                    }
                } else {
                    newSlotsPayload.push(appt);
                }
            }

            console.log(slotsPayload, newSlotsPayload, "slotsPayload")
            const slots = [];

            // 🔹 Step 2: Process each request
            for (const [index, appointment] of newSlotsPayload.entries()) {
                if (!appointment.serviceId || !appointment.employeeId || !appointment.date) {
                    return { message: 'Missing required fields' };
                }

                // ✅ UTC day range (safe)
                const dateStart = moment.utc(appointment.date).startOf('day').toDate();
                const dateEnd = moment.utc(appointment.date).endOf('day').toDate();
                console.log(dateStart, dateEnd, "kjkkkj")
                // 🔹 Step 3: Fetch bookings
                const [appointments, employeeBreak, userAppointments] = await Promise.all([
                    this.appointmentModel.find({
                        employeeId: new Types.ObjectId(appointment.employeeId),
                        type: 'appointment',
                        status: { $nin: ['cancelled', 'notPaid'] },
                        date: { $gte: dateStart, $lte: dateEnd },
                    }),
                    this.appointmentModel.find({
                        employeeId: new Types.ObjectId(appointment.employeeId),
                        type: 'break',
                        date: { $gte: dateStart, $lte: dateEnd },
                    }),
                    this.appointmentModel.find({
                        userId: new Types.ObjectId(appointment.userId),
                        type: 'appointment',
                        status: { $nin: ['cancelled', 'notPaid'] },
                        date: { $gte: dateStart, $lte: dateEnd },
                    }),
                ]);

                // 🔹 Step 4: Employee
                const employeeData = await this.employeeModel.aggregate([
                    { $match: { _id: new Types.ObjectId(appointment.employeeId) } },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userId',
                            foreignField: '_id',
                            as: 'userDetails',
                        },
                    },
                    { $unwind: '$userDetails' },
                ]);
                console.log(employeeData, "employeeDataemployeeData")
                if (!employeeData.length) continue;
                // if (!employeeData.length && index + 1 !== newSlotsPayload.length) {
                //     continue
                // } else
                //     if (index + 1 === newSlotsPayload.length) {
                //         console.log("availableSlots", slots, index + 1, newSlotsPayload.length, "availableSlotsavailableSlotsavailableSlots")
                //         return {
                //             message: 'Available slots fetched successfully',
                //             slots,
                //         };
                //     }
                console.log(employeeData, "employeeDataemployeeData1")

                const employee = employeeData[0];
                console.log(appointment.date, "appointment.date")
                // ❌ Not working day
                const dayShort = this.getDayShort(appointment.date);
                if (!employee.working_days.includes(dayShort)) continue;
                // if (!employee.working_days.includes(dayShort)&&index + 1 !== newSlotsPayload.length) {
                //     continue
                // }else
                // if (index + 1 === newSlotsPayload.length) {
                //     // console.log("availableSlots",slots,index + 1 , newSlotsPayload.length,"availableSlotsavailableSlotsavailableSlots")
                //     return {
                //         message: 'Available slots fetched successfully',
                //         slots,
                //     };
                // }

                console.log(dayShort, "dayShort")
                // 🔹 Step 5: Service
                const service = await this.servicePriceModel.aggregate([
                    {
                        $match: {
                            serviceId: new Types.ObjectId(appointment.serviceId),
                            userId: new Types.ObjectId(employee.userId),
                        },
                    },
                    {
                        $lookup: {
                            from: 'servicesmanagements',
                            localField: 'serviceId',
                            foreignField: '_id',
                            as: 'service',
                        },
                    },
                    { $unwind: '$service' },
                ]);
                console.log(service, "service")
                if (!service.length) continue;
                // if (!service.length&&index + 1 !== newSlotsPayload.length) {
                //     continue
                // }else
                // if (index + 1 === newSlotsPayload.length) {
                //     console.log("availableSlots",slots,index + 1 , newSlotsPayload.length,"availableSlotsavailableSlotsavailableSlots")
                //     return {
                //         message: 'Available slots fetched successfully',
                //         slots,
                //     };
                // }

                const duration = Number(service[0].duration) || 60;
                const cleanup = service[0].service.cleanup_time || 0;
                const totalTime = (duration + cleanup) * 60 * 1000;

                // ✅ Working hours → EST → UTC timestamp
                const workingStart = moment.tz(
                    `${appointment.date} ${employee.working_time_start}`,
                    'YYYY-MM-DD HH:mm',
                    'America/New_York'
                ).valueOf();

                const workingEnd = moment.tz(
                    `${appointment.date} ${employee.working_time_end}`,
                    'YYYY-MM-DD HH:mm',
                    'America/New_York'
                ).valueOf();

                // 🔹 Step 6: Blocked Slots (🔥 FIXED)
                const allBlocked = [...appointments, ...userAppointments, ...employeeBreak];

                const blockedSlots = allBlocked.map((appt) => {
                    // ✅ FIX: force correct EST interpretation
                    const start = moment
                        .tz(
                            `${moment.utc(appt.date).format('YYYY-MM-DD')} ${appt.time}`,
                            'YYYY-MM-DD HH:mm',
                            'America/New_York'
                        )
                        .valueOf();

                    const apptDuration = (Number(appt.duration) || duration) * 60 * 1000;
                    const end = start + apptDuration + cleanup * 60 * 1000;

                    return { start, end };
                });

                // 🔹 Step 7: Generate Slots
                const availableSlots = [];
                let slotStart = workingStart;

                while (slotStart + totalTime <= workingEnd) {
                    const slotEnd = slotStart + totalTime;

                    // ✅ PERFECT OVERLAP CHECK
                    const overlaps = blockedSlots.some((blocked) => {
                        return slotStart < blocked.end && slotEnd > blocked.start;
                    });

                    // console.log(availableSlots,"slotsslots")
                    if (!overlaps) {
                        availableSlots.push({
                            startTime: new Date(slotStart).toISOString(),
                            endTime: new Date(slotEnd).toISOString(),
                        });
                    }

                    slotStart += (duration + cleanup) * 60 * 1000;
                }

                // 🔹 Step 8: Reviews
                const employeeReviews = await this.getEmployeeReviews(appointment.employeeId);

                slots.push({
                    slots: availableSlots,
                    employeeData: employee,
                    serviceDetails: service[0],
                    reviews: {
                        message: 'Reviews fetched successfully!',
                        statusCode: 200,
                        average: employeeReviews.average,
                        data: employeeReviews.reviews,
                    },
                });

                if (index + 1 === newSlotsPayload.length) {
                    return {
                        message: 'Available slots fetched successfully',
                        slots,
                    };
                }
            }
        } catch (error) {
            console.error(error);
            return {
                message: 'Something went wrong',
                error: error.message,
            };
        }
    }



    async appointmentPayment(data: Partial<any>) {
        try {
            const { id, price, familyMemberId, aboutAppoiment, paymentIntent } = data;
            let currency = 'usd'
            let description = 'string'
            const cardAccept = await this.masterModel.findOne({ dropdown_type: 'appointment_accept_card' })
            let updateData = {}
            console.log(cardAccept, "cardAccept")
            let newIds
            let apptId
            if (Array.isArray(id)) {
                for (const checkId of id) {
                    const booked = await this.appointmentModel.findOne({ _id: new Types.ObjectId(checkId), status: { $ne: 'notPaid' } })
                    if (booked)
                        return {
                            message: 'This Slot Already booked.',
                            statusCode: 204,
                        }
                }
                apptId = new Types.ObjectId(id[0])
                newIds = { $in: id.map(newId => new Types.ObjectId(newId)) }
            } else {
                const booked = await this.appointmentModel.findOne({ _id: new Types.ObjectId(id), status: { $ne: 'notPaid' } })
                if (booked)
                    return {
                        message: 'This Slot Already booked.',
                        statusCode: 204,
                    }
                apptId = new Types.ObjectId(id)
                newIds = { $in: [new Types.ObjectId(id)] }
            }
            if (familyMemberId) {
                // await this.appointmentModel.findOneAndUpdate({ _id: id }, { $set: { familyMemberId: new Types.ObjectId(familyMemberId), note: aboutAppoiment } })
                updateData['familyMemberId'] = new Types.ObjectId(familyMemberId)
            }
            if (aboutAppoiment) {
                updateData['note'] = aboutAppoiment
            }
            if (paymentIntent) {
                updateData['paymentIntent'] = paymentIntent
            }
            if (data.billingAddress1) {
                updateData['billingAddress1'] = data.billingAddress1
                updateData['billingAddress2'] = data.billingAddress2
                updateData['billingCity'] = data.billingCity
                updateData['billingCountry'] = data.billingCountry
                updateData['billingState'] = data.billingState
                updateData['billingZipcode'] = data.billingZipcode
            }
            updateData['status'] = "unpaid"
            if (!cardAccept.status) {

                const appointments = await this.appointmentModel.updateMany({ _id: newIds }, { $set: updateData }, { new: true })
                console.log(appointments, "appointments")
                // if (appointments) {
                try {
                    const booked = await this.appointmentModel.findOne({ _id: apptId })
                    const user = await this.userModel.findById(booked.userId).lean();
                    const employee = await this.employeeModel.findById(booked.employeeId).lean();
                    const practitionerUser = employee?.userId ? await this.userModel.findById(employee.userId).lean() : null;
                    const center = booked.centerId ? await this.centerModel.findById(booked.centerId).lean() : null;
                    const venueOrLink = center ? (center.address || center.centerName || 'See appointment details') : 'See appointment details';
                    const mode = 'In-Person';
                    const dateStr = moment(booked.date).format('MMMM D, YYYY');
                    const timeStr: string = String(booked.time || 'See appointment details');
                    if (user?.email) {
                        await sendAppointmentConfirmationEmail(
                            user.email,
                            user.name || 'Customer',
                            practitionerUser?.name || 'Practitioner',
                            dateStr,
                            timeStr,
                            mode,
                            venueOrLink,
                        );
                    }
                } catch (emailErr) {
                    console.error('Appointment confirmation email failed:', emailErr);
                }
                // }
            }
            if (familyMemberId || aboutAppoiment || paymentIntent) {
                await this.appointmentModel.updateMany({ _id: newIds }, { $set: updateData }, { new: true })
            }

            return {
                message: 'Appointments booked',
                statusCode: 200,
                paymentUrl: `${process.env.FRONTEND_URL}/Appointment/components/AyurvedicInitialConsult/Thankyou`,
            };
        } catch (error) {
            console.log(error)
            return {
                message: 'Something went wrong',
                statusCode: 400,
            }
        }

    }

    // without time zone 
    // async unAvailableSlotsInDate(data: any) {
    //     const { slotsPayload } = data;
    //     let slots = []
    //     for (const appointment of slotsPayload) {

    //         console.log(appointment, "appointment")
    //         if (!appointment.serviceId || !appointment.employeeId || !appointment.date) {
    //             return { message: 'Missing required fields: serviceId, employeeId, date' };
    //         }

    //         const dateStart = new Date(`${appointment.date}T00:00:00`);
    //         const dateEnd = new Date(`${appointment.date}T23:59:59.999`);



    //         const appointments = await this.appointmentModel.find({
    //             // serviceId: new Types.ObjectId(serviceId),
    //             status: { $nin: ['cancelled', 'notPaid'] },
    //             employeeId: new Types.ObjectId(appointment.employeeId),
    //             date: { $gte: dateStart, $lte: dateEnd }
    //         });

    //         console.log("Appointments Found:", appointments);
    //         const employeeData = await this.employeeModel.aggregate([{ $match: { _id: new Types.ObjectId(appointment.employeeId) } }, {
    //             $lookup: {
    //                 from: 'users',
    //                 localField: 'userId',
    //                 foreignField: '_id',
    //                 as: 'userDetails'
    //             }
    //         }, { $unwind: '$userDetails' }])

    //         if (appointment.date && !employeeData[0].working_days.includes(this.getDayShort(dateStart))) {
    //             return {
    //                 message: 'employee not working on this day'
    //             };
    //         }

    //         // 2. Fetch service and duration
    //         const service = await this.servicePriceModel.aggregate([
    //             {
    //                 $match: { serviceId: new Types.ObjectId(appointment.serviceId), userId: new Types.ObjectId(appointment.userId) }
    //             },
    //             {
    //                 $lookup: {
    //                     from: 'servicesmanagements',
    //                     localField: 'serviceId',
    //                     foreignField: '_id',
    //                     as: 'service'
    //                 }
    //             },
    //             { $unwind: '$service' }
    //         ]);

    //         if (!service.length) {
    //             return { message: 'Service pricing info not found', service };
    //         }


    //         const duration = Number(service[0].duration) || 30; // in minutes
    //         const cleanup = service[0].service.cleanup_time || 0;
    //         const totalTime = (duration + cleanup) * 60 * 1000;

    //         // console.log("Service Duration (min):", duration);
    //         console.log("Cleanup Time (min):", cleanup, employeeData);
    //         // console.log('total Time', totalTime, duration + cleanup)

    //         // 3. Working hours
    //         const workingStart = new Date(`${appointment.date}T${employeeData[0].working_time_start}`);
    //         const workingEnd = new Date(`${appointment.date}T${employeeData[0].working_time_end}`);

    //         // console.log(workingStart, workingEnd, "timeeeeeeeeee")
    //         // 4. Prepare blocked slots with adjusted times
    //         const blockedSlots = appointments.map(appt => {
    //             const raw = new Date(`${moment(appt.date).format('YYYY-MM-DD')}T${appt.time}`);
    //             const hasTime = raw.getUTCHours() + raw.getUTCMinutes() > 0;
    //             const start = hasTime ? raw : new Date(raw.setUTCHours(10, 0, 0)); // default to 10:00 AM

    //             const apptDuration = (Number(appt.duration) || duration) * 60 * 1000;
    //             const end = new Date(start.getTime() + apptDuration + cleanup * 60 * 1000);

    //             return { start, end };
    //         });

    //         // console.log("Blocked Slots:", blockedSlots.map(b => ({
    //         //     start: b.start.toISOString(),
    //         //     end: b.end.toISOString()
    //         // })));

    //         // 5. Generate available slots
    //         const availableSlots: { start: Date; end: Date }[] = [];
    //         let slotStart = new Date(workingStart);

    //         while (slotStart.getTime() + totalTime <= workingEnd.getTime()) {
    //             const slotEnd = new Date(slotStart.getTime() + totalTime);

    //             const overlaps = blockedSlots.some(blocked => {
    //                 return slotStart < blocked.end && slotEnd > blocked.start;
    //             });

    //             if (overlaps) {
    //                 availableSlots.push({ start: new Date(slotStart), end: new Date(slotEnd) });
    //             }

    //             slotStart = new Date(slotStart.getTime() + (Number(duration) + cleanup) * 60 * 1000); // move by 15 minutes
    //         }
    //         // const employeeReviews = await this.getEmployeeReviews(appointment.employeeId);

    //         slots.push({
    //             slots: availableSlots.map(slot => ({
    //                 startTime: slot.start.toISOString(),
    //                 endTime: slot.end.toISOString()
    //             })),
    //             employeeData: employeeData[0],
    //             serviceDetails: service[0],

    //         });

    //         if (slots.length == slotsPayload.length) {
    //             return {
    //                 statusCode: 201,
    //                 message: 'unAvailable slots fetched successfully',
    //                 slots
    //             };
    //         }
    //     }
    // }


    async unAvailableSlotsInDate(data: any) {
        const { slotsPayload } = data;
        let slots = [];

        for (const appointment of slotsPayload) {

            if (!appointment.serviceId || !appointment.employeeId || !appointment.date) {
                return { message: 'Missing required fields: serviceId, employeeId, date' };
            }

            // ✅ EST day range
            const dateStart = moment.tz(appointment.date, 'YYYY-MM-DD', this.EST)
                .startOf('day')
                .toDate();

            const dateEnd = moment.tz(appointment.date, 'YYYY-MM-DD', this.EST)
                .endOf('day')
                .toDate();

            const appointments = await this.appointmentModel.find({
                status: { $nin: ['cancelled', 'notPaid'] },
                employeeId: new Types.ObjectId(appointment.employeeId),
                date: { $gte: dateStart, $lte: dateEnd }
            });

            const employeeData = await this.employeeModel.aggregate([
                { $match: { _id: new Types.ObjectId(appointment.employeeId) } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                { $unwind: '$userDetails' }
            ]);

            const employee = employeeData[0];

            if (appointment.date && !employee.working_days.includes(this.getDayShort(dateStart))) {
                return { message: 'employee not working on this day' };
            }

            // 🔹 Service
            const service = await this.servicePriceModel.aggregate([
                {
                    $match: {
                        serviceId: new Types.ObjectId(appointment.serviceId),
                        userId: new Types.ObjectId(appointment.userId)
                    }
                },
                {
                    $lookup: {
                        from: 'servicesmanagements',
                        localField: 'serviceId',
                        foreignField: '_id',
                        as: 'service'
                    }
                },
                { $unwind: '$service' }
            ]);

            if (!service.length) {
                return { message: 'Service pricing info not found', service };
            }

            const duration = Number(service[0].duration) || 30;
            const cleanup = service[0].service.cleanup_time || 0;
            const totalTime = (duration + cleanup) * 60 * 1000;

            // ✅ EST working hours
            const workingStart = moment.tz(
                `${appointment.date} ${employee.working_time_start}`,
                'YYYY-MM-DD HH:mm',
                this.EST
            ).toDate();

            const workingEnd = moment.tz(
                `${appointment.date} ${employee.working_time_end}`,
                'YYYY-MM-DD HH:mm',
                this.EST
            ).toDate();

            // 🔹 Blocked slots (EST)
            const blockedSlots = appointments.map(appt => {
                const start = moment.tz(
                    `${moment(appt.date).format('YYYY-MM-DD')} ${appt.time}`,
                    'YYYY-MM-DD HH:mm',
                    this.EST
                ).toDate();

                const apptDuration = (Number(appt.duration) || duration) * 60 * 1000;

                const end = new Date(
                    start.getTime() + apptDuration + cleanup * 60 * 1000
                );

                return { start, end };
            });

            // 🔹 Generate UNAVAILABLE slots
            const unavailableSlots = [];
            let slotStart = new Date(workingStart);

            while (slotStart.getTime() + totalTime <= workingEnd.getTime()) {
                const slotEnd = new Date(slotStart.getTime() + totalTime);

                const overlaps = blockedSlots.some(blocked => {
                    return slotStart < blocked.end && slotEnd > blocked.start;
                });

                if (overlaps) {
                    unavailableSlots.push({
                        start: new Date(slotStart),
                        end: new Date(slotEnd)
                    });
                }

                slotStart = new Date(
                    slotStart.getTime() + (duration + cleanup) * 60 * 1000
                );
            }

            slots.push({
                slots: unavailableSlots.map(slot => ({
                    startTime: slot.start.toISOString(),
                    endTime: slot.end.toISOString()
                })),
                employeeData: employee,
                serviceDetails: service[0],
            });

            if (slots.length === slotsPayload.length) {
                return {
                    statusCode: 201,
                    message: 'unAvailable slots fetched successfully',
                    slots
                };
            }
        }
    }

    async paymentSuccess(data: any) {
        try {
            const appointmentId = typeof data === 'string' ? data : data?.id;
            if (!appointmentId) {
                return { message: 'Invalid appointment id', statusCode: 400 };
            }
            const appointments = await this.appointmentModel.findOneAndUpdate(
                { _id: new Types.ObjectId(appointmentId) },
                { $set: { status: "paid" } },
                { new: true }
            );
            if (appointments) {
                try {
                    // delete appt from cart
                    await this.cartManagementModel.deleteMany({
                        appointmentId: new Types.ObjectId(appointmentId),
                        type: 'appointment'
                    });
                    const user = await this.userModel.findById(appointments.userId).lean();
                    const employee = await this.employeeModel.findById(appointments.employeeId).lean();
                    const practitionerUser = employee?.userId ? await this.userModel.findById(employee.userId).lean() : null;
                    const center = appointments.centerId ? await this.centerModel.findById(appointments.centerId).lean() : null;
                    const venueOrLink = center ? (center.address || center.centerName || 'See appointment details') : 'See appointment details';
                    const mode = 'In-Person';
                    const dateStr = moment(appointments.date).format('MMMM D, YYYY');
                    const timeStr: string = String(appointments.time || 'See appointment details');
                    if (user?.email) {
                        await sendAppointmentConfirmationEmail(
                            user.email,
                            user.name || 'Customer',
                            practitionerUser?.name || 'Practitioner',
                            dateStr,
                            timeStr,
                            mode,
                            venueOrLink,
                        );
                    }
                } catch (emailErr) {
                    console.error('Appointment confirmation email failed:', emailErr);
                }
            }
            return {
                message: 'Order placed',
                statusCode: 200,
                paymentUrl: `${process.env.FRONTEND_URL}/Shop/thankYou`,
            };
        } catch (err) {
            console.error('paymentSuccess error:', err);
            return {
                message: 'Something went wrong',
                statusCode: 204,
            }
        }
    }
    async adminPaymentSuccess(data: any) {
        try {
            const appointmentId = typeof data === 'string' ? data : data?.id;
            if (!appointmentId) {
                return { message: 'Invalid appointment id', statusCode: 400 };
            }
            const appointments = await this.appointmentModel.findOneAndUpdate(
                { _id: new Types.ObjectId(appointmentId) },
                { $set: { status: "paid" } },
                { new: true }
            );
            console.log(data, appointments, "appointmentsappointmentsappointments");
            if (appointments) {
                try {
                    // delete appt from cart
                    await this.cartManagementModel.deleteMany({
                        appointmentId: new Types.ObjectId(appointmentId),
                        type: 'appointment'
                    });
                    const user = await this.userModel.findById(appointments.userId).lean();
                    const employee = await this.employeeModel.findById(appointments.employeeId).lean();
                    const practitionerUser = employee?.userId ? await this.userModel.findById(employee.userId).lean() : null;
                    const center = appointments.centerId ? await this.centerModel.findById(appointments.centerId).lean() : null;
                    const venueOrLink = center ? (center.address || center.centerName || 'See appointment details') : 'See appointment details';
                    const mode = 'In-Person';
                    const dateStr = moment(appointments.date).format('MMMM D, YYYY');
                    const timeStr: string = String(appointments.time || 'See appointment details');
                    if (user?.email) {
                        await sendAppointmentConfirmationEmail(
                            user.email,
                            user.name || 'Customer',
                            practitionerUser?.name || 'Practitioner',
                            dateStr,
                            timeStr,
                            mode,
                            venueOrLink,
                        );
                    }
                } catch (emailErr) {
                    console.error('Appointment confirmation email failed:', emailErr);
                }
            }
            return {
                message: 'Order placed',
                statusCode: 200,
                paymentUrl: `${process.env.FRONTEND_URL}/Employee-Portal/components/Calender`,
            };
        } catch (err) {
            console.error('adminPaymentSuccess error:', err);
            return {
                message: 'Something went wrong',
                statusCode: 204,
            }
        }
    }

    async paymentSuccessByAdmin(data: any) {
        try {
            const appointmentId = typeof data === 'string' ? data : data?.id;
            if (!appointmentId) {
                return { message: 'Invalid appointment id', statusCode: 400 };
            }
            const appointments = await this.appointmentModel.findOneAndUpdate(
                { _id: new Types.ObjectId(appointmentId) },
                { $set: { status: "paid" } },
                { new: true }
            );
            console.log(data, appointments, "appointmentsappointmentsappointments");
            if (appointments) {
                try {
                    // delete appt from cart
                    await this.cartManagementModel.deleteMany({
                        appointmentId: new Types.ObjectId(appointmentId),
                        type: 'appointment'
                    });
                    const user = await this.userModel.findById(appointments.userId).lean();
                    const employee = await this.employeeModel.findById(appointments.employeeId).lean();
                    const practitionerUser = employee?.userId ? await this.userModel.findById(employee.userId).lean() : null;
                    const center = appointments.centerId ? await this.centerModel.findById(appointments.centerId).lean() : null;
                    const venueOrLink = center ? (center.address || center.centerName || 'See appointment details') : 'See appointment details';
                    const mode = 'In-Person';
                    const dateStr = moment(appointments.date).format('MMMM D, YYYY');
                    const timeStr: string = String(appointments.time || 'See appointment details');
                    const footerData = await this.masterModel.findOne({ dropdown_type: "footer_data" })
                    if (user?.email) {
                        await sendAppointmentConfirmationEmail(
                            user.email,
                            user.name || 'Customer',
                            practitionerUser?.name || 'Practitioner',
                            dateStr,
                            timeStr,
                            mode,
                            venueOrLink,
                        );
                    }
                    sendAppointmentScheduledNotificationAdminEmail(
                        footerData?.email || "Info@vedichealth.org",
                        `${user?.name} ${user?.lastName || ""}`,
                        user.email,
                        practitionerUser?.name || 'Practitioner',
                        dateStr,
                        timeStr,
                    )
                } catch (emailErr) {
                    console.error('Appointment confirmation email failed:', emailErr);
                }
            }
            return {
                message: 'Appoiment payment done',
                statusCode: 200,
                paymentUrl: `${process.env.FRONTEND_URL}/admin/Practitioner-Dashboard`,
            };
        } catch (err) {
            console.error('adminPaymentSuccess error:', err);
            return {
                message: 'Something went wrong',
                statusCode: 204,
            }
        }
    }

    async editAppointments(data: any) {
        try {

            const appointments = await this.appointmentModel.findOneAndUpdate({ _id: data._id }, { $set: data }, { new: true })
            // if (data.status == "notPaid") {
            const userData = await this.userModel.findById(new Types.ObjectId(appointments.userId))
            const employeeData = await this.employeeModel.aggregate([
                { $match: { _id: new Types.ObjectId(appointments.employeeId) } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                { $unwind: '$userDetails' }
            ]);
            // sendMailto user
            const user = await this.userModel.findById(appointments.userId).lean();
            const employee = await this.employeeModel.findById(appointments.employeeId).lean();
            const practitionerUser = employee?.userId ? await this.userModel.findById(employee.userId).lean() : null;
            const center = appointments.centerId ? await this.centerModel.findById(appointments.centerId).lean() : null;
            const venueOrLink = center ? (center.address || center.centerName || 'See appointment details') : 'See appointment details';
            const mode = 'In-Person';
            const dateStr = moment(appointments.date).format('MMMM D, YYYY');
            const timeStr: string = String(appointments.time || 'See appointment details');
            const footerData = await this.masterModel.findOne({ dropdown_type: "footer_data" })
            console.log(userData.email, "userData.email")
            if (data.note == "Rescheduled via admin" || data.note == "Rescheduled via MyAppointment") {
                if (user?.email) {
                    sendAppointmentRescheduledEmail(
                        user.email,
                        `${user?.name} ${user?.lastName || ""}`,
                        practitionerUser?.name || 'Practitioner',
                        dateStr,
                        timeStr,
                        mode,
                        venueOrLink,
                    );
                }
                sendAppointmentRescheduledNotificationAdminEmail(
                    footerData?.email || "Info@vedichealth.org",
                    `${user?.name} ${user?.lastName || ""}`,
                    user.email,
                    practitionerUser?.name || 'Practitioner',
                    dateStr,
                    timeStr,
                )

            } else if (data.status == "notPaid") {
                sendAppointmentCancelledByAdminEmail(userData.email, `${userData.name} ${userData.lastName || ""}`, `${employeeData[0].userDetails.name} ${employeeData[0].userDetails.lastName || ""}`, `${moment(appointments.date).format('dddd, DD MMM')}`, `${appointments.time}`)
                sendAppointmentCancelledNotificationAdminEmail(
                    footerData?.email || "Info@vedichealth.org",
                    `${user?.name} ${user?.lastName || ""}`,
                    user.email,
                    practitionerUser?.name || 'Practitioner',
                    dateStr,
                    timeStr,
                )
            } else if (data.apptStatus == "Completed") {
                sendAppointmentCompletedEmail(
                    user.email,
                    user.name || 'Customer',
                    practitionerUser?.name || 'Practitioner',
                    dateStr,
                    timeStr,
                    mode,)
                sendAppointmentCompletedNotificationAdminEmail(
                    footerData?.email || "Info@vedichealth.org",
                    `${user?.name} ${user?.lastName || ""}`,
                    user.email,
                    practitionerUser?.name || 'Practitioner',
                    dateStr,
                    timeStr,)
            }
            // }

            // return appointments
        } catch (err) {
            console.error('edit Appointment error:', err);
            return {
                message: 'Something went wrong',
                statusCode: 204,
            }
        }
    }
    async employeeNonWorkingDates(payload: any[]) {
        try {
            const finalResult: any[] = [];

            for (const empData of payload) {
                const { employeeId, startDate, endDate } = empData;

                const employeeData = await this.employeeModel.findOne({ _id: new Types.ObjectId(employeeId) });

                if (!employeeData) {
                    finalResult.push({ employeeId, unavailableDates: [], error: "Employee not found" });
                    continue;
                }

                const inputDate = new Date(startDate);
                const startYear = inputDate.getUTCFullYear();
                const startMonth = inputDate.getUTCMonth();

                const inputEndDate = new Date(endDate);
                const endYear = inputEndDate.getUTCFullYear();
                const endMonth = inputEndDate.getUTCMonth();

                const firstDay = new Date(Date.UTC(startYear, startMonth, 1));
                const lastDay = new Date(Date.UTC(endYear, endMonth + 1, 0));

                const unavailableDates: string[] = [];

                for (let day = new Date(firstDay); day <= lastDay; day.setUTCDate(day.getUTCDate() + 1)) {
                    const dayStr = day.toISOString().split("T")[0];
                    if (!employeeData.working_days.includes(this.getDayShort(dayStr))) {
                        unavailableDates.push(dayStr);
                    }
                }

                finalResult.push({ employeeId, unavailableDates, employeeData });
            }

            return finalResult;
        } catch {
            return { message: 'Something went wrong', statusCode: 204 };
        }
    }

    async addBreak(payload: any) {
        try {

            let data: any = {
                type: 'break',
                ...payload
            };

            data['employeeId'] = new Types.ObjectId(payload.employeeId);

            data['userId'] = new Types.ObjectId(payload.userId);

            data['centerId'] = new Types.ObjectId(
                Array.isArray(payload.centerId)
                    ? payload.centerId[0]
                    : payload.centerId
            );

            // ✅ UTC Day Range
            const dateStart = moment
                .utc(payload.date, 'YYYY-MM-DD')
                .startOf('day')
                .toDate();

            const dateEnd = moment
                .utc(payload.date, 'YYYY-MM-DD')
                .endOf('day')
                .toDate();

            // ✅ Break Start/End
            const breakStart = moment.utc(
                `${payload.date} ${payload.time}`,
                'YYYY-MM-DD HH:mm'
            );

            const breakEnd = breakStart
                .clone()
                .add(Number(payload.duration || 0), 'minutes');

            console.log(dateStart, "start");
            console.log(dateEnd, "end");
            console.log(breakStart.format(), "breakStart");
            console.log(breakEnd.format(), "breakEnd");

            // ✅ Fetch appointments + breaks
            const [appointments, employeeBreak] = await Promise.all([

                this.appointmentModel.find({
                    employeeId: new Types.ObjectId(payload.employeeId),
                    type: 'appointment',
                    status: { $nin: ['cancelled', 'notPaid'] },
                    date: {
                        $gte: dateStart,
                        $lte: dateEnd
                    },
                }),

                this.appointmentModel.find({
                    employeeId: new Types.ObjectId(payload.employeeId),
                    type: 'break',
                    date: {
                        $gte: dateStart,
                        $lte: dateEnd
                    },
                }),

            ]);

            console.log(
                appointments,
                employeeBreak,
                "appointments"
            );

            // ✅ Build blocked slots
            const blockedSlots = [
                ...appointments,
                ...employeeBreak
            ].map((appt: any) => {

                const apptStart = moment.utc(
                    `${moment.utc(appt.date).format('YYYY-MM-DD')} ${appt.time}`,
                    'YYYY-MM-DD HH:mm'
                );

                const apptEnd = apptStart
                    .clone()
                    .add(Number(appt.duration || 0), 'minutes');

                return {
                    start: apptStart.valueOf(),
                    end: apptEnd.valueOf(),
                };
            });

            console.log(
                blockedSlots,
                breakStart.valueOf(),
                breakEnd.valueOf(),
                "blockedSlots"
            );

            // ✅ Overlap Check
            const overlaps = blockedSlots.some((blocked: any) => {

                return (
                    breakStart.valueOf() < blocked.end &&
                    breakEnd.valueOf() > blocked.start
                );

            });

            console.log(overlaps, "overlaps");

            if (overlaps) {

                return {
                    message: "Employee already has an appointment/break during this time.",
                    statusCode: 204
                };

            }

            // ✅ Save Break
            const saveBreak = await new this.appointmentModel(data).save();

            return {
                message: "Break added successfully",
                statusCode: 200,
                data: saveBreak
            };

        } catch (err) {

            console.log(err, "err");

            return {
                message: 'Something went wrong',
                statusCode: 500,
                error: err.message
            };
        }
    }


    async addBreakFromAdmin(payload: any) {
        try {

            const employee = await this.employeeModel.findById(
                payload.employeeId
            );

            if (!employee) {
                return {
                    message: 'Employee not found',
                    statusCode: 404
                };
            }

            const workingDays = employee.working_days || []; // ['Mon','Tue','Sat']

            const startDate = moment.utc(payload.startDate, 'YYYY-MM-DD');
            const endDate = moment.utc(payload.endDate, 'YYYY-MM-DD');

            if (!startDate.isValid() || !endDate.isValid()) {
                return {
                    message: 'Invalid date range',
                    statusCode: 400
                };
            }

            const createdBreaks = [];
            const skippedDays = [];

            let currentDate = startDate.clone();

            while (currentDate.isSameOrBefore(endDate, 'day')) {

                const dayName = currentDate.format('ddd'); // Mon Tue Wed

                // Skip if practitioner is not working
                if (!workingDays.includes(dayName)) {

                    skippedDays.push({
                        date: currentDate.format('YYYY-MM-DD'),
                        reason: 'Not a working day'
                    });

                    currentDate.add(1, 'day');
                    continue;
                }

                const dateStart = currentDate.clone().startOf('day').toDate();
                const dateEnd = currentDate.clone().endOf('day').toDate();

                const breakStart = moment.utc(
                    `${currentDate.format('YYYY-MM-DD')} ${payload.time}`,
                    'YYYY-MM-DD HH:mm'
                );

                const breakEnd = breakStart
                    .clone()
                    .add(Number(payload.duration || 0), 'minutes');

                const [appointments, employeeBreaks] = await Promise.all([

                    this.appointmentModel.find({
                        employeeId: new Types.ObjectId(payload.employeeId),
                        type: 'appointment',
                        status: {
                            $nin: ['cancelled', 'notPaid']
                        },
                        date: {
                            $gte: dateStart,
                            $lte: dateEnd
                        }
                    }),

                    this.appointmentModel.find({
                        employeeId: new Types.ObjectId(payload.employeeId),
                        type: 'break',
                        date: {
                            $gte: dateStart,
                            $lte: dateEnd
                        }
                    })

                ]);

                const blockedSlots = [
                    ...appointments,
                    ...employeeBreaks
                ].map((appt: any) => {

                    const apptStart = moment.utc(
                        `${moment.utc(appt.date).format('YYYY-MM-DD')} ${appt.time}`,
                        'YYYY-MM-DD HH:mm'
                    );

                    const apptEnd = apptStart
                        .clone()
                        .add(Number(appt.duration || 0), 'minutes');

                    return {
                        start: apptStart.valueOf(),
                        end: apptEnd.valueOf()
                    };
                });

                const overlaps = blockedSlots.some((blocked: any) => {

                    return (
                        breakStart.valueOf() < blocked.end &&
                        breakEnd.valueOf() > blocked.start
                    );

                });

                if (overlaps) {

                    skippedDays.push({
                        date: currentDate.format('YYYY-MM-DD'),
                        reason: 'Appointment/Break already exists'
                    });

                    currentDate.add(1, 'day');
                    continue;
                }

                const breakData = {
                    ...payload,
                    type: 'break',
                    employeeId: new Types.ObjectId(payload.employeeId),
                    userId: new Types.ObjectId(payload.userId),
                    centerId: new Types.ObjectId(
                        Array.isArray(payload.centerId)
                            ? payload.centerId[0]
                            : payload.centerId
                    ),
                    date: currentDate.toDate()
                };

                const saveBreak = await new this.appointmentModel(
                    breakData
                ).save();

                createdBreaks.push(saveBreak);

                currentDate.add(1, 'day');
            }

            return {
                message: 'Break processing completed',
                statusCode: 200,
                totalCreated: createdBreaks.length,
                totalSkipped: skippedDays.length,
                createdBreaks,
                skippedDays
            };

        } catch (err) {

            console.log(err);

            return {
                message: 'Something went wrong',
                statusCode: 500,
                error: err.message
            };

        }
    }


    // async addBreak(payload: any) {
    //     try {

    //         let data = { type: 'break', ...payload };

    //         data['employeeId'] = new Types.ObjectId(payload.employeeId);

    //         data['userId'] = new Types.ObjectId(payload.userId);

    //         data['centerId'] = new Types.ObjectId(Array.isArray(payload.centerId) ? payload.centerId[0] : payload.centerId);

    //         // ✅ EST timezone day range
    //         const dateStart = moment
    //             .tz(payload.date, 'YYYY-MM-DD', 'America/New_York')
    //             .startOf('day')
    //             .utc()
    //             .toDate();

    //         const dateEnd = moment
    //             .tz(payload.date, 'YYYY-MM-DD', 'America/New_York')
    //             .endOf('day')
    //             .utc()
    //             .toDate();

    //         // ✅ Break start/end in EST
    //         const breakStart = moment.tz(
    //             `${payload.date} ${payload.time}`,
    //             'YYYY-MM-DD HH:mm',
    //             'America/New_York'
    //         );

    //         const breakEnd = breakStart.clone().add(payload.duration, 'minutes');

    //         console.log(dateStart, "dateStart");
    //         console.log(dateEnd, "dateEnd");
    //         console.log(breakStart.toISOString(), "breakStart");
    //         console.log(breakEnd.toISOString(), "breakEnd");

    //         // 🔹 Fetch appointments
    //         const appointments = await this.appointmentModel.find({
    //             employeeId: new Types.ObjectId(payload.employeeId),
    //             status: { $nin: ['cancelled', 'notPaid'] },
    //             date: { $gte: dateStart, $lte: dateEnd }
    //         });

    //         // 🔹 Build blocked slots
    //         const blockedSlots = appointments.map(appt => {

    //             const apptStart = moment.tz(
    //                 `${moment.utc(appt.date).format('YYYY-MM-DD')} ${appt.time}`,
    //                 'YYYY-MM-DD HH:mm',
    //                 'America/New_York'
    //             );

    //             const apptEnd = apptStart
    //                 .clone()
    //                 .add(Number(appt.duration || 0), 'minutes');

    //             return {
    //                 start: apptStart.valueOf(),
    //                 end: apptEnd.valueOf()
    //             };
    //         });

    //         // 🔹 Check overlap
    //         const overlaps = blockedSlots.some(blocked => {
    //             return (
    //                 breakStart.valueOf() < blocked.end &&
    //                 breakEnd.valueOf() > blocked.start
    //             );
    //         });

    //         if (overlaps) {
    //             return {
    //                 message: "Employee already has an appointment during this time.",
    //                 statusCode: 204
    //             };
    //         }

    //         return //await new this.appointmentModel(data).save();

    //     } catch (err) {

    //         console.log(err, "err");

    //         return {
    //             message: 'Something went wrong',
    //             statusCode: 204
    //         };
    //     }
    // }
    async sendKey(req: any) {
        try {
            const { _id } = req;
            let stripeCustomerId
            const userDetails = await this.userModel.findById({ _id: new Types.ObjectId(_id) })
            if (userDetails.stripeCustomerId) {
                stripeCustomerId = userDetails.stripeCustomerId
            } else {
                const customer = await this.stripe.customers.create({ metadata: { _id } });
                stripeCustomerId = customer.id
            }
            const setupIntent = await this.stripe.setupIntents.create({
                customer: stripeCustomerId,
                payment_method_types: ["card"],
            });

            return {
                client_secret: setupIntent.client_secret
            };
        } catch (err) {
            return { error: err.message };
        }
    }

    // appointment_management.service.ts

    async getRevenueAnalytics(employeeId: string) {
        const empObjectId = new Types.ObjectId(employeeId);

        // Fetch paid appointments only
        const appointments = await this.appointmentModel.aggregate([
            {
                $match: {
                    employeeId: empObjectId,
                    status: 'paid'
                }
            },
            {
                $lookup: {
                    from: 'servicesmanagements',
                    localField: 'serviceId',
                    foreignField: '_id',
                    as: 'service'
                }
            },
            { $unwind: '$service' },
        ]);

        // --------------------------
        // 1️⃣ Monthly Revenue
        // --------------------------
        const monthlyRevenue = Array(12).fill(0);

        appointments.forEach(app => {
            const date = new Date(app.date);
            const monthIndex = date.getMonth();
            monthlyRevenue[monthIndex] += app.price || 0;
        });

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = months.map((m, i) => ({
            month: m,
            revenue: monthlyRevenue[i],
        }));

        // --------------------------
        // 2️⃣ Top Services by Revenue
        // --------------------------
        const serviceStats = {};

        for (const app of appointments) {
            const sId = app.serviceId.toString();
            const sName = app.service?.name || 'Unknown Service';

            if (!serviceStats[sId]) {
                serviceStats[sId] = { name: sName, totalRevenue: 0, sessions: 0 };
            }

            serviceStats[sId].totalRevenue += app.price || 0;
            serviceStats[sId].sessions += 1;
        }

        // Sort top 5 services
        const topServices = Object.values(serviceStats)
            .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5)
            .map((s: any, idx: number, arr: any[]) => ({
                name: s.name,
                revenue: s.totalRevenue,
                sessions: s.sessions,
                percentage: ((s.totalRevenue / arr[0].totalRevenue) * 100).toFixed(1) + '%'
            }));

        // --------------------------
        // Return formatted data
        // --------------------------
        return {
            monthlyRevenue: monthlyData,
            topServices,
        };
    }

    // appointment_management.service.ts

    async getEmployeeSummary(employeeId: string) {
        const empObjectId = new Types.ObjectId(employeeId);

        const todayStart = moment().startOf('day').toDate();
        const todayEnd = moment().endOf('day').toDate();

        const monthStart = moment().startOf('month').toDate();
        const lastMonthStart = moment().subtract(1, 'month').startOf('month').toDate();
        const lastMonthEnd = moment().subtract(1, 'month').endOf('month').toDate();

        // 1️⃣ Fetch today's appointments
        const todayAppointments = await this.appointmentModel.countDocuments({
            employeeId: empObjectId,
            status: { $nin: ['cancelled', 'notPaid'] },
            date: { $gte: todayStart, $lte: todayEnd },
            type: "appointment",
        });

        const yesterdayAppointments = await this.appointmentModel.countDocuments({
            employeeId: empObjectId,
            type: "appointment",
            status: { $nin: ['cancelled', 'notPaid'] },
            date: {
                $gte: moment().subtract(1, 'day').startOf('day').toDate(),
                $lte: moment().subtract(1, 'day').endOf('day').toDate(),
            },
        });

        // 2️⃣ Fetch this month & last month appointments
        const monthAppointments = await this.appointmentModel.countDocuments({
            employeeId: empObjectId,
            type: "appointment",
            status: { $nin: ['cancelled', 'notPaid'] },
            date: { $gte: monthStart },
        });

        const lastMonthAppointments = await this.appointmentModel.countDocuments({
            employeeId: empObjectId,
            type: "appointment",
            status: { $nin: ['cancelled', 'notPaid'] },
            date: { $gte: lastMonthStart, $lte: lastMonthEnd },
        });

        // 3️⃣ Total earnings this month (for paid appointments)
        const earningsData = await this.appointmentModel.aggregate([
            {
                $match: {
                    employeeId: empObjectId,
                    status: 'paid',
                    date: { $gte: monthStart },
                },
            },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: '$price' },
                },
            },
        ]);

        const lastMonthEarnings = await this.appointmentModel.aggregate([
            {
                $match: {
                    employeeId: empObjectId,
                    status: 'paid',
                    date: { $gte: lastMonthStart, $lte: lastMonthEnd },
                },
            },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: '$price' },
                },
            },
        ]);

        const earnings = earningsData[0]?.totalEarnings || 0;
        const lastEarnings = lastMonthEarnings[0]?.totalEarnings || 0;

        // 4️⃣ Compute available slots today (no slotModel needed)
        const employeeData = await this.employeeModel.findById(empObjectId);
        if (!employeeData) {
            throw new Error('Employee not found');
        }

        const workingStart = new Date(`${moment().format('YYYY-MM-DD')}T${employeeData.working_time_start}`);
        const workingEnd = new Date(`${moment().format('YYYY-MM-DD')}T${employeeData.working_time_end}`);

        // Fetch today's appointments for this employee
        const appointments = await this.appointmentModel.find({
            employeeId: empObjectId,
            status: { $nin: ['cancelled', 'notPaid'] },
            type: "appointment",
            date: { $gte: todayStart, $lte: todayEnd },
        });
        const todayBreak = await this.appointmentModel.find({
            employeeId: empObjectId,
            type: "break",
            date: { $gte: todayStart, $lte: todayEnd },
        });

        // Derive total slot time (30 mins default)
        const slotDuration = 60 * 60 * 1000; // 30 min in ms

        const blockedSlots = [...appointments, ...todayBreak].map(appt => {
            const start = new Date(`${moment(appt.date).format('YYYY-MM-DD')}T${appt.time}`);
            const end = new Date(start.getTime() + (Number(appt.duration) || 30) * 60 * 1000);
            return { start, end };
        });

        let availableSlotsToday = 0;
        let slotStart = new Date(workingStart);

        while (slotStart.getTime() + slotDuration <= workingEnd.getTime()) {
            const slotEnd = new Date(slotStart.getTime() + slotDuration);
            const overlaps = blockedSlots.some(b => slotStart < b.end && slotEnd > b.start);

            if (!overlaps) availableSlotsToday++;
            slotStart = new Date(slotStart.getTime() + slotDuration);
        }

        // 5️⃣ Compute changes
        const todayChange = todayAppointments - yesterdayAppointments;
        const monthChange = monthAppointments - lastMonthAppointments;
        const earningsChange = earnings - lastEarnings;
        console.log(availableSlotsToday, "availableSlotsTodayavailableSlotsToday")
        return {
            todayAppointments,
            todayChange,
            monthAppointments,
            monthChange,
            earnings,
            earningsChange,
            availableSlotsToday,
        };
    }

    // File: appointment_management.service.ts

    async getNextAppointments(employeeId: string) {
        const empObjectId = new Types.ObjectId(employeeId);

        // 🔹 Define today's end (anything after this is considered "future")
        const todayEnd = moment().endOf('day').toDate();
        console.log(todayEnd, "todayEnd")
        // 1️⃣ Fetch the next future appointment (after today)
        const nextAppointment = await this.appointmentModel.aggregate([
            {
                $match: {
                    employeeId: empObjectId,
                    status: { $nin: ['cancelled', 'notPaid'] },
                    date: { $gt: todayEnd }, // Any appointment after today
                },
            },
            { $sort: { date: 1, time: 1 } }, // Earliest first
            { $limit: 5 }, // Limit to the next few appointments
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $lookup: {
                    from: 'servicesmanagements',
                    localField: 'serviceId',
                    foreignField: '_id',
                    as: 'service',
                },
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    time: 1,
                    duration: 1,
                    status: 1,
                    date: 1,
                    'user.name': 1,
                    'user.profile_pic': 1,
                    'service.name': 1,
                },
            },
        ]);

        if (!nextAppointment.length) {
            return {
                message: 'No upcoming appointments found',
                statusCode: 204,
                data: [],
            };
        }

        // 2️⃣ Group all appointments on the same day as the earliest one
        const firstDate = moment(nextAppointment[0].date).startOf('day').toDate();
        const nextDayEnd = moment(firstDate).endOf('day').toDate();

        const dayAppointments = await this.appointmentModel.aggregate([
            {
                $match: {
                    employeeId: empObjectId,
                    status: { $nin: ['cancelled', 'notPaid'] },
                    date: { $gte: firstDate, $lte: nextDayEnd },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $lookup: {
                    from: 'servicesmanagements',
                    localField: 'serviceId',
                    foreignField: '_id',
                    as: 'service',
                },
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
            { $sort: { time: 1 } },
            {
                $project: {
                    _id: 1,
                    time: 1,
                    duration: 1,
                    status: 1,
                    date: 1,
                    'user.name': 1,
                    'user.profile_pic': 1,
                    'service.name': 1,
                },
            },
        ]);

        // 3️⃣ Format data for frontend UI
        const formatted = dayAppointments.map((app) => {
            const startTime = app.time;
            const endTime = moment(startTime, 'HH:mm')
                .add(app.duration || 30, 'minutes')
                .format('HH:mm');

            return {
                name: app.user?.name || 'Unknown',
                profile_pic: app.user?.profile_pic || null,
                service: app.service?.name || 'N/A',
                timeRange: `${startTime} - ${endTime}`,
                status: app.status || 'Pending',
                date: moment(app.date).format('dddd, DD MMM'),
            };
        });

        return {
            message: 'Next appointments fetched successfully',
            statusCode: 200,
            data: formatted,
        };
    }


    async getServicesByEmployee(employeeId: string) {
        try {
            const empObjectId = new Types.ObjectId(employeeId);

            // 1️⃣ Find employee’s userId
            const employee = await this.employeeModel.findById(empObjectId).lean();

            if (!employee) {
                return {
                    message: 'Employee not found',
                    statusCode: 404,
                    data: [],
                };
            }

            const userObjectId = new Types.ObjectId(employee.userId);

            // 2️⃣ Now use employee.userId to match servicePrice.userId
            const services = await this.servicePriceModel.aggregate([
                { $match: { userId: userObjectId } },
                {
                    $lookup: {
                        from: 'servicesmanagements',
                        localField: 'serviceId',
                        foreignField: '_id',
                        as: 'serviceDetails',
                    },
                },
                { $unwind: { path: '$serviceDetails', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        serviceId: 1,
                        serviceName: '$serviceDetails.name',
                        description: '$serviceDetails.description',
                        duration: 1,
                        price: 1,
                        created_at: 1,
                    },
                },
                { $sort: { created_at: -1 } },
            ]);

            return {
                message: 'Services fetched successfully',
                statusCode: 200,
                data: services,
            };
        } catch (error) {
            console.error('Error fetching employee services:', error);
            return {
                message: 'Error fetching services',
                statusCode: 500,
                error: error.message,
            };
        }
    }

    // File: appointment_management.service.ts

    async cancelAppointment(appointmentId: string, userId?: string) {
        try {
            const appointment = await this.appointmentModel.findById(appointmentId);

            if (!appointment) {
                return { message: 'Appointment not found', statusCode: 404 };
            }

            // ✅ Optional: Verify the appointment belongs to this user
            if (userId && appointment.userId.toString() !== userId.toString()) {
                return {
                    message: 'You are not authorized to cancel this appointment',
                    statusCode: 403,
                };
            }

            // ✅ Calculate time difference between now and appointment start time
            const appointmentDate = new Date(appointment.date);
            const [hours, minutes] = appointment.time.split(':').map(Number);
            appointmentDate.setHours(hours, minutes, 0, 0);

            const now = new Date();
            const diffMs = appointmentDate.getTime() - now.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);

            // ✅ Allow cancellation only if more than 48 hours remain
            if (diffHours < 48) {
                return {
                    message: 'Appointments can only be cancelled at least 48 hours in advance',
                    statusCode: 400,
                };
            }

            // ✅ Update appointment status
            appointment.status = 'cancelled';
            appointment.updated_at = new Date();

            await appointment.save();
            const waitList = await this.waitListModel.aggregate([{ $match: { date: appointmentDate } },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: "servicesmanagements",
                    localField: "serviceId",
                    foreignField: "_id",
                    as: 'service'
                }
            },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'employeeId',
                    foreignField: '_id',
                    as: 'employee'
                }
            }, { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'employee.userId',
                    foreignField: '_id',
                    as: 'employee.userDetails'
                }
            },
            { $unwind: { path: '$employee.userDetails', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            ])
            // const [year, month, day] = appointmentDate.toString().split("T")[0].split("-");
            const [year, month, day] = appointmentDate.toISOString().split("T")[0].split("-").map(Number);

            const d = new Date(year, month - 1, day); // local date (no shift)

            const date = d.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
            });
            const userData = await this.userModel.findById(new Types.ObjectId(appointment.userId))
            const employeeData = await this.employeeModel.aggregate([
                { $match: { _id: new Types.ObjectId(appointment.employeeId) } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                { $unwind: '$userDetails' }
            ]);
            // sendMailto user
            console.log(userData.email, "userData.email")
            sendAppointmentCancelledByUserEmail(userData.email, `${userData.name} ${userData.lastName || ""}`, `${employeeData[0].userDetails.name} ${employeeData[0].userDetails.lastName || ""}`, `${moment(appointment.date).format('dddd, DD MMM')}`, `${appointment.time}`)

            waitList.forEach(e =>

                sendSlotAvailableMail(
                    e.user.email,
                    `${e.user.name} ${e.user.lastName || ""}`,
                    e.service.name,
                    `${e.employee.userDetails.name} ${e.employee.userDetails.lastName || ""}`,
                    date
                )
            )

            return {
                message: 'Appointment cancelled successfully',
                statusCode: 200,
                data: appointment,
            };
        } catch (error) {
            return {
                message: 'Error while cancelling appointment',
                statusCode: 500,
                error: error.message,
            };
        }
    }
    // async takePayment(appointmentId: string) {
    //     try {
    //         const appointment = await this.appointmentModel.findById(appointmentId);
    //         console.log(appointment.paymentIntent,"lllllllllll")
    //         // const confirmedPayment = await this.stripe.paymentIntents.confirm(appointment.paymentIntent.toString());
    //         // res.json({ success: true, paymentIntent: confirmedPayment });
    //         const confirmedPayment =await this.stripe.paymentIntents.create({
    //   amount: Number(appointment.price) * 100, // INR in paise
    //   currency: "inr",
    //   customer: 'customerId',
    //   payment_method: appointment.paymentIntent.toString(),
    //   off_session: true,
    //   confirm: true,
    // });

    //         console.log(confirmedPayment,"confirmedPaymentconfirmedPayment")
    //         if (confirmedPayment.status === "succeeded") {
    //             return {
    //                 message: "Payment successful",
    //                 statusCode: 200,
    //                 data: confirmedPayment,
    //             };
    //         } else {
    //             return {
    //                 message: "Payment not completed",
    //                 statusCode: 400,
    //                 paymentStatus: confirmedPayment.status,
    //                 data: confirmedPayment,
    //             };
    //         }
    //     } catch (error) {
    //         console.log(error,"error")
    //         return {
    //             message: 'Error while appointment',
    //             statusCode: 500,
    //             error: error.message,
    //         };
    //     }
    // }

    async takePayment(appointmentId: string, paymentBy: string) {
        try {
            const appointment = await this.appointmentModel.findById(appointmentId);
            const userData = await this.userModel.findById(appointment.userId)

            if (!appointment) {
                throw new Error("Appointment not found");
            } else if (appointment.status == 'paid') {
                return {
                    message: 'Payment already received',
                    statusCode: 204,
                };
            } else if (!appointment.paymentIntent) {
                const session = await this.stripe.checkout.sessions.create({
                    line_items: [
                        {
                            price_data: {
                                currency: 'usd',
                                product_data: {
                                    name: 'Appointment',
                                },
                                unit_amount: parseFloat((Number(appointment.price) * 100).toFixed(2)),
                            },
                            quantity: 1,
                        },
                    ],
                    payment_intent_data: {
                        description: 'Appointment',
                        metadata: {
                            id: `${appointment._id}`,
                            type: 'appointment'
                        }
                    },
                    mode: 'payment',
                    success_url: paymentBy ? `${process.env.BASE_URL}/appointment-management/paymentSuccessByAdmin/${appointment._id}` : `${process.env.BASE_URL}/appointment-management/adminPaymentSuccess/${appointment._id}`,  // URL after successful payment
                    // cancel_url: `https://doyoursurvey.com/cancel`,    // URL if payment is canceled
                });
                console.log(session, "session")

                return {
                    message: 'Appointment payment received',
                    statusCode: 200,
                    paymentUrl: session.url,
                };
            }

            const customerId = userData.stripeCustomerId;
            const paymentMethodId = appointment.paymentIntent; // pm_xxx

            if (!customerId || !paymentMethodId) {
                throw new Error("Missing customer or saved payment method");
            }
            console.log(customerId, paymentMethodId, "yyyyytr")
            // Create & confirm PaymentIntent
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Number(appointment.price) * 100,               // INR → paise
                currency: "usd",
                customer: customerId,
                payment_method: paymentMethodId.toString(),
                off_session: true,                 // user not present
                confirm: true,                     // charge immediately
            });
            console.log(paymentIntent.status, "kkkkkkkkkkk")
            if (paymentIntent.status == 'succeeded') {
                const appointments = await this.appointmentModel.findOneAndUpdate(
                    { _id: new Types.ObjectId(appointmentId) },
                    { $set: { status: 'paid' } },
                    { new: true });

                if (appointments) {
                    try {
                        // delete appt from cart
                    await this.cartManagementModel.deleteMany({
                        appointmentId: new Types.ObjectId(appointmentId),
                        type: 'appointment'
                    });
                        const user = await this.userModel.findById(appointments.userId).lean();
                        const employee = await this.employeeModel.findById(appointments.employeeId).lean();
                        const practitionerUser = employee?.userId ? await this.userModel.findById(employee.userId).lean() : null;
                        const center = appointments.centerId ? await this.centerModel.findById(appointments.centerId).lean() : null;
                        const venueOrLink = center ? (center.address || center.centerName || 'See appointment details') : 'See appointment details';
                        const mode = 'In-Person';
                        const dateStr = moment(appointments.date).format('MMMM D, YYYY');
                        const timeStr: string = String(appointments.time || 'See appointment details');
                        const footerData = await this.masterModel.findOne({ dropdown_type: "footer_data" })
                        if (user?.email) {
                            sendAppointmentConfirmationEmail(
                                user.email,
                                user.name || 'Customer',
                                practitionerUser?.name || 'Practitioner',
                                dateStr,
                                timeStr,
                                mode,
                                venueOrLink,
                            );
                            sendAppointmentScheduledNotificationAdminEmail(
                                footerData?.email || "Info@vedichealth.org",
                                //   appointmentId: string,
                                `${user?.name} ${user?.lastName || ""}`,
                                user.email,
                                practitionerUser?.name || 'Practitioner',
                                dateStr,
                                timeStr,
                            )
                        }
                    } catch (emailErr) {
                        console.error('Appointment confirmation email failed:', emailErr);
                    }
                }
                return {
                    message: "Payment successful",
                    statusCode: 200,
                    data: paymentIntent,
                };
            } else {
                console.log(paymentIntent.status, "kkkkkkkkkkk")
                return {
                    message: "Something went wrong in Payment",
                    statusCode: 402,
                    data: paymentIntent.status,
                };
            }
        } catch (error) {
            // Handle potential card decline for off-session
            console.log(error, "kkkkkkkkkkkm")

            return {
                message: "Payment failed",
                statusCode: 500,
                error: error.message,
            };
        }
    }

    // async employeeAvailableSlot(data: any) {
    //     const { slotsPayload } = data;
    //     let slots = []
    //     for (const appointment of slotsPayload) {

    //         console.log(appointment, "appointment")
    //         if (!appointment.employeeId || !appointment.date) {
    //             return { message: 'Missing required fields: serviceId, employeeId, date' };
    //         }

    //         const dateStart = new Date(`${appointment.date}T00:00:00`);
    //         const dateEnd = new Date(`${appointment.date}T23:59:59.999`);


    //         console.log(dateStart, "dateStart")
    //         // ✅ Fetch all booked appointments for this employee on this date

    //         // ✅ Fetch all booked appointments for this USER on this date
    //         // const userAppointments = await this.appointmentModel.find({
    //         //     userId: new Types.ObjectId(appointment.userId),
    //         //     type: 'appointment',
    //         //     status: { $nin: ['cancelled', 'notPaid'] },
    //         //     date: { $gte: dateStart, $lte: dateEnd },
    //         // });


    //         const employeeData = await this.employeeModel.aggregate([{ $match: { userId: new Types.ObjectId(appointment.employeeId) } }, {
    //             $lookup: {
    //                 from: 'users',
    //                 localField: 'userId',
    //                 foreignField: '_id',
    //                 as: 'userDetails'
    //             }
    //         }, { $unwind: '$userDetails' }])
    //         console.log(employeeData[0], "employeeData")
    //         if (appointment.date && !employeeData[0].working_days.includes(this.getDayShort(dateStart))) {
    //             return {
    //                 message: 'employee not working on this day'
    //             };
    //         }
    //         const appointments = await this.appointmentModel.find({
    //             employeeId: new Types.ObjectId(employeeData[0]?._id),
    //             type: 'appointment', // ensure it's an actual booking
    //             status: { $nin: ['cancelled', 'notPaid'] }, // only exclude cancelled
    //             date: { $gte: dateStart, $lte: dateEnd },
    //         });
    //         const breaks = await this.appointmentModel.find({
    //             employeeId: new Types.ObjectId(employeeData[0]?._id),
    //             type: 'break', // ensure it's an actual booking
    //             // status: { $nin: ['cancelled', 'notPaid'] }, // only exclude cancelled
    //             date: { $gte: dateStart, $lte: dateEnd },
    //         });
    //         console.log("Appointments Found:", appointments);

    //         // 2. Fetch service and duration
    //         const service = await this.servicePriceModel.aggregate([
    //             {
    //                 $match: {
    //                     serviceId: new Types.ObjectId(appointment.serviceId),
    //                     userId: new Types.ObjectId(employeeData[0].userId) // ✅ use practitioner’s userId from employee record
    //                 }

    //             },
    //             {
    //                 $lookup: {
    //                     from: 'servicesmanagements',
    //                     localField: 'serviceId',
    //                     foreignField: '_id',
    //                     as: 'service'
    //                 }
    //             },
    //             { $unwind: '$service' }
    //         ]);

    //         // if (!service.length) {
    //         //     return { message: 'Service pricing info not found', service };
    //         // }

    //         const duration = Number(service[0]?.duration) || 30; // in minutes
    //         const cleanup = service[0]?.service.cleanup_time || 0;
    //         const totalTime = (duration + cleanup) * 60 * 1000;

    //         // const duration = 60; // in minutes
    //         // const cleanup = 0;
    //         // const totalTime = (duration + cleanup) * 60 * 1000;

    //         // console.log("Service Duration (min):", duration);
    //         console.log("Cleanup Time (min):", cleanup, appointments, employeeData);
    //         // console.log('total Time', totalTime, duration + cleanup)

    //         // 3. Working hours
    //         const workingStart = new Date(`${appointment.date}T${employeeData[0].working_time_start}`);
    //         const workingEnd = new Date(`${appointment.date}T${employeeData[0].working_time_end}`);

    //         // console.log(workingStart, workingEnd, "timeeeeeeeeee")
    //         // 4. Prepare blocked slots with adjusted times
    //         // ✅ Combine both employee and user blocked slots
    //         const allBlockedAppointments = [...appointments, ...breaks];
    //         console.log(allBlockedAppointments, "allBlockedAppointments")
    //         console.log('breaks', breaks)
    //         // const blockedSlots = allBlockedAppointments.map(appt => {
    //         //     const start = moment(`${moment(appt.date).format('YYYY-MM-DD')}T${appt.time}`).toDate();

    //         //     const apptDuration = (Number(appt.duration) || duration) * 60 * 1000;
    //         //     const end = new Date(start.getTime() + apptDuration + cleanup * 60 * 1000);
    //         //     return { start, end };
    //         // });
    //         const blockedSlots = allBlockedAppointments.map(appt => {
    //             const start = moment(
    //                 `${moment(appt.date).format('YYYY-MM-DD')}T${appt.time}`
    //             ).toDate();

    //             let blockDurationMs: number;

    //             if (appt.type === 'break') {
    //                 // ✅ Breaks are always 60 minutes
    //                 blockDurationMs = 60 * 60 * 1000;
    //             } else {
    //                 // ✅ Normal appointment duration
    //                 const apptDurationMin = Number(appt.duration) || duration;
    //                 blockDurationMs = (apptDurationMin + cleanup) * 60 * 1000;
    //             }

    //             const end = new Date(start.getTime() + blockDurationMs);

    //             return { start, end };
    //         });

    //         console.log("Blocked Slots for", appointment.userId, blockedSlots.map(b => ({
    //             start: b.start.toISOString(),
    //             end: b.end.toISOString()
    //         })));


    //         // 5. Generate available slots
    //         const availableSlots: { start: Date; end: Date }[] = [];
    //         let slotStart = new Date(workingStart);

    //         while (slotStart.getTime() + totalTime <= workingEnd.getTime()) {
    //             const slotEnd = new Date(slotStart.getTime() + totalTime);

    //             const overlaps = blockedSlots.some(blocked => {
    //                 return slotStart < blocked.end && slotEnd > blocked.start;
    //             });

    //             if (!overlaps) {
    //                 availableSlots.push({ start: new Date(slotStart), end: new Date(slotEnd) });
    //             }

    //             slotStart = new Date(slotStart.getTime() + Number(duration) + cleanup * 60 * 1000); // move by 15 minutes
    //         }
    //         const employeeReviews = await this.getEmployeeReviews(appointment.employeeId);

    //         slots.push({
    //             slots: availableSlots.map(slot => ({
    //                 startTime: slot.start.toISOString(),
    //                 endTime: slot.end.toISOString()
    //             })),
    //             employeeData: employeeData[0],
    //             // serviceDetails: service[0],
    //             reviews: {
    //                 message: 'Reviews fetched successfully!',
    //                 statusCode: 200,
    //                 average: employeeReviews.average,
    //                 data: employeeReviews.reviews,   // 👈 match by-employee API
    //             }
    //         });
    //         console.log(slots[0], slots, "slotsg")
    //         if (slots.length == slotsPayload.length) {
    //             return {
    //                 message: 'Available slots fetched successfully',
    //                 slots
    //             };
    //         }
    //     }
    // }











    ""
    // async employeeAvailableSlot(data: any) {
    //     const { slotsPayload } = data;
    //     const slots = [];

    //     const SLOT_DURATION_MIN = 60; // 🔧 change if needed
    //     const SLOT_DURATION_MS = SLOT_DURATION_MIN * 60 * 1000;

    //     for (const appointment of slotsPayload) {

    //         if (!appointment.employeeId || !appointment.date) {
    //             return { message: 'Missing required fields' };
    //         }

    //         const dateStart = new Date(`${appointment.date}T00:00:00`);
    //         const dateEnd = new Date(`${appointment.date}T23:59:59.999`);

    //         // 🔹 Fetch employee
    //         const employeeData = await this.employeeModel.aggregate([
    //             { $match: { userId: new Types.ObjectId(appointment.employeeId) } },
    //             {
    //                 $lookup: {
    //                     from: 'users',
    //                     localField: 'userId',
    //                     foreignField: '_id',
    //                     as: 'userDetails'
    //                 }
    //             },
    //             { $unwind: '$userDetails' }
    //         ]);

    //         if (!employeeData.length) {
    //             return { message: 'Employee not found' };
    //         }

    //         const employee = employeeData[0];

    //         // 🔹 Check working day
    //         if (!employee.working_days.includes(this.getDayShort(appointment.date))) {
    //             return { message: 'Employee not working on this day' };
    //         }

    //         // 🔹 Fetch appointments & breaks
    //         const appointments = await this.appointmentModel.find({
    //             employeeId: new Types.ObjectId(employee._id),
    //             type: 'appointment',
    //             status: { $nin: ['cancelled', 'notPaid'] },
    //             date: { $gte: dateStart, $lte: dateEnd },
    //         });

    //         const breaks = await this.appointmentModel.find({
    //             employeeId: new Types.ObjectId(employee._id),
    //             type: 'break',
    //             date: { $gte: dateStart, $lte: dateEnd },
    //         });

    //         // 🔹 Working hours
    //         const workingStart = new Date(`${appointment.date}T${employee.working_time_start}`);
    //         const workingEnd = new Date(`${appointment.date}T${employee.working_time_end}`);

    //         // 🔹 Blocked slots
    //         const blockedSlots = [...appointments, ...breaks].map(appt => {
    //             const start = moment(
    //                 `${moment(appt.date).format('YYYY-MM-DD')}T${appt.time}`
    //             ).toDate();

    //             let durationMs = SLOT_DURATION_MS;

    //             if (appt.type === 'break') {
    //                 durationMs = 60 * 60 * 1000; // ✅ fixed 60 min break
    //             } else if (appt.duration) {
    //                 durationMs = Number(appt.duration) * 60 * 1000;
    //             }

    //             return {
    //                 start,
    //                 end: new Date(start.getTime() + durationMs)
    //             };
    //         });

    //         // 🔹 Generate slots
    //         const availableSlots = [];
    //         let slotStart = new Date(workingStart);

    //         while (slotStart.getTime() + SLOT_DURATION_MS <= workingEnd.getTime()) {
    //             const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION_MS);

    //             const overlaps = blockedSlots.some(blocked =>
    //                 slotStart < blocked.end && slotEnd > blocked.start
    //             );

    //             if (!overlaps) {
    //                 availableSlots.push({
    //                     start: new Date(slotStart),
    //                     end: new Date(slotEnd)
    //                 });
    //             }

    //             slotStart = new Date(slotStart.getTime() + SLOT_DURATION_MS);
    //         }

    //         slots.push({
    //             slots: availableSlots.map(slot => ({
    //                 startTime: slot.start.toISOString(),
    //                 endTime: slot.end.toISOString()
    //             })),
    //             employeeData: employee
    //         });
    //     }

    //     return {
    //         message: 'Available slots fetched successfully',
    //         slots
    //     };
    // }
    async employeeAvailableSlot(data: any) {
        try {
            const { slotsPayload } = data;
            const slots = [];

            const SLOT_DURATION_MIN = 60;
            const SLOT_DURATION_MS = SLOT_DURATION_MIN * 60 * 1000;

            for (const appointment of slotsPayload) {

                if (!appointment.employeeId || !appointment.date) {
                    return { message: 'Missing required fields' };
                }

                // ✅ EST day range
                const dateStart = moment
                    .tz(appointment.date, 'YYYY-MM-DD', 'America/New_York')
                    .startOf('day')
                    .utc()
                    .toDate();

                const dateEnd = moment
                    .tz(appointment.date, 'YYYY-MM-DD', 'America/New_York')
                    .endOf('day')
                    .utc()
                    .toDate();

                // 🔹 Fetch employee
                const employeeData = await this.employeeModel.aggregate([
                    {
                        $match: {
                            userId: new Types.ObjectId(appointment.employeeId)
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userId',
                            foreignField: '_id',
                            as: 'userDetails'
                        }
                    },
                    { $unwind: '$userDetails' }
                ]);

                if (!employeeData.length) {
                    return { message: 'Employee not found' };
                }

                const employee = employeeData[0];

                // ✅ EST working day check
                const dayShort = moment
                    .tz(appointment.date, 'America/New_York')
                    .format('ddd');

                if (!employee.working_days.includes(dayShort)) {
                    return { message: 'Employee not working on this day' };
                }

                // 🔹 Fetch appointments
                const appointments = await this.appointmentModel.find({
                    employeeId: new Types.ObjectId(employee._id),
                    type: 'appointment',
                    status: { $nin: ['cancelled', 'notPaid'] },
                    date: { $gte: dateStart, $lte: dateEnd },
                });

                // 🔹 Fetch breaks
                const breaks = await this.appointmentModel.find({
                    employeeId: new Types.ObjectId(employee._id),
                    type: 'break',
                    date: { $gte: dateStart, $lte: dateEnd },
                });

                // ✅ Working hours in EST
                const workingStart = moment.tz(
                    `${appointment.date} ${employee.working_time_start}`,
                    'YYYY-MM-DD HH:mm',
                    'America/New_York'
                ).valueOf();

                const workingEnd = moment.tz(
                    `${appointment.date} ${employee.working_time_end}`,
                    'YYYY-MM-DD HH:mm',
                    'America/New_York'
                ).valueOf();

                // 🔹 Blocked slots
                const blockedSlots = [...appointments, ...breaks].map(appt => {

                    // ✅ Appointment start in EST
                    const start = moment.tz(
                        `${moment.utc(appt.date).format('YYYY-MM-DD')} ${appt.time}`,
                        'YYYY-MM-DD HH:mm',
                        'America/New_York'
                    ).valueOf();

                    let durationMs = SLOT_DURATION_MS;

                    if (appt.type === 'break') {
                        durationMs = 60 * 60 * 1000;
                    } else if (appt.duration) {
                        durationMs = Number(appt.duration) * 60 * 1000;
                    }

                    return {
                        start,
                        end: start + durationMs
                    };
                });

                // 🔹 Generate slots
                const availableSlots = [];

                let slotStart = workingStart;

                while (slotStart + SLOT_DURATION_MS <= workingEnd) {

                    const slotEnd = slotStart + SLOT_DURATION_MS;

                    const overlaps = blockedSlots.some(blocked => {
                        return slotStart < blocked.end &&
                            slotEnd > blocked.start;
                    });

                    if (!overlaps) {
                        availableSlots.push({
                            startTime: new Date(slotStart).toISOString(),
                            endTime: new Date(slotEnd).toISOString(),
                        });
                    }

                    slotStart += SLOT_DURATION_MS;
                }

                slots.push({
                    slots: availableSlots,
                    employeeData: employee
                });
            }

            return {
                message: 'Available slots fetched successfully',
                slots
            };

        } catch (error) {
            console.error(error);

            return {
                message: 'Something went wrong',
                error: error.message,
            };
        }
    }

    async checkAvailableNonWorkingHourSlot(data: any) {
        try {
            const { slotsPayload } = data;
            const newSlotsPayload = [];

            // 🔹 Step 1: Expand "any" employee
            for (const appt of slotsPayload) {
                if (appt.employeeId === 'any') {
                    const serviceEmp = await this.servicePriceModel.aggregate([
                        { $match: { serviceId: new Types.ObjectId(appt.serviceId) } },
                        {
                            $lookup: {
                                from: 'employees',
                                localField: 'userId',
                                foreignField: 'userId',
                                as: 'employees',
                            },
                        },
                        { $unwind: '$employees' },
                    ]);

                    for (const service of serviceEmp) {
                        newSlotsPayload.push({
                            serviceId: appt.serviceId,
                            employeeId: service.employees._id.toString(),
                            userId: appt.userId,
                            date: appt.date,
                        });
                    }
                } else {
                    newSlotsPayload.push(appt);
                }
            }

            const slots = [];

            // 🔹 Step 2: Process each request
            for (const [index, appointment] of newSlotsPayload.entries()) {

                if (!appointment.serviceId || !appointment.employeeId || !appointment.date) {
                    return { message: 'Missing required fields' };
                }

                const dateStart = moment.utc(appointment.date).startOf('day').toDate();
                const dateEnd = moment.utc(appointment.date).endOf('day').toDate();

                // 🔹 Step 3: Fetch bookings
                const [appointments, employeeBreak, userAppointments] = await Promise.all([
                    this.appointmentModel.find({
                        employeeId: new Types.ObjectId(appointment.employeeId),
                        type: 'appointment',
                        status: { $nin: ['cancelled', 'notPaid'] },
                        date: { $gte: dateStart, $lte: dateEnd },
                    }),
                    this.appointmentModel.find({
                        employeeId: new Types.ObjectId(appointment.employeeId),
                        type: 'break',
                        date: { $gte: dateStart, $lte: dateEnd },
                    }),
                    this.appointmentModel.find({
                        userId: new Types.ObjectId(appointment.userId),
                        type: 'appointment',
                        status: { $nin: ['cancelled', 'notPaid'] },
                        date: { $gte: dateStart, $lte: dateEnd },
                    }),
                ]);

                // 🔹 Step 4: Employee
                const employeeData = await this.employeeModel.aggregate([
                    { $match: { _id: new Types.ObjectId(appointment.employeeId) } },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userId',
                            foreignField: '_id',
                            as: 'userDetails',
                        },
                    },
                    { $unwind: '$userDetails' },
                ]);

                if (!employeeData.length) continue;

                const employee = employeeData[0];

                const dayShort = this.getDayShort(appointment.date);

                // employee must work that day
                if (!employee.working_days.includes(dayShort)) {
                    continue;
                }

                // 🔹 Step 5: Service
                const service = await this.servicePriceModel.aggregate([
                    {
                        $match: {
                            serviceId: new Types.ObjectId(appointment.serviceId),
                            userId: new Types.ObjectId(employee.userId),
                        },
                    },
                    {
                        $lookup: {
                            from: 'servicesmanagements',
                            localField: 'serviceId',
                            foreignField: '_id',
                            as: 'service',
                        },
                    },
                    { $unwind: '$service' },
                ]);

                if (!service.length) continue;

                const duration = Number(service[0].duration) || 60;
                const cleanup = service[0].service.cleanup_time || 0;
                const totalTime = (duration + cleanup) * 60 * 1000;

                // Employee working hours
                const workingStart = moment.tz(
                    `${appointment.date} ${employee.working_time_start}`,
                    'YYYY-MM-DD HH:mm',
                    'America/New_York'
                ).valueOf();

                const workingEnd = moment.tz(
                    `${appointment.date} ${employee.working_time_end}`,
                    'YYYY-MM-DD HH:mm',
                    'America/New_York'
                ).valueOf();

                // Full day range
                const dayStartTime = moment.tz(
                    appointment.date,
                    'YYYY-MM-DD',
                    'America/New_York'
                ).startOf('day').valueOf();

                const dayEndTime = moment.tz(
                    appointment.date,
                    'YYYY-MM-DD',
                    'America/New_York'
                ).endOf('day').valueOf();

                // 🔹 Step 6: Blocked Slots
                const allBlocked = [
                    ...appointments,
                    ...userAppointments,
                    ...employeeBreak,
                ];

                const blockedSlots = allBlocked.map((appt) => {

                    const start = moment.tz(
                        `${moment.utc(appt.date).format('YYYY-MM-DD')} ${appt.time}`,
                        'YYYY-MM-DD HH:mm',
                        'America/New_York'
                    ).valueOf();

                    const apptDuration =
                        (Number(appt.duration) || duration) * 60 * 1000;

                    const end =
                        start +
                        apptDuration +
                        cleanup * 60 * 1000;

                    return { start, end };
                });

                // 🔥 NON WORKING HOURS ONLY
                const availableSlots = [];

                const slotRanges = [
                    {
                        start: dayStartTime,
                        end: workingStart,
                    },
                    {
                        start: workingEnd,
                        end: dayEndTime,
                    },
                ];

                for (const range of slotRanges) {

                    let slotStart = range.start;

                    while (slotStart + totalTime <= range.end) {

                        const slotEnd = slotStart + totalTime;

                        const overlaps = blockedSlots.some((blocked) => {
                            return (
                                slotStart < blocked.end &&
                                slotEnd > blocked.start
                            );
                        });

                        if (!overlaps) {
                            availableSlots.push({
                                startTime: new Date(slotStart).toISOString(),
                                endTime: new Date(slotEnd).toISOString(),
                            });
                        }

                        slotStart += totalTime;
                    }
                }

                // 🔹 Step 8: Reviews
                const employeeReviews = await this.getEmployeeReviews(
                    appointment.employeeId,
                );

                slots.push({
                    slots: availableSlots,
                    employeeData: employee,
                    serviceDetails: service[0],
                    reviews: {
                        message: 'Reviews fetched successfully!',
                        statusCode: 200,
                        average: employeeReviews.average,
                        data: employeeReviews.reviews,
                    },
                });

                if (index + 1 === newSlotsPayload.length) {
                    return {
                        message: 'Available non-working hour slots fetched successfully',
                        slots,
                    };
                }
            }

            return {
                message: 'Available non-working hour slots fetched successfully',
                slots,
            };

        } catch (error) {
            console.error(error);

            return {
                message: 'Something went wrong',
                error: error.message,
            };
        }
    }

    async appointmentAddToCart(appointmentId: string, userId?: string) {
        try {
            const appointment = await this.appointmentModel.findById(appointmentId);

            if (!appointment) {
                return {
                    message: 'Appointment not found',
                    statusCode: 404,
                };
            }

            const existingCart = await this.cartManagementModel.findOne({
                userId: new Types.ObjectId(userId),
                appointmentId: appointment._id,
                type: 'appointment'
            });

            if (existingCart) {
                return {
                    message: 'Appointment already added to cart',
                    statusCode: 400,
                };
            }

            const oldApptInCart = await this.cartManagementModel.deleteMany({
                userId: new Types.ObjectId(userId),
                type: 'appointment'
            });

            const cart = await this.cartManagementModel.create({
                userId: new Types.ObjectId(userId),
                appointmentId: appointment._id,
                type: 'appointment',
                quantity: 1
            });

            const cartCount = await this.cartManagementModel.countDocuments({ userId: new Types.ObjectId(userId), })
            return {
                message: 'Appointment added to cart successfully',
                statusCode: 200,
                data: cart,
                cartCount: cartCount
            };

        } catch (error) {
            return {
                message: 'Error while adding appointment to cart',
                statusCode: 500,
                error: error.message,
            };
        }
    }

}
