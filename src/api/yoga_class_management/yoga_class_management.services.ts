import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { YogaClassManagement, YogaClassManagementDocument, Coupon, CouponDocument, yogaClassBooking, yogaClassBookingDocument, User, UserDocument } from 'src/schema/schema';
import Stripe from 'stripe';
import { sendEventTicketEmail, sendEventRegistrationConfirmedEmail,
   sendNewEventRegistrationAdminEmail,
   sendClassBookingTicketEmail,
   sendNewClassBookingAdminEmail
  
  } from 'src/middlewares/nodemailer/nodemailer.controller';
import * as XLSX from "xlsx";
import { Response } from "express";
@Injectable()
export class YogaClassManagementService {
  private stripe: Stripe;

  constructor(
    @InjectModel(YogaClassManagement.name) private classModal: Model<YogaClassManagementDocument>,
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(yogaClassBooking.name) private yogaClassBookingModel: Model<yogaClassBookingDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      // apiVersion: '2023-10-16',
    });
  }

  async create(
    classData: Partial<YogaClassManagement>,
  ): Promise<any> {

    if (
      classData.is_exclusive &&
      !classData.membership_pricing
    ) {
      classData.membership_pricing = [];
    }

    const createdClass =
      new this.classModal(classData);

    await createdClass.save();

    // recurring classes
    if (
      classData.is_recurring &&
      classData.recurrence_type &&
      classData.recurrence_end_date
    ) {

      const recurrenceDates =
        this.generateRecurrenceDates(
          classData.date,
          classData.recurrence_type,
          classData.recurrence_end_date,
        );

      const futureDates =
        recurrenceDates.slice(1);

      const clonedClasses =
        futureDates.map((date) => ({
          ...createdClass.toObject(),
          _id: undefined,
          date,
          date_created: new Date(),
          modified: new Date(),
          classname: `${createdClass.classname} (${new Date(
            date,
          ).toLocaleDateString()})`,
        }));

      if (clonedClasses.length > 0) {
        await this.classModal.insertMany(
          clonedClasses,
        );

        console.log(
          `✅ Created ${clonedClasses.length} recurring yoga classes for: ${createdClass.classname}`,
        );
      }
    }

    return createdClass;
  }

  async findAll(
    page: number,
    pageSize: number,
    classname?: string,
    all?: boolean,
  ) {

    const skip = (page - 1) * pageSize;

    const filter: any = {};

    if (classname && classname.trim() !== '') {

      filter.$or = [
        {
          classname: {
            $regex: classname,
            $options: 'i',
          },
        },
        {
          speakername: {
            $regex: classname,
            $options: 'i',
          },
        },
        {
          host_name: {
            $regex: classname,
            $options: 'i',
          },
        },
        {
          city: {
            $regex: classname,
            $options: 'i',
          },
        },
      ];
    }

    const classes = all
      ? await this.classModal.find(filter).exec()
      : await this.classModal
        .find(filter)
        .skip(skip)
        .limit(pageSize)
        .exec();

    const totalCount =
      await this.classModal
        .countDocuments(filter)
        .exec();

    const hostUrl =
      process.env.BASE_URL ||
      'http://localhost:3008';

    const classesWithUrls =
      await Promise.all(
        classes.map(async (item) => {

          const availability =
            await this.getEventAvailability(
              item._id.toString(),
            );

          const isExpired =
            this.isEventExpired(item as any);

          return {
            ...item.toObject(),

            fileUrl: item.file
              ? `${hostUrl}/${item.file.replace(
                /\\/g,
                '/',
              )}`
              : null,

            coverUrl: item.coverImage
              ? `${hostUrl}/${item.coverImage.replace(
                /\\/g,
                '/',
              )}`
              : null,

            iconUrl: item.icon_file
              ? `${hostUrl}/${item.icon_file.replace(
                /\\/g,
                '/',
              )}`
              : null,

            maxTickets:
              availability.maxTickets,

            currentBookings:
              availability.currentBookings,

            availableTickets:
              availability.availableTickets,

            isFullyBooked:
              availability.isFullyBooked,

            is_expired:
              isExpired ? 1 : 0,
          };
        }),
      );

    return {
      message:
        'Yoga classes fetched successfully!',

      statusCode: 200,

      classes: classesWithUrls,

      totalCount,

      totalPages: Math.ceil(
        totalCount / pageSize,
      ),

      page,

      pageSize,
    };
  }

  async findOneById(id: string) {

    const objectId =
      new Types.ObjectId(id);

    const yogaClass =
      await this.classModal
        .findById(objectId)
        .exec();

    if (!yogaClass) {
      throw new Error(
        `Yoga class not found with id: ${id}`,
      );
    }

    const hostUrl =
      process.env.BASE_URL ||
      'http://localhost:3008';

    const availability =
      await this.getEventAvailability(id);

    const isExpired =
      this.isEventExpired(
        yogaClass as any,
      );

    return {
      message:
        'Yoga class fetched successfully!',

      statusCode: 200,

      class: {
        ...yogaClass.toObject(),

        fileUrl: yogaClass.file
          ? `${hostUrl}/${yogaClass.file.replace(
            /\\/g,
            '/',
          )}`
          : null,

        coverUrl: yogaClass.coverImage
          ? `${hostUrl}/${yogaClass.coverImage.replace(
            /\\/g,
            '/',
          )}`
          : null,

        iconUrl: yogaClass.icon_file
          ? `${hostUrl}/${yogaClass.icon_file.replace(
            /\\/g,
            '/',
          )}`
          : null,

        maxTickets:
          availability.maxTickets,

        currentBookings:
          availability.currentBookings,

        availableTickets:
          availability.availableTickets,

        isFullyBooked:
          availability.isFullyBooked,

        is_expired:
          isExpired ? 1 : 0,
      },
    };
  }

  async update(
    id: string,
    classData: Partial<YogaClassManagement>,
  ) {

    const objectId =
      new Types.ObjectId(id);

    await this.classModal.updateOne(
      { _id: objectId },
      {
        $set: {
          ...classData,
          modified: new Date(),
        },
      },
    );

    return {
      message:
        'Yoga class updated successfully',

      statusCode: 200,
    };
  }

  async delete(id: string) {

    const objectId =
      new Types.ObjectId(id);

    await this.classModal.deleteOne({
      _id: objectId,
    });

    return {
      message:
        'Yoga class deleted successfully',

      statusCode: 200,
    };
  }


  // 🧩 Helper function
  private generateRecurrenceDates(startDate: Date, type: string, endDate: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      dates.push(new Date(current));
      if (type === 'weekly') current.setDate(current.getDate() + 7);
      else if (type === 'monthly') current.setMonth(current.getMonth() + 1);
      else if (type === 'yearly') current.setFullYear(current.getFullYear() + 1);
      else break;
    }

    return dates;
  }

  private isEventExpired(event: YogaClassManagement): boolean {
    if (!event?.date) return true;
    const end = new Date(event.date);
    // Expect "HH:mm" 24h; if missing -> end of day
    if (event.time && /^\d{1,2}:\d{2}$/.test(event.time.trim())) {
      const [hh, mm] = event.time.trim().split(':').map((v) => parseInt(v, 10));
      end.setHours(Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0);
    } else {
      end.setHours(23, 59, 59, 999);
    }
    return end.getTime() < Date.now();
  }


  async toggleStatus(id: string) {
    const yogaClass = await this.classModal.findById(id);
    if (!yogaClass) throw new Error(`Class not found with id: ${id}`);

    // Flip 1 ↔ 0
    yogaClass.status = yogaClass.status === 1 ? 0 : 1;
    yogaClass.modified = new Date();
    await yogaClass.save();

    return {
      message: 'yogaClass status updated successfully',
      statusCode: 200,
      yogaClassId: id,
      newStatus: yogaClass.status,
    };
  }


  async createEventPaymentLink(eventPaymentData: any): Promise<any> {
    try {
      const { type, classId, quantity, userId, coupanId, amount, baseUrl } = eventPaymentData;

      // Validate required fields
      if (!type || !classId || !userId) {
        throw new Error('Missing required fields: type, classId, userId, amount');
      }

      // Get event details
      const yogaClass = await this.classModal.findById(new Types.ObjectId(classId));
      if (!yogaClass) {
        throw new Error('Yoga Classvent not found');
      }

      // Validate ticket availability before creating payment
      const requestedQuantity = Number(quantity || 1);
      const ticketValidation = await this.validateTicketAvailability(classId, requestedQuantity);

      if (!ticketValidation.available) {
        return {
          message: 'Tickets not available',
          statusCode: 400,
          error: `Only ${ticketValidation.availableTickets} tickets available. Requested: ${requestedQuantity}`,
          ticketInfo: {
            currentBookings: ticketValidation.currentBookings,
            maxTickets: ticketValidation.maxTickets,
            availableTickets: ticketValidation.availableTickets,
            requestedQuantity: requestedQuantity
          }
        };
      }


      let discount = 0;
      let couponData = null;

      // Apply coupon if provided
      const totalPrice = Number(amount); // trust frontend's total


      // Create event booking record
      const yogaClassBookingData = {
        type,
        classId: new Types.ObjectId(classId),
        quantity: Number(quantity || 1),
        userId: new Types.ObjectId(userId),
        coupanId: coupanId || null,
        amount,
        discountAmount: discount,
        grandTotal: totalPrice,
        status: 'pending',
        paymentSessionId: null,
        created_at: new Date(),
      };

      // Save booking to database first
      const classBooking = new this.yogaClassBookingModel(yogaClassBookingData);
      const savedBooking = await classBooking.save();

      // Calculate per unit price for Stripe (must be integer in the smallest currency unit)
      const perUnitPriceFloat = (totalPrice / (quantity || 1)) * 100;
      const perUnitPrice = Math.round(perUnitPriceFloat);

      // Build safe absolute URLs for Stripe redirects
      const ensureScheme = (url: string): string => {
        const trimmed = (url || '').trim();
        if (!trimmed) return '';
        return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      };
      const backendBaseRaw = (baseUrl || process.env.BASE_URL || '').replace(/\/$/, '');
      const frontendBaseRaw = (process.env.FRONTEND_URL || baseUrl || process.env.BASE_URL || '').replace(/\/$/, '');
      const backendBase = ensureScheme(backendBaseRaw);
      const frontendBase = ensureScheme(frontendBaseRaw);

      if (!backendBase) {
        throw new Error('Missing BASE_URL or request host to build success_url');
      }
      if (!frontendBase) {
        throw new Error('Missing FRONTEND_URL/BASE_URL to build cancel_url');
      }
      const userDetails = await this.userModel.findById(new Types.ObjectId(userId))
      const session = await this.stripe.checkout.sessions.create({
        customer: userDetails.stripeCustomerId,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${yogaClass.classname} - Yoga Class Registration`,
                description: `Registration for ${yogaClass.classname} Yoga Class`,
              },
              unit_amount: perUnitPrice, // ✅ Correct: per item
            },
            quantity: Number(quantity || 1),
          },
        ],
        payment_intent_data: {
           description: `Registration for ${yogaClass.classname} Yoga Class`,
           metadata: {
              id: savedBooking._id.toString(),
               type: 'yogaClass'
                }
          },        
        mode: 'payment',
        success_url: `${backendBase}/yoga_class_management/eventPaymentSuccess?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendBase}/YogaClasses/components/Thankyou?status=cancelled`,
        metadata: {
          type,
          classId,
          userId,
          bookingId: savedBooking._id.toString(),
          quantity: quantity || 1,
          coupanId: coupanId || '',
          amount: amount.toString(),
          discountAmount: discount.toString(),
          grandTotal: totalPrice.toString(),
        },
      });

      console.log('Stripe session created:', {
        id: session.id,
        url: session.url,
        // success_url is not returned by Sessions API; we keep the field for debug resilience
        // cancel_url is not returned either; only url/id are available
      });

      // Update booking with session ID
      await this.yogaClassBookingModel.findByIdAndUpdate(
        savedBooking._id,
        { paymentSessionId: session.id }
      );

      return {
        message: 'Event payment session created successfully',
        statusCode: 200,
        paymentUrl: session.url,
        sessionId: session.id,
        bookingId: savedBooking._id,
      };

    } catch (error) {
      console.error('Error creating event payment link:', error);
      throw new Error(
        `Error creating checkout session: ${error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async eventPaymentSuccess(sessionId: string): Promise<any> {
    try {
      console.log(`Processing payment success for session: ${sessionId}`);

      // Retrieve the session from Stripe (expand payment_intent for accurate status)
      const session = await this.stripe.checkout.sessions.retrieve(sessionId, { expand: ['payment_intent'] });
      console.log('Stripe session retrieved:', { id: session.id, status: session.payment_status });

      const paymentIntent: any = session['payment_intent'];
      const isPaid = session.payment_status === 'paid' || paymentIntent?.status === 'succeeded';

      if (isPaid) {
        const metadata = session.metadata;
        const bookingId = metadata?.bookingId;

        console.log('Payment metadata:', metadata);

        if (!bookingId) {
          throw new Error('Booking ID not found in session metadata');
        }

        // Find the booking by session ID
        const booking = await this.yogaClassBookingModel.findById(bookingId);
        if (!booking) {
          console.error('Booking not found for ID:', bookingId);
          throw new Error(`Booking not found for ID: ${bookingId}`);
        }

        console.log('Booking found:', { id: booking._id, status: booking.status });

        // Double-check ticket availability before confirming payment (race condition protection)
        const requestedQuantity = booking.quantity;
        const ticketValidation = await this.validateTicketAvailability(booking.classId.toString(), requestedQuantity);

        if (!ticketValidation.available) {
          // Refund the payment and update booking status
          try {
            if (paymentIntent?.id) {
              await this.stripe.refunds.create({
                payment_intent: paymentIntent.id,
                reason: 'requested_by_customer'
              });
            }
          } catch (refundError) {
            console.error('Error processing refund:', refundError);
          }

          await this.yogaClassBookingModel.findByIdAndUpdate(bookingId, {
            status: 'refunded',
            modified: new Date()
          });

          return {
            message: 'Payment processed but tickets no longer available',
            statusCode: 400,
            paymentUrl: `${process.env.FRONTEND_URL}/YogaClasses/components/Thankyou?status=refunded&reason=${encodeURIComponent('Tickets no longer available')}`,
            refunded: true,
            ticketInfo: {
              currentBookings: ticketValidation.currentBookings,
              maxTickets: ticketValidation.maxTickets,
              availableTickets: ticketValidation.availableTickets,
              requestedQuantity: requestedQuantity
            }
          };
        }

        // Update booking status to paid and add transaction details
        const ticketNumber = `EVT-${Date.now()}-${booking._id.toString().slice(-6).toUpperCase()}`;

        await this.yogaClassBookingModel.findByIdAndUpdate(bookingId, {
          status: 'paid',
          stripePaymentIntentId: paymentIntent?.id || (session.payment_intent as any),
          transactionId: session.id,
          ticketNumber: ticketNumber,
          modified: new Date()
        });

        const [event, user] = await Promise.all([
          this.classModal.findById(booking.classId),
          this.userModel.findById(booking.userId)
        ]);

        const safeclassname = event?.classname || 'Class Registration';
        const safeEventTime = event?.time || '';
        const safeEventAddress = event?.address || '';
        const eventDate = event?.date ? new Date(event.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : '';

        // Send ticket email and registration confirmation to available email (user or Stripe customer_details)
        try {
          const targetEmail = user?.email || session.customer_details?.email;
          if (targetEmail) {
            await sendEventTicketEmail(
              targetEmail,
              safeclassname,
              eventDate,
              safeEventTime,
              safeEventAddress,
              ticketNumber,
              booking.quantity,
              booking.grandTotal,
              undefined,
              event?.format === 'Online' ? (event as any)?.meeting_link || (event as any)?.meetingLink || '' : undefined
            );
            const venueOrLink = event?.format === 'Online'
              ? ((event as any)?.meeting_link || (event as any)?.meetingLink || 'Online – link in ticket email')
              : (safeEventAddress || 'See ticket email');
            await sendEventRegistrationConfirmedEmail(
              targetEmail,
              user?.name || 'there',
              safeclassname,
              eventDate,
              safeEventTime,
              venueOrLink,
            );
            console.log(`Ticket and registration confirmation emails sent to ${targetEmail}`);
          } else {
            console.warn('No email available to send ticket.');
          }
        } catch (emailError) {
          console.error('Error sending Class emails:', emailError);
          // Don't fail the payment success if email fails
        }

        try {
          const targetEmail = user?.email || session.customer_details?.email;
          if (targetEmail) {
            await sendEventTicketEmail(
              targetEmail,
              safeclassname,
              eventDate,
              safeEventTime,
              safeEventAddress,
              ticketNumber,
              booking.quantity,
              booking.grandTotal,
              undefined,
              event?.format === 'Online'
                ? (event as any)?.meeting_link || (event as any)?.meetingLink || ''
                : undefined
            );

            const venueOrLink = event?.format === 'Online'
              ? ((event as any)?.meeting_link || (event as any)?.meetingLink || 'Online – link in ticket email')
              : (safeEventAddress || 'See ticket email');

            await sendEventRegistrationConfirmedEmail(
              targetEmail,
              user?.name || 'there',
              safeclassname,
              eventDate,
              safeEventTime,
              venueOrLink,
            );

            console.log(`Ticket and registration confirmation emails sent to ${targetEmail}`);
          } else {
            console.warn('No email available to send ticket.');
          }
        } catch (emailError) {
          console.error('Error sending Class emails:', emailError);
        }



        console.log('Class payment successful:', {
          bookingId,
          ticketNumber,
          classname: safeclassname,
          userEmail: user?.email || session.customer_details?.email
        });

        const ensureScheme = (url: string): string => {
          const trimmed = (url || '').trim();
          if (!trimmed) return '';
          return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
        };
        const frontendBase = ensureScheme(process.env.FRONTEND_URL || process.env.BASE_URL || '');
        const thankyouBase = frontendBase || '';

        return {
          message: 'Class payment successful',
          statusCode: 200,
          paymentUrl: thankyouBase
            ? `${thankyouBase.replace(/\/$/, '')}/YogaClasses/components/Thankyou?status=success&session_id=${sessionId}&ticket=${ticketNumber}`
            : `/YogaClasses/components/Thankyou?status=success&session_id=${sessionId}&ticket=${ticketNumber}`,
          bookingId: bookingId,
          ticketNumber: ticketNumber
        };
      } else {
        const reason = paymentIntent?.last_payment_error?.message || 'Payment not completed';
        const ensureScheme = (url: string): string => {
          const trimmed = (url || '').trim();
          if (!trimmed) return '';
          return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
        };
        const frontendBase = ensureScheme(process.env.FRONTEND_URL || process.env.BASE_URL || '');
        const thankyouBase = frontendBase || '';

        return {
          message: 'Payment not completed',
          statusCode: 400,
          paymentUrl: thankyouBase
            ? `${thankyouBase.replace(/\/$/, '')}/YogaClasses/components/Thankyou?status=failed&session_id=${sessionId}&reason=${encodeURIComponent(reason)}`
            : `/YogaClasses/components/Thankyou?status=failed&session_id=${sessionId}&reason=${encodeURIComponent(reason)}`,
        };
      }

    } catch (error) {
      console.error('Error processing Class payment success:', error);
      const reason = (error as any)?.message || 'Unknown error';
      const ensureScheme = (url: string): string => {
        const trimmed = (url || '').trim();
        if (!trimmed) return '';
        return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      };
      const frontendBase = ensureScheme(process.env.FRONTEND_URL || process.env.BASE_URL || '');
      const thankyouBase = frontendBase || '';

      return {
        message: 'Error processing payment',
        statusCode: 500,
        paymentUrl: thankyouBase
          ? `${thankyouBase.replace(/\/$/, '')}/YogaClasses/components/Thankyou?status=error&reason=${encodeURIComponent(reason)}`
          : `/YogaClasses/components/Thankyou?status=error&reason=${encodeURIComponent(reason)}`,
      };
    }
  }

  // Method to get all Class bookings for admin dashboard
  async getAllYogaClassBookings(page: number = 1, pageSize: number = 10): Promise<any> {
    try {
      // Ensure valid numeric pagination
      page = Math.max(1, Number(page) || 1);
      pageSize = Math.max(1, Number(pageSize) || 10);
      const skip = (page - 1) * pageSize;

      // Aggregate pipeline with pagination
      const bookings = await this.yogaClassBookingModel.aggregate([
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
            from: 'yogaclassmanagements',
            localField: 'classId',
            foreignField: '_id',
            as: 'yogaClass'
          }
        },
        { $unwind: '$user' },
        { $unwind: '$yogaClass' },
        {
          $project: {
            ticketNumber: 1,
            status: 1,
            quantity: 1,
            grandTotal: 1,
            created_at: 1,
            'user.name': 1,
            'user.email': 1,
            'yogaClass.classname': 1,
            'yogaClass.date': 1,
            'yogaClass.time': 1,
            'yogaClass.address': 1
          }
        },
        { $sort: { created_at: -1 } },
        { $skip: skip },
        { $limit: pageSize }
      ]);

      // Get total count for pagination metadata
      const totalCount = await this.yogaClassBookingModel.countDocuments();

      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        message: 'Class bookings fetched successfully',
        statusCode: 200,
        data: bookings,
        pagination: {
          totalCount,
          page,
          pageSize,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Error fetching Class bookings:', error);
      throw new Error(
        `Error creating checkout session: ${error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // Method to get all Class bookings for user
  async getUserYogaClassBookings(user_id): Promise<any> {
    try {
      // Ensure valid numeric pagination
      // page = Math.max(1, Number(page) || 1);
      // pageSize = Math.max(1, Number(pageSize) || 10);
      // const skip = (page - 1) * pageSize;

      // Aggregate pipeline with pagination
      const bookings = await this.yogaClassBookingModel.aggregate([
        { $match: { userId: new Types.ObjectId(user_id) } },
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
            from: 'yogaclassmanagements',
            localField: 'classId',
            foreignField: '_id',
            as: 'class'
          }
        },
        { $unwind: '$user' },
        { $unwind: '$class' },
        {
          $project: {
            ticketNumber: 1,
            status: 1,
            quantity: 1,
            grandTotal: 1,
            created_at: 1,
            'user.name': 1,
            'user.email': 1,
            'class.classname': 1,
            'class.date': 1,
            'class.time': 1,
            'class.address': 1,
            'class.meeting_link': 1,
            'class.speakername': 1,
            'class.host_name': 1
          }
        },
        { $sort: { created_at: -1 } },
        // { $skip: skip },
        // { $limit: pageSize }
      ]);

      // Get total count for pagination metadata
      // const totalCount = await this.yogaClassBookingModel.countDocuments();

      // const totalPages = Math.ceil(totalCount / pageSize);

      return {
        message: 'Class bookings fetched successfully',
        statusCode: 200,
        data: bookings,
        // pagination: {
        //   totalCount,
        //   page,
        //   pageSize,
        //   totalPages,
        //   hasNextPage: page < totalPages,
        //   hasPrevPage: page > 1
        // }
      };
    } catch (error) {
      console.error('Error fetching Class bookings:', error);
      throw new Error(
        `Error creating checkout session: ${error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }


  // Method to get bookings by Class ID
  async getEventBookingsByEventId(eventId: string): Promise<any> {
    try {
      const bookings = await this.yogaClassBookingModel.aggregate([
        { $match: { eventId: new Types.ObjectId(eventId) } },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            ticketNumber: 1,
            status: 1,
            quantity: 1,
            grandTotal: 1,
            created_at: 1,
            'user.name': 1,
            'user.email': 1
          }
        },
        { $sort: { created_at: -1 } }
      ]);

      return {
        message: 'Class bookings fetched successfully',
        statusCode: 200,
        data: bookings
      };
    } catch (error) {
      console.error('Error fetching Class bookings by Class ID:', error);
      throw new Error(
        `Error creating checkout session: ${error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // Method to count current bookings for an Class
  async getCurrentBookingsCount(classId: string): Promise<number> {
    try {
      const result = await this.yogaClassBookingModel.aggregate([
        {
          $match: {
            classId: new Types.ObjectId(classId),
            status: { $in: ['paid', 'rsvp'] }  // ✅ include RSVP too
          }
        },
        { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } }
      ]);
      return result.length > 0 ? result[0].totalQuantity : 0;
    } catch (error) {
      console.error('Error counting current bookings:', error);
      throw new Error(
        `Error creating checkout session: ${error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }


  // Method to validate ticket availability
  async validateTicketAvailability(classId: string, requestedQuantity: number): Promise<{ available: boolean; currentBookings: number; maxTickets: number; availableTickets: number }> {
    try {
      const yogaClass = await this.classModal.findById(new Types.ObjectId(classId));
      if (!yogaClass) {
        throw new Error('Yoga Class not found');
      }

      const currentBookings = await this.getCurrentBookingsCount(classId);
      const maxTickets = yogaClass.max_tickets || 0;
      const availableTickets = maxTickets - currentBookings;
      const available = availableTickets >= requestedQuantity;

      return {
        available,
        currentBookings,
        maxTickets,
        availableTickets
      };
    } catch (error) {
      console.error('Error validating ticket availability:', error);
      throw new Error(
        `Error creating checkout session: ${error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // Method to get all tickets booked for a specific Class (new API)
  async getTicketsBookedForClass(classId: string): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(classId)) {
        throw new Error('Invalid Class ID format');
      }

      const yogaclass = await this.classModal.findById(new Types.ObjectId(classId));
      if (!yogaclass) {
        throw new Error('Class not found');
      }

      const bookings = await this.yogaClassBookingModel.aggregate([
        {
          $match: {
            classId: new Types.ObjectId(classId),
            status: { $in: ['paid', 'rsvp'] }
          }
        },

        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            ticketNumber: 1,
            status: 1,
            quantity: 1,
            grandTotal: 1,
            created_at: 1,
            modified: 1,
            'user.name': 1,
            'user.email': 1,
            'user.phone': 1,
            'user.mobileNo': 1
          }
        },
        { $sort: { created_at: -1 } }
      ]);

      const currentBookings = await this.getCurrentBookingsCount(classId);
      const maxTickets = yogaclass.max_tickets || 0;
      const availableTickets = maxTickets - currentBookings;

      return {
        message: 'Tickets booked for YogaClass fetched successfully',
        statusCode: 200,
        YogaClassInfo: {
          YogaClassId: yogaclass._id,
          classname: yogaclass.classname,
          ClassDate: yogaclass.date,
          ClassTime: yogaclass.time,
          maxTickets: maxTickets,
          currentBookings: currentBookings,
          availableTickets: availableTickets
        },
        tickets: bookings,
        summary: {
          totalTicketsBooked: currentBookings,
          totalTicketsAvailable: maxTickets,
          remainingTickets: availableTickets,
          isFullyBooked: availableTickets <= 0
        }
      };
    } catch (error) {
      console.error('Error fetching tickets booked for Class:', error);
      throw new Error(
        `Error creating checkout session: ${error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async createEventRSVP(rsvpData: any): Promise<any> {
    try {
      const { classId, userId, quantity = 1, type = 'RSVP' } = rsvpData;

      const event = await this.classModal.findById(new Types.ObjectId(classId));
      if (!event) throw new Error('Class not found');

      // Validate ticket availability
      const ticketValidation = await this.validateTicketAvailability(classId, quantity);
      if (!ticketValidation.available) {
        return {
          message: 'Tickets not available',
          statusCode: 400,
          error: `Only ${ticketValidation.availableTickets} tickets left.`,
        };
      }

      // Create RSVP booking
      const booking = new this.yogaClassBookingModel({
        type,
        classId: new Types.ObjectId(classId),
        userId: new Types.ObjectId(userId),
        quantity: Number(quantity),
        amount: 0,
        discountAmount: 0,
        grandTotal: 0,
        status: 'rsvp',
        created_at: new Date(),
      });

      const savedBooking = await booking.save();

      // Generate ticket number
      const ticketNumber = `RSVP-${Date.now()}-${savedBooking._id.toString().slice(-6).toUpperCase()}`;

      await this.yogaClassBookingModel.findByIdAndUpdate(savedBooking._id, {
        ticketNumber,
        modified: new Date(),
      });

     // Fetch class & user details
const [user, fullClass] = await Promise.all([
  this.userModel.findById(userId),
  this.classModal.findById(classId),
]);

const targetEmail = user?.email;
if (targetEmail) {
  const classDate = fullClass?.date
    ? new Date(fullClass.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  // Send ticket email to user
  await sendClassBookingTicketEmail(
    targetEmail,
    fullClass?.classname || 'Class Booking',
    classDate,
    fullClass?.time || '',
    fullClass?.address || '',
    ticketNumber,
    quantity,
    0,
    undefined,
    fullClass?.format === 'Online'
      ? (fullClass as any)?.meeting_link || (fullClass as any)?.meetingLink || ''
      : undefined,
  );

  // Send admin notification
  const bookingDateTime = (savedBooking?.created_at || new Date()).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  await sendNewClassBookingAdminEmail(
    fullClass?.classname || 'Class Booking',
    user?.name || 'User',
    targetEmail,
    bookingDateTime,
  );
}

      return {
        message: 'RSVP registered successfully',
        statusCode: 200,
        bookingId: savedBooking._id,
        ticketNumber,
      };
    } catch (error) {
      console.error('Error creating RSVP:', error);
      throw new Error(
        `Error creating checkout session: ${error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // 🔥 Reusable function: returns availability info for any Class
  async getEventAvailability(eventId: string) {
    const event = await this.classModal.findById(eventId);
    if (!event) throw new Error('Class not found');

    const currentBookings = await this.getCurrentBookingsCount(eventId);
    const maxTickets = event.max_tickets || 0;
    const availableTickets = maxTickets - currentBookings;

    return {
      maxTickets,
      currentBookings,
      availableTickets,
      isFullyBooked: availableTickets <= 0,
    };
  }

  async findByUser(id: string) {
    const objectId = new Types.ObjectId(id);
    console.log(objectId, "onbasiodnbjasbdjb")
    const event = await this.yogaClassBookingModel.aggregate([{ $match: { userId: objectId } },
    {
      $lookup: {
        from: 'YogaClassManagements',
        localField: 'eventId',
        foreignField: '_id',
        as: 'event'
      }
    },
    { $unwind: '$event' },
    ]).exec();
    if (!event) throw new Error(`Event not found with id: ${id}`);

    const hostUrl = process.env.BASE_URL || 'http://localhost:3008';
    // const availability = await this.getEventAvailability(id);
    // const isExpired = this.isEventExpired(Class as any);

    return {
      message: 'Class fetched successfully!',
      statusCode: 200,
      event
      // event: {
      //   ...event.toObject(),
      //   fileUrl: event.file ? `${hostUrl}/${event.file.replace(/\\/g, '/')}` : null,
      //   coverUrl: event.coverImage ? `${hostUrl}/${event.coverImage.replace(/\\/g, '/')}` : null,
      //   iconUrl: event.icon_file ? `${hostUrl}/${event.icon_file.replace(/\\/g, '/')}` : null,
      //   maxTickets: availability.maxTickets,
      //   currentBookings: availability.currentBookings,
      //   availableTickets: availability.availableTickets,
      //   isFullyBooked: availability.isFullyBooked,
      //   // --- NEW FIELD ---
      //   is_expired: isExpired ? 1 : 0,
      // },
    };
  }


  async downloadEventTicketDetails(classId: string, res: Response): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(classId)) {
        return res.status(400).json({ message: 'Invalid Class ID format' });
      }

      const yogaClass = await this.classModal.findById(new Types.ObjectId(classId));
      if (!yogaClass) {
        return res.status(404).json({ message: 'Class not found' });
      }

      const bookings = await this.yogaClassBookingModel.aggregate([
        {
          $match: {
            classId: new Types.ObjectId(classId),
            status: { $in: ['paid', 'rsvp'] }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },

        // ✅ Add name + mobile
        {
          $addFields: {
            fullName: {
              $concat: ["$user.name", " ", { $ifNull: ["$user.lastName", ""] }]
            },
            mobile: { $toString: "$user.phone" }
          }
        },

        {
          $project: {
            ticketNumber: 1,
            status: 1,
            quantity: 1,
            grandTotal: 1,
            created_at: 1,
            modified: 1,
            fullName: 1,
            email: "$user.email",
            mobile: 1
          }
        },

        // ✅ Stable sort
        { $sort: { created_at: -1, _id: -1 } }
      ]);

      // ✅ Excel Data
      const excelData = bookings.map((t, index) => ({
        "#": index + 1,
        "Ticket Number": t.ticketNumber,
        "Name": t.fullName,
        // "Email": t.email,
        "Mobile": t.mobile,
        "Quantity": t.quantity,
        "Status": t.status,
        "Total": t.grandTotal,
        "Booked On": t.created_at ? new Date(t.created_at).toLocaleString("en-US", { timeZone: "America/New_York", hour12: true }) : "",
        "Last Updated": t.modified ? new Date(t.modified).toLocaleString("en-US", {
          timeZone: "America/New_York",
          hour12: true
        }) : ""
        //  t.modified ? new Date(t.modified).toLocaleString() : ""
      }));

      // ✅ Create Excel
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");

      // Optional: column width
      worksheet["!cols"] = [
        { wch: 5 }, { wch: 20 }, { wch: 25 }, { wch: 30 },
        { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 15 },
        { wch: 25 }, { wch: 25 }
      ];

      const buffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx"
      });

      // ✅ Send file
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=event-tickets-${Date.now()}.xlsx`
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      return res.send(buffer);

    } catch (error) {
      console.error("Excel Error:", error);
      return res.status(500).json({
        message: "Failed to generate Excel",
        error: error instanceof Error ? error.message : String(error)
      });

    }
  }

}
