import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventManagement, EventManagementDocument, Coupon, CouponDocument, EventBooking, EventBookingDocument, User, UserDocument } from 'src/schema/schema';
import Stripe from 'stripe';
import { sendEventTicketEmail, sendEventRegistrationConfirmedEmail, sendNewEventRegistrationAdminEmail } from 'src/middlewares/nodemailer/nodemailer.controller';
import * as XLSX from "xlsx";
import { Response } from "express";
@Injectable()
export class EventManagementService {
  private stripe: Stripe;

  constructor(
    @InjectModel(EventManagement.name) private eventModel: Model<EventManagementDocument>,
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(EventBooking.name) private eventBookingModel: Model<EventBookingDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      // apiVersion: '2023-10-16',
    });
  }

  async create(eventData: Partial<EventManagement>): Promise<any> {
    if (eventData.is_exclusive && !eventData.membership_pricing) {
      eventData.membership_pricing = [];
    }

    // Create the base event
    const createdEvent = new this.eventModel(eventData);
    await createdEvent.save();

    // ✅ If this is a recurring event, auto-generate future ones
    if (eventData.is_recurring && eventData.recurrence_type && eventData.recurrence_end_date) {
      const recurrenceDates = this.generateRecurrenceDates(
        eventData.date,
        eventData.recurrence_type,
        eventData.recurrence_end_date
      );

      // Exclude the first date (it’s already saved)
      const futureDates = recurrenceDates.slice(1);

      const clonedEvents = futureDates.map((date) => ({
        ...createdEvent.toObject(),
        _id: undefined, // ensure a new document
        date,
        date_created: new Date(),
        modified: new Date(),
        eventname: `${createdEvent.eventname} (${new Date(date).toLocaleDateString()})`,
      }));

      if (clonedEvents.length > 0) {
        await this.eventModel.insertMany(clonedEvents);
        console.log(`✅ Created ${clonedEvents.length} recurring events for: ${createdEvent.eventname}`);
      }
    }

    return createdEvent;
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

  private isEventExpired(event: EventManagement): boolean {
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

  async findAll(page: number, pageSize: number, eventName?: string, all?: boolean, sortBy?: string, sortOrder: 'asc' | 'desc' = 'asc', eventFilter?: string) {
    const sort: any = {};

    if (sortBy === 'date') {
      sort.date = sortOrder === 'asc' ? 1 : -1;
    }
    const skip = (page - 1) * pageSize;
    const filter: any = {};
    if (eventName && eventName.trim() !== '') {
      filter.$or = [
        { eventname: { $regex: eventName, $options: 'i' } },
        { speakername: { $regex: eventName, $options: 'i' } },
        { host_name: { $regex: eventName, $options: 'i' } },
        { city: { $regex: eventName, $options: 'i' } },
      ];
    }
    if (eventFilter !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      eventFilter == 'upcoming' ? filter.date = { $gt: today } : eventFilter == 'completed' ? filter.date = { $lt: today } : filter.date = { $eq: today }

    }
    console.log(filter, "filter")
    // const events = all
    //   ? await this.eventModel.find(filter).exec()
    //   : await this.eventModel.find(filter).skip(skip).limit(pageSize).exec();
    const events = all ? await this.eventModel
      .find(filter)
      .sort(sort)
      .exec()
      : await this.eventModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .exec();

    const totalCount = await this.eventModel.countDocuments(filter).exec();
    const hostUrl = process.env.BASE_URL || 'http://localhost:3008';

    const eventsWithUrls = await Promise.all(
      events.map(async (event) => {
        const availability = await this.getEventAvailability(event._id.toString());
        const isExpired = this.isEventExpired(event as any);
        return {
          ...event.toObject(),
          fileUrl: event.file ? `${hostUrl}/${event.file.replace(/\\/g, '/')}` : null,
          coverUrl: event.coverImage ? `${hostUrl}/${event.coverImage.replace(/\\/g, '/')}` : null,
          iconUrl: event.icon_file ? `${hostUrl}/${event.icon_file.replace(/\\/g, '/')}` : null,
          // availability
          maxTickets: availability.maxTickets,
          currentBookings: availability.currentBookings,
          availableTickets: availability.availableTickets,
          isFullyBooked: availability.isFullyBooked,
          // --- NEW FIELD ---
          is_expired: isExpired ? 1 : 0,
        };
      })
    );

    return {
      message: 'Events fetched successfully!',
      statusCode: 200,
      events: eventsWithUrls,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  }


  async toggleStatus(id: string) {
    const event = await this.eventModel.findById(id);
    if (!event) throw new Error(`Event not found with id: ${id}`);

    // Flip 1 ↔ 0
    event.status = event.status === 1 ? 0 : 1;
    event.modified = new Date();
    await event.save();

    return {
      message: 'Event status updated successfully',
      statusCode: 200,
      eventId: id,
      newStatus: event.status,
    };
  }

  async findOneById(id: string) {
    const objectId = new Types.ObjectId(id);
    const event = await this.eventModel.findById(objectId).exec();
    if (!event) throw new Error(`Event not found with id: ${id}`);

    const hostUrl = process.env.BASE_URL || 'http://localhost:3008';
    const availability = await this.getEventAvailability(id);
    const isExpired = this.isEventExpired(event as any);

    return {
      message: 'Event fetched successfully!',
      statusCode: 200,
      event: {
        ...event.toObject(),
        fileUrl: event.file ? `${hostUrl}/${event.file.replace(/\\/g, '/')}` : null,
        coverUrl: event.coverImage ? `${hostUrl}/${event.coverImage.replace(/\\/g, '/')}` : null,
        iconUrl: event.icon_file ? `${hostUrl}/${event.icon_file.replace(/\\/g, '/')}` : null,
        maxTickets: availability.maxTickets,
        currentBookings: availability.currentBookings,
        availableTickets: availability.availableTickets,
        isFullyBooked: availability.isFullyBooked,
        // --- NEW FIELD ---
        is_expired: isExpired ? 1 : 0,
      },
    };
  }

  async update(id: string, eventData: Partial<EventManagement>) {
    const objectId = new Types.ObjectId(id);
    await this.eventModel.updateOne({ _id: objectId }, { $set: eventData });
    return { message: 'Event updated successfully', statusCode: 200 };
  }

  async delete(id: string) {
    const objectId = new Types.ObjectId(id);
    await this.eventModel.deleteOne({ _id: objectId });
    return { message: 'Event deleted successfully', statusCode: 200 };
  }

  async createEventPaymentLink(eventPaymentData: any): Promise<any> {
    try {
      const { type, eventId, quantity, userId, coupanId, amount, baseUrl } = eventPaymentData;

      // Validate required fields
      if (!type || !eventId || !userId) {
        throw new Error('Missing required fields: type, eventId, userId, amount');
      }

      // Get event details
      const event = await this.eventModel.findById(new Types.ObjectId(eventId));
      if (!event) {
        throw new Error('Event not found');
      }

      // Validate ticket availability before creating payment
      const requestedQuantity = Number(quantity || 1);
      const ticketValidation = await this.validateTicketAvailability(eventId, requestedQuantity);

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
      const eventBookingData = {
        type,
        eventId: new Types.ObjectId(eventId),
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
      const eventBooking = new this.eventBookingModel(eventBookingData);
      const savedBooking = await eventBooking.save();

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

      const session = await this.stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${event.eventname} - Event Registration`,
                description: `Registration for ${event.eventname} event`,
              },
              unit_amount: perUnitPrice, // ✅ Correct: per item
            },
            quantity: Number(quantity || 1),
          },
        ],
        payment_intent_data: {
          description: `${event.eventname} - Event Registration`,
          metadata: {
            id: eventId,
            type: 'event'
          }
        },
        mode: 'payment',
        success_url: `${backendBase}/event_management/eventPaymentSuccess?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendBase}/Events/Thankyou?status=cancelled`,
        metadata: {
          type,
          eventId,
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
      await this.eventBookingModel.findByIdAndUpdate(
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
      throw new Error(`Error creating checkout session: ${error.message}`);
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
        const booking = await this.eventBookingModel.findById(bookingId);
        if (!booking) {
          console.error('Booking not found for ID:', bookingId);
          throw new Error(`Booking not found for ID: ${bookingId}`);
        }

        console.log('Booking found:', { id: booking._id, status: booking.status });

        // Double-check ticket availability before confirming payment (race condition protection)
        const requestedQuantity = booking.quantity;
        const ticketValidation = await this.validateTicketAvailability(booking.eventId.toString(), requestedQuantity);

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

          await this.eventBookingModel.findByIdAndUpdate(bookingId, {
            status: 'refunded',
            modified: new Date()
          });

          return {
            message: 'Payment processed but tickets no longer available',
            statusCode: 400,
            paymentUrl: `${process.env.FRONTEND_URL}/Events/Thankyou?status=refunded&reason=${encodeURIComponent('Tickets no longer available')}`,
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

        await this.eventBookingModel.findByIdAndUpdate(bookingId, {
          status: 'paid',
          stripePaymentIntentId: paymentIntent?.id || (session.payment_intent as any),
          transactionId: session.id,
          ticketNumber: ticketNumber,
          modified: new Date()
        });

        const [event, user] = await Promise.all([
          this.eventModel.findById(booking.eventId),
          this.userModel.findById(booking.userId)
        ]);

        const safeEventName = event?.eventname || 'Event Registration';
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
              safeEventName,
              eventDate,
              safeEventTime ? this.convertTo12HourFormat(safeEventTime) : "",
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
              safeEventName,
              eventDate,
              safeEventTime ? this.convertTo12HourFormat(safeEventTime) : "",
              venueOrLink,
            );
            console.log(`Ticket and registration confirmation emails sent to ${targetEmail}`);
          } else {
            console.warn('No email available to send ticket.');
          }
        } catch (emailError) {
          console.error('Error sending event emails:', emailError);
          // Don't fail the payment success if email fails
        }

        try {
          const targetEmail = user?.email || session.customer_details?.email;
          if (targetEmail) {
            await sendEventTicketEmail(
              targetEmail,
              safeEventName,
              eventDate,
              safeEventTime ? this.convertTo12HourFormat(safeEventTime) : "",
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
              safeEventName,
              eventDate,
              safeEventTime ? this.convertTo12HourFormat(safeEventTime) : "",
              venueOrLink,
            );

            console.log(`Ticket and registration confirmation emails sent to ${targetEmail}`);
          } else {
            console.warn('No email available to send ticket.');
          }
        } catch (emailError) {
          console.error('Error sending event emails:', emailError);
        }



        console.log('Event payment successful:', {
          bookingId,
          ticketNumber,
          eventName: safeEventName,
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
          message: 'Event payment successful',
          statusCode: 200,
          paymentUrl: thankyouBase
            ? `${thankyouBase.replace(/\/$/, '')}/Events/Thankyou?status=success&session_id=${sessionId}&ticket=${ticketNumber}`
            : `/Events/Thankyou?status=success&session_id=${sessionId}&ticket=${ticketNumber}`,
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
            ? `${thankyouBase.replace(/\/$/, '')}/Events/Thankyou?status=failed&session_id=${sessionId}&reason=${encodeURIComponent(reason)}`
            : `/Events/Thankyou?status=failed&session_id=${sessionId}&reason=${encodeURIComponent(reason)}`,
        };
      }

    } catch (error) {
      console.error('Error processing event payment success:', error);
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
          ? `${thankyouBase.replace(/\/$/, '')}/Events/Thankyou?status=error&reason=${encodeURIComponent(reason)}`
          : `/Events/Thankyou?status=error&reason=${encodeURIComponent(reason)}`,
      };
    }
  }

  // Method to get all event bookings for admin dashboard
  async getAllEventBookings(page: number = 1, pageSize: number = 10): Promise<any> {
    try {
      // Ensure valid numeric pagination
      page = Math.max(1, Number(page) || 1);
      pageSize = Math.max(1, Number(pageSize) || 10);
      const skip = (page - 1) * pageSize;

      // Aggregate pipeline with pagination
      const bookings = await this.eventBookingModel.aggregate([
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
            from: 'eventmanagements',
            localField: 'eventId',
            foreignField: '_id',
            as: 'event'
          }
        },
        { $unwind: '$user' },
        { $unwind: '$event' },
        {
          $project: {
            ticketNumber: 1,
            status: 1,
            quantity: 1,
            grandTotal: 1,
            created_at: 1,
            'user.name': 1,
            'user.email': 1,
            'event.eventname': 1,
            'event.date': 1,
            'event.time': 1,
            'event.address': 1
          }
        },
        { $sort: { created_at: -1 } },
        { $skip: skip },
        { $limit: pageSize }
      ]);

      // Get total count for pagination metadata
      const totalCount = await this.eventBookingModel.countDocuments();

      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        message: 'Event bookings fetched successfully',
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
      console.error('Error fetching event bookings:', error);
      throw new Error(`Error fetching event bookings: ${error.message}`);
    }
  }

  // Method to get all event bookings for user
  async getUserEventBookings(user_id): Promise<any> {
    try {
      // Ensure valid numeric pagination
      // page = Math.max(1, Number(page) || 1);
      // pageSize = Math.max(1, Number(pageSize) || 10);
      // const skip = (page - 1) * pageSize;

      // Aggregate pipeline with pagination
      const bookings = await this.eventBookingModel.aggregate([
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
            from: 'eventmanagements',
            localField: 'eventId',
            foreignField: '_id',
            as: 'event'
          }
        },
        { $unwind: '$user' },
        { $unwind: '$event' },
        {
          $project: {
            ticketNumber: 1,
            status: 1,
            quantity: 1,
            grandTotal: 1,
            created_at: 1,
            'user.name': 1,
            'user.email': 1,
            'event.eventname': 1,
            'event.date': 1,
            'event.time': 1,
            'event.address': 1,
            'event.meeting_link': 1,
            'event.speakername': 1
          }
        },
        { $sort: { created_at: -1 } },
        // { $skip: skip },
        // { $limit: pageSize }
      ]);

      // Get total count for pagination metadata
      // const totalCount = await this.eventBookingModel.countDocuments();

      // const totalPages = Math.ceil(totalCount / pageSize);

      return {
        message: 'Event bookings fetched successfully',
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
      console.error('Error fetching event bookings:', error);
      throw new Error(`Error fetching event bookings: ${error.message}`);
    }
  }


  // Method to get bookings by event ID
  async getEventBookingsByEventId(eventId: string): Promise<any> {
    try {
      const bookings = await this.eventBookingModel.aggregate([
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
        message: 'Event bookings fetched successfully',
        statusCode: 200,
        data: bookings
      };
    } catch (error) {
      console.error('Error fetching event bookings by event ID:', error);
      throw new Error(`Error fetching event bookings: ${error.message}`);
    }
  }

  // Method to count current bookings for an event
  async getCurrentBookingsCount(eventId: string): Promise<number> {
    try {
      const result = await this.eventBookingModel.aggregate([
        {
          $match: {
            eventId: new Types.ObjectId(eventId),
            status: { $in: ['paid', 'rsvp'] }  // ✅ include RSVP too
          }
        },
        { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } }
      ]);
      return result.length > 0 ? result[0].totalQuantity : 0;
    } catch (error) {
      console.error('Error counting current bookings:', error);
      throw new Error(`Error counting current bookings: ${error.message}`);
    }
  }


  // Method to validate ticket availability
  async validateTicketAvailability(eventId: string, requestedQuantity: number): Promise<{ available: boolean; currentBookings: number; maxTickets: number; availableTickets: number }> {
    try {
      const event = await this.eventModel.findById(new Types.ObjectId(eventId));
      if (!event) {
        throw new Error('Event not found');
      }

      const currentBookings = await this.getCurrentBookingsCount(eventId);
      const maxTickets = event.max_tickets || 0;
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
      throw new Error(`Error validating ticket availability: ${error.message}`);
    }
  }

  // Method to get all tickets booked for a specific event (new API)
  async getTicketsBookedForEvent(eventId: string): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(eventId)) {
        throw new Error('Invalid Event ID format');
      }

      const event = await this.eventModel.findById(new Types.ObjectId(eventId));
      if (!event) {
        throw new Error('Event not found');
      }

      const bookings = await this.eventBookingModel.aggregate([
        {
          $match: {
            eventId: new Types.ObjectId(eventId),
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
            'user.phone': 1
          }
        },
        { $sort: { created_at: -1 } }
      ]);

      const currentBookings = await this.getCurrentBookingsCount(eventId);
      const maxTickets = event.max_tickets || 0;
      const availableTickets = maxTickets - currentBookings;

      return {
        message: 'Tickets booked for event fetched successfully',
        statusCode: 200,
        eventInfo: {
          eventId: event._id,
          eventName: event.eventname,
          eventDate: event.date,
          eventTime: event.time,
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
      console.error('Error fetching tickets booked for event:', error);
      throw new Error(`Error fetching tickets booked for event: ${error.message}`);
    }
  }

  async createEventRSVP(rsvpData: any): Promise<any> {
    try {
      const { eventId, userId, quantity = 1, type = 'RSVP' } = rsvpData;

      const event = await this.eventModel.findById(new Types.ObjectId(eventId));
      if (!event) throw new Error('Event not found');

      // Validate ticket availability
      const ticketValidation = await this.validateTicketAvailability(eventId, quantity);
      if (!ticketValidation.available) {
        return {
          message: 'Tickets not available',
          statusCode: 400,
          error: `Only ${ticketValidation.availableTickets} tickets left.`,
        };
      }

      // Create RSVP booking
      const booking = new this.eventBookingModel({
        type,
        eventId: new Types.ObjectId(eventId),
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

      await this.eventBookingModel.findByIdAndUpdate(savedBooking._id, {
        ticketNumber,
        modified: new Date(),
      });

      // Fetch event & user details
      const [user, fullEvent] = await Promise.all([
        this.userModel.findById(userId),
        this.eventModel.findById(eventId),
      ]);

      // Send ticket email and registration confirmation
      const targetEmail = user?.email;
      if (targetEmail) {
        const eventDate = fullEvent?.date
          ? new Date(fullEvent.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
          : '';

        await sendEventTicketEmail(
          targetEmail,
          fullEvent?.eventname || 'Event Registration',
          eventDate,
          fullEvent?.time ? this.convertTo12HourFormat(fullEvent?.time) : '',
          fullEvent?.address || '',
          ticketNumber,
          quantity,
          0,
          undefined,
          fullEvent?.format === 'Online'
            ? (fullEvent as any)?.meeting_link || (fullEvent as any)?.meetingLink || ''
            : undefined
        );
        const venueOrLink = fullEvent?.format === 'Online'
          ? ((fullEvent as any)?.meeting_link || (fullEvent as any)?.meetingLink || 'Online – link in ticket email')
          : (fullEvent?.address || 'See ticket email');
        await sendEventRegistrationConfirmedEmail(
          targetEmail,
          user?.name || 'there',
          fullEvent?.eventname || 'Event Registration',
          eventDate,
          fullEvent?.time ? this.convertTo12HourFormat(fullEvent?.time) : "",
          venueOrLink,
        );

        const registrationDateTime = (savedBooking?.created_at || new Date()).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        sendNewEventRegistrationAdminEmail(
          fullEvent?.eventname || 'Event Registration',
          user?.name || 'User',
          targetEmail,
          registrationDateTime,
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
      throw new Error(`Error creating RSVP: ${error.message}`);
    }
  }

  // 🔥 Reusable function: returns availability info for any event
  async getEventAvailability(eventId: string) {
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new Error('Event not found');

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
    const event = await this.eventBookingModel.aggregate([{ $match: { userId: objectId } },
    {
      $lookup: {
        from: 'eventmanagements',
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
    // const isExpired = this.isEventExpired(event as any);

    return {
      message: 'Event fetched successfully!',
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


  async downloadEventTicketDetails(eventId: string, res: Response): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ message: 'Invalid Event ID format' });
      }

      const event = await this.eventModel.findById(new Types.ObjectId(eventId));
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      const bookings = await this.eventBookingModel.aggregate([
        {
          $match: {
            eventId: new Types.ObjectId(eventId),
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
        error: error.message
      });
    }
  }

  convertTo12HourFormat = (timeString) => {
    if (!timeString) return "N/A";

    if (timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    }

    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }

    return timeString;
  };

  async createDuplicateEvent(id: string) {
    try {

      const event = await this.eventModel.findById(id);

      if (!event) {

        return { statusCode: 204, message: "Event not found" }
      }
console.log(event,"event")
      const duplicateEvent = event.toObject();

      delete duplicateEvent._id;

      duplicateEvent.eventname = `${duplicateEvent.eventname} Copy`;

      const newEvent = await this.eventModel.create(duplicateEvent);
      console.log(duplicateEvent,"duplicateEvent")
      console.log(newEvent,"newEvent")

      return { statusCode: 200, message: "Event duplicated successfully", data: newEvent };

    } catch (error) {
      return { statusCode: 404, message: "Something went wrong", error: error.message };
    }
  };

}
