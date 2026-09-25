import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  User,
  UserDocument,
  orderManagement,
  OrderDocument,
  AppointmentManagement,
  AppointmentManagementDocument,
  MembershipBuyHistroy,
  MembershipBuyHistroyDocument,
  Donation,
  DonationDocument,
  cartManagement,
  CartDocument,
  yogaClassBooking,
  yogaClassBookingDocument,
  EventBooking,
  EventBookingDocument,
  WaitlistManagement,
  WaitlistManagementDocument,
  Employee,
  EmployeeDocument,
  MembershipManagement,
  MembershipManagementDocument,
  EventManagement,
  EventManagementDocument,
  YogaClassManagement,
  YogaClassManagementDocument,
} from '../../schema/schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(orderManagement.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(AppointmentManagement.name)
    private readonly appointmentModel: Model<AppointmentManagementDocument>,
    @InjectModel(MembershipBuyHistroy.name)
    private readonly membershipBuyModel: Model<MembershipBuyHistroyDocument>,
    @InjectModel(Donation.name) private readonly donationModel: Model<DonationDocument>,
    @InjectModel(cartManagement.name) private readonly cartModel: Model<CartDocument>,
    @InjectModel(Employee.name) private readonly employeeModel: Model<EmployeeDocument>,
    @InjectModel(yogaClassBooking.name)
    private readonly yogaBookingModel: Model<yogaClassBookingDocument>,
    @InjectModel(EventBooking.name)
    private readonly eventBookingModel: Model<EventBookingDocument>,
    @InjectModel(WaitlistManagement.name)
    private readonly waitlistModel: Model<WaitlistManagementDocument>,
    @InjectModel(MembershipManagement.name)
    private readonly membershipManagementModel: Model<MembershipManagementDocument>,
    @InjectModel(EventManagement.name)
    private readonly eventManagementModel: Model<EventManagementDocument>,
    @InjectModel(YogaClassManagement.name)
    private readonly yogaClassManagementModel: Model<YogaClassManagementDocument>,
  ) {}


  // API=======================================================================================

  async getDashboardSummary(filter: any = {}): Promise<any> {
    console.log("Call Dashbord Api")
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    const dateRangeFilter = this.buildDateRangeFilter(filter.startDate, filter.endDate);

    const userFilter: any = {};
    const appointmentFilter: any = {};
    const orderFilter: any = {};
    const membershipFilter: any = {};
    const donationFilter: any = {};
    const cartFilter: any = {};
    const yogaBookingFilter: any = {};
    const eventBookingFilter: any = {};
    const waitlistFilter: any = {};
    const employeeFilter: any = { is_deleted: 0 };

    if (dateRangeFilter) {
      orderFilter.created_at = dateRangeFilter;
      membershipFilter.date = dateRangeFilter;
      donationFilter.created_date = dateRangeFilter;
      cartFilter.created_at = dateRangeFilter;
      yogaBookingFilter.created_at = dateRangeFilter;
      eventBookingFilter.created_at = dateRangeFilter;
      waitlistFilter.date = dateRangeFilter;
    }

    if (filter.status) {
      orderFilter.status = filter.status;
      appointmentFilter.status = filter.status;
    }

    const pickupOrderFilter: any = { ...orderFilter, pickupDate: { $ne: null } };
    const shippingOrderFilter: any = { ...orderFilter, pickupDate: null, shippingId: { $exists: true, $ne: null } };

    const todayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][todayStart.getDay()];

    const [
      userCount,
      activeUserCount,
      inactiveUserCount,
      practitionerCount,
      todayAvailablePractitionerCount,
      activeAdmin,
      activeMembers,
      appointmentCount,
      todayAppointmentsCount,
      upcomingAppointmentsCount,
      appointmentRescheduleCount,
      cancelledAppointmentsCount,
      orderCount,
      totalOrderAmountResult,
      cancelledOrdersCount,
      notYetShippedOrdersCount,
      totalMemberships,          //nnn
      activeMembershipCount,          //nnn
      inactiveMembershipsPurchased,          //nnn
      totalMembershipsPurchasedCount,
      cancelledMembershipsCount,
      donationCount,
      donationTotalResult,
      cartItemCount,
      yogaBookingCount,
      waitlistCount,
      todayAppointmentWaitlist,
      todayYogaBookingsCountResult,
      upcomingYogaBookingsCountResult,
      todayEventBookingsCountResult,
      totalEventBookingsResult,
      totalYogaBookingCountResult,
      totalEvents,
      upcomingEvents,
      completedEvents,
      totalYogaClasses,
      upcomingYogaClasses,
      completedYogaClasses,
      membershipPlanCounts,
      pickupOrderPlacedCount,
      pickupOrderPackedCount,
      pickupOrderReadyCount,
      pickupOrderPickedUpCount,
      shipOrderPlacedCount,
      shipOrderDispatchedCount,
      shipOrderDeliveredCount,
    ] = await Promise.all([
      this.userModel.countDocuments(userFilter),
      this.userModel.countDocuments({ ...userFilter, is_deleted : 0 }),
      this.userModel.countDocuments({ ...userFilter, is_deleted: { $ne: 0 } }),
      this.employeeModel.countDocuments(employeeFilter),
      this.employeeModel.countDocuments({ ...employeeFilter, status: 1, working_days: todayShort }),
      this.userModel.countDocuments({ ...userFilter, is_deleted : 0, role : "admin" }),
      this.userModel.countDocuments({ ...userFilter, is_deleted : 0, role : "member" }),
      this.appointmentModel.countDocuments(appointmentFilter),
      this.appointmentModel.countDocuments({
        ...appointmentFilter,
        date: { $gte: todayStart, $lte: todayEnd },
      }),
      this.appointmentModel.countDocuments({
        ...appointmentFilter,
        date: { $gte: now },
      }),
      this.appointmentModel.countDocuments({
        note: { $in: ['Rescheduled via admin', 'Rescheduled via MyAppointment'] },
      }),
      this.appointmentModel.countDocuments({ ...appointmentFilter, status: 'cancelled' }),
      this.orderModel.countDocuments(orderFilter),
      this.orderModel.aggregate([
        { $match: orderFilter },
        { $group: { _id: null, totalAmount: { $sum: '$grandTotal' } } },
      ]),
      this.orderModel.countDocuments({ ...orderFilter, status: 'orderCanceled' }),
      this.orderModel.countDocuments({
        ...shippingOrderFilter,
        $or: [
          { 'deliveryDates.shippedDate': { $exists: false } },
          { 'deliveryDates.shippedDate': null },
        ],
      }),
      this.membershipBuyModel.countDocuments(membershipFilter),
      this.membershipBuyModel.countDocuments({ ...membershipFilter, is_expired:false, status: 'paid', }),
      this.membershipBuyModel.countDocuments({ ...membershipFilter, is_expired:true, status: 'paid', }),
      this.membershipBuyModel.countDocuments({
        ...membershipFilter,
        status: 'paid',                                     // jijj
      }),
      this.membershipBuyModel.countDocuments({
        ...membershipFilter, stripeSubscriptionStatus :"inactive", is_expired:true, 
        // cancelAtPeriodEnd: true,
      }),
      this.donationModel.countDocuments(donationFilter),
      this.donationModel.aggregate([
        { $match: donationFilter },
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
      ]),
      this.cartModel.countDocuments(cartFilter),
      this.yogaBookingModel.countDocuments(yogaBookingFilter),
      this.waitlistModel.countDocuments(waitlistFilter),              // waitlistFilter
      this.waitlistModel.countDocuments({
        ...waitlistFilter,
        date: { $gte: todayStart, $lte: todayEnd },
      }),
      this.yogaBookingModel.aggregate([
        { $match: yogaBookingFilter },
        {
          $lookup: {
            from: 'yogaclassmanagements',
            localField: 'classId',
            foreignField: '_id',
            as: 'class',
          },
        },
        { $unwind: { path: '$class', preserveNullAndEmptyArrays: true } },
        { $match: { 'class.date': { $gte: todayStart, $lte: todayEnd } } },
        { $count: 'count' },
      ]),
      this.yogaBookingModel.aggregate([
        { $match: yogaBookingFilter },
        {
          $lookup: {
            from: 'yogaclassmanagements',
            localField: 'classId',
            foreignField: '_id',
            as: 'class',
          },
        },
        { $unwind: { path: '$class', preserveNullAndEmptyArrays: true } },
        { $match: { 'class.date': { $gt: todayEnd } } },
        { $count: 'count' },
      ]),
      this.eventBookingModel.aggregate([
        { $match: eventBookingFilter },
        {
          $lookup: {
            from: 'eventmanagements',
            localField: 'eventId',
            foreignField: '_id',
            as: 'event',
          },
        },
        { $unwind: { path: '$event', preserveNullAndEmptyArrays: true } },
        { $match: { 'event.date': { $gte: todayStart, $lte: todayEnd } } },
        { $count: 'count' },
      ]),
      this.eventBookingModel.aggregate([
        { $match: eventBookingFilter },
        { $count: 'count' },
      ]),
      this.yogaBookingModel.aggregate([
        { $match: yogaBookingFilter },
        { $count: 'count' },
      ]),
      this.eventManagementModel.countDocuments({ status: 1, is_deleted: 0 }),
      this.eventManagementModel.countDocuments({ status: 1, is_deleted: 0, date: { $gte: todayStart } }),
      this.eventManagementModel.countDocuments({ status: 1, is_deleted: 0, date: { $lt: todayStart } }),
      this.yogaClassManagementModel.countDocuments({ status: 1, is_deleted: 0 }),
      this.yogaClassManagementModel.countDocuments({ status: 1, is_deleted: 0, date: { $gte: todayStart } }),
      this.yogaClassManagementModel.countDocuments({ status: 1, is_deleted: 0, date: { $lt: todayStart } }),
      this.membershipBuyModel.aggregate([
        { $match: membershipFilter },
        { $group: { _id: '$membership_id', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'membershipmanagements',
            localField: '_id',
            foreignField: '_id',
            as: 'membership',
          },
        },
        { $unwind: { path: '$membership', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            membershipId: '$_id',
            planName: '$membership.plan_name',
            count: 1,
          },
        },
      ]),
      this.orderModel.countDocuments({ ...pickupOrderFilter, orderStatus: 'ordered' }),
      this.orderModel.countDocuments({ ...pickupOrderFilter, orderStatus: 'orderPacked' }),
      this.orderModel.countDocuments({ ...pickupOrderFilter, orderStatus: 'orderReady' }),
      this.orderModel.countDocuments({ ...pickupOrderFilter, orderStatus: 'orderPickedUp' }),
      this.orderModel.countDocuments({ ...shippingOrderFilter, orderStatus: 'ordered' }),
      this.orderModel.countDocuments({
        ...shippingOrderFilter,
        'deliveryDates.shippedDate': { $exists: true, $ne: null },
        $or: [
          { 'deliveryDates.deliveredDate': { $exists: false } },
          { 'deliveryDates.deliveredDate': null },
        ],
      }),
      this.orderModel.countDocuments({
        ...shippingOrderFilter,
        $or: [
          { 'deliveryDates.deliveredDate': { $exists: true, $ne: null } },
          { currentStatus: { $regex: /delivered/i } },
        ],
      }),
    ]);

    const totalOrderAmount = totalOrderAmountResult.length ? totalOrderAmountResult[0].totalAmount : 0;
    const totalDonationAmount = donationTotalResult.length ? donationTotalResult[0].totalAmount : 0;
    const totalEventBookings = totalEventBookingsResult.length ? totalEventBookingsResult[0].count : 0;
    const totalYogaBookings = totalYogaBookingCountResult.length ? totalYogaBookingCountResult[0].count : 0;
    const todayYogaBookings = todayYogaBookingsCountResult.length ? todayYogaBookingsCountResult[0].count : 0;
    const upcomingYogaBookings = upcomingYogaBookingsCountResult.length ? upcomingYogaBookingsCountResult[0].count : 0;
    const todayEventBookings = todayEventBookingsCountResult.length ? todayEventBookingsCountResult[0].count : 0;

    return {
      totalUsers: userCount,
      activeUsers: activeUserCount,
      inactiveUsers: inactiveUserCount,
      totalPractitioners: practitionerCount,
      todayAvailablePractitioners: todayAvailablePractitionerCount,
      activeAdmin: activeAdmin,
      activeMembers: activeMembers,
      totalAppointments: appointmentCount,
      todayAppointments: todayAppointmentsCount,
      upcomingAppointments: upcomingAppointmentsCount,
      rescheduledAppointments: appointmentRescheduleCount,
      cancelledAppointments: cancelledAppointmentsCount,
      appointmentWaitlist: waitlistCount,
      todayAppointmentWaitlist: todayAppointmentWaitlist,
      totalOrders: orderCount,
      totalOrderRevenue: totalOrderAmount,
      notYetShippedOrders: notYetShippedOrdersCount,
      deliveredOrders: shipOrderDeliveredCount,
      cancelledOrders: cancelledOrdersCount,
      totalMemberships: totalMemberships,
      totalMembershipsPurchased: totalMembershipsPurchasedCount,
      activeMembershipsPurchased: activeMembershipCount,
      inactiveMembershipsPurchased: inactiveMembershipsPurchased,
      cancelledMemberships: cancelledMembershipsCount,
      membershipPlanCounts,
      totalDonations: donationCount,
      totalDonationAmount,
      cartItems: cartItemCount,
      yogaBookings: yogaBookingCount,
      todayYogaBookings,
      upcomingYogaBookings,
      totalEventBookings,
      todayEventBookings,
      totalYogaBookings,
      eventCounts: {
        totalEvents,
        upcomingEvents,
        completedEvents,
      },
      yogaClassCounts: {
        totalClasses: totalYogaClasses,
        upcomingClasses: upcomingYogaClasses,
        completedClasses: completedYogaClasses,
      },
      orderStages: {
        pickup: {
          placed: pickupOrderPlacedCount,
          packed: pickupOrderPackedCount,
          ready: pickupOrderReadyCount,
          pickedUp: pickupOrderPickedUpCount,
        },
        shipping: {
          placed: shipOrderPlacedCount,
          dispatched: shipOrderDispatchedCount,
          delivered: shipOrderDeliveredCount,
        },
      },
    };
  }

  private buildDateRangeFilter(startDate?: string, endDate?: string): any {
    const range: any = {};
    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) {
        range.$gte = start;
      }
    }
    if (endDate) {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) {
        range.$lte = end;
      }
    }
    return Object.keys(range).length ? range : null;
  }
}
