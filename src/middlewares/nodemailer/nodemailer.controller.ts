
// // nodemailer.controller.ts
// import * as nodemailer from 'nodemailer';
// import * as path from 'path';
// import * as fs from 'fs';

// console.log('Nodemailer module loaded successfully');

// /** Replace this path with your Vedic Health logo file location */
// const VEDIC_HEALTH_LOGO_PATH = path.join(process.cwd(), 'public', 'vedic-health-logo.png');
// // Create a transporter function
// export function createTransporter() {
//   return nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 587,
//     secure: false, // TLS requires false for port 587
//     auth: {
//       user: 'info@vedichealth.org',
//       pass: 'iwyn jjtp vdmc xlfr', // SMTP password you provided
//     },
//     // tls: {
//     //   rejectUnauthorized: false, // For self-signed certificates or specific scenarios
//     // },
//   });
// }

// // Function to send OTP email
// export async function sendOtpEmail(email: string, otp: string) {
//   const transporter = createTransporter();

//   const mailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: email,
//     subject: 'Your OTP Code',
//     text: `Your OTP code is: ${otp} \n Don't share this code with anyone. \n\n Regards, \n Vedic Health`,
//     html: `<p>Your OTP code is: <strong>${otp}</strong></p><p>Don't share this code with anyone.</p><p>Regards,</p><p>Vedic Health</p>`,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log('OTP sent successfully');
//     return { status: true, message: 'OTP sent successfully' };
//   } catch (error) {
//     console.error('Error sending OTP email:', error);
//     return { status: false, message: 'Failed to send OTP email.' };
//   }
// }

// /**
//  * Send new order notification email to admin.
//  */
// export async function sendNewOrderAdminEmail(
//   orderId: string,
//   userName: string,
//   userEmail: string,
//   amount: number,
//   paymentMode: string,
//   orderDateTime: string,
// ) {
//   const transporter = createTransporter();

//   const mailOptions: nodemailer.SendMailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: CONTACT_ENQUIRY_ADMIN_EMAIL,
//     subject: `New Order Received – Order #${orderId}`,
//     text: `Hello Admin,

// A new order has been placed on the Vedic Health platform.

// Order Details:
// - Order ID: ${orderId}
// - User Name: ${userName}
// - User Email: ${userEmail}
// - Total Amount: $${amount.toFixed(2)}
// - Payment Mode: ${paymentMode}
// - Order Date: ${orderDateTime}

// Please review the order details in the admin panel.

// Regards,

// Vedic Health System`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #333333; line-height: 1.6;">
//         <p style="font-size: 16px; margin-top: 0;">Hello Admin,</p>
//         <p>A new order has been placed on the <strong>Vedic Health</strong> platform.</p>
//         <div style="background: #f9f9f9; padding: 16px; border-radius: 6px; margin: 20px 0;">
//           <p style="margin: 6px 0;"><strong>Order Details:</strong></p>
//           <p style="margin: 6px 0;">Order ID: ${orderId}</p>
//           <p style="margin: 6px 0;">User Name: ${userName}</p>
//           <p style="margin: 6px 0;">User Email: ${userEmail}</p>
//           <p style="margin: 6px 0;">Total Amount: $${amount.toFixed(2)}</p>
//           <p style="margin: 6px 0;">Payment Mode: ${paymentMode}</p>
//           <p style="margin: 6px 0;">Order Date: ${orderDateTime}</p>
//         </div>
//         <p>Please review the order details in the admin panel.</p>
//         <p style="margin-top: 24px;">Regards,<br/><strong>Vedic Health System</strong></p>
//       </div>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`New order admin email sent for order #${orderId} to ${CONTACT_ENQUIRY_ADMIN_EMAIL}`);
//     return { status: true, message: 'New order admin email sent successfully' };
//   } catch (error) {
//     console.error('Error sending new order admin email:', error);
//     return { status: false, message: 'Failed to send new order admin email.' };
//   }
// }

// // Function to send OTP email
// export async function sendOtpForPassword(email: string, otp: string) {
//   const transporter = createTransporter();

//   const mailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: email,
//     subject: 'Your OTP Code',
//     text: `We received a request to reset your password.\n\nYour OTP code is: ${otp}\n\nPlease do not share this code with anyone.\n\nIf you did not request a password reset, please ignore this email.\n\nRegards,\nVedic Health`,
//     html: `
//       <p>We received a request to reset your password.</p>
//       <p>Your OTP code is: <strong>${otp}</strong></p>
//       <p>Please do not share this code with anyone.</p>
//       <p>If you did not request a password reset, please ignore this email.</p>
//       <p>Regards,<br/>Vedic Health</p>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log('OTP sent successfully');
//     return { status: true, message: 'OTP sent successfully' };
//   } catch (error) {
//     console.error('Error sending OTP email:', error);
//     return { status: false, message: 'Failed to send OTP email.' };
//   }
// }

// /**
//  * Send reset-password OTP email (when requestFor is "changePassword" in sendOtp).
//  */
// export async function sendResetPasswordOtpEmail(email: string, userName: string, otp: string) {
//   const transporter = createTransporter();

//   const displayName = userName && userName.trim() ? userName.trim() : 'there';

//   const mailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: email,
//     subject: 'Reset Your Vedic Health Password',
//     text: `Hi ${displayName},

// We received a request to reset your password. This is your one-time password: ${otp}

// If you didn't request this change, you can safely ignore this email.

// Best regards,

// Team Vedic Health`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #333333; line-height: 1.6;">
//         <p style="font-size: 16px; margin-top: 0;">Hi ${displayName},</p>
//         <p>We received a request to reset your password. This is your one-time password <strong>${otp}</strong>.</p>
//         <p>If you didn't request this change, you can safely ignore this email.</p>
//         <p style="margin-top: 24px;">Best regards,</p>
//         <p><strong>Team Vedic Health</strong></p>
//       </div>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log('Reset password OTP email sent successfully');
//     return { status: true, message: 'OTP sent successfully' };
//   } catch (error) {
//     console.error('Error sending reset password OTP email:', error);
//     return { status: false, message: 'Failed to send OTP email.' };
//   }
// }

// export async function sendLowStockEmail(
//   email: string,
//   productName: string,
//   currentStock: number,
//   threshold: number,
//   actionLink: string
// ) {
//   const transporter = createTransporter();
//   console.log()
//   const mailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: email,
//     subject: `Low Stock Alert: ${productName}`,
//     text: `⚠️ Low Stock Alert

// Product: ${productName}
// Current Stock: ${currentStock}


// Please take action to restock or update inventory.

// Action Link: ${actionLink}

// Regards,
// Vedic Health
//     `,
//     html: `
//       <h3>⚠️ Low Stock Alert</h3>
//       <p><strong>Product:</strong> ${productName}</p>
//       <p><strong>Current Stock:</strong> ${currentStock}</p>

//       <br/>
//       <a href="${actionLink}" 
//          style="display:inline-block;padding:10px 15px;background:#d9534f;color:#fff;text-decoration:none;border-radius:5px;">
//          Reorder / Update Stock
//       </a>
//       <br/><br/>
//       <p>Regards,</p>
//       <p>Vedic Health</p>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Low stock alert sent for ${productName}`);
//     return { status: true, message: 'Low stock alert sent successfully' };
//   } catch (error) {
//     console.error('Error sending low stock email:', error);
//     return { status: false, message: 'Failed to send low stock email.' };
//   }
// }

// // Function to send event ticket email
// export async function sendEventTicketEmail(
//   email: string,
//   eventName: string,
//   eventDate: string,
//   eventTime: string,
//   eventAddress: string,
//   ticketNumber: string,
//   quantity: number,
//   totalAmount: number,
//   qrCode?: string,
//   meetingLink?: string
// ) {
//   const transporter = createTransporter();

//   const mailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: email,
//     subject: `🎫 Your Event Ticket - ${eventName}`,
//     text: `🎫 EVENT TICKET CONFIRMATION

// Event: ${eventName}
// Date: ${eventDate}
// Time: ${eventTime}
// Address: ${eventAddress}
// Ticket Number: ${ticketNumber}
// Quantity: ${quantity}
// Total Amount: $${totalAmount}

// ${meetingLink ? `Online Meeting Link: ${meetingLink}` : ''}

// Thank you for your registration! Please bring this ticket to the event.

// Regards,
// Vedic Health Team`,
//     html: `
//   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">

//     <!-- Header -->
//     <div style="background: #2e7d32; color: #ffffff; padding: 20px; text-align: center;">
//       <h1 style="margin: 0; font-size: 24px;">Vedic Health 🌿</h1>
//     </div>

//     <!-- Body -->
//     <div style="padding: 25px; color: #333333; line-height: 1.6;">

//       <p style="font-size: 16px; margin-top: 0;">
//         Dear <strong>Participant</strong>,
//       </p>

//       <p>
//         Greetings from <strong>Vedic Health 🌿</strong>
//       </p>

//       <p>
//         We are pleased to announce a new upcoming event for our community.
//       </p>

//       <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
//         <p style="margin: 6px 0;"><strong>Event:</strong> ${eventName}</p>
//         <p style="margin: 6px 0;"><strong>Date:</strong> ${eventDate}</p>
//         <p style="margin: 6px 0;"><strong>Time:</strong> ${eventTime}</p>
//         <p style="margin: 6px 0;"><strong>Mode & Location:</strong> ${eventAddress}</p>
//         <p style="margin: 6px 0;"><strong>Ticket Number:</strong> ${ticketNumber}</p>
//         <p style="margin: 6px 0;"><strong>Quantity:</strong> ${quantity}</p>
//         <p style="margin: 6px 0;"><strong>Total Amount:</strong> $${totalAmount}</p>
//       </div>

//       ${meetingLink
//         ? `
//       <p>
//         Click below to join/view the event:
//       </p>

//       <div style="text-align: center; margin: 20px 0;">
//         <a 
//           href="${meetingLink}" 
//           target="_blank"
//           style="background: #2e7d32; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-size: 16px; display: inline-block;"
//         >
//           View Event Details
//         </a>
//       </div>
//       `
//         : ''
//       }

//       ${qrCode
//         ? `
//       <div style="text-align: center; margin: 25px 0;">
//         <p style="font-weight: bold;">Scan QR Code at the Event:</p>
//         <img src="${qrCode}" alt="QR Code" style="max-width: 150px; border: 1px solid #ddd; border-radius: 6px;" />
//       </div>
//       `
//         : ''
//       }

//       <p>
//         We look forward to your participation.
//       </p>

//       <p style="margin-top: 30px;">
//         Warm regards,<br/>
//         <strong>Team Vedic Health System</strong>
//       </p>

//     </div>

//     <!-- Footer -->
//     <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 13px; color: #666;">
//       <p style="margin: 5px 0;">
//         info@vedichealth.org
//       </p>
//     </div>

//   </div>
// `

//     //   html: `
//     //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//     //       <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
//     //         <h1 style="margin: 0; font-size: 28px;">🎫 EVENT TICKET</h1>
//     //         <p style="margin: 10px 0 0 0; font-size: 16px;">Your registration is confirmed!</p>
//     //       </div>

//     //       <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
//     //         <h2 style="color: #333; margin-bottom: 20px; text-align: center;">${eventName}</h2>

//     //         <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
//     //           <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
//     //             <strong>📅 Date:</strong>
//     //             <span>${eventDate}</span>
//     //           </div>
//     //           <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
//     //             <strong>🕐 Time:</strong>
//     //             <span>${eventTime}</span>
//     //           </div>
//     //           <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
//     //             <strong>📍 Location:</strong>
//     //             <span style="text-align: right; max-width: 250px;">${eventAddress}</span>
//     //           </div>
//     //           <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
//     //             <strong>🎫 Ticket Number:</strong>
//     //             <span style="font-family: monospace; background: #f8f9fa; padding: 2px 6px; border-radius: 3px;">${ticketNumber}</span>
//     //           </div>
//     //           <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
//     //             <strong>👥 Quantity:</strong>
//     //             <span>${quantity} ticket(s)</span>
//     //           </div>
//     //           <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-top: 1px solid #e9ecef; padding-top: 10px;">
//     //             <strong style="font-size: 18px;">💰 Total Amount:</strong>
//     //             <span style="font-size: 18px; color: #28a745; font-weight: bold;">$${totalAmount}</span>
//     //           </div>
//     //         </div>

//     //         ${meetingLink ? `
//     //         <div style="background: #eef7ff; border: 1px solid #cfe8ff; color: #084298; padding: 15px; border-radius: 8px; margin-top: 10px;">
//     //           <strong>🔗 Online Meeting Link:</strong>
//     //           <div style="margin-top: 8px;">
//     //             <a href="${meetingLink}" target="_blank" style="color:#0d6efd; word-break: break-all;">${meetingLink}</a>
//     //           </div>
//     //         </div>
//     //         ` : ''}

//     //         ${qrCode ? `
//     //         <div style="text-align: center; margin: 20px 0;">
//     //           <p style="margin-bottom: 10px; font-weight: bold;">Scan QR Code at Event:</p>
//     //           <img src="${qrCode}" alt="QR Code" style="max-width: 150px; border: 2px solid #ddd; border-radius: 8px;"/>
//     //         </div>
//     //         ` : ''}

//     //         <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin-top: 20px;">
//     //           <h4 style="margin: 0 0 10px 0;">📋 Important Instructions:</h4>
//     //           <ul style="margin: 0; padding-left: 20px;">
//     //             <li>Please bring this ticket (digital or printed) to the event</li>
//     //             <li>Arrive 15 minutes before the event starts</li>
//     //             <li>Contact us if you have any questions</li>
//     //           </ul>
//     //         </div>

//     //         <div style="text-align: center; margin-top: 30px;">
//     //           <p style="color: #666; font-size: 14px;">Thank you for your registration!</p>
//     //           <p style="color: #666; font-size: 14px;">We look forward to seeing you at the event.</p>
//     //         </div>
//     //       </div>

//     //       <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
//     //         <p>Regards,<br/>Vedic Health Team</p>
//     //         <p>For support, contact: info@vedichealth.org</p>
//     //       </div>
//     //     </div>
//     //   `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Event ticket sent successfully to ${email} for event: ${eventName}`);
//     return { status: true, message: 'Event ticket sent successfully' };
//   } catch (error) {
//     console.error('Error sending event ticket email:', error);
//     return { status: false, message: 'Failed to send event ticket email.' };
//   }
// }

// /**
//  * Send welcome email to user after successful registration.
//  * Logo path: set VEDIC_HEALTH_LOGO_PATH at top of this file (default: public/vedic-health-logo.png).
//  */
// export async function sendWelcomeEmail(email: string, userName: string) {
//   const transporter = createTransporter();

//   const displayName = userName && userName.trim() ? userName.trim() : 'there';
//   const hasLogo = fs.existsSync(VEDIC_HEALTH_LOGO_PATH);

//   const attachments: nodemailer.SendMailOptions['attachments'] = [];
//   if (hasLogo) {
//     attachments.push({
//       filename: 'vedic-health-logo.png',
//       content: fs.readFileSync(VEDIC_HEALTH_LOGO_PATH),
//       cid: 'vedic-health-logo',
//     });
//   }

//   const mailOptions: nodemailer.SendMailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: email,
//     subject: 'Welcome to Vedic Health – Your Wellness Journey Begins',
//     text: `Dear ${displayName},

// Welcome to Vedic Health! Your account has been successfully created.

// You can now explore our health products, book appointments, and join yoga sessions through the Vedic Health app.

// Wishing you good health,

// Team Vedic Health`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
//         ${hasLogo ? `<div style="text-align: center; padding: 24px 24px 16px;"><img src="cid:vedic-health-logo" alt="Vedic Health" style="max-width: 200px; height: auto;" /></div>` : ''}
//         <div style="padding: 24px; color: #333333; line-height: 1.6;">
//           <p style="font-size: 16px; margin-top: 0;">Dear ${displayName},</p>
//           <p>Welcome to <strong>Vedic Health</strong>! Your account has been successfully created.</p>
//           <p>You can now explore our health products, book appointments, and join yoga sessions through the Vedic Health app.</p>
//           <p style="margin-top: 24px;">Wishing you good health,</p>
//           <p><strong>Team Vedic Health</strong></p>
//         </div>
//         <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 13px; color: #666;">
//           <p style="margin: 5px 0;">info@vedichealth.org</p>
//         </div>
//       </div>
//     `,
//     attachments: attachments.length ? attachments : undefined,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Welcome email sent successfully to ${email}`);
//     return { status: true, message: 'Welcome email sent successfully' };
//   } catch (error) {
//     console.error('Error sending welcome email:', error);
//     return { status: false, message: 'Failed to send welcome email.' };
//   }
// }

// /**
//  * Send order confirmation email after order is successfully placed.
//  */
// export async function sendOrderConfirmationEmail(
//   email: string,
//   userName: string,
//   orderId: string,
//   productList: string,
//   total: number,
//   paymentMode: string,
// ) {
//   const transporter = createTransporter();

//   const displayName = userName && userName.trim() ? userName.trim() : 'Customer';
//   const hasLogo = fs.existsSync(VEDIC_HEALTH_LOGO_PATH);

//   const attachments: nodemailer.SendMailOptions['attachments'] = [];
//   if (hasLogo) {
//     attachments.push({
//       filename: 'vedic-health-logo.png',
//       content: fs.readFileSync(VEDIC_HEALTH_LOGO_PATH),
//       cid: 'vedic-health-logo',
//     });
//   }

//   const mailOptions: nodemailer.SendMailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: email,
//     subject: `Order #${orderId} Placed Successfully`,
//     text: `Dear ${displayName},

// Thank you for your order with Vedic Health! Your order #${orderId} has been placed successfully.

// We'll notify you once it's dispatched.

// Order Details:
// - Items: ${productList}
// - Total: $${total.toFixed(2)}
// - Payment Mode: ${paymentMode}

// Stay Healthy,

// Team Vedic Health`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
//         ${hasLogo ? `<div style="text-align: center; padding: 24px 24px 16px;"><img src="cid:vedic-health-logo" alt="Vedic Health" style="max-width: 200px; height: auto;" /></div>` : ''}
//         <div style="padding: 24px; color: #333333; line-height: 1.6;">
//           <p style="font-size: 16px; margin-top: 0;">Dear ${displayName},</p>
//           <p>Thank you for your order with <strong>Vedic Health</strong>! Your order <strong>#${orderId}</strong> has been placed successfully.</p>
//           <p>We'll notify you once it's dispatched.</p>
//           <div style="background: #f9f9f9; padding: 16px; border-radius: 6px; margin: 20px 0;">
//             <p style="margin: 6px 0;"><strong>Order Details:</strong></p>
//             <p style="margin: 6px 0;">Items: ${productList}</p>
//             <p style="margin: 6px 0;">Total: $${total.toFixed(2)}</p>
//             <p style="margin: 6px 0;">Payment Mode: ${paymentMode}</p>
//           </div>
//           <p style="margin-top: 24px;">Stay Healthy,</p>
//           <p><strong>Team Vedic Health</strong></p>
//         </div>
//         <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 13px; color: #666;">
//           <p style="margin: 5px 0;">info@vedichealth.org</p>
//         </div>
//       </div>
//     `,
//     attachments: attachments.length ? attachments : undefined,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Order confirmation email sent to ${email} for order #${orderId}`);
//     return { status: true, message: 'Order confirmation email sent successfully' };
//   } catch (error) {
//     console.error('Error sending order confirmation email:', error);
//     return { status: false, message: 'Failed to send order confirmation email.' };
//   }
// }

// /**
//  * Send payment success email to user after order payment is completed.
//  */
// export async function sendOrderPaymentSuccessEmail(
//   email: string,
//   userName: string,
//   orderId: string,
//   amount: number,
//   paymentMode: string,
// ) {
//   const transporter = createTransporter();

//   const displayName = userName && userName.trim() ? userName.trim() : 'Customer';
//   const hasLogo = fs.existsSync(VEDIC_HEALTH_LOGO_PATH);

//   const attachments: nodemailer.SendMailOptions['attachments'] = [];
//   if (hasLogo) {
//     attachments.push({
//       filename: 'vedic-health-logo.png',
//       content: fs.readFileSync(VEDIC_HEALTH_LOGO_PATH),
//       cid: 'vedic-health-logo',
//     });
//   }

//   const mailOptions: nodemailer.SendMailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: email,
//     subject: `Order #${orderId} Payment Successfully processed`,
//     text: `Dear ${displayName},

// Your payment for Order #${orderId} of $${amount.toFixed(2)} has been received successfully.

// We'll update you once your order is dispatched.

// Thank you for choosing Vedic Health!

// Team Vedic Health`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
//         ${hasLogo ? `<div style="text-align: center; padding: 24px 24px 16px;"><img src="cid:vedic-health-logo" alt="Vedic Health" style="max-width: 200px; height: auto;" /></div>` : ''}
//         <div style="padding: 24px; color: #333333; line-height: 1.6;">
//           <p style="font-size: 16px; margin-top: 0;">Dear ${displayName},</p>
//           <p>Your payment for Order <strong>#${orderId}</strong> of <strong>$${amount.toFixed(2)}</strong> has been received successfully.</p>
//           <p>We'll update you once your order is dispatched.</p>
//           <p style="margin-top: 24px;">Thank you for choosing <strong>Vedic Health</strong>!</p>
//           <p><strong>Team Vedic Health</strong></p>
//         </div>
//         <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 13px; color: #666;">
//           <p style="margin: 5px 0;">info@vedichealth.org</p>
//         </div>
//       </div>
//     `,
//     attachments: attachments.length ? attachments : undefined,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Order payment success email sent to ${email} for order #${orderId}`);
//     return { status: true, message: 'Order payment success email sent successfully' };
//   } catch (error) {
//     console.error('Error sending order payment success email:', error);
//     return { status: false, message: 'Failed to send order payment success email.' };
//   }
// }

// /**
//  * Send login success email when user successfully logs in.
//  */
// export async function sendLoginSuccessEmail(email: string, userName: string) {
//   const transporter = createTransporter();

//   const displayName = userName && userName.trim() ? userName.trim() : 'there';
//   const hasLogo = fs.existsSync(VEDIC_HEALTH_LOGO_PATH);

//   const attachments: nodemailer.SendMailOptions['attachments'] = [];
//   if (hasLogo) {
//     attachments.push({
//       filename: 'vedic-health-logo.png',
//       content: fs.readFileSync(VEDIC_HEALTH_LOGO_PATH),
//       cid: 'vedic-health-logo',
//     });
//   }

//   const mailOptions: nodemailer.SendMailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: email,
//     subject: 'Login Successful – Vedic Health',
//     text: `Hello ${displayName},

// You have successfully logged into your Vedic Health account.

// If this wasn't you, please reset your password immediately.

// Regards,

// Team Vedic Health`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
//         ${hasLogo ? `<div style="text-align: center; padding: 24px 24px 16px;"><img src="cid:vedic-health-logo" alt="Vedic Health" style="max-width: 200px; height: auto;" /></div>` : ''}
//         <div style="padding: 24px; color: #333333; line-height: 1.6;">
//           <p style="font-size: 16px; margin-top: 0;">Hello ${displayName},</p>
//           <p>You have successfully logged into your <strong>Vedic Health</strong> account.</p>
//           <p>If this wasn't you, please reset your password immediately.</p>
//           <p style="margin-top: 24px;">Regards,</p>
//           <p><strong>Team Vedic Health</strong></p>
//         </div>
//         <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 13px; color: #666;">
//           <p style="margin: 5px 0;">info@vedichealth.org</p>
//         </div>
//       </div>
//     `,
//     attachments: attachments.length ? attachments : undefined,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Login success email sent to ${email}`);
//     return { status: true, message: 'Login success email sent successfully' };
//   } catch (error) {
//     console.error('Error sending login success email:', error);
//     return { status: false, message: 'Failed to send login success email.' };
//   }
// }

// /**
//  * Send appointment confirmation email when user successfully books an appointment.
//  * mode: "Online" or "In-Person"; venueOrLink: online meeting link or site address.
//  */
// export async function sendAppointmentConfirmationEmail(
//   email: string,
//   userName: string,
//   practitionerName: string,
//   dateStr: string,
//   timeStr: string,
//   mode: string,
//   venueOrLink: string,
// ) {
//   const transporter = createTransporter();

//   const displayName = userName && userName.trim() ? userName.trim() : 'there';
//   const hasLogo = fs.existsSync(VEDIC_HEALTH_LOGO_PATH);

//   const attachments: nodemailer.SendMailOptions['attachments'] = [];
//   if (hasLogo) {
//     attachments.push({
//       filename: 'vedic-health-logo.png',
//       content: fs.readFileSync(VEDIC_HEALTH_LOGO_PATH),
//       cid: 'vedic-health-logo',
//     });
//   }

//   const sectionLabel = mode === 'Online' ? 'Online Link' : 'Site Address';

//   const mailOptions: nodemailer.SendMailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: email,
//     subject: 'Appointment Scheduled Successfully',
//     text: `Dear ${displayName},

// Your appointment with ${practitionerName} has been scheduled successfully.

// Appointment Details:
// - Date: ${dateStr}
// - Time: ${timeStr}
// - Mode: ${mode}

// ${sectionLabel}
// ${venueOrLink}

// Please be available 5 minutes before your scheduled time.

// Warm regards,

// Team Vedic Health`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
//         ${hasLogo ? `<div style="text-align: center; padding: 24px 24px 16px;"><img src="cid:vedic-health-logo" alt="Vedic Health" style="max-width: 200px; height: auto;" /></div>` : ''}
//         <div style="padding: 24px; color: #333333; line-height: 1.6;">
//           <p style="font-size: 16px; margin-top: 0;">Dear ${displayName},</p>
//           <p>Your appointment with <strong>${practitionerName}</strong> has been scheduled successfully.</p>
//           <div style="background: #f9f9f9; padding: 16px; border-radius: 6px; margin: 20px 0;">
//             <p style="margin: 6px 0;"><strong>Appointment Details:</strong></p>
//             <p style="margin: 6px 0;">Date: ${dateStr}</p>
//             <p style="margin: 6px 0;">Time: ${timeStr}</p>
//             <p style="margin: 6px 0;">Mode: ${mode}</p>
//             <p style="margin: 6px 0;"><strong>${sectionLabel}</strong></p>
//             <p style="margin: 6px 0;">${venueOrLink}</p>
//           </div>
//           <p>Please be available 5 minutes before your scheduled time.</p>
//           <p style="margin-top: 24px;">Warm regards,</p>
//           <p><strong>Team Vedic Health</strong></p>
//         </div>
//         <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 13px; color: #666;">
//           <p style="margin: 5px 0;">info@vedichealth.org</p>
//         </div>
//       </div>
//     `,
//     attachments: attachments.length ? attachments : undefined,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Appointment confirmation email sent to ${email}`);
//     return { status: true, message: 'Appointment confirmation email sent successfully' };
//   } catch (error) {
//     console.error('Error sending appointment confirmation email:', error);
//     return { status: false, message: 'Failed to send appointment confirmation email.' };
//   }
// }

// /**
//  * Send event registration confirmation email (in addition to ticket email).
//  */
// export async function sendEventRegistrationConfirmedEmail(
//   email: string,
//   userName: string,
//   eventName: string,
//   dateStr: string,
//   timeStr: string,
//   venueOrLink: string,
// ) {
//   const transporter = createTransporter();

//   const displayName = userName && userName.trim() ? userName.trim() : 'there';
//   const hasLogo = fs.existsSync(VEDIC_HEALTH_LOGO_PATH);

//   const attachments: nodemailer.SendMailOptions['attachments'] = [];
//   if (hasLogo) {
//     attachments.push({
//       filename: 'vedic-health-logo.png',
//       content: fs.readFileSync(VEDIC_HEALTH_LOGO_PATH),
//       cid: 'vedic-health-logo',
//     });
//   }

//   const mailOptions: nodemailer.SendMailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: email,
//     subject: `Event Registration Confirmed – ${eventName}`,
//     text: `Hello ${displayName},

// Your registration for ${eventName} has been confirmed.

// Event Details:
// - Date: ${dateStr}
// - Time: ${timeStr}
// - Venue: ${venueOrLink}

// We look forward to your participation!

// Team Vedic Health`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
//         ${hasLogo ? `<div style="text-align: center; padding: 24px 24px 16px;"><img src="cid:vedic-health-logo" alt="Vedic Health" style="max-width: 200px; height: auto;" /></div>` : ''}
//         <div style="padding: 24px; color: #333333; line-height: 1.6;">
//           <p style="font-size: 16px; margin-top: 0;">Hello ${displayName},</p>
//           <p>Your registration for <strong>${eventName}</strong> has been confirmed.</p>
//           <div style="background: #f9f9f9; padding: 16px; border-radius: 6px; margin: 20px 0;">
//             <p style="margin: 6px 0;"><strong>Event Details:</strong></p>
//             <p style="margin: 6px 0;">Date: ${dateStr}</p>
//             <p style="margin: 6px 0;">Time: ${timeStr}</p>
//             <p style="margin: 6px 0;">Venue: ${venueOrLink}</p>
//           </div>
//           <p>We look forward to your participation!</p>
//           <p style="margin-top: 24px;">Team Vedic Health</p>
//         </div>
//         <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 13px; color: #666;">
//           <p style="margin: 5px 0;">info@vedichealth.org</p>
//         </div>
//       </div>
//     `,
//     attachments: attachments.length ? attachments : undefined,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Event registration confirmation email sent to ${email}`);
//     return { status: true, message: 'Event registration confirmation email sent successfully' };
//   } catch (error) {
//     console.error('Error sending event registration confirmation email:', error);
//     return { status: false, message: 'Failed to send event registration confirmation email.' };
//   }
// }

// /** Admin email for contact/enquiry form notifications */
// const CONTACT_ENQUIRY_ADMIN_EMAIL = 'info@vedichealth.org';

// /**
//  * Send admin notification when a new contact/enquiry form is submitted.
//  * Recipient: admin (govindshringi12@gmail.com). Body includes submitter name, email, phone.
//  */
// export async function sendContactEnquiryAdminEmail(
//   userName: string,
//   userEmail: string,
//   userPhone: string,
// ) {
//   const transporter = createTransporter();

//   const mailOptions: nodemailer.SendMailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: CONTACT_ENQUIRY_ADMIN_EMAIL,
//     subject: 'New Contact Enquiry Received – Vedic Health',
//     text: `Dear Admin,

// A new query has been submitted via the Contact Us form.

// Enquiry Details:
// - Name: ${userName}
// - Email: ${userEmail}
// - Phone: ${userPhone}

// Team Vedic Health`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #333333; line-height: 1.6;">
//         <p style="font-size: 16px; margin-top: 0;">Dear Admin,</p>
//         <p>A new query has been submitted via the Contact Us form.</p>
//         <div style="background: #f9f9f9; padding: 16px; border-radius: 6px; margin: 20px 0;">
//           <p style="margin: 6px 0;"><strong>Enquiry Details:</strong></p>
//           <p style="margin: 6px 0;">Name: ${userName}</p>
//           <p style="margin: 6px 0;">Email: ${userEmail}</p>
//           <p style="margin: 6px 0;">Phone: ${userPhone}</p>
//         </div>
//         <p style="margin-top: 24px;">Team Vedic Health</p>
//       </div>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Contact enquiry admin email sent to ${CONTACT_ENQUIRY_ADMIN_EMAIL}`);
//     return { status: true, message: 'Admin notification sent successfully' };
//   } catch (error) {
//     console.error('Error sending contact enquiry admin email:', error);
//     return { status: false, message: 'Failed to send admin notification.' };
//   }
// }

// /**
//  * Send confirmation email to the user who submitted the contact/enquiry form.
//  */
// export async function sendContactEnquiryUserConfirmationEmail(
//   userEmail: string,
//   userName: string,
// ) {
//   const transporter = createTransporter();

//   const displayName = userName && userName.trim() ? userName.trim() : 'there';

//   const mailOptions: nodemailer.SendMailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: userEmail,
//     subject: 'We Received Your Enquiry – Vedic Health',
//     text: `Dear ${displayName},

// Thank you for contacting Vedic Health. We have received your enquiry and will get back to you shortly.

// Best regards,
// Team Vedic Health`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #333333; line-height: 1.6;">
//         <p style="font-size: 16px; margin-top: 0;">Dear ${displayName},</p>
//         <p>Thank you for contacting <strong>Vedic Health</strong>. We have received your enquiry and will get back to you shortly.</p>
//         <p style="margin-top: 24px;">Best regards,<br/><strong>Team Vedic Health</strong></p>
//       </div>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Contact enquiry confirmation sent to user: ${userEmail}`);
//     return { status: true, message: 'User confirmation sent successfully' };
//   } catch (error) {
//     console.error('Error sending contact enquiry user confirmation:', error);
//     return { status: false, message: 'Failed to send user confirmation.' };
//   }
// }

// /**
//  * Send confirmation email to the admin on succesfull event registration by the user.
//  */
// export async function sendNewEventRegistrationAdminEmail(
//   eventName: string,
//   userName: string,
//   userEmail: string,
//   registrationDateTime: string,
// ) {
//   const transporter = createTransporter();

//   // Reuse existing constant (already set to govindshringi12@gmail.com)
//   const adminEmail = CONTACT_ENQUIRY_ADMIN_EMAIL;

//   const mailOptions: nodemailer.SendMailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: adminEmail,
//     subject: `New Event Registration – ${eventName}`,
//     text: `Hello Admin,

// A new user has registered for the event ${eventName}.

// Registration Details:
// - Event Name: ${eventName}
// - User Name: ${userName}
// - User Email: ${userEmail}
// - Registration Date: ${registrationDateTime}

// Please confirm the registration in the admin dashboard.

// Best regards,
// Vedic Health System
// `,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #333; line-height: 1.6;">
//         <p>Hello Admin,</p>
//         <p>A new user has registered for the event <strong>${eventName}</strong>.</p>

//         <div style="background:#f9f9f9;padding:16px;border-radius:6px;margin:16px 0;">
//           <p style="margin:6px 0;"><strong>Registration Details:</strong></p>
//           <p style="margin:6px 0;">- Event Name: ${eventName}</p>
//           <p style="margin:6px 0;">- User Name: ${userName}</p>
//           <p style="margin:6px 0;">- User Email: ${userEmail}</p>
//           <p style="margin:6px 0;">- Registration Date: ${registrationDateTime}</p>
//         </div>

//         <p>Please confirm the registration in the admin dashboard.</p>
//         <p style="margin-top: 24px;">Best regards,<br/><strong>Vedic Health System</strong></p>
//       </div>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Admin event registration email sent to ${adminEmail} for event: ${eventName}`);
//     return { status: true, message: 'Admin registration notification sent' };
//   } catch (error) {
//     console.error('Error sending admin event registration email:', error);
//     return { status: false, message: 'Failed to send admin registration notification.' };
//   }
// }

// // Send email for pickup date update due to product unavailability

// export async function sendPickupDateUpdateEmail(email: string, newPickupDate: string) {
//   const transporter = createTransporter();

//   const mailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: email,
//     subject: 'Update on Your Pickup Schedule',
//     text: `Hello,

//             We regret to inform you that due to the unavailability of the product, your pickup date has been rescheduled by our team.

//             New Pickup Date: ${newPickupDate}

//             We apologize for any inconvenience caused and appreciate your understanding.

//             For any queries, please feel free to contact us.

//             Regards,  
//             Vedic Health Team`,

//     html: `
//       <p>Hello,</p>
//       <p>We regret to inform you that due to the <strong>unavailability of the product</strong>, your pickup date has been rescheduled by our team.</p>

//       <p><strong>New Pickup Date:</strong> ${newPickupDate}</p>

//       <p>We apologize for any inconvenience caused and appreciate your understanding.</p>

//       <p>If you have any questions, please feel free to contact us.</p>

//       <br/>
//       <p>Regards,</p>
//       <p>Vedic Health Team</p>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log('Pickup update email sent successfully');
//     return { status: true, message: 'Pickup update email sent successfully' };
//   } catch (error) {
//     console.error('Error sending pickup update email:', error);
//     return { status: false, message: 'Failed to send pickup update email.' };
//   }
// }


// nodemailer.controller.ts
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';
import * as pdf from 'html-pdf-node';
import { generateInvoicePdfBuffer } from './invoice.util';

console.log('Nodemailer module loaded successfully');

/** Replace this path with your Vedic Health logo file location */
const VEDIC_HEALTH_LOGO_PATH = path.join(process.cwd(), 'public', 'vedic-health-logo.png');
console.log(VEDIC_HEALTH_LOGO_PATH, "VEDIC_HEALTH_LOGO_PATH")

/** Admin email for contact/enquiry form notifications */
const CONTACT_ENQUIRY_ADMIN_EMAIL = 'info@vedichealth.org';

// ─────────────────────────────────────────────────────────────────────────────
// SHARED TEMPLATE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the inline CSS + full HTML email shell.
 * @param preheaderText  Short preview text (hidden from body, shown in inbox)
 * @param bodyContent    Inner HTML for the body section (greeting + content + closing)
 * @param hasLogo        Whether to embed the logo via cid
 */
function buildEmailHtml(preheaderText: string, bodyContent: string, hasLogo: boolean): string {
  const logoSrc = hasLogo ? 'cid:vedic-health-logo' : '';
  const logoHeader = hasLogo
    ? `<img style="display:block;width:190px;max-width:100%;height:auto;" src="${logoSrc}" alt="Vedic Health" />`
    : `<span style="font-size:22px;font-weight:800;color:#7a3a14;font-family:'Poppins',Arial,sans-serif;">Vedic Health</span>`;
  const logoFooter = hasLogo
    ? `<img style="display:block;width:170px;max-width:100%;height:auto;margin-bottom:12px;" src="${logoSrc}" alt="Vedic Health" />`
    : `<span style="font-size:18px;font-weight:800;color:#7a3a14;font-family:'Poppins',Arial,sans-serif;">Vedic Health</span>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Vedic Health</title>
</head>
<body style="margin:0;padding:0;background-color:#f0ede8;font-family:'Poppins',Arial,sans-serif;font-size:14px;color:#303030;-webkit-font-smoothing:antialiased;line-height:1.6;">

  <!-- Preheader -->
  <div style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">${preheaderText}</div>

  <!-- Wrapper -->
  <div style="max-width:620px;margin:36px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 24px rgba(102,42,9,0.10);font-family:'Poppins',Arial,sans-serif;">

    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#fff2e5 0%,#f7deca 55%,#f2d2b7 100%);padding:22px 40px 18px;border-bottom:1px solid #efc9a8;position:relative;overflow:hidden;">
      <div style="position:relative;z-index:2;">
        ${logoHeader}
      </div>
      <div style="margin-top:6px;font-size:11px;font-weight:500;color:#8f4a1e;letter-spacing:0.4px;font-family:'Poppins',Arial,sans-serif;">Ancient Wisdom for Natural Healing</div>
    </div>
    <!-- Header accent line -->
    <div style="height:3px;background:linear-gradient(90deg,#f38328,#f4c46a,#f38328);"></div>

    <!-- BODY -->
    <div style="padding:30px 44px 20px;background:#ffffff;font-family:'Poppins',Arial,sans-serif;">
      ${bodyContent}
    </div>

    <!-- ORNAMENT DIVIDER -->
    <div style="text-align:center;padding:8px 52px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="width:45%;height:1px;background:linear-gradient(90deg,transparent,#c8944a,transparent);"></td>
          <td style="width:10%;text-align:center;padding:0 8px;color:#c8944a;font-size:18px;line-height:1;">✦</td>
          <td style="width:45%;height:1px;background:linear-gradient(90deg,transparent,#c8944a,transparent);"></td>
        </tr>
      </table>
    </div>

    <!-- FOOTER -->
    <div style="background:#fff2e7;padding:24px 44px;font-family:'Poppins',Arial,sans-serif;border-top:1px solid #efc9a8;">
      ${logoFooter}
      <div style="font-size:12px;color:#84431d;line-height:1.9;font-family:'Poppins',Arial,sans-serif;margin-bottom:10px;">
        15235 Shady Grove Rd, Suite 100, Rockville, MD 20850<br/>
        <a href="mailto:info@vedichealth.org" style="color:#f38328;text-decoration:none;font-family:'Poppins',Arial,sans-serif;">info@vedichealth.org</a>
        &nbsp;·&nbsp; 240-753-0151
      </div>
      <div style="font-size:10.5px;color:#a15e35;letter-spacing:0.3px;font-family:'Poppins',Arial,sans-serif;">
        © 2026 Vedic Health Inc. All Rights Reserved.
      </div>
    </div>

  </div>
</body>
</html>`;
}

/**
 * Wraps content in the standard greeting + salutation-line + closing block.
 */
function buildBodyContent(displayName: string, paragraphs: string, closingLine: string = 'With warm regards,'): string {
  return `
    <div style="font-size:20px;font-weight:700;color:#7a3a14;margin-bottom:4px;font-family:'Poppins',Arial,sans-serif;">Hello ${displayName},</div>
    <div style="width:40px;height:2px;background:#f38328;margin-bottom:20px;border-radius:2px;"></div>
    ${paragraphs}
    <div style="margin-top:30px;font-size:14px;color:#555555;font-family:'Poppins',Arial,sans-serif;">
      ${closingLine}
      <div style="font-size:15px;font-weight:700;color:#7a3a14;margin-top:4px;font-family:'Poppins',Arial,sans-serif;">Team Vedic Health</div>
    </div>
  `;
}

/** Renders a styled info-box / detail card. */
function infoBox(rows: string): string {
  return `
    <div style="background:#fff8f2;border:1px solid #f0d4b8;border-radius:6px;padding:16px 20px;margin:20px 0;font-family:'Poppins',Arial,sans-serif;">
      ${rows}
    </div>
  `;
}

/** Single row inside an info box. */
function infoRow(label: string, value: string): string {
  return `<p style="margin:6px 0;font-size:14px;color:#303030;font-family:'Poppins',Arial,sans-serif;"><strong style="color:#7a3a14;">${label}:</strong> ${value}</p>`;
}

/** Standard body paragraph. */
function p(text: string): string {
  return `<p style="font-size:14px;font-weight:400;color:#303030;line-height:1.8;margin-bottom:14px;font-family:'Poppins',Arial,sans-serif;">${text}</p>`;
}

/** A styled CTA button. */
function ctaButton(href: string, label: string): string {
  return `
    <div style="text-align:center;margin:24px 0;">
      <a href="${href}" target="_blank"
         style="display:inline-block;padding:12px 30px;background:linear-gradient(135deg,#f38328,#e06b10);color:#ffffff;text-decoration:none;border-radius:6px;font-size:15px;font-weight:700;letter-spacing:0.3px;font-family:'Poppins',Arial,sans-serif;">
        ${label}
      </a>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSPORTER
// ─────────────────────────────────────────────────────────────────────────────

export function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'info@vedichealth.org',
      pass: 'pqba ytmf ryaa vbkm',//'iwyn jjtp vdmc xlfr',
    },
    connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  });
  // return nodemailer.createTransport({
  //   host: "smtp.gmail.com",
  //   port: 465,
  //   secure: true, // ✅ SSL (important)
  //   auth: {
  //     user: "info@vedichealth.org", // ✅ correct email
  //     pass: "iwyn jjtp vdmc xlfr",    // ❗ use Gmail App Password (no spaces)
  //   },
  //   pool: true,               // ✅ reuse connections
  //   maxConnections: 3,
  //   maxMessages: 50,
  //   connectionTimeout: 15000, // ✅ prevent hanging
  //   greetingTimeout: 15000,
  //   socketTimeout: 15000,
  // });
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGO ATTACHMENT HELPER
// ─────────────────────────────────────────────────────────────────────────────

function getLogoAttachment(): { hasLogo: boolean; attachments: nodemailer.SendMailOptions['attachments'] } {
  const hasLogo = fs.existsSync(VEDIC_HEALTH_LOGO_PATH);
  const attachments: nodemailer.SendMailOptions['attachments'] = [];
  if (hasLogo) {
    attachments.push({
      filename: 'vedic-health-logo.png',
      content: fs.readFileSync(VEDIC_HEALTH_LOGO_PATH),
      cid: 'vedic-health-logo',
    });
  }
  return { hasLogo, attachments };
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Send OTP (registration / login verification) */
export async function sendOtpEmail(email: string, otp: string) {
  const transporter = createTransporter();

  const bodyContent = buildBodyContent(
    'there',
    `
      ${p('We received a request to verify your identity on <strong>Vedic Health</strong>. Use the one-time password below to complete your verification.')}
      ${infoBox(`
        <p style="text-align:center;font-size:32px;font-weight:800;color:#f38328;letter-spacing:8px;margin:10px 0;font-family:'Poppins',Arial,sans-serif;">${otp}</p>
        <p style="text-align:center;font-size:12px;color:#84431d;margin:0;font-family:'Poppins',Arial,sans-serif;">This OTP is valid for a limited time. Do not share it with anyone.</p>
      `)}
      ${p('If you did not initiate this request, please ignore this email or contact our support team immediately.')}
    `,
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: 'Your Vedic Health OTP Code',
    text: `Your OTP code is: ${otp}\n\nDon't share this code with anyone.\n\nRegards,\nVedic Health`,
    html: buildEmailHtml('Your one-time password for Vedic Health verification.', bodyContent, false),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP sent successfully');
    return { status: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { status: false, message: 'Failed to send OTP email.' };
  }
}

/** Send OTP for password reset (legacy function) */
export async function sendOtpForPassword(email: string, otp: string) {
  const transporter = createTransporter();

  const bodyContent = buildBodyContent(
    'there',
    `
      ${p('We received a request to reset your <strong>Vedic Health</strong> account password. Use the OTP below to proceed.')}
      ${infoBox(`
        <p style="text-align:center;font-size:32px;font-weight:800;color:#f38328;letter-spacing:8px;margin:10px 0;font-family:'Poppins',Arial,sans-serif;">${otp}</p>
        <p style="text-align:center;font-size:12px;color:#84431d;margin:0;font-family:'Poppins',Arial,sans-serif;">Do not share this code with anyone.</p>
      `)}
      ${p('If you did not request a password reset, please ignore this email. Your account remains secure.')}
    `,
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: 'Your OTP Code – Vedic Health',
    text: `We received a request to reset your password.\n\nYour OTP code is: ${otp}\n\nPlease do not share this code with anyone.\n\nIf you did not request a password reset, please ignore this email.\n\nRegards,\nVedic Health`,
    html: buildEmailHtml('Password reset OTP for your Vedic Health account.', bodyContent, false),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP sent successfully');
    return { status: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { status: false, message: 'Failed to send OTP email.' };
  }
}

/** Send reset-password OTP email */
export async function sendResetPasswordOtpEmail(email: string, userName: string, otp: string) {
  const transporter = createTransporter();
  const displayName = userName && userName.trim() ? userName.trim() : 'there';

  const bodyContent = buildBodyContent(
    displayName,
    `
      ${p('We received a request to reset your <strong>Vedic Health</strong> account password. Use the one-time password below to proceed with the reset.')}
      ${infoBox(`
        <p style="text-align:center;font-size:32px;font-weight:800;color:#f38328;letter-spacing:8px;margin:10px 0;font-family:'Poppins',Arial,sans-serif;">${otp}</p>
        <p style="text-align:center;font-size:12px;color:#84431d;margin:0;font-family:'Poppins',Arial,sans-serif;">This is your one-time password. Do not share it with anyone.</p>
      `)}
      ${p("If you didn't request this change, you can safely ignore this email. Your account remains secure.")}
    `,
    'Best regards,',
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: 'Reset Your Vedic Health Password',
    text: `Hi ${displayName},\n\nWe received a request to reset your password. This is your one-time password: ${otp}\n\nIf you didn't request this change, you can safely ignore this email.\n\nBest regards,\nTeam Vedic Health`,
    html: buildEmailHtml('Reset your Vedic Health account password using this OTP.', bodyContent, false),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Reset password OTP email sent successfully');
    return { status: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Error sending reset password OTP email:', error);
    return { status: false, message: 'Failed to send OTP email.' };
  }
}

/** Send welcome email after registration */
export async function sendWelcomeEmail(email: string, userName: string) {
  const transporter = createTransporter();
  const displayName = userName && userName.trim() ? userName.trim() : 'there';
  const { hasLogo, attachments } = getLogoAttachment();

  const bodyContent = buildBodyContent(
    displayName,
    `
      ${p('Welcome to <strong>Vedic Health</strong>! Your account has been successfully created and we are thrilled to have you as part of our wellness community.')}
      ${p('You can now explore our health products, book appointments with trusted practitioners, and join rejuvenating yoga sessions — all through the Vedic Health app.')}
      ${p('Our mission is to bring the timeless wisdom of Ayurveda and natural healing to your everyday life. We are here to support you every step of the way.')}
    `,
    'Wishing you good health,',
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: 'Welcome to Vedic Health – Your Wellness Journey Begins',
    text: `Dear ${displayName},\n\nWelcome to Vedic Health! Your account has been successfully created.\n\nYou can now explore our health products, book appointments, and join yoga sessions through the Vedic Health app.\n\nWishing you good health,\n\nTeam Vedic Health`,
    html: buildEmailHtml('Welcome to Vedic Health – your wellness journey starts now.', bodyContent, hasLogo),
    attachments: attachments.length ? attachments : undefined,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent successfully to ${email}`);
    return { status: true, message: 'Welcome email sent successfully' };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { status: false, message: 'Failed to send welcome email.' };
  }
}

/** Send login success notification */
export async function sendLoginSuccessEmail(email: string, userName: string) {
  const transporter = createTransporter();
  const displayName = userName && userName.trim() ? userName.trim() : 'there';
  const { hasLogo, attachments } = getLogoAttachment();

  const bodyContent = buildBodyContent(
    displayName,
    `
      ${p('You have successfully logged into your <strong>Vedic Health</strong> account. We are glad to have you with us on this journey toward holistic well-being.')}
      ${p('Your wellness is our highest priority. Should you ever need assistance or have questions about your account, our team is always here to help.')}
      ${p('If this login was not made by you, please <strong>reset your password immediately</strong> to keep your account secure.')}
    `,
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: 'Login Successful – Vedic Health',
    text: `Hello ${displayName},\n\nYou have successfully logged into your Vedic Health account.\n\nIf this wasn't you, please reset your password immediately.\n\nRegards,\n\nTeam Vedic Health`,
    html: buildEmailHtml('Security alert: new login detected on your Vedic Health account.', bodyContent, hasLogo),
    attachments: attachments.length ? attachments : undefined,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Login success email sent to ${email}`);
    return { status: true, message: 'Login success email sent successfully' };
  } catch (error) {
    console.error('Error sending login success email:', error);
    return { status: false, message: 'Failed to send login success email.' };
  }
}

/** Send order confirmation email */
// export async function sendOrderConfirmationEmail(
//   email: string,
//   userName: string,
//   orderId: string,
//   productList: string,
//   total: number,
//   paymentMode: string,
//   orderFullData: any,
//   footerData: any
// ) {
//   // ✅ Generate PDF
//   const pdfBuffer = await generateInvoicePdfBuffer(orderFullData, footerData);
//   const transporter = createTransporter();
//   const displayName = userName && userName.trim() ? userName.trim() : 'Customer';
//   const { hasLogo, attachments } = getLogoAttachment();

//   const bodyContent = buildBodyContent(
//     displayName,
//     `
//       ${p(`Thank you for your order with <strong>Vedic Health</strong>! Your order <strong>#${orderId}</strong> has been placed successfully.`)}
//       ${p("We'll notify you once your order has been dispatched. Your products are being prepared with care.")}
//       ${infoBox(`
//         ${infoRow('Order ID', `#Ved${orderId}`)}
//         ${infoRow('Items', productList)}
//         ${infoRow('Total Amount', `$${total.toFixed(2)}`)}
//         ${infoRow('Payment Mode', paymentMode)}
//       `)}
//     `,
//     'Stay Healthy,',
//   );

//   const mailOptions: nodemailer.SendMailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: email,
//     subject: `Order #Ved${orderId} Placed Successfully – Vedic Health`,
//     text: `Dear ${displayName},\n\nThank you for your order with Vedic Health! Your order #Ved${orderId} has been placed successfully.\n\nWe'll notify you once it's dispatched.\n\nOrder Details:\n- Items: ${productList}\n- Total: $${total.toFixed(2)}\n- Payment Mode: ${paymentMode}\n\nStay Healthy,\n\nTeam Vedic Health`,
//     html: buildEmailHtml(`Your Vedic Health order #Ved${orderId} has been placed successfully.`, bodyContent, hasLogo),
//     // attachments: attachments.length ? attachments : undefined,
//     // ✅ ATTACHMENTS (logo + PDF)
//     attachments: [
//       ...attachments, // logo
//       {
//         filename: `Invoice-Ved${orderId}.pdf`,
//         content: pdfBuffer,
//         contentType: "application/pdf",
//       },
//     ],
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Order confirmation email sent to ${email} for order #Ved${orderId}`);
//     return { status: true, message: 'Order confirmation email sent successfully' };
//   } catch (error) {
//     console.error('Error sending order confirmation email:', error);
//     return { status: false, message: 'Failed to send order confirmation email.' };
//   }
// }
export async function sendOrderConfirmationEmail(
  email: string,
  userName: string,
  orderId: string,
  productList: any[],
  total: number,
  paymentMode: string,
  orderFullData: any,
  footerData: any
) {
  // ✅ Generate PDF
  const pdfBuffer = await generateInvoicePdfBuffer(orderFullData, footerData);

  const transporter = createTransporter();

  const displayName =
    userName && userName.trim()
      ? userName.trim()
      : "Customer";

  const { hasLogo, attachments } = getLogoAttachment();

  const orderData = orderFullData?.[0] || {};

  // ✅ Product rows
  const productsHtml = (productList || [])
    .map((item: any) => {
      const totalPrice =
        Number(item.productPrice || 0) *
        Number(item.quantity || 0);

      return `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            ${item.productName || ""}
          </td>

          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            $${Number(item.productPrice || 0).toFixed(2)}
          </td>

          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            ${item.quantity || 0}
          </td>

          <td style="padding:10px;border-bottom:1px solid #E5E5E5;font-weight:bold;">
            $${totalPrice.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join("");

  const shippingAddress = [
    orderData?.billingAddress1,
    orderData?.billingAddress2,
    orderData?.billingCity,
    orderData?.billingState,
    orderData?.billingZipcode,
    orderData?.billingCountry,
  ]
    .filter(Boolean)
    .join(", ");

  const bodyContent = `
  
    ${p(`
      Hello <strong>${displayName}</strong>,
    `)}

    ${p(`
      Great news! Your payment for Order 
      <strong>#${orderId}</strong> has been received and confirmed successfully 🎉
    `)}

    ${infoBox(`
      ${infoRow("Order ID", `#${orderId}`)}
      ${infoRow("Payment Status", `Payment Successful ✔`)}
      ${infoRow("Payment Mode", paymentMode)}
    `)}

    <div style="margin-top:25px;">
      <h3 style="margin-bottom:15px;color:#000;">
        Order Summary
      </h3>

      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <thead>
          <tr style="background:#F5F5F5;">
            <th style="padding:12px;text-align:left;">
              Product
            </th>

            <th style="padding:12px;text-align:left;">
              Price
            </th>

            <th style="padding:12px;text-align:left;">
              Qty
            </th>

            <th style="padding:12px;text-align:left;">
              Total
            </th>
          </tr>
        </thead>

        <tbody>
          ${productsHtml}
        </tbody>
      </table>
    </div>

    ${infoBox(`
      ${infoRow(
        "Subtotal",
        `$${Number(orderData?.totalAmount || 0).toFixed(2)}`
      )}

      ${infoRow(
        "Shipping",
        `$${Number(orderData?.deliveryCharge || 0).toFixed(2)}`
      )}

      ${infoRow(
        "Discount",
        `$${Number(orderData?.discountAmount || 0).toFixed(2)}`
      )}

      ${infoRow(
        "Total Amount Paid",
        `<strong>$${Number(total || 0).toFixed(2)}</strong>`
      )}

      ${infoRow(
        "Payment Processing Method",
        paymentMode
      )}

      ${infoRow(
        "Delivery Method",
        orderData?.pickupDate ? "Pickup" : "Shipping"
      )}
    `)}

    <div style="margin-top:25px;">
      <h3 style="margin-bottom:10px;color:#000;">
        Shipping Address
      </h3>

      <div style="
        background:#F9F9F9;
        padding:15px;
        border-radius:6px;
        font-size:14px;
        line-height:22px;
      ">
        <strong>${displayName}</strong><br/>
        ${shippingAddress}
      </div>
    </div>

    ${p(`
      We’ll update you once your order has been dispatched.
    `)}

    ${p(`
      Thank you for choosing <strong>Vedic Health</strong>!
    `)}
  `;

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: `Payment Confirmation for Order #${orderId}`,

    text: `
Hello ${displayName},

Your payment for Order #${orderId} has been received successfully.

Payment Status: Payment Successful
Payment Mode: ${paymentMode}

Total Amount Paid: $${Number(total).toFixed(2)}

Thank you for choosing Vedic Health.

Team Vedic Health
`,

    html: buildEmailHtml(
      `Payment Confirmation for Order #${orderId}`,
      bodyContent,
      hasLogo
    ),

    attachments: [
      ...attachments,
      {
        filename: `Invoice-${orderId}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);

    console.log(
      `Payment confirmation email sent to ${email}`
    );

    return {
      status: true,
      message: "Payment confirmation email sent successfully",
    };
  } catch (error) {
    console.error(
      "Error sending payment confirmation email:",
      error
    );

    return {
      status: false,
      message: "Failed to send payment confirmation email.",
    };
  }
}

/** Send payment success email */
export async function sendOrderPaymentSuccessEmail(
  email: string,
  userName: string,
  orderId: string,
  amount: number,
  paymentMode: string,
) {
  const transporter = createTransporter();
  const displayName = userName && userName.trim() ? userName.trim() : 'Customer';
  const { hasLogo, attachments } = getLogoAttachment();

  const bodyContent = buildBodyContent(
    displayName,
    `
      ${p(`Great news! Your payment for Order <strong>#${orderId}</strong> of <strong>$${amount.toFixed(2)}</strong> has been received and confirmed.`)}
      ${infoBox(`
        ${infoRow('Order ID', `#${orderId}`)}
        ${infoRow('Amount Paid', `$${amount.toFixed(2)}`)}
        ${infoRow('Payment Mode', paymentMode)}
        ${infoRow('Status', '<span style="color:#2e7d32;font-weight:700;">Payment Successful ✔</span>')}
      `)}
      ${p("We'll update you once your order is dispatched. Thank you for choosing <strong>Vedic Health</strong>!")}
    `,
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: `Order #${orderId} Payment Successfully Processed – Vedic Health`,
    text: `Dear ${displayName},\n\nYour payment for Order #${orderId} of $${amount.toFixed(2)} has been received successfully.\n\nWe'll update you once your order is dispatched.\n\nThank you for choosing Vedic Health!\n\nTeam Vedic Health`,
    html: buildEmailHtml(`Payment confirmed for your Vedic Health order #${orderId}.`, bodyContent, hasLogo),
    attachments: attachments.length ? attachments : undefined,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order payment success email sent to ${email} for order #${orderId}`);
    return { status: true, message: 'Order payment success email sent successfully' };
  } catch (error) {
    console.error('Error sending order payment success email:', error);
    return { status: false, message: 'Failed to send order payment success email.' };
  }
}

/** Send new order admin notification */
// export async function sendNewOrderAdminEmail(
//   orderId: string,
//   userName: string,
//   userEmail: string,
//   amount: number,
//   paymentMode: string,
//   orderDateTime: string,
// ) {
//   const transporter = createTransporter();

//   const bodyContent = buildBodyContent(
//     'Admin',
//     `
//       ${p('A new order has been placed on the <strong>Vedic Health</strong> platform. Please review the details below and process accordingly.')}
//       ${infoBox(`
//         ${infoRow('Order ID', `#${orderId}`)}
//         ${infoRow('User Name', userName)}
//         ${infoRow('User Email', userEmail)}
//         ${infoRow('Total Amount', `$${amount.toFixed(2)}`)}
//         ${infoRow('Payment Mode', paymentMode)}
//         ${infoRow('Order Date', orderDateTime)}
//       `)}
//       ${p('Please review the order details in the admin panel and take the necessary action.')}
//     `,
//     'Regards,',
//   );

//   const mailOptions: nodemailer.SendMailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: CONTACT_ENQUIRY_ADMIN_EMAIL,
//     subject: `New Order Received – Order #${orderId}`,
//     text: `Hello Admin,\n\nA new order has been placed on the Vedic Health platform.\n\nOrder ID: ${orderId}\nUser Name: ${userName}\nUser Email: ${userEmail}\nTotal Amount: $${amount.toFixed(2)}\nPayment Mode: ${paymentMode}\nOrder Date: ${orderDateTime}\n\nPlease review the order details in the admin panel.\n\nRegards,\nVedic Health System`,
//     html: buildEmailHtml(`New order #${orderId} has been placed on Vedic Health.`, bodyContent, false),
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`New order admin email sent for order #${orderId} to ${CONTACT_ENQUIRY_ADMIN_EMAIL}`);
//     return { status: true, message: 'New order admin email sent successfully' };
//   } catch (error) {
//     console.error('Error sending new order admin email:', error);
//     return { status: false, message: 'Failed to send new order admin email.' };
//   }
// }

export async function sendNewOrderAdminEmail(
  orderId: string,
  userName: string,
  userEmail: string,
  amount: number,
  paymentMode: string,
  orderDateTime: string,
  productList: any[],
  orderFullData: any
) {
  const transporter = createTransporter();

  const orderData = Array.isArray(orderFullData)
    ? orderFullData[0] || {}
    : orderFullData || {};

  const shippingAddress = [
    orderData?.billingAddress1,
    orderData?.billingAddress2,
    orderData?.billingCity,
    orderData?.billingState,
    orderData?.billingZipcode,
    orderData?.billingCountry,
  ]
    .filter(Boolean)
    .join(", ");

  const productsHtml = (productList || [])
    .map((item: any) => {
      const price = Number(item.productPrice || 0);
      const qty = Number(item.quantity || 0);
      const totalPrice = price * qty;

      return `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            ${item.productName || ""}
          </td>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            $${price.toFixed(2)}
          </td>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            ${qty}
          </td>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;font-weight:bold;">
            $${totalPrice.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join("");

  const bodyContent = buildBodyContent(
    "Admin",
    `
      ${p(
        "A new order has been placed on <strong>Vedic Health</strong>. Please review the order details below and process accordingly."
      )}

      ${infoBox(`
        ${infoRow("Order ID", `#${orderId}`)}
        ${infoRow("Customer Name", userName)}
        ${infoRow("Customer Email", userEmail)}
        ${infoRow("Order Date", orderDateTime)}
        ${infoRow("Payment Mode", paymentMode)}
        ${infoRow(
          "Delivery Method",
          orderData?.pickupDate ? "Pickup" : "Shipping"
        )}
        ${
          orderData?.pickupDate
            ? infoRow(
                "Pickup Date",
                new Date(orderData.pickupDate).toLocaleString()
              )
            : ""
        }
      `)}

      <div style="margin-top:25px;">
        <h3 style="margin-bottom:15px;color:#000;">
          Ordered Products
        </h3>

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="border-collapse:collapse;"
        >
          <thead>
            <tr style="background:#F5F5F5;">
              <th style="padding:12px;text-align:left;">Product</th>
              <th style="padding:12px;text-align:left;">Price</th>
              <th style="padding:12px;text-align:left;">Qty</th>
              <th style="padding:12px;text-align:left;">Total</th>
            </tr>
          </thead>

          <tbody>
            ${productsHtml}
          </tbody>
        </table>
      </div>

      ${infoBox(`
        ${infoRow(
          "Subtotal",
          `$${Number(orderData?.totalAmount || 0).toFixed(2)}`
        )}

        ${infoRow(
          "Shipping Charges",
          `$${Number(orderData?.deliveryCharge || 0).toFixed(2)}`
        )}

        ${infoRow(
          "Discount",
          `$${Number(orderData?.discountAmount || 0).toFixed(2)}`
        )}

        ${infoRow(
          "Total Amount",
          `<strong>$${Number(amount || 0).toFixed(2)}</strong>`
        )}

        ${infoRow("Payment Status", "Paid")}
        ${infoRow("Payment Method", paymentMode)}
      `)}

      ${
        orderData?.pickupDate
          ? `
            <div style="margin-top:25px;">
              <h3 style="margin-bottom:10px;color:#000;">
                Pickup Details
              </h3>

              <div
                style="
                  background:#F9F9F9;
                  padding:15px;
                  border-radius:6px;
                  font-size:14px;
                  line-height:22px;
                "
              >
                <strong>Pickup Date:</strong><br/>
                ${new Date(orderData.pickupDate).toLocaleString()}
              </div>
            </div>
          `
          : `
            <div style="margin-top:25px;">
              <h3 style="margin-bottom:10px;color:#000;">
                Shipping Address
              </h3>

              <div
                style="
                  background:#F9F9F9;
                  padding:15px;
                  border-radius:6px;
                  font-size:14px;
                  line-height:22px;
                "
              >
                <strong>${userName}</strong><br/>
                ${shippingAddress || "N/A"}
              </div>
            </div>
          `
      }

      ${p(
        "Please review the order in the admin panel and proceed with fulfillment, shipping, or pickup arrangements."
      )}
    `,
    "Regards,"
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: CONTACT_ENQUIRY_ADMIN_EMAIL,
    subject: `New Order Received - Order #${orderId}`,

    text: `
Hello Admin,

A new order has been placed on Vedic Health.

Order ID: ${orderId}
Customer Name: ${userName}
Customer Email: ${userEmail}
Amount: $${Number(amount).toFixed(2)}
Payment Mode: ${paymentMode}
Order Date: ${orderDateTime}

Please review the order in the admin panel.

Regards,
Vedic Health
`,

    html: buildEmailHtml(
      `New Order Received - Order #${orderId}`,
      bodyContent,
      false
    ),
  };

  try {
    const response = await transporter.sendMail(mailOptions);

    console.log(
      `New order admin email sent successfully for order #${orderId}`,
      response
    );

    return {
      status: true,
      message: "New order admin email sent successfully",
    };
  } catch (error) {
    console.error("Error sending new order admin email:", error);

    return {
      status: false,
      message: "Failed to send new order admin email",
    };
  }
}

/** Send appointment confirmation email */
export async function sendAppointmentConfirmationEmail(
  email: string,
  userName: string,
  practitionerName: string,
  dateStr: string,
  timeStr: string,
  mode: string,
  venueOrLink: string,
) {
  const transporter = createTransporter();
  const displayName = userName && userName.trim() ? userName.trim() : 'there';
  const { hasLogo, attachments } = getLogoAttachment();

  const sectionLabel = mode === 'Online' ? 'Online Meeting Link' : 'Site Address';

  const bodyContent = buildBodyContent(
    displayName,
    `
      ${p(`Your appointment with <strong>${practitionerName}</strong> has been scheduled successfully. We look forward to supporting your wellness journey.`)}
      ${infoBox(`
        ${infoRow('Practitioner', practitionerName)}
        ${infoRow('Date', dateStr)}
        ${infoRow('Time', timeStr)}
        ${infoRow('Mode', mode)}
        ${infoRow(sectionLabel, venueOrLink)}
      `)}
      ${p('Please be available <strong>5 minutes before</strong> your scheduled time to ensure a smooth start to your session.')}
    `,
    'Warm regards,',
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: 'Appointment Scheduled Successfully – Vedic Health',
    text: `Dear ${displayName},\n\nYour appointment with ${practitionerName} has been scheduled successfully.\n\nAppointment Details:\n- Date: ${dateStr}\n- Time: ${timeStr}\n- Mode: ${mode}\n- ${sectionLabel}: ${venueOrLink}\n\nPlease be available 5 minutes before your scheduled time.\n\nWarm regards,\nTeam Vedic Health`,
    html: buildEmailHtml('Your Vedic Health appointment has been confirmed.', bodyContent, hasLogo),
    attachments: attachments.length ? attachments : undefined,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Appointment confirmation email sent to ${email}`);
    return { status: true, message: 'Appointment confirmation email sent successfully' };
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
    return { status: false, message: 'Failed to send appointment confirmation email.' };
  }
}

/** Send event ticket email */
export async function sendEventTicketEmail(
  email: string,
  eventName: string,
  eventDate: string,
  eventTime: string,
  eventAddress: string,
  ticketNumber: string,
  quantity: number,
  totalAmount: number,
  qrCode?: string,
  meetingLink?: string,
) {
  const transporter = createTransporter();

  const qrSection = qrCode
    ? `
      <div style="text-align:center;margin:24px 0;">
        <p style="font-weight:700;color:#7a3a14;margin-bottom:10px;font-family:'Poppins',Arial,sans-serif;">Scan QR Code at the Event</p>
        <img src="${qrCode}" alt="QR Code" style="max-width:150px;border:1px solid #efc9a8;border-radius:6px;" />
      </div>
    `
    : '';

  const meetingSection = meetingLink
    ? ctaButton(meetingLink, 'Join / View Event')
    : '';

  const bodyContent = buildBodyContent(
    'Participant',
    `
      ${p(`Greetings from <strong>Vedic Health</strong> 🌿`)}
      ${p(`We are pleased to confirm your registration for <strong>${eventName}</strong>. Your ticket details are below.`)}
      ${infoBox(`
        ${infoRow('Event', eventName)}
        ${infoRow('Date', eventDate)}
        ${infoRow('Time', eventTime)}
        ${infoRow('Mode & Location', eventAddress)}
        ${infoRow('Ticket Number', ticketNumber)}
        ${infoRow('Quantity', String(quantity))}
        ${infoRow('Total Amount', `$${totalAmount}`)}
      `)}
      ${meetingSection}
      ${qrSection}
      ${p('We look forward to your participation. Please bring this ticket (digital or printed) to the event.')}
    `,
    'Warm regards,',
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: `🎫 Your Event Ticket – ${eventName}`,
    text: `EVENT TICKET CONFIRMATION\n\nEvent: ${eventName}\nDate: ${eventDate}\nTime: ${eventTime}\nAddress: ${eventAddress}\nTicket Number: ${ticketNumber}\nQuantity: ${quantity}\nTotal Amount: $${totalAmount}\n\n${meetingLink ? `Online Meeting Link: ${meetingLink}` : ''}\n\nThank you for your registration!\n\nRegards,\nVedic Health Team`,
    html: buildEmailHtml(`Your ticket for ${eventName} is confirmed.`, bodyContent, false),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Event ticket sent successfully to ${email} for event: ${eventName}`);
    return { status: true, message: 'Event ticket sent successfully' };
  } catch (error) {
    console.error('Error sending event ticket email:', error);
    return { status: false, message: 'Failed to send event ticket email.' };
  }
}

/** Send event registration confirmation email */
export async function sendEventRegistrationConfirmedEmail(
  email: string,
  userName: string,
  eventName: string,
  dateStr: string,
  timeStr: string,
  venueOrLink: string,
) {
  const transporter = createTransporter();
  const displayName = userName && userName.trim() ? userName.trim() : 'there';
  const { hasLogo, attachments } = getLogoAttachment();

  const bodyContent = buildBodyContent(
    displayName,
    `
      ${p(`Your registration for <strong>${eventName}</strong> has been confirmed. We are excited to have you join us!`)}
      ${infoBox(`
        ${infoRow('Event', eventName)}
        ${infoRow('Date', dateStr)}
        ${infoRow('Time', timeStr)}
        ${infoRow('Venue', venueOrLink)}
      `)}
      ${p('We look forward to your participation and to sharing this experience with you.')}
    `,
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: `Event Registration Confirmed – ${eventName}`,
    text: `Hello ${displayName},\n\nYour registration for ${eventName} has been confirmed.\n\nEvent Details:\n- Date: ${dateStr}\n- Time: ${timeStr}\n- Venue: ${venueOrLink}\n\nWe look forward to your participation!\n\nTeam Vedic Health`,
    html: buildEmailHtml(`Your registration for ${eventName} is confirmed.`, bodyContent, hasLogo),
    attachments: attachments.length ? attachments : undefined,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Event registration confirmation email sent to ${email}`);
    return { status: true, message: 'Event registration confirmation email sent successfully' };
  } catch (error) {
    console.error('Error sending event registration confirmation email:', error);
    return { status: false, message: 'Failed to send event registration confirmation email.' };
  }
}

/** Send new event registration admin notification */
export async function sendNewEventRegistrationAdminEmail(
  eventName: string,
  userName: string,
  userEmail: string,
  registrationDateTime: string,
) {
  const transporter = createTransporter();

  const bodyContent = buildBodyContent(
    'Admin',
    `
      ${p(`A new user has registered for the event <strong>${eventName}</strong>. Please confirm the registration in the admin dashboard.`)}
      ${infoBox(`
        ${infoRow('Event Name', eventName)}
        ${infoRow('User Name', userName)}
        ${infoRow('User Email', userEmail)}
        ${infoRow('Registration Date', registrationDateTime)}
      `)}
    `,
    'Best regards,',
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: CONTACT_ENQUIRY_ADMIN_EMAIL,
    subject: `New Event Registration – ${eventName}`,
    text: `Hello Admin,\n\nA new user has registered for the event ${eventName}.\n\nRegistration Details:\n- Event Name: ${eventName}\n- User Name: ${userName}\n- User Email: ${userEmail}\n- Registration Date: ${registrationDateTime}\n\nPlease confirm the registration in the admin dashboard.\n\nBest regards,\nVedic Health System`,
    html: buildEmailHtml(`New registration for ${eventName} on Vedic Health.`, bodyContent, false),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Admin event registration email sent to ${CONTACT_ENQUIRY_ADMIN_EMAIL} for event: ${eventName}`);
    return { status: true, message: 'Admin registration notification sent' };
  } catch (error) {
    console.error('Error sending admin event registration email:', error);
    return { status: false, message: 'Failed to send admin registration notification.' };
  }
}

/** Send low stock alert email */
export async function sendLowStockEmail(
  email: string,
  productName: string,
  currentStock: number,
  threshold: number,
  actionLink: string,
) {
  const transporter = createTransporter();

  const bodyContent = buildBodyContent(
    'Admin',
    `
      ${p(`This is an automated low-stock alert from the <strong>Vedic Health</strong> inventory system. Immediate attention may be required.`)}
      ${infoBox(`
        <p style="margin:6px 0;font-size:13px;color:#d9534f;font-weight:700;font-family:'Poppins',Arial,sans-serif;">⚠️ Low Stock Alert</p>
        ${infoRow('Product', productName)}
        ${infoRow('Current Stock', String(currentStock))}
        ${infoRow('Threshold', String(threshold))}
        ${infoRow('Status', '<span style="color:#d9534f;font-weight:700;">Below Minimum Level</span>')}
      `)}
      ${ctaButton(actionLink, 'Reorder / Update Stock')}
      ${p('Please take action to restock or update the inventory to avoid disruption.')}
    `,
    'Regards,',
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: `⚠️ Low Stock Alert: ${productName}`,
    text: `Low Stock Alert\n\nProduct: ${productName}\nCurrent Stock: ${currentStock}\nThreshold: ${threshold}\n\nPlease take action to restock or update inventory.\n\nAction Link: ${actionLink}\n\nRegards,\nVedic Health`,
    html: buildEmailHtml(`Low stock alert for ${productName} on Vedic Health.`, bodyContent, false),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Low stock alert sent for ${productName}`);
    return { status: true, message: 'Low stock alert sent successfully' };
  } catch (error) {
    console.error('Error sending low stock email:', error);
    return { status: false, message: 'Failed to send low stock email.' };
  }
}

/** Send contact enquiry admin notification */
export async function sendContactEnquiryAdminEmail(
  userName: string,
  userEmail: string,
  userPhone: string,
) {
  const transporter = createTransporter();

  const bodyContent = buildBodyContent(
    'Admin',
    `
      ${p('A new query has been submitted via the <strong>Contact Us</strong> form on the Vedic Health platform. Please follow up with the user at the earliest.')}
      ${infoBox(`
        ${infoRow('Name', userName)}
        ${infoRow('Email', userEmail)}
        ${infoRow('Phone', userPhone)}
      `)}
    `,
    'Regards,',
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: CONTACT_ENQUIRY_ADMIN_EMAIL,
    subject: 'New Contact Enquiry Received – Vedic Health',
    text: `Dear Admin,\n\nA new query has been submitted via the Contact Us form.\n\nEnquiry Details:\n- Name: ${userName}\n- Email: ${userEmail}\n- Phone: ${userPhone}\n\nTeam Vedic Health`,
    html: buildEmailHtml('A new contact enquiry has been submitted on Vedic Health.', bodyContent, false),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Contact enquiry admin email sent to ${CONTACT_ENQUIRY_ADMIN_EMAIL}`);
    return { status: true, message: 'Admin notification sent successfully' };
  } catch (error) {
    console.error('Error sending contact enquiry admin email:', error);
    return { status: false, message: 'Failed to send admin notification.' };
  }
}

/** Send contact enquiry user confirmation */
export async function sendContactEnquiryUserConfirmationEmail(
  userEmail: string,
  userName: string,
) {
  const transporter = createTransporter();
  const displayName = userName && userName.trim() ? userName.trim() : 'there';

  const bodyContent = buildBodyContent(
    displayName,
    `
      ${p('Thank you for reaching out to <strong>Vedic Health</strong>. We have received your enquiry and our team will get back to you shortly.')}
      ${p('We value your time and are committed to providing you with the best support on your wellness journey.')}
    `,
    'Best regards,',
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: userEmail,
    subject: 'We Received Your Enquiry – Vedic Health',
    text: `Dear ${displayName},\n\nThank you for contacting Vedic Health. We have received your enquiry and will get back to you shortly.\n\nBest regards,\nTeam Vedic Health`,
    html: buildEmailHtml('Vedic Health has received your enquiry.', bodyContent, false),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Contact enquiry confirmation sent to user: ${userEmail}`);
    return { status: true, message: 'User confirmation sent successfully' };
  } catch (error) {
    console.error('Error sending contact enquiry user confirmation:', error);
    return { status: false, message: 'Failed to send user confirmation.' };
  }
}

/** Send pickup date update email */
export async function sendPickupDateUpdateEmail(email: string, newPickupDate: string) {
  const transporter = createTransporter();

  const bodyContent = buildBodyContent(
    'there',
    `
      ${p('We regret to inform you that due to the <strong>unavailability of the product</strong>, your pickup date has been rescheduled by our team.')}
      ${infoBox(`
        ${infoRow('New Pickup Date', newPickupDate)}
        ${infoRow('Status', '<span style="color:#e06b10;font-weight:700;">Rescheduled</span>')}
      `)}
      ${p('We sincerely apologize for any inconvenience caused and truly appreciate your understanding and patience. If you have any questions, please feel free to contact us.')}
    `,
    'Regards,',
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: 'Update on Your Pickup Schedule – Vedic Health',
    text: `Hello,\n\nWe regret to inform you that due to the unavailability of the product, your pickup date has been rescheduled by our team.\n\nNew Pickup Date: ${newPickupDate}\n\nWe apologize for any inconvenience caused and appreciate your understanding.\n\nRegards,\nVedic Health Team`,
    html: buildEmailHtml('Your Vedic Health pickup schedule has been updated.', bodyContent, false),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Pickup update email sent successfully');
    return { status: true, message: 'Pickup update email sent successfully' };
  } catch (error) {
    console.error('Error sending pickup update email:', error);
    return { status: false, message: 'Failed to send pickup update email.' };
  }
}

export async function sendOrderCancelEmail(
  email: string,
  customerName: string,
  orderId: string,
  itemsList: any,
  orderDate: string,
  cancellationDate: string
) {
  const transporter = createTransporter();

  // ✅ HTML Items List
  const itemsHtml = itemsList?.length
    ? `
      <div style="margin:10px 0;">
        <ul style="padding-left:18px; margin:0;">
          ${itemsList
      .map(
        (item) => `
            <li style="margin-bottom:6px;">
              ${item.productName} – ${item.quantity} ${item.quantity > 1 ? "Units" : "Unit"
          }
            </li>`
      )
      .join("")}
        </ul>
      </div>
    `
    : `<p>No items found</p>`;

  // ✅ TEXT Items List
  const itemsText = itemsList?.length
    ? itemsList
      .map(
        (item) =>
          `${item.productName} - ${item.quantity} ${item.quantity > 1 ? "Units" : "Unit"
          }`
      )
      .join("\n")
    : "No items found";

  const bodyContent = buildBodyContent(
    customerName || "there",
    `
      ${p(
      `We’re writing to confirm that your <strong>order #${orderId}</strong> has been successfully cancelled as per your request.`
    )}

      ${infoBox(`
        ${infoRow("Order ID", orderId)}
        ${infoRow("Order Date", orderDate)}
        ${infoRow("Cancellation Date", cancellationDate)}
        ${infoRow(
      "Status",
      '<span style="color:#d32f2f;font-weight:700;">Cancelled</span>'
    )}
      `)}

      ${p("<strong>Cancelled Items:</strong>")}
      ${itemsHtml}
      
      ${p(
      "If you did not intend to cancel this order or need assistance, please feel free to reach out to our support team."
    )}

      ${p("We hope to serve you again soon.")}
    `,
    "Regards,"
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: `Your Order #${orderId} has been Cancelled – Vedic Health`,

    // ✅ TEXT VERSION
    text: `Hi ${customerName},

We’re writing to confirm that your order #${orderId} has been successfully cancelled as per your request.

Cancelled Items:
${itemsText}

Order Summary:
Order ID: ${orderId}
Order Date: ${orderDate}
Cancellation Date: ${cancellationDate}

If you have already made a payment, the refund (if applicable) will be processed within 2-3 working days.

If you did not intend to cancel this order or need assistance, please contact our support team.

We hope to serve you again soon.

Regards,
Vedic Health Team`,

    // ✅ HTML VERSION
    html: buildEmailHtml(
      `Your order #${orderId} has been successfully cancelled.`,
      bodyContent,
      false
    ),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Order cancel email sent successfully");
    return { status: true, message: "Order cancel email sent successfully" };
  } catch (error) {
    console.error("Error sending order cancel email:", error);
    return { status: false, message: "Failed to send order cancel email." };
  }
}

export async function sendRefundProcessedEmail(
  email: string,
  customerName: string,
  orderId: string,
  itemsList: any,
  refundAmount: string,
  refundDate: string
) {
  const transporter = createTransporter();

  // ✅ HTML Items
  const itemsHtml = itemsList?.length
    ? `
      <div style="margin:10px 0;">
        <ul style="padding-left:18px; margin:0;">
          ${itemsList
      .map(
        (item) => `
            <li style="margin-bottom:6px;">
              ${item.productName} – ${item.quantity} ${item.quantity > 1 ? "Units" : "Unit"
          }
            </li>`
      )
      .join("")}
        </ul>
      </div>
    `
    : `<p>No items found</p>`;

  // ✅ TEXT Items
  const itemsText = itemsList?.length
    ? itemsList
      .map(
        (item) =>
          `${item.productName} - ${item.quantity} ${item.quantity > 1 ? "Units" : "Unit"
          }`
      )
      .join("\n")
    : "No items found";

  const bodyContent = buildBodyContent(
    customerName || "there",
    `
      ${p(
      `We would like to inform you that your refund for <strong>order #${orderId}</strong> has been successfully processed.`
    )}

      ${p("<strong>Refund against the Items:</strong>")}
      ${itemsHtml}

      ${infoBox(`
        ${infoRow("Order ID", orderId)}
        ${infoRow("Refund Amount", refundAmount)}
        ${infoRow("Refund Date", refundDate)}
        ${infoRow(
      "Status",
      '<span style="color:#2e7d32;font-weight:700;">Refunded</span>'
    )}
      `)}

      ${p(
      "If you have any questions or need further assistance, please don’t hesitate to contact our support team."
    )}

      ${p("Thank you for shopping with us.")}
    `,
    "Regards,"
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: `Refund Processed for Order #${orderId} – Vedic Health`,

    // ✅ TEXT VERSION
    text: `Hi ${customerName},

We would like to inform you that your refund for order #${orderId} has been successfully processed.

Refund against the Items:
${itemsText}

Refund Details:
Order ID: ${orderId}
Refund Amount: ${refundAmount}
Refund Date: ${refundDate}

If you have any questions or need further assistance, please contact our support team.

Thank you for shopping with us.

Regards,
Vedic Health Team`,

    // ✅ HTML VERSION
    html: buildEmailHtml(
      `Your refund for order #${orderId} has been successfully processed.`,
      bodyContent,
      false
    ),
  };

  try {
    await transporter.sendMail(mailOptions); // ✅ your original method
    console.log("Refund email sent successfully");
    return { status: true, message: "Refund email sent successfully" };
  } catch (error) {
    console.error("Error sending refund email:", error);
    return { status: false, message: "Failed to send refund email." };
  }
}


export function buildInvoiceHtml(data: any, footerData: any) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const items = Array.isArray(data.orderItems) ? data.orderItems : [];

  return `
  <html>
  <head>
    <style>
      body { font-family: Arial; padding:20px; }
      table { width:100%; border-collapse: collapse; }
      th, td { padding:10px; border-bottom:1px solid #ddd; }
      .header { display:flex; justify-content:space-between; }
      .title { font-size:18px; font-weight:bold; }
    </style>
  </head>

  <body>

    <div class="header">
      <div>
        <h2>Vedic Health</h2>
      </div>
      <div>
        <div class="title">INVOICE</div>
        <div>Invoice #: ${data.invoiceNo || 'N/A'}</div>
        <div>Date: ${formatDate(data.created_at)}</div>
        <div>Total: $${data.grandTotal || 0}</div>
      </div>
    </div>

    <h3>Customer</h3>
    <p>${data.customer?.name || ''}</p>
    <p>${data.customer?.email || ''}</p>

    <table>
      <tr>
        <th>Description</th>
        <th>Price</th>
        <th>Qty</th>
        <th>Total</th>
      </tr>

      ${items.map(item => `
        <tr>
          <td>${item.productName || ''}</td>
          <td>$${item.productPrice || 0}</td>
          <td>${item.quantity || 0}</td>
          <td>$${(item.productPrice || 0) * (item.quantity || 0)}</td>
        </tr>
      `).join("")}

    </table>

    <h3 style="text-align:right">Grand Total: $${data.grandTotal || 0}</h3>

  </body>
  </html>
  `;
}

export async function sendOrderPlacedEmail(
  email: string,
  customerName: string,
  order: any,
  footerData: any
) {
  const transporter = createTransporter();



  // ✅ Logo attachment
  const { hasLogo, attachments } = getLogoAttachment();

  // ✅ Items HTML
  const itemsHtml = order.orderItems?.length
    ? `
      <div style="margin:10px 0;">
        <ul style="padding-left:18px; margin:0;">
          ${order.orderItems
      .map(
        (item: any) => `
            <li style="margin-bottom:6px;">
              ${item.productName} – ${item.quantity} ${item.quantity > 1 ? "Units" : "Unit"
          }
            </li>`
      )
      .join("")}
        </ul>
      </div>
    `
    : `<p>No items found</p>`;

  // ✅ TEXT fallback
  const itemsText = order.orderItems?.length
    ? order.orderItems
      .map(
        (item: any) =>
          `${item.productName} - ${item.quantity} ${item.quantity > 1 ? "Units" : "Unit"
          }`
      )
      .join("\n")
    : "No items found";

  // ✅ SAME DESIGN BODY (like cancel email)
  const bodyContent = buildBodyContent(
    customerName || "there",
    `
      ${p(`Thank you for your order! Your order has been placed successfully.`)}

      ${infoBox(`
        ${infoRow("Order ID", `Ved${order.invoiceNo}`)}
        ${infoRow("Order Date", new Date(order.created_at).toDateString())}
        ${infoRow("Payment Method", order.paymentMethod || "Online")}
        ${infoRow("Total Amount", `$${order.grandTotal}`)}
      `)}

      ${p("<strong>Items Ordered:</strong>")}
      ${itemsHtml}

      ${p(`<strong>Delivery Address:</strong><br/>${order.address?.fullAddress || ""}`)}

      ${p("We will notify you once your order is packed and ready.")}

      ${p("If you have any questions, feel free to contact us.")}
    `,
    "Regards,"
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: `Order Confirmation - Ved${order.invoiceNo}`,

    // ✅ TEXT VERSION
    text: `Hi ${customerName},

Thank you for your order!

Order ID: Ved${order.invoiceNo}
Order Date: ${new Date(order.created_at).toDateString()}
Payment Method: ${order.paymentMethod}
Total Amount: $${order.grandTotal}

Items:
${itemsText}

Address:
${order.address?.fullAddress}

Regards,
Vedic Health Team`,

    // ✅ HTML (same template system)
    html: buildEmailHtml(
      `Your order #Ved${order.invoiceNo} has been placed successfully.`,
      bodyContent,
      hasLogo
    ),
    attachments: attachments.length ? attachments : undefined,



  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Order placed email sent successfully");
    return { status: true };
  } catch (error) {
    console.error("Error sending order email:", error);
    return { status: false };
  }
}

export async function sendOrderPackedEmail(
  email: string,
  customerName: string,
  order: any
) {
  const transporter = createTransporter();

  // ✅ Items HTML
  const itemsHtml = order?.orderItems?.length
    ? `
      <div style="margin:10px 0;">
        <ul style="padding-left:18px; margin:0;">
          ${order.orderItems
            .map(
              (item: any) => `
            <li style="margin-bottom:6px;">
              ${item.productName} – ${item.quantity} ${
                item.quantity > 1 ? "Units" : "Unit"
              }
            </li>`
            )
            .join("")}
        </ul>
      </div>
    `
    : `<p>No items found</p>`;

  // ✅ Items TEXT (fallback)
  const itemsText = order?.orderItems?.length
    ? order.orderItems
        .map(
          (item: any) =>
            `${item.productName} - ${item.quantity} ${
              item.quantity > 1 ? "Units" : "Unit"
            }`
        )
        .join("\n")
    : "No items found";

  // ✅ Email Body (SAME DESIGN)
  const bodyContent = buildBodyContent(
    customerName || "there",
    `
      ${p(
        `Good news! Your <strong>order #Ved${order.invoiceNo}</strong> has been packed and is being prepared for the next step.`
      )}

      ${infoBox(`
        ${infoRow("Order ID",`Ved${order.invoiceNo}`)}
        ${infoRow("Order Placed", order.created_at)}
        ${infoRow("Order Packed", new Date().toLocaleDateString())}
        ${infoRow(
          "Status",
          '<span style="color:#2e7d32;font-weight:700;">Packed</span>'
        )}
      `)}

      ${p("<strong>Items:</strong>")}
      ${itemsHtml}

      ${p(
        "We’ll notify you once your order is ready for dispatch or pickup."
      )}

      ${p("Thanks for your patience 😊")}
    `,
    "Regards,"
  );

  const { hasLogo, attachments } = getLogoAttachment();

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: `Your Order #Ved${order.invoiceNo} is Packed – Vedic Health`,

    // ✅ TEXT VERSION
    text: `Hi ${customerName},

Good news! Your order #Ved${order.invoiceNo} has been packed.

Items:
${itemsText}

Order Details:
Order ID: Ved${order.invoiceNo}
Order Placed: ${order.created_at}
Order Packed: ${new Date().toLocaleDateString()}

We’ll notify you once your order is ready.

Thanks for your patience 😊

Regards,
Vedic Health Team`,

    // ✅ HTML VERSION (SAME DESIGN)
    html: buildEmailHtml(
      `Your order #Ved${order.invoiceNo} has been packed.`,
      bodyContent,
      hasLogo
    ),

     attachments: attachments.length ? attachments : undefined,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Order packed email sent successfully");
    return { status: true };
  } catch (error) {
    console.error("Error sending order packed email:", error);
    return { status: false };
  }
}

export async function sendOrderReadyEmail(
  email: string,
  customerName: string,
  order: any
) {
  const transporter = createTransporter();

  // ✅ Items HTML
  const itemsHtml = order?.orderItems?.length
    ? `
      <div style="margin:10px 0;">
        <ul style="padding-left:18px; margin:0;">
          ${order.orderItems
            .map(
              (item: any) => `
            <li style="margin-bottom:6px;">
              ${item.productName} – ${item.quantity} ${
                item.quantity > 1 ? "Units" : "Unit"
              }
            </li>`
            )
            .join("")}
        </ul>
      </div>
    `
    : `<p>No items found</p>`;

  // ✅ TEXT fallback
  const itemsText = order?.orderItems?.length
    ? order.orderItems
        .map(
          (item: any) =>
            `${item.productName} - ${item.quantity} ${
              item.quantity > 1 ? "Units" : "Unit"
            }`
        )
        .join("\n")
    : "No items found";

  // ✅ Dates
  const orderPlacedDate = order?.created_at;
  const orderPackedDate = order?.orderPackDate || "-";
  const orderReadyDate = new Date().toLocaleDateString();

  // ✅ Pickup / Delivery Info
  const deliveryInfo =
    order?.address?.fullAddress ||
    order?.pickupLocation ||
    "Will be shared soon";

  // ✅ Body (same design)
  const bodyContent = buildBodyContent(
    customerName || "there",
    `
      ${p(
        `Your <strong>order #Ved${order.invoiceNo}</strong> is now ready 🎉`
      )}

      ${infoBox(`
        ${infoRow("Order ID", `Ved${order.invoiceNo}`)}
        ${infoRow("Order Placed", orderPlacedDate)}
        ${infoRow("Order Packed", orderPackedDate)}
        ${infoRow("Order Ready", orderReadyDate)}
        ${infoRow(
          "Status",
          '<span style="color:#2e7d32;font-weight:700;">Ready</span>'
        )}
      `)}

      ${p("<strong>Items:</strong>")}
      ${itemsHtml}

      ${p("<strong>Pickup / Delivery Info:</strong>")}
      ${p(deliveryInfo)}

      ${p(
        "You can now collect your order or it will be dispatched shortly."
      )}
    `,
    "Regards,"
  );

  const { hasLogo, attachments } = getLogoAttachment();

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: `Your Order #Ved${order.invoiceNo} is Ready – Vedic Health`,

    // ✅ TEXT VERSION
    text: `Hi ${customerName},

Your order #Ved${order.invoiceNo} is now ready 🎉

Items:
${itemsText}

Order Status:
Order Placed: ${orderPlacedDate}
Order Packed: ${orderPackedDate}
Order Ready: ${orderReadyDate}

Pickup / Delivery Info:
${deliveryInfo}

You can now collect your order or it will be dispatched shortly.

Regards,
Vedic Health Team`,

    // ✅ HTML VERSION
    html: buildEmailHtml(
      `Your order #Ved${order.invoiceNo} is ready.`,
      bodyContent,
      hasLogo
    ),

     attachments: attachments.length ? attachments : undefined,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Order ready email sent successfully");
    return { status: true };
  } catch (error) {
    console.error("Error sending order ready email:", error);
    return { status: false };
  }
}
export async function sendOrderDeliveredEmail(
  email: string,
  customerName: string,
  order: any,
  footerData:any
) {
  const pdfBuffer = await generateInvoicePdfBuffer(order, footerData);
  const transporter = createTransporter();

  // ✅ Items HTML
  const itemsHtml = order?.orderItems?.length
    ? `
      <div style="margin:10px 0;">
        <ul style="padding-left:18px; margin:0;">
          ${order.orderItems
            .map(
              (item: any) => `
            <li style="margin-bottom:6px;">
              ${item.productName} – ${item.quantity} ${
                item.quantity > 1 ? "Units" : "Unit"
              }
            </li>`
            )
            .join("")}
        </ul>
      </div>
    `
    : `<p>No items found</p>`;

  // ✅ TEXT fallback
  const itemsText = order?.orderItems?.length
    ? order.orderItems
        .map(
          (item: any) =>
            `${item.productName} - ${item.quantity} ${
              item.quantity > 1 ? "Units" : "Unit"
            }`
        )
        .join("\n")
    : "No items found";

  const deliveredDate = order?.deliveredDate || new Date().toLocaleDateString();

  // ✅ Body (same design)
  const bodyContent = buildBodyContent(
    customerName || "there",
    `
      ${p(
        `Your <strong>order #Ved${order.invoiceNo}</strong> has been successfully delivered 🎉`
      )}

      ${infoBox(`
        ${infoRow("Order ID", `Ved${order.invoiceNo}`)}
        ${infoRow("Delivered Date", deliveredDate)}
        ${infoRow(
          "Status",
          '<span style="color:#2e7d32;font-weight:700;">Delivered</span>'
        )}
      `)}

      ${p("<strong>Items Delivered:</strong>")}
      ${itemsHtml}

      ${p("We hope you enjoy your purchase 😊")}

      ${p(
        "If you need any help or want to return items, feel free to contact us."
      )}
    `,
    "Regards,"
  );

  const { hasLogo, attachments } = getLogoAttachment();

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: `Your Order #Ved${order.invoiceNo} has been Delivered – Vedic Health`,

    // ✅ TEXT VERSION
    text: `Hi ${customerName},

Your order #Ved${order.invoiceNo} has been successfully delivered 🎉

Items:
${itemsText}

Delivered Date: ${deliveredDate}

We hope you enjoy your purchase 😊

If you need any help or want to return items, feel free to contact us.

Regards,
Vedic Health Team`,

    // ✅ HTML VERSION (same premium UI)
    html: buildEmailHtml(
      `Your order #Ved${order.invoiceNo} has been delivered.`,
      bodyContent,
      hasLogo
    ),

     attachments: [
      ...attachments, // logo
      {
        filename: `Invoice-Ved${order.invoiceNo}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Order delivered email sent successfully");
    return { status: true };
  } catch (error) {
    console.error("Error sending order delivered email:", error);
    return { status: false };
  }
}

export async function sendMembershipCancellationMail(email: string, customerName: string) {
  const transporter = createTransporter();

  const bodyContent = buildBodyContent(
    customerName || 'there',
    `
      ${p('We would like to inform you that your <strong>Vedic Health</strong> membership has been successfully cancelled.')}

      ${infoBox(`
        <p style="text-align:center;font-size:16px;color:#84431d;margin:0;font-family:'Poppins',Arial,sans-serif;">
          You will no longer have access to membership benefits and services associated with your plan.
        </p>
      `)}

      ${p('If you did not request this cancellation or believe this has been done in error, please contact our support team immediately.')}

      ${p('We sincerely thank you for being a part of Vedic Health. It was a pleasure serving you, and we hope to assist you again in the future.')}
    `,
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: 'Your Vedic Health Membership Has Been Cancelled',
    text: `Hello ${customerName || 'Customer'},

Your Vedic Health membership has been successfully cancelled.

You will no longer have access to membership benefits.

If you did not request this, please contact support immediately.

Thank you for being with Vedic Health.

Regards,  
Vedic Health Team`,
    html: buildEmailHtml(
      'Your Vedic Health membership has been cancelled.',
      bodyContent,
      false
    ),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Membership cancellation email sent successfully');
    return { status: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return { status: false, message: 'Failed to send email.' };
  }
}

export async function sendWaitlistConfirmationMail(
  email: string,
  customerName: string,
  serviceName: string,
  employeeName: string,
  date: string
) {
  const transporter = createTransporter();

  const bodyContent = buildBodyContent(
    customerName || "there",
    `
      ${p('Thank you for your request! You have been added to the <strong>waitlist</strong> successfully.')}

      ${infoBox(`
        <p style="margin:5px 0;font-family:'Poppins',Arial,sans-serif;">
          <strong>Service Name:</strong> ${serviceName || '-'}
        </p>
        <p style="margin:5px 0;font-family:'Poppins',Arial,sans-serif;">
          <strong>Preferred Employee:</strong> ${employeeName || '-'}
        </p>
        <p style="margin:5px 0;font-family:'Poppins',Arial,sans-serif;">
          <strong>Preferred Date:</strong> ${date || '-'}
        </p>
      `)}

      ${p('We will notify you as soon as a slot becomes available on your selected date.')}

      ${p('If you have any questions, feel free to contact us.')}
    `
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: 'You Have Been Added to the Waitlist – Vedic Health',
    text: `Hi ${customerName || 'Customer'},

Thank you for your request! You have been added to the waitlist successfully.

Waitlist Details:
Service Name: ${serviceName || '-'}
Preferred Employee: ${employeeName || '-'}
Preferred Date: ${date || '-'}

We will notify you as soon as a slot becomes available on your selected date.

If you have any questions, feel free to contact us.

Regards,  
Vedic Health Team`,
    html: buildEmailHtml(
      'You have been successfully added to the waitlist.',
      bodyContent,
      false
    ),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Waitlist email sent successfully');
    return { status: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending waitlist email:', error);
    return { status: false, message: 'Failed to send email.' };
  }
}

export async function sendSlotAvailableMail(
  email: string,
  customerName: string,
  serviceName: string,
  employeeName: string,
  date: string
) {
  const transporter = createTransporter();

  const bodyContent = buildBodyContent(
    customerName || "there",
    `
      ${p('<strong>Good news!</strong> A slot is now available for your requested service.')}

      ${infoBox(`
        <p><strong>Service Name:</strong> ${serviceName || '-'}</p>
        <p><strong>Employee Name:</strong> ${employeeName || '-'}</p>
        <p><strong>Date:</strong> ${date || '-'}</p>
      `)}

      ${p('Please book your slot at the earliest to confirm your appointment.')}

      ${p('If you have any questions, feel free to contact us.')}
    `
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: 'Slot Available – Book Now | Vedic Health',
    text: `Hi ${customerName || 'Customer'},

Good news! A slot is now available for your requested service.

Booking Details:
Service Name: ${serviceName || '-'}
Employee Name: ${employeeName || '-'}
Date: ${date || '-'}

Please book your slot at the earliest to confirm your appointment.

If you have any questions, feel free to contact us.

Regards,  
Vedic Health Team`,
    html: buildEmailHtml(
      'A slot is now available for your requested service.',
      bodyContent,
      false
    ),
  };

  try {
    await transporter.sendMail(mailOptions);
    return { status: true };
  } catch (error) {
    console.error('Error sending slot email:', error);
    return { status: false };
  }
}

export async function sendNoSlotAvailableMail(
  email: string,
  customerName: string,
  serviceName: string,
  employeeName: string,
  date: string
) {
  const transporter = createTransporter();

  const bodyContent = buildBodyContent(
    customerName || "there",
    `
      ${p('We regret to inform you that <strong>no slots are available</strong> for your selected service.')}

      ${infoBox(`
        <p><strong>Service Name:</strong> ${serviceName || '-'}</p>
        <p><strong>Employee Name:</strong> ${employeeName || '-'}</p>
        <p><strong>Date:</strong> ${date || '-'}</p>
      `)}

      ${p('We’re sorry for the inconvenience caused.')}

      ${p(`
        <strong>Please try:</strong><br/>
        • Selecting a different date<br/>
        • Choosing another available employee
      `)}

      ${p('If you need help, feel free to contact us.')}
    `
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: 'No Slots Available – Vedic Health',
    text: `Hi ${customerName || 'Customer'},

We regret to inform you that no slots are available for your selected service.

Request Details:
Service Name: ${serviceName || '-'}
Employee Name: ${employeeName || '-'}
Date: ${date || '-'}

We’re sorry for the inconvenience caused.

Please try:
- Selecting a different date
- Choosing another available employee

If you need help, feel free to contact us.

Regards,  
Vedic Health Team`,
    html: buildEmailHtml(
      'No slots available for your selected service.',
      bodyContent,
      false
    ),
  };

  try {
    await transporter.sendMail(mailOptions);
    return { status: true };
  } catch (error) {
    console.error('Error sending no-slot email:', error);
    return { status: false };
  }
}


export async function sendAppointmentCancelledByAdminEmail(
  email: string,
  customerName: string,
  employeeName: string,
  appointmentDate: string,
  appointmentTime: string,
) {
  const transporter = createTransporter();

  const bodyContent = buildBodyContent(
    customerName || "there",
    `
      ${p(
        `We regret to inform you that your appointment with <strong>${employeeName}</strong> has been cancelled by the admin.`
      )}

      ${infoBox(`
        ${infoRow("Appointment Date", appointmentDate)}
        ${infoRow("Appointment Time", appointmentTime)}
        ${infoRow(
          "Status",
          '<span style="color:#d32f2f;font-weight:700;">Cancelled</span>'
        )}
      `)}

      ${p(
        "We apologize for the inconvenience caused."
      )}

      ${p(
        "Please reschedule your appointment by selecting another date or employee."
      )}

      ${p(
        "If you need any assistance, feel free to contact us."
      )}
    `,
    "Warm regards,"
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: `Appointment Cancellation Notification`,

    // TEXT VERSION
    text: `Dear ${customerName},

We regret to inform you that your appointment with ${employeeName} has been cancelled by the admin.

Appointment Details:
Date: ${appointmentDate}
Time: ${appointmentTime}

We apologize for the inconvenience caused.

Please reschedule your appointment by selecting another date or employee.

If you need any assistance, feel free to contact us.

Warm regards,
Team Vedic Health`,

    // HTML VERSION
    html: buildEmailHtml(
      `Your appointment with ${employeeName} has been cancelled.`,
      bodyContent,
      true
    ),

    attachments: getLogoAttachment().attachments,
  };

  try {
    await transporter.sendMail(mailOptions);

    console.log("Appointment cancellation email sent successfully");

    return {
      status: true,
      message: "Appointment cancellation email sent successfully",
    };
  } catch (error) {
    console.error("Error sending appointment cancellation email:", error);

    return {
      status: false,
      message: "Failed to send appointment cancellation email.",
    };
  }
}

export async function sendAppointmentCancelledByUserEmail(
  email: string,
  customerName: string,
  employeeName: string,
  appointmentDate: string,
  appointmentTime: string
) {
  const transporter = createTransporter();

  const { hasLogo, attachments } = getLogoAttachment();

  const bodyContent = buildBodyContent(
    customerName || "there",
    `
      ${p(
        `Your appointment with <strong>${employeeName}</strong> has been cancelled successfully as per your request.`
      )}

      ${infoBox(`
        ${infoRow("Appointment With", employeeName)}
        ${infoRow("Date", appointmentDate)}
        ${infoRow("Time", appointmentTime)}
        ${infoRow(
          "Status",
          '<span style="color:#d32f2f;font-weight:700;">Cancelled</span>'
        )}
      `)}

      ${p(
        "If you would like to book another appointment, you can schedule it anytime."
      )}

      ${p(
        "Thank you for choosing Vedic Health."
      )}
    `,
    "Warm regards,"
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: `Appointment Cancellation Confirmation – Vedic Health`,

    text: `Dear ${customerName},

Your appointment with ${employeeName} has been cancelled successfully as per your request.

Cancelled Appointment Details:
Appointment With: ${employeeName}
Date: ${appointmentDate}
Time: ${appointmentTime}

If you would like to book another appointment, you can schedule it anytime.

Thank you for choosing Vedic Health.

Warm regards,
Team Vedic Health`,

    html: buildEmailHtml(
      `Your appointment has been cancelled successfully.`,
      bodyContent,
      hasLogo
    ),

    attachments,
  };

  try {
    await transporter.sendMail(mailOptions);

    console.log("Appointment cancellation confirmation email sent successfully");

    return {
      status: true,
      message: "Appointment cancellation confirmation email sent successfully",
    };
  } catch (error) {
    console.error(
      "Error sending appointment cancellation confirmation email:",
      error
    );

    return {
      status: false,
      message: "Failed to send appointment cancellation confirmation email.",
    };
  }
}

export async function sendAppointmentRescheduledEmail(
  email: string,
  userName: string,
  practitionerName: string,
  newDateStr: string,
  newTimeStr: string,
  mode: string,
  venueOrLink: string,
) {
  const transporter = createTransporter();

  const displayName =
    userName && userName.trim()
      ? userName.trim()
      : 'there';

  const { hasLogo, attachments } = getLogoAttachment();

  const sectionLabel =
    mode === 'Online'
      ? 'Online Meeting Link'
      : 'Site Address';

  const bodyContent = buildBodyContent(
    displayName,
    `
      ${p(`
        Your appointment with <strong>${practitionerName}</strong> has been successfully rescheduled.
        Please find your updated appointment details below.
      `)}

      ${infoBox(`
        ${infoRow('Practitioner', practitionerName)}

        
        ${infoRow(
          'Updated Schedule',
          `${newDateStr} at ${newTimeStr}`
        )}

        ${infoRow('Mode', mode)}

        ${infoRow(sectionLabel, venueOrLink)}
      `)}

      ${p(`
        Kindly make sure to join or arrive
        <strong>5 minutes before</strong>
        your updated appointment time.
      `)}
    `,
    'Warm regards,',
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: 'Appointment Rescheduled Successfully – Vedic Health',

    text: `
Dear ${displayName},

Your appointment with ${practitionerName} has been rescheduled successfully.



Updated Appointment:
- Date: ${newDateStr}
- Time: ${newTimeStr}
- Mode: ${mode}
- ${sectionLabel}: ${venueOrLink}

Please be available 5 minutes before your scheduled time.

Warm regards,
Team Vedic Health
    `,

    html: buildEmailHtml(
      'Your Vedic Health appointment has been rescheduled.',
      bodyContent,
      hasLogo
    ),

    attachments: attachments.length
      ? attachments
      : undefined,
  };

  try {
    await transporter.sendMail(mailOptions);

    console.log(
      `Appointment rescheduled email sent to ${email}`
    );

    return {
      status: true,
      message:
        'Appointment rescheduled email sent successfully',
    };
  } catch (error) {
    console.error(
      'Error sending appointment rescheduled email:',
      error
    );

    return {
      status: false,
      message:
        'Failed to send appointment rescheduled email.',
    };
  }
}

export async function sendAppointmentCompletedEmail(
  email: string,
  userName: string,
  practitionerName: string,
  dateStr: string,
  timeStr: string,
  mode: string,
) {

  const transporter = createTransporter();

  const displayName =
    userName && userName.trim()
      ? userName.trim()
      : 'there';

  const { hasLogo, attachments } = getLogoAttachment();

  const bodyContent = buildBodyContent(
    displayName,
    `
      ${p(`
        Your appointment with
        <strong>${practitionerName}</strong>
        has been completed successfully.
      `)}

      ${infoBox(`
        ${infoRow('Practitioner', practitionerName)}
        ${infoRow('Date', dateStr)}
        ${infoRow('Time', timeStr)}
        ${infoRow('Mode', mode)}
        ${infoRow('Status', 'Completed')}
      `)}

      ${p(`
        Thank you for choosing
        <strong>Vedic Health</strong>
        for your wellness journey.
      `)}

      ${p(`
        We hope your session was helpful and enriching.
        If you have any questions or wish to schedule
        another appointment, feel free to reach out.
      `)}
    `,
    'Warm regards,',
  );

  const mailOptions: nodemailer.SendMailOptions = {

    from: '"Vedic Health" <info@vedichealth.org>',

    to: email,

    subject: 'Appointment Completed – Vedic Health',

    text: `
Dear ${displayName},

Your appointment with ${practitionerName} has been completed successfully.

Appointment Details:
- Date: ${dateStr}
- Time: ${timeStr}
- Mode: ${mode}
- Status: Completed

Thank you for choosing Vedic Health.

Warm regards,
Team Vedic Health
    `,

    html: buildEmailHtml(
      'Your Vedic Health appointment has been completed.',
      bodyContent,
      hasLogo,
    ),

    attachments: attachments.length
      ? attachments
      : undefined,
  };

  try {

    await transporter.sendMail(mailOptions);

    console.log(
      `Appointment completed email sent to ${email}`
    );

    return {
      status: true,
      message:
        'Appointment completed email sent successfully',
    };

  } catch (error) {

    console.error(
      'Error sending appointment completed email:',
      error,
    );

    return {
      status: false,
      message:
        'Failed to send appointment completed email.',
    };
  }
}

// ================= SEND MULTIPLE EMAILS =================

export async function sendSubscribeEmails(
  emails: string[],
  subject: string,
  htmlBody: string,
) {

  try {

    // ================= VALIDATE =================

    // console.log(
    //   'Received emails >>>>>>>>>>>>>>>>>>>>>>>>>>>',
    //   emails,
    // );

    if (
      !emails ||
      !Array.isArray(emails) ||
      !emails.length
    ) {
      throw new Error(
        'Email list is empty',
      );
    }

    // ================= FILTER VALID EMAILS =================

    const validEmails = emails.filter(
      (email) =>
        email &&
        typeof email === 'string' &&
        email.includes('@'),
    );

    if (!validEmails.length) {
      throw new Error(
        'No valid emails found',
      );
    }

    console.log(
      'Sending subscribe emails to:',
      validEmails,
    );

    const transporter = createTransporter();

    // VERIFY SMTP FIRST
    await transporter.verify();

    console.log(
      'SMTP server connected successfully',
    );

    // ================= BODY CONTENT =================

    const bodyContent =
      buildBodyContent(
        'User',
        `${htmlBody}`,
      );

    // ================= SEND EMAIL ONE BY ONE =================

    const results = [];

    for (const email of validEmails) {

      const mailOptions: nodemailer.SendMailOptions =
        {
          from:
            '"Vedic Health" <info@vedichealth.org>',

          // RESPECTIVE EMAIL IN TO
          to: email,

          subject: subject,

          text: `${subject} Please check the HTML version of this email.`,

          html: buildEmailHtml(
            subject,
            bodyContent,
            false,
          ),
        };

      // console.log(
      //   'Sending mail >>>>>>>>>>>>>>>>>>>>>>>>>>>',
      //   mailOptions,
      // );

      try {

        const response =
          await transporter.sendMail(
            mailOptions,
          );

        results.push({
          email,
          status: true,
          messageId:
            response.messageId,
        });

      } catch (err) {

        console.error(
          `Failed for ${email}`,
          err,
        );

        results.push({
          email,
          status: false,
        });
      }
    }

    // ================= FINAL RESPONSE =================

    return {
      status: true,
      message:
        'Emails sent successfully',
      totalEmails:
        validEmails.length,
      results,
    };

  } catch (error: any) {

    console.error(
      'Error sending multiple emails:',
      error,
    );

    return {
      status: false,
      message:
        error.message ||
        'Failed to send emails.',
    };
  }
}


/** Send class booking ticket email */
export async function sendClassBookingTicketEmail(
  email: string,
  className: string,
  classDate: string,
  classTime: string,
  classAddress: string,
  ticketNumber: string,
  quantity: number,
  totalAmount: number,
  qrCode?: string,
  meetingLink?: string,
) {
  const transporter = createTransporter();

  console.log("AAAAAAAA",email, className, classDate,classTime, classAddress,"<<<<<<<<<<<<< sendClassBookingTicketEmail")

  const qrSection = qrCode
    ? `
      <div style="text-align:center;margin:24px 0;">
        <p style="font-weight:700;color:#7a3a14;margin-bottom:10px;font-family:'Poppins',Arial,sans-serif;">Scan QR Code at the Class</p>
        <img src="${qrCode}" alt="QR Code" style="max-width:150px;border:1px solid #efc9a8;border-radius:6px;" />
      </div>
    `
    : '';

  const meetingSection = meetingLink
    ? ctaButton(meetingLink, 'Join / View Class')
    : '';

  const bodyContent = buildBodyContent(
    'Participant',
    `
      ${p(`Greetings from <strong>Vedic Health</strong> 🌿`)}
      ${p(`We are pleased to confirm your booking for <strong>${className}</strong>. Your ticket details are below.`)}
      ${infoBox(`
        ${infoRow('Class', className)}
        ${infoRow('Date', classDate)}
        ${infoRow('Time', classTime)}
        ${infoRow('Mode & Location', classAddress)}
        ${infoRow('Ticket Number', ticketNumber)}
        ${infoRow('Quantity', String(quantity))}
        ${infoRow('Total Amount', `$${totalAmount}`)}
      `)}
      ${meetingSection}
      ${qrSection}
      ${p('We look forward to your participation. Please bring this ticket (digital or printed) to the class.')}
    `,
    'Warm regards,',
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: `🎫 Your Class Booking Ticket – ${className}`,
    text: `CLASS BOOKING CONFIRMATION\n\nClass: ${className}\nDate: ${classDate}\nTime: ${classTime}\nAddress: ${classAddress}\nTicket Number: ${ticketNumber}\nQuantity: ${quantity}\nTotal Amount: $${totalAmount}\n\n${meetingLink ? `Online Meeting Link: ${meetingLink}` : ''}\n\nThank you for your booking!\n\nRegards,\nVedic Health Team`,
    html: buildEmailHtml(`Your booking for ${className} is confirmed.`, bodyContent, false),
  };

  console.log(mailOptions,"<<<<<<<<<<<<<<<<<<<<<<<<<<<Mail for sendClassBookingTicketEmail")

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Class booking ticket sent successfully to ${email} for class: ${className}`);
    return { status: true, message: 'Class booking ticket sent successfully' };
  } catch (error) {
    console.error('Error sending class booking ticket email:', error);
    return { status: false, message: 'Failed to send class booking ticket email.' };
  }
}

/** Send new class booking admin notification */
export async function sendNewClassBookingAdminEmail(
  className: string,
  userName: string,
  userEmail: string,
  bookingDateTime: string,
) {
  const transporter = createTransporter();

  console.log(className, userName, userEmail, bookingDateTime)

  const bodyContent = buildBodyContent(
    'Admin',
    `
      ${p(`A new user has booked the class <strong>${className}</strong>. Please confirm the booking in the admin dashboard.`)}
      ${infoBox(`
        ${infoRow('Class Name', className)}
        ${infoRow('User Name', userName)}
        ${infoRow('User Email', userEmail)}
        ${infoRow('Booking Date', bookingDateTime)}
      `)}
    `,
    'Best regards,',
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: CONTACT_ENQUIRY_ADMIN_EMAIL,
    subject: `New Class Booking – ${className}`,
    text: `Hello Admin,\n\nA new user has booked the class ${className}.\n\nBooking Details:\n- Class Name: ${className}\n- User Name: ${userName}\n- User Email: ${userEmail}\n- Booking Date: ${bookingDateTime}\n\nPlease confirm the booking in the admin dashboard.\n\nBest regards,\nVedic Health System`,
    html: buildEmailHtml(`New class booking for ${className} on Vedic Health.`, bodyContent, false),
  };

  console.log(mailOptions,"<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<mail for sendNewClassBookingAdminEmail")
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Admin class booking email sent to ${CONTACT_ENQUIRY_ADMIN_EMAIL} for class: ${className}`);
    return { status: true, message: 'Admin class booking notification sent' };
  } catch (error) {
    console.error('Error sending admin class booking email:', error);
    return { status: false, message: 'Failed to send admin class booking notification.' };
  }
}

// send mail to admin for order pack
// export async function sendOrderPackedAdminEmail(
//   email: string,
//   orderId: string,
//   customerName: string,
//   customerEmail: string,
//   packedDate: string,
// ) {
//   const transporter = createTransporter();
//   const displayName = customerName && customerName.trim() ? customerName.trim() : 'Team';

//   const { hasLogo, attachments } = getLogoAttachment();

//   const bodyContent = buildBodyContent(
//     displayName,
//     `
//       ${p('An order has been marked as <strong>packed</strong> and is ready for the next processing stage.')}
      
//       ${infoBox(`
//         ${infoRow('Order ID', orderId)}
//         ${infoRow('Customer Name', customerName)}
//         ${infoRow('Customer Email', customerEmail)}
//         ${infoRow('Packed Date', packedDate)}
//       `)}

//       ${p('Please proceed with dispatch arrangements.')}
//     `,
//     'Regards,',
//   );

//   const mailOptions: nodemailer.SendMailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: email,
//     subject: `Order Packed Notification – Order #${orderId}`,
//     text: `Hello Vedic Health Team,

// An order has been marked as packed and is ready for the next processing stage.

// Order ID: ${orderId}

// Customer Name: ${customerName}

// Customer Email: ${customerEmail}

// Packed Date: ${packedDate}

// Please proceed with dispatch arrangements.

// Regards,
// Team Vedic Health`,
//     html: buildEmailHtml(
//       'An order has been packed and is ready for dispatch.',
//       bodyContent,
//       hasLogo,
//     ),
//     attachments: attachments.length ? attachments : undefined,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Order packed email sent to ${email}`);
//     return {
//       status: true,
//       message: 'Order packed email sent successfully',
//     };
//   } catch (error) {
//     console.error('Error sending order packed email:', error);
//     return {
//       status: false,
//       message: 'Failed to send order packed email.',
//     };
//   }
// }
export async function sendOrderPackedAdminEmail(
  email: string,
  orderId: string,
  customerName: string,
  customerEmail: string,
  packedDate: string,
  productList: any[],
  orderFullData: any
) {
  const transporter = createTransporter();

  const displayName =
    customerName && customerName.trim()
      ? customerName.trim()
      : "Team";

  const { hasLogo, attachments } = getLogoAttachment();

  const orderData = Array.isArray(orderFullData)
    ? orderFullData[0] || {}
    : orderFullData || {};

  const shippingAddress = [
    orderData?.billingAddress1,
    orderData?.billingAddress2,
    orderData?.billingCity,
    orderData?.billingState,
    orderData?.billingZipcode,
    orderData?.billingCountry,
  ]
    .filter(Boolean)
    .join(", ");

  const productsHtml = (productList || [])
    .map((item: any) => {
      const price = Number(item.productPrice || 0);
      const qty = Number(item.quantity || 0);
      const totalPrice = price * qty;

      return `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            ${item.productName || ""}
          </td>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            $${price.toFixed(2)}
          </td>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            ${qty}
          </td>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;font-weight:bold;">
            $${totalPrice.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join("");

  const bodyContent = buildBodyContent(
    displayName,
    `
      ${p(
        'An order has been marked as <strong>Packed</strong> and is ready for dispatch.'
      )}

      ${infoBox(`
        ${infoRow("Order ID", `#${orderId}`)}
        ${infoRow("Customer Name", customerName)}
        ${infoRow("Customer Email", customerEmail)}
        ${infoRow("Packed Date", packedDate)}
        ${infoRow(
          "Delivery Method",
          orderData?.pickupDate ? "Pickup" : "Shipping"
        )}
        ${
          orderData?.pickupDate
            ? infoRow(
                "Pickup Date",
                new Date(orderData.pickupDate).toLocaleString()
              )
            : ""
        }
      `)}

      <div style="margin-top:25px;">
        <h3 style="margin-bottom:15px;color:#000;">
          Packed Products
        </h3>

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="border-collapse:collapse;"
        >
          <thead>
            <tr style="background:#F5F5F5;">
              <th style="padding:12px;text-align:left;">Product</th>
              <th style="padding:12px;text-align:left;">Price</th>
              <th style="padding:12px;text-align:left;">Qty</th>
              <th style="padding:12px;text-align:left;">Total</th>
            </tr>
          </thead>

          <tbody>
            ${productsHtml}
          </tbody>
        </table>
      </div>

      ${infoBox(`
        ${infoRow(
          "Subtotal",
          `$${Number(orderData?.totalAmount || 0).toFixed(2)}`
        )}

        ${infoRow(
          "Shipping Charges",
          `$${Number(orderData?.deliveryCharge || 0).toFixed(2)}`
        )}

        ${infoRow(
          "Discount",
          `$${Number(orderData?.discountAmount || 0).toFixed(2)}`
        )}

        ${infoRow(
          "Total Amount",
          `<strong>$${Number(
            orderData?.finalAmount ||
            orderData?.totalAmount ||
            0
          ).toFixed(2)}</strong>`
        )}

        ${infoRow(
          "Payment Status",
          "Paid"
        )}
      `)}

      ${
        orderData?.pickupDate
          ? `
            <div style="margin-top:25px;">
              <h3 style="margin-bottom:10px;color:#000;">
                Pickup Details
              </h3>

              <div
                style="
                  background:#F9F9F9;
                  padding:15px;
                  border-radius:6px;
                  font-size:14px;
                  line-height:22px;
                "
              >
                <strong>Pickup Date:</strong><br/>
                ${new Date(
                  orderData.pickupDate
                ).toLocaleString()}
              </div>
            </div>
          `
          : `
            <div style="margin-top:25px;">
              <h3 style="margin-bottom:10px;color:#000;">
                Shipping Address
              </h3>

              <div
                style="
                  background:#F9F9F9;
                  padding:15px;
                  border-radius:6px;
                  font-size:14px;
                  line-height:22px;
                "
              >
                <strong>${customerName}</strong><br/>
                ${shippingAddress || "N/A"}
              </div>
            </div>
          `
      }

      ${p(
        "Please proceed with dispatch arrangements and update the shipment status once dispatched."
      )}
    `,
    "Regards,"
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: `Order Packed Notification – Order #${orderId}`,

    text: `
Hello Vedic Health Team,

An order has been marked as packed and is ready for dispatch.

Order ID: ${orderId}
Customer Name: ${customerName}
Customer Email: ${customerEmail}
Packed Date: ${packedDate}

Please proceed with dispatch arrangements.

Regards,
Team Vedic Health
`,

    html: buildEmailHtml(
      `Order #${orderId} has been packed and is ready for dispatch.`,
      bodyContent,
      hasLogo
    ),

    attachments: attachments.length
      ? attachments
      : undefined,
  };

  try {
    await transporter.sendMail(mailOptions);

    console.log(
      `Order packed email sent successfully for Order #${orderId}`
    );

    return {
      status: true,
      message: "Order packed email sent successfully",
    };
  } catch (error) {
    console.error(
      "Error sending order packed email:",
      error
    );

    return {
      status: false,
      message: "Failed to send order packed email.",
    };
  }
}


// export async function sendOrderReadyAdminEmail(
//   email: string,
//   orderId: string,
//   customerName: string,
//   customerEmail: string,
//   readyDate: string,
// ) {
//   const transporter = createTransporter();
//   const displayName = customerName && customerName.trim() ? customerName.trim() : 'Team';

//   const { hasLogo, attachments } = getLogoAttachment();

//   const bodyContent = buildBodyContent(
//     displayName,
//     `
//       ${p('An order is ready for <strong>shipment or customer pickup</strong>.')}

//       ${infoBox(`
//         ${infoRow('Order ID', orderId)}
//         ${infoRow('Customer Name', customerName)}
//         ${infoRow('Customer Email', customerEmail)}
//         ${infoRow('Ready Date', readyDate)}
//       `)}

//       ${p('Please complete the next fulfillment step.')}
//     `,
//     'Regards,',
//   );

//   const mailOptions: nodemailer.SendMailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: email,
//     subject: `Order Ready Notification – Order #${orderId}`,
//     text: `Hello Vedic Health Team,

// An order is ready for shipment or customer pickup.

// Order ID: ${orderId}

// Customer Name: ${customerName}

// Customer Email: ${customerEmail}

// Ready Date: ${readyDate}

// Please complete the next fulfillment step.

// Regards,
// Team Vedic Health`,
//     html: buildEmailHtml(
//       'An order is ready for shipment or customer pickup.',
//       bodyContent,
//       hasLogo,
//     ),
//     attachments: attachments.length ? attachments : undefined,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Order ready email sent to ${email}`);
//     return {
//       status: true,
//       message: 'Order ready email sent successfully',
//     };
//   } catch (error) {
//     console.error('Error sending order ready email:', error);
//     return {
//       status: false,
//       message: 'Failed to send order ready email.',
//     };
//   }
// }
export async function sendOrderReadyAdminEmail(
  email: string,
  orderId: string,
  customerName: string,
  customerEmail: string,
  readyDate: string,
  productList: any[],
  orderFullData: any
) {
  const transporter = createTransporter();

  const displayName =
    customerName && customerName.trim()
      ? customerName.trim()
      : "Team";

  const { hasLogo, attachments } = getLogoAttachment();

  const orderData = Array.isArray(orderFullData)
    ? orderFullData[0] || {}
    : orderFullData || {};

  const shippingAddress = [
    orderData?.billingAddress1,
    orderData?.billingAddress2,
    orderData?.billingCity,
    orderData?.billingState,
    orderData?.billingZipcode,
    orderData?.billingCountry,
  ]
    .filter(Boolean)
    .join(", ");

  const productsHtml = (productList || [])
    .map((item: any) => {
      const price = Number(item.productPrice || 0);
      const qty = Number(item.quantity || 0);
      const totalPrice = price * qty;

      return `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            ${item.productName || ""}
          </td>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            $${price.toFixed(2)}
          </td>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            ${qty}
          </td>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;font-weight:bold;">
            $${totalPrice.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join("");

  const bodyContent = buildBodyContent(
    displayName,
    `
      ${p(
        'An order is now <strong>Ready</strong> for shipment or customer pickup.'
      )}

      ${infoBox(`
        ${infoRow("Order ID", `#${orderId}`)}
        ${infoRow("Customer Name", customerName)}
        ${infoRow("Customer Email", customerEmail)}
        ${infoRow("Ready Date", readyDate)}
        ${infoRow(
          "Delivery Method",
          orderData?.pickupDate ? "Pickup" : "Shipping"
        )}
        ${
          orderData?.pickupDate
            ? infoRow(
                "Pickup Date",
                new Date(orderData.pickupDate).toLocaleString()
              )
            : ""
        }
      `)}

      <div style="margin-top:25px;">
        <h3 style="margin-bottom:15px;color:#000;">
          Order Items
        </h3>

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="border-collapse:collapse;"
        >
          <thead>
            <tr style="background:#F5F5F5;">
              <th style="padding:12px;text-align:left;">Product</th>
              <th style="padding:12px;text-align:left;">Price</th>
              <th style="padding:12px;text-align:left;">Qty</th>
              <th style="padding:12px;text-align:left;">Total</th>
            </tr>
          </thead>

          <tbody>
            ${productsHtml}
          </tbody>
        </table>
      </div>

      ${infoBox(`
        ${infoRow(
          "Subtotal",
          `$${Number(orderData?.totalAmount || 0).toFixed(2)}`
        )}

        ${infoRow(
          "Shipping Charges",
          `$${Number(orderData?.deliveryCharge || 0).toFixed(2)}`
        )}

        ${infoRow(
          "Discount",
          `$${Number(orderData?.discountAmount || 0).toFixed(2)}`
        )}

        ${infoRow(
          "Total Amount",
          `<strong>$${Number(
            orderData?.finalAmount ||
            orderData?.totalAmount ||
            0
          ).toFixed(2)}</strong>`
        )}

        ${infoRow(
          "Payment Status",
          "Paid"
        )}
      `)}

      ${
        orderData?.pickupDate
          ? `
            <div style="margin-top:25px;">
              <h3 style="margin-bottom:10px;color:#000;">
                Pickup Details
              </h3>

              <div
                style="
                  background:#F9F9F9;
                  padding:15px;
                  border-radius:6px;
                  font-size:14px;
                  line-height:22px;
                "
              >
                <strong>Pickup Date:</strong><br/>
                ${new Date(
                  orderData.pickupDate
                ).toLocaleString()}
              </div>
            </div>
          `
          : `
            <div style="margin-top:25px;">
              <h3 style="margin-bottom:10px;color:#000;">
                Shipping Address
              </h3>

              <div
                style="
                  background:#F9F9F9;
                  padding:15px;
                  border-radius:6px;
                  font-size:14px;
                  line-height:22px;
                "
              >
                <strong>${customerName}</strong><br/>
                ${shippingAddress || "N/A"}
              </div>
            </div>
          `
      }

      ${p(
        "Please complete the next fulfillment step and arrange shipment or customer pickup."
      )}
    `,
    "Regards,"
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: `Order Ready Notification – Order #${orderId}`,

    text: `
Hello Vedic Health Team,

An order is ready for shipment or customer pickup.

Order ID: ${orderId}
Customer Name: ${customerName}
Customer Email: ${customerEmail}
Ready Date: ${readyDate}

Please complete the next fulfillment step.

Regards,
Team Vedic Health
`,

    html: buildEmailHtml(
      `Order #${orderId} is ready for shipment or customer pickup.`,
      bodyContent,
      hasLogo
    ),

    attachments: attachments.length
      ? attachments
      : undefined,
  };

  try {
    await transporter.sendMail(mailOptions);

    console.log(
      `Order ready email sent successfully for Order #${orderId}`
    );

    return {
      status: true,
      message: "Order ready email sent successfully",
    };
  } catch (error) {
    console.error(
      "Error sending order ready email:",
      error
    );

    return {
      status: false,
      message: "Failed to send order ready email.",
    };
  }
}

// export async function sendOrderPickupAdminEmail(
//   email: string,
//   orderId: string,
//   customerName: string,
//   customerEmail: string,
//   pickupDate: string,
// ) {
//   const transporter = createTransporter();
//   const displayName = customerName && customerName.trim() ? customerName.trim() : 'Team';

//   const { hasLogo, attachments } = getLogoAttachment();

//   const bodyContent = buildBodyContent(
//     displayName,
//     `
//       ${p('An order has been successfully <strong>picked up by the customer</strong>.')}

//       ${infoBox(`
//         ${infoRow('Order ID', orderId)}
//         ${infoRow('Customer Name', customerName)}
//         ${infoRow('Customer Email', customerEmail)}
//         ${infoRow('Pickup Date', pickupDate)}
//       `)}

//       ${p('Please update the order records accordingly.')}
//     `,
//     'Regards,',
//   );

//   const mailOptions: nodemailer.SendMailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: email,
//     subject: `Order Pickup Confirmation – Order #${orderId}`,
//     text: `Hello Vedic Health Team,

// An order has been successfully picked up by the customer.

// Order ID: ${orderId}

// Customer Name: ${customerName}

// Customer Email: ${customerEmail}

// Pickup Date: ${pickupDate}

// Please update the order records accordingly.

// Regards,
// Team Vedic Health`,
//     html: buildEmailHtml(
//       'An order has been successfully picked up by the customer.',
//       bodyContent,
//       hasLogo,
//     ),
//     attachments: attachments.length ? attachments : undefined,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Order pickup email sent to ${email}`);
//     return {
//       status: true,
//       message: 'Order pickup email sent successfully',
//     };
//   } catch (error) {
//     console.error('Error sending order pickup email:', error);
//     return {
//       status: false,
//       message: 'Failed to send order pickup email.',
//     };
//   }
// }

export async function sendOrderPickupAdminEmail(
  email: string,
  orderId: string,
  customerName: string,
  customerEmail: string,
  pickupDate: string,
  productList: any[],
  orderFullData: any
) {
  const transporter = createTransporter();

  const displayName =
    customerName && customerName.trim()
      ? customerName.trim()
      : "Team";

  const { hasLogo, attachments } = getLogoAttachment();

  const orderData = Array.isArray(orderFullData)
    ? orderFullData[0] || {}
    : orderFullData || {};

  const shippingAddress = [
    orderData?.billingAddress1,
    orderData?.billingAddress2,
    orderData?.billingCity,
    orderData?.billingState,
    orderData?.billingZipcode,
    orderData?.billingCountry,
  ]
    .filter(Boolean)
    .join(", ");

  const productsHtml = (productList || [])
    .map((item: any) => {
      const price = Number(item.productPrice || 0);
      const qty = Number(item.quantity || 0);
      const totalPrice = price * qty;

      return `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            ${item.productName || ""}
          </td>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            $${price.toFixed(2)}
          </td>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            ${qty}
          </td>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;font-weight:bold;">
            $${totalPrice.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join("");

  const bodyContent = buildBodyContent(
    displayName,
    `
      ${p(
        'An order has been successfully <strong>picked up by the customer</strong>.'
      )}

      ${infoBox(`
        ${infoRow("Order ID", `#${orderId}`)}
        ${infoRow("Customer Name", customerName)}
        ${infoRow("Customer Email", customerEmail)}
        ${infoRow("Pickup Date", pickupDate)}
        ${infoRow(
          "Delivery Method",
          orderData?.pickupDate ? "Pickup" : "Shipping"
        )}
      `)}

      <div style="margin-top:25px;">
        <h3 style="margin-bottom:15px;color:#000;">
          Order Items
        </h3>

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="border-collapse:collapse;"
        >
          <thead>
            <tr style="background:#F5F5F5;">
              <th style="padding:12px;text-align:left;">Product</th>
              <th style="padding:12px;text-align:left;">Price</th>
              <th style="padding:12px;text-align:left;">Qty</th>
              <th style="padding:12px;text-align:left;">Total</th>
            </tr>
          </thead>

          <tbody>
            ${productsHtml}
          </tbody>
        </table>
      </div>

      ${infoBox(`
        ${infoRow(
          "Subtotal",
          `$${Number(orderData?.totalAmount || 0).toFixed(2)}`
        )}

        ${infoRow(
          "Shipping Charges",
          `$${Number(orderData?.deliveryCharge || 0).toFixed(2)}`
        )}

        ${infoRow(
          "Discount",
          `$${Number(orderData?.discountAmount || 0).toFixed(2)}`
        )}

        ${infoRow(
          "Total Amount",
          `<strong>$${Number(
            orderData?.finalAmount ||
            orderData?.totalAmount ||
            0
          ).toFixed(2)}</strong>`
        )}

        ${infoRow(
          "Payment Status",
          "Paid"
        )}
      `)}

      ${
        orderData?.pickupDate
          ? `
            <div style="margin-top:25px;">
              <h3 style="margin-bottom:10px;color:#000;">
                Pickup Details
              </h3>

              <div
                style="
                  background:#F9F9F9;
                  padding:15px;
                  border-radius:6px;
                  font-size:14px;
                  line-height:22px;
                "
              >
                <strong>Pickup Date:</strong><br/>
                ${new Date(
                  orderData.pickupDate
                ).toLocaleString()}
              </div>
            </div>
          `
          : `
            <div style="margin-top:25px;">
              <h3 style="margin-bottom:10px;color:#000;">
                Shipping Address
              </h3>

              <div
                style="
                  background:#F9F9F9;
                  padding:15px;
                  border-radius:6px;
                  font-size:14px;
                  line-height:22px;
                "
              >
                <strong>${customerName}</strong><br/>
                ${shippingAddress || "N/A"}
              </div>
            </div>
          `
      }

      ${p(
        "Please update the order records accordingly."
      )}
    `,
    "Regards,"
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: `Order Pickup Confirmation – Order #${orderId}`,

    text: `
Hello Vedic Health Team,

An order has been successfully picked up by the customer.

Order ID: ${orderId}
Customer Name: ${customerName}
Customer Email: ${customerEmail}
Pickup Date: ${pickupDate}

Please update the order records accordingly.

Regards,
Team Vedic Health
`,

    html: buildEmailHtml(
      `Order #${orderId} has been successfully picked up by the customer.`,
      bodyContent,
      hasLogo
    ),

    attachments: attachments.length
      ? attachments
      : undefined,
  };

  try {
    await transporter.sendMail(mailOptions);

    console.log(
      `Order pickup email sent successfully for Order #${orderId}`
    );

    return {
      status: true,
      message: "Order pickup email sent successfully",
    };
  } catch (error) {
    console.error(
      "Error sending order pickup email:",
      error
    );

    return {
      status: false,
      message: "Failed to send order pickup email.",
    };
  }
}

// export async function sendOrderDispatchedAdminEmail(
//   email: string,
//   orderId: string,
//   customerName: string,
//   customerEmail: string,
//   dispatchDate: string,
//   shippingPartner: string,
// ) {
//   const transporter = createTransporter();
//   const displayName = customerName && customerName.trim() ? customerName.trim() : 'Team';

//   const { hasLogo, attachments } = getLogoAttachment();

//   const bodyContent = buildBodyContent(
//     displayName,
//     `
//       ${p('An order has been <strong>dispatched</strong> and is currently in transit to the customer.')}

//       ${infoBox(`
//         ${infoRow('Order ID', orderId)}
//         ${infoRow('Customer Name', customerName)}
//         ${infoRow('Customer Email', customerEmail)}
//         ${infoRow('Dispatch Date', dispatchDate)}
//         ${infoRow('Shipping Partner', shippingPartner)}
//       `)}

//       ${p('Please monitor the shipment status and ensure timely delivery.')}
//     `,
//     'Regards,',
//   );

//   const mailOptions: nodemailer.SendMailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: email,
//     subject: `Order Dispatched Notification – Order #${orderId}`,
//     text: `Hello Vedic Health Team,

// An order has been dispatched and is currently in transit to the customer.

// Order ID: ${orderId}

// Customer Name: ${customerName}

// Customer Email: ${customerEmail}

// Dispatch Date: ${dispatchDate}

// Shipping Partner: ${shippingPartner}

// Please monitor the shipment status and ensure timely delivery.

// Regards,
// Team Vedic Health`,
//     html: buildEmailHtml(
//       'An order has been dispatched and is now in transit.',
//       bodyContent,
//       hasLogo,
//     ),
//     attachments: attachments.length ? attachments : undefined,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Order dispatched email sent to ${email}`);
//     return {
//       status: true,
//       message: 'Order dispatched email sent successfully',
//     };
//   } catch (error) {
//     console.error('Error sending order dispatched email:', error);
//     return {
//       status: false,
//       message: 'Failed to send order dispatched email.',
//     };
//   }
// }

export async function sendOrderDispatchedAdminEmail(
  email: string,
  orderId: string,
  customerName: string,
  customerEmail: string,
  dispatchDate: string,
  shippingPartner: string,
  productList: any[],
  orderFullData: any
) {
  const transporter = createTransporter();

  const displayName =
    customerName && customerName.trim()
      ? customerName.trim()
      : "Team";

  const { hasLogo, attachments } = getLogoAttachment();

  const orderData = Array.isArray(orderFullData)
    ? orderFullData[0] || {}
    : orderFullData || {};

  const shippingAddress = [
    orderData?.billingAddress1,
    orderData?.billingAddress2,
    orderData?.billingCity,
    orderData?.billingState,
    orderData?.billingZipcode,
    orderData?.billingCountry,
  ]
    .filter(Boolean)
    .join(", ");

  const productsHtml = (productList || [])
    .map((item: any) => {
      const price = Number(item.productPrice || 0);
      const qty = Number(item.quantity || 0);
      const totalPrice = price * qty;

      return `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            ${item.productName || ""}
          </td>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            $${price.toFixed(2)}
          </td>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            ${qty}
          </td>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;font-weight:bold;">
            $${totalPrice.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join("");

  const bodyContent = buildBodyContent(
    displayName,
    `
      ${p(
        'An order has been <strong>dispatched</strong> and is currently in transit to the customer.'
      )}

      ${infoBox(`
        ${infoRow("Order ID", `#${orderId}`)}
        ${infoRow("Customer Name", customerName)}
        ${infoRow("Customer Email", customerEmail)}
        ${infoRow("Dispatch Date", dispatchDate)}
        ${infoRow("Shipping Partner", shippingPartner)}
        ${infoRow(
          "Delivery Method",
          orderData?.pickupDate ? "Pickup" : "Shipping"
        )}
      `)}

      <div style="margin-top:25px;">
        <h3 style="margin-bottom:15px;color:#000;">
          Dispatched Products
        </h3>

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="border-collapse:collapse;"
        >
          <thead>
            <tr style="background:#F5F5F5;">
              <th style="padding:12px;text-align:left;">Product</th>
              <th style="padding:12px;text-align:left;">Price</th>
              <th style="padding:12px;text-align:left;">Qty</th>
              <th style="padding:12px;text-align:left;">Total</th>
            </tr>
          </thead>

          <tbody>
            ${productsHtml}
          </tbody>
        </table>
      </div>

      ${infoBox(`
        ${infoRow(
          "Subtotal",
          `$${Number(orderData?.totalAmount || 0).toFixed(2)}`
        )}

        ${infoRow(
          "Shipping Charges",
          `$${Number(orderData?.deliveryCharge || 0).toFixed(2)}`
        )}

        ${infoRow(
          "Discount",
          `$${Number(orderData?.discountAmount || 0).toFixed(2)}`
        )}

        ${infoRow(
          "Total Amount",
          `<strong>$${Number(
            orderData?.finalAmount ||
              orderData?.totalAmount ||
              0
          ).toFixed(2)}</strong>`
        )}

        ${infoRow(
          "Payment Status",
          "Paid"
        )}
      `)}

      <div style="margin-top:25px;">
        <h3 style="margin-bottom:10px;color:#000;">
          Shipping Address
        </h3>

        <div
          style="
            background:#F9F9F9;
            padding:15px;
            border-radius:6px;
            font-size:14px;
            line-height:22px;
          "
        >
          <strong>${customerName}</strong><br/>
          ${shippingAddress || "N/A"}
        </div>
      </div>

      ${p(
        "Please monitor the shipment status and ensure timely delivery."
      )}
    `,
    "Regards,"
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: `Order Dispatched Notification – Order #${orderId}`,

    text: `
Hello Vedic Health Team,

An order has been dispatched and is currently in transit to the customer.

Order ID: ${orderId}
Customer Name: ${customerName}
Customer Email: ${customerEmail}
Dispatch Date: ${dispatchDate}
Shipping Partner: ${shippingPartner}

Please monitor the shipment status and ensure timely delivery.

Regards,
Team Vedic Health
`,

    html: buildEmailHtml(
      `Order #${orderId} has been dispatched and is now in transit.`,
      bodyContent,
      hasLogo
    ),

    attachments: attachments.length
      ? attachments
      : undefined,
  };

  try {
    await transporter.sendMail(mailOptions);

    console.log(
      `Order dispatched email sent successfully for Order #${orderId}`
    );

    return {
      status: true,
      message: "Order dispatched email sent successfully",
    };
  } catch (error) {
    console.error(
      "Error sending order dispatched email:",
      error
    );

    return {
      status: false,
      message: "Failed to send order dispatched email.",
    };
  }
}

// export async function sendOrderCancelledAdminEmail(
//   email: string,
//   orderId: string,
//   customerName: string,
//   customerEmail: string,
//   cancellationDate: string,
// ) {
//   const transporter = createTransporter();
//   const displayName = customerName && customerName.trim() ? customerName.trim() : 'Team';

//   const { hasLogo, attachments } = getLogoAttachment();

//   const bodyContent = buildBodyContent(
//     displayName,
//     `
//       ${p('An order has been <strong>cancelled</strong>.')}

//       ${infoBox(`
//         ${infoRow('Order ID', orderId)}
//         ${infoRow('Customer Name', customerName)}
//         ${infoRow('Customer Email', customerEmail)}
//         ${infoRow('Cancellation Date', cancellationDate)}
//       `)}

//       ${p('Please review the cancellation and update the order records accordingly.')}
//     `,
//     'Regards,',
//   );

//   const mailOptions: nodemailer.SendMailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: email,
//     subject: `Order Cancellation Notification – Order #${orderId}`,
//     text: `Hello Vedic Health Team,

// An order has been cancelled.

// Order ID: ${orderId}

// Customer Name: ${customerName}

// Customer Email: ${customerEmail}

// Cancellation Date: ${cancellationDate}

// Please review the cancellation and update the order records accordingly.

// Regards,
// Team Vedic Health`,
//     html: buildEmailHtml(
//       'An order has been cancelled.',
//       bodyContent,
//       hasLogo,
//     ),
//     attachments: attachments.length ? attachments : undefined,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Order cancellation email sent to ${email}`);
//     return {
//       status: true,
//       message: 'Order cancellation email sent successfully',
//     };
//   } catch (error) {
//     console.error('Error sending order cancellation email:', error);
//     return {
//       status: false,
//       message: 'Failed to send order cancellation email.',
//     };
//   }
// }

export async function sendOrderCancelledAdminEmail(
  email: string,
  orderId: string,
  customerName: string,
  customerEmail: string,
  cancellationDate: string,
  productList: any[],
  orderFullData: any
) {
  const transporter = createTransporter();

  const displayName =
    customerName && customerName.trim()
      ? customerName.trim()
      : "Team";

  const { hasLogo, attachments } = getLogoAttachment();

  const orderData = Array.isArray(orderFullData)
    ? orderFullData[0] || {}
    : orderFullData || {};

  const shippingAddress = [
    orderData?.billingAddress1,
    orderData?.billingAddress2,
    orderData?.billingCity,
    orderData?.billingState,
    orderData?.billingZipcode,
    orderData?.billingCountry,
  ]
    .filter(Boolean)
    .join(", ");

  const productsHtml = (productList || [])
    .map((item: any) => {
      const price = Number(item.productPrice || 0);
      const qty = Number(item.quantity || 0);
      const totalPrice = price * qty;

      return `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            ${item.productName || ""}
          </td>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            $${price.toFixed(2)}
          </td>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            ${qty}
          </td>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;font-weight:bold;">
            $${totalPrice.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join("");

  const bodyContent = buildBodyContent(
    displayName,
    `
      ${p(
        'An order has been <strong>cancelled</strong>. Please review the cancellation details below.'
      )}

      ${infoBox(`
        ${infoRow("Order ID", `#${orderId}`)}
        ${infoRow("Customer Name", customerName)}
        ${infoRow("Customer Email", customerEmail)}
        ${infoRow("Cancellation Date", cancellationDate)}
        ${infoRow(
          "Delivery Method",
          orderData?.pickupDate ? "Pickup" : "Shipping"
        )}
      `)}

      <div style="margin-top:25px;">
        <h3 style="margin-bottom:15px;color:#000;">
          Cancelled Products
        </h3>

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="border-collapse:collapse;"
        >
          <thead>
            <tr style="background:#F5F5F5;">
              <th style="padding:12px;text-align:left;">Product</th>
              <th style="padding:12px;text-align:left;">Price</th>
              <th style="padding:12px;text-align:left;">Qty</th>
              <th style="padding:12px;text-align:left;">Total</th>
            </tr>
          </thead>

          <tbody>
            ${productsHtml}
          </tbody>
        </table>
      </div>

      ${infoBox(`
        ${infoRow(
          "Subtotal",
          `$${Number(orderData?.totalAmount || 0).toFixed(2)}`
        )}

        ${infoRow(
          "Shipping Charges",
          `$${Number(orderData?.deliveryCharge || 0).toFixed(2)}`
        )}

        ${infoRow(
          "Discount",
          `$${Number(orderData?.discountAmount || 0).toFixed(2)}`
        )}

        ${infoRow(
          "Total Amount",
          `<strong>$${Number(
            orderData?.finalAmount ||
            orderData?.totalAmount ||
            0
          ).toFixed(2)}</strong>`
        )}

        ${infoRow(
          "Payment Status",
          orderData?.paymentStatus || "Paid"
        )}
      `)}

      ${
        orderData?.pickupDate
          ? `
            <div style="margin-top:25px;">
              <h3 style="margin-bottom:10px;color:#000;">
                Pickup Details
              </h3>

              <div
                style="
                  background:#F9F9F9;
                  padding:15px;
                  border-radius:6px;
                  font-size:14px;
                  line-height:22px;
                "
              >
                <strong>Pickup Date:</strong><br/>
                ${new Date(
                  orderData.pickupDate
                ).toLocaleString()}
              </div>
            </div>
          `
          : `
            <div style="margin-top:25px;">
              <h3 style="margin-bottom:10px;color:#000;">
                Shipping Address
              </h3>

              <div
                style="
                  background:#F9F9F9;
                  padding:15px;
                  border-radius:6px;
                  font-size:14px;
                  line-height:22px;
                "
              >
                <strong>${customerName}</strong><br/>
                ${shippingAddress || "N/A"}
              </div>
            </div>
          `
      }

      ${p(
        "Please review the cancellation and update the order records, inventory, and refund process (if applicable)."
      )}
    `,
    "Regards,"
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: `Order Cancellation Notification – Order #${orderId}`,

    text: `
Hello Vedic Health Team,

An order has been cancelled.

Order ID: ${orderId}
Customer Name: ${customerName}
Customer Email: ${customerEmail}
Cancellation Date: ${cancellationDate}

Please review the cancellation and update the order records accordingly.

Regards,
Team Vedic Health
`,

    html: buildEmailHtml(
      `Order #${orderId} has been cancelled.`,
      bodyContent,
      hasLogo
    ),

    attachments: attachments.length
      ? attachments
      : undefined,
  };

  try {
    await transporter.sendMail(mailOptions);

    console.log(
      `Order cancellation email sent successfully for Order #${orderId}`
    );

    return {
      status: true,
      message: "Order cancellation email sent successfully",
    };
  } catch (error) {
    console.error(
      "Error sending order cancellation email:",
      error
    );

    return {
      status: false,
      message: "Failed to send order cancellation email.",
    };
  }
}

// export async function sendOrderPickupDateUpdatedAdminEmail(
//   email: string,
//   orderId: string,
//   customerName: string,
//   customerEmail: string,
//   pickupDate: string,
// ) {
//   const transporter = createTransporter();
//   const displayName = customerName && customerName.trim() ? customerName.trim() : 'Team';

//   const { hasLogo, attachments } = getLogoAttachment();

//   const bodyContent = buildBodyContent(
//     displayName,
//     `
//       ${p('The pickup date for an order has been <strong>updated</strong>.')}

//       ${infoBox(`
//         ${infoRow('Order ID', orderId)}
//         ${infoRow('Customer Name', customerName)}
//         ${infoRow('Customer Email', customerEmail)}
//         ${infoRow('Updated Pickup Date', pickupDate)}
//       `)}

//       ${p('Please review the updated schedule.')}
//     `,
//     'Regards,',
//   );

//   const mailOptions: nodemailer.SendMailOptions = {
//     from: '"Vedic Health" <info@vedichealth.org>',
//     to: email,
//     subject: `Order Pickup Date Updated – Order #${orderId}`,
//     text: `Hello Vedic Health Team,

// The pickup date for an order has been updated.

// Order ID: ${orderId}

// Customer Name: ${customerName}

// Customer Email: ${customerEmail}

// Updated Pickup Date: ${pickupDate}

// Please review the updated schedule.

// Regards,
// Team Vedic Health`,
//     html: buildEmailHtml(
//       'The pickup date for an order has been updated.',
//       bodyContent,
//       hasLogo,
//     ),
//     attachments: attachments.length ? attachments : undefined,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Order pickup date update email sent to ${email}`);
//     return {
//       status: true,
//       message: 'Order pickup date update email sent successfully',
//     };
//   } catch (error) {
//     console.error('Error sending order pickup date update email:', error);
//     return {
//       status: false,
//       message: 'Failed to send order pickup date update email.',
//     };
//   }
// }

export async function sendOrderPickupDateUpdatedAdminEmail(
  email: string,
  orderId: string,
  customerName: string,
  customerEmail: string,
  pickupDate: string,
  productList: any[],
  orderFullData: any
) {
  const transporter = createTransporter();

  const displayName =
    customerName && customerName.trim()
      ? customerName.trim()
      : "Team";

  const { hasLogo, attachments } = getLogoAttachment();

  const orderData = Array.isArray(orderFullData)
    ? orderFullData[0] || {}
    : orderFullData || {};

  const shippingAddress = [
    orderData?.billingAddress1,
    orderData?.billingAddress2,
    orderData?.billingCity,
    orderData?.billingState,
    orderData?.billingZipcode,
    orderData?.billingCountry,
  ]
    .filter(Boolean)
    .join(", ");

  const productsHtml = (productList || [])
    .map((item: any) => {
      const price = Number(item.productPrice || 0);
      const qty = Number(item.quantity || 0);
      const totalPrice = price * qty;

      return `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            ${item.productName || ""}
          </td>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            $${price.toFixed(2)}
          </td>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;">
            ${qty}
          </td>
          <td style="padding:10px;border-bottom:1px solid #E5E5E5;font-weight:bold;">
            $${totalPrice.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join("");

  const bodyContent = buildBodyContent(
    displayName,
    `
      ${p(
        'The pickup date for an order has been <strong>updated</strong>. Please review the updated order details below.'
      )}

      ${infoBox(`
        ${infoRow("Order ID", `#${orderId}`)}
        ${infoRow("Customer Name", customerName)}
        ${infoRow("Customer Email", customerEmail)}
        ${infoRow("Updated Pickup Date", pickupDate)}
        ${infoRow(
          "Delivery Method",
          orderData?.pickupDate ? "Pickup" : "Shipping"
        )}
      `)}

      <div style="margin-top:25px;">
        <h3 style="margin-bottom:15px;color:#000;">
          Order Products
        </h3>

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="border-collapse:collapse;"
        >
          <thead>
            <tr style="background:#F5F5F5;">
              <th style="padding:12px;text-align:left;">Product</th>
              <th style="padding:12px;text-align:left;">Price</th>
              <th style="padding:12px;text-align:left;">Qty</th>
              <th style="padding:12px;text-align:left;">Total</th>
            </tr>
          </thead>

          <tbody>
            ${productsHtml}
          </tbody>
        </table>
      </div>

      ${infoBox(`
        ${infoRow(
          "Subtotal",
          `$${Number(orderData?.totalAmount || 0).toFixed(2)}`
        )}

        ${infoRow(
          "Shipping Charges",
          `$${Number(orderData?.deliveryCharge || 0).toFixed(2)}`
        )}

        ${infoRow(
          "Discount",
          `$${Number(orderData?.discountAmount || 0).toFixed(2)}`
        )}

        ${infoRow(
          "Total Amount",
          `<strong>$${Number(
            orderData?.finalAmount ||
            orderData?.totalAmount ||
            0
          ).toFixed(2)}</strong>`
        )}

        ${infoRow(
          "Payment Status",
          orderData?.paymentStatus || "Paid"
        )}
      `)}

      ${
        orderData?.pickupDate
          ? `
            <div style="margin-top:25px;">
              <h3 style="margin-bottom:10px;color:#000;">
                Updated Pickup Details
              </h3>

              <div
                style="
                  background:#F9F9F9;
                  padding:15px;
                  border-radius:6px;
                  font-size:14px;
                  line-height:22px;
                "
              >
                <strong>Pickup Date:</strong><br/>
                ${pickupDate}
              </div>
            </div>
          `
          : `
            <div style="margin-top:25px;">
              <h3 style="margin-bottom:10px;color:#000;">
                Shipping Address
              </h3>

              <div
                style="
                  background:#F9F9F9;
                  padding:15px;
                  border-radius:6px;
                  font-size:14px;
                  line-height:22px;
                "
              >
                <strong>${customerName}</strong><br/>
                ${shippingAddress || "N/A"}
              </div>
            </div>
          `
      }

      ${p(
        "Please review the updated pickup schedule and make any necessary operational adjustments."
      )}
    `,
    "Regards,"
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: `Order Pickup Date Updated – Order #${orderId}`,

    text: `
Hello Vedic Health Team,

The pickup date for an order has been updated.

Order ID: ${orderId}
Customer Name: ${customerName}
Customer Email: ${customerEmail}
Updated Pickup Date: ${pickupDate}

Please review the updated schedule.

Regards,
Team Vedic Health
`,

    html: buildEmailHtml(
      `Pickup date updated for Order #${orderId}`,
      bodyContent,
      hasLogo
    ),

    attachments: attachments.length
      ? attachments
      : undefined,
  };

  try {
    await transporter.sendMail(mailOptions);

    console.log(
      `Order pickup date update email sent successfully for Order #${orderId}`
    );

    return {
      status: true,
      message: "Order pickup date update email sent successfully",
    };
  } catch (error) {
    console.error(
      "Error sending order pickup date update email:",
      error
    );

    return {
      status: false,
      message: "Failed to send order pickup date update email.",
    };
  }
}


export async function sendAppointmentScheduledNotificationAdminEmail(
  email: string,
  customerName: string,
  customerEmail: string,
  practitionerName: string,
  appointmentDate: string,
  appointmentTime: string,
) {
  const transporter = createTransporter();
  const displayName = customerName?.trim() || 'Team';

  const { hasLogo, attachments } = getLogoAttachment();

  const bodyContent = buildBodyContent(
    displayName,
    `
      ${p('A new appointment has been <strong>scheduled</strong> on the Vedic Health platform.')}

      ${infoBox(`
        ${infoRow('Customer Name', customerName)}
        ${infoRow('Customer Email', customerEmail)}
        ${infoRow('Practitioner', practitionerName)}
        ${infoRow('Date', appointmentDate)}
        ${infoRow('Time', appointmentTime)}
      `)}

      ${p('Please review the appointment details and prepare accordingly.')}
    `,
    'Regards,',
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: `New Appointment Scheduled`,
    text: `Hello Vedic Health Team,

A new appointment has been scheduled on the Vedic Health platform.


Customer Name: ${customerName}

Customer Email: ${customerEmail}

Practitioner: ${practitionerName}

Date: ${appointmentDate}

Time: ${appointmentTime}

Please review the appointment details and prepare accordingly.

Regards,
Team Vedic Health`,
    html: buildEmailHtml(
      'A new appointment has been scheduled on the Vedic Health platform.',
      bodyContent,
      hasLogo,
    ),
    attachments: attachments.length ? attachments : undefined,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Appointment scheduled notification email sent to ${email}`);
    return {
      status: true,
      message: 'Appointment scheduled notification email sent successfully',
    };
  } catch (error) {
    console.error('Error sending appointment scheduled notification email:', error);
    return {
      status: false,
      message: 'Failed to send appointment scheduled notification email.',
    };
  }
}


export async function sendAppointmentRescheduledNotificationAdminEmail(
  email: string,
  customerName: string,
  customerEmail: string,
  practitionerName: string,
  appointmentDate: string,
  appointmentTime: string,
) {
  const transporter = createTransporter();
  const displayName = customerName?.trim() || 'Team';

  const { hasLogo, attachments } = getLogoAttachment();

  const bodyContent = buildBodyContent(
    displayName,
    `
      ${p('An appointment has been <strong>rescheduled</strong> on the Vedic Health platform.')}

      ${infoBox(`
        ${infoRow('Customer Name', customerName)}
        ${infoRow('Customer Email', customerEmail)}
        ${infoRow('New Date', appointmentDate)}
        ${infoRow('New Time', appointmentTime)}
        ${infoRow('Practitioner', practitionerName)}
      `)}

      ${p('Please review the updated appointment details.')}
    `,
    'Regards,',
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: 'Appointment Rescheduled',
    text: `Hello Vedic Health Team,

An appointment has been rescheduled on the Vedic Health platform.

Customer Name: ${customerName}

Customer Email: ${customerEmail}

New Date: ${appointmentDate}

New Time: ${appointmentTime}

Practitioner: ${practitionerName}

Please review the updated appointment details.

Regards,
Team Vedic Health`,
    html: buildEmailHtml(
      'An appointment has been rescheduled on the Vedic Health platform.',
      bodyContent,
      hasLogo,
    ),
    attachments: attachments.length ? attachments : undefined,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Appointment rescheduled notification email sent to ${email}`);
    return {
      status: true,
      message: 'Appointment rescheduled notification email sent successfully',
    };
  } catch (error) {
    console.error('Error sending appointment rescheduled notification email:', error);
    return {
      status: false,
      message: 'Failed to send appointment rescheduled notification email.',
    };
  }
}

export async function sendAppointmentCancelledNotificationAdminEmail(
  email: string,
  customerName: string,
  customerEmail: string,
  practitionerName: string,
  appointmentDate: string,
  appointmentTime: string,
) {
  const transporter = createTransporter();
  const displayName = customerName?.trim() || 'Team';

  const { hasLogo, attachments } = getLogoAttachment();

  const bodyContent = buildBodyContent(
    displayName,
    `
      ${p('An appointment has been <strong>cancelled</strong> by the Vedic Health team.')}

      ${infoBox(`
        ${infoRow('Customer Name', customerName)}
        ${infoRow('Customer Email', customerEmail)}
        ${infoRow('Practitioner', practitionerName)}
        ${infoRow('Date', appointmentDate)}
        ${infoRow('Time', appointmentTime)}
      `)}

      ${p('Please review the cancellation details.')}
    `,
    'Regards,',
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: 'Appointment Cancelled',
    text: `Hello Vedic Health Team,

An appointment has been cancelled by the Vedic Health team.

Customer Name: ${customerName}

Customer Email: ${customerEmail}

Practitioner: ${practitionerName}

Date: ${appointmentDate}

Time: ${appointmentTime}

Please review the cancellation details.

Regards,
Team Vedic Health`,
    html: buildEmailHtml(
      'An appointment has been cancelled by the Vedic Health team.',
      bodyContent,
      hasLogo,
    ),
    attachments: attachments.length ? attachments : undefined,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Appointment cancelled notification email sent to ${email}`);
    return {
      status: true,
      message: 'Appointment cancelled notification email sent successfully',
    };
  } catch (error) {
    console.error('Error sending appointment cancelled notification email:', error);
    return {
      status: false,
      message: 'Failed to send appointment cancelled notification email.',
    };
  }
}

export async function sendAppointmentCompletedNotificationAdminEmail(
  email: string,
  customerName: string,
  customerEmail: string,
  practitionerName: string,
  appointmentDate: string,
  appointmentTime: string,
) {
  const transporter = createTransporter();
  const displayName = customerName?.trim() || 'Team';

  const { hasLogo, attachments } = getLogoAttachment();

  const bodyContent = buildBodyContent(
    displayName,
    `
      ${p('An appointment has been <strong>completed successfully</strong>.')}

      ${infoBox(`
        ${infoRow('Customer Name', customerName)}
        ${infoRow('Customer Email', customerEmail)}
        ${infoRow('Practitioner', practitionerName)}
        ${infoRow('Date', appointmentDate)}
        ${infoRow('Time', appointmentTime)}
      `)}

      ${p('Please update any required records or follow-up actions.')}
    `,
    'Regards,',
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: 'Appointment Completed',
    text: `Hello Vedic Health Team,

An appointment has been completed successfully.

Customer Name: ${customerName}

Customer Email: ${customerEmail}

Practitioner: ${practitionerName}

Date: ${appointmentDate}

Time: ${appointmentTime}

Please update any required records or follow-up actions.

Regards,
Team Vedic Health`,
    html: buildEmailHtml(
      'An appointment has been completed successfully.',
      bodyContent,
      hasLogo,
    ),
    attachments: attachments.length ? attachments : undefined,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Appointment completed notification email sent to ${email}`);
    return {
      status: true,
      message: 'Appointment completed notification email sent successfully',
    };
  } catch (error) {
    console.error('Error sending appointment completed notification email:', error);
    return {
      status: false,
      message: 'Failed to send appointment completed notification email.',
    };
  }
}

export async function sendMembershipPurchaseConfirmationMail(
  email: string,
  customerName: string,
  membershipDetails: {
    planName: string;
    duration: string;
    startDate: string;
    endDate: string;
    amountPaid: string;
    invoiceNo?: string;
  }
) {
  const transporter = createTransporter();

  const bodyContent = buildBodyContent(
    customerName || 'there',
    `
      ${p('We’re happy to let you know that your <strong>Vedic Health</strong> membership has been successfully activated.')}

      ${infoBox(`
        <div style="text-align:left;font-size:15px;color:#84431d;margin:0;font-family:'Poppins',Arial,sans-serif;line-height:1.6;">
          <p style="margin:0 0 8px;"><strong>Plan:</strong> ${membershipDetails.planName}</p>
          <p style="margin:0 0 8px;"><strong>Duration:</strong> ${membershipDetails.duration}</p>
          <p style="margin:0 0 8px;"><strong>Start Date:</strong> ${membershipDetails.startDate}</p>
          <p style="margin:0 0 8px;"><strong>End Date:</strong> ${membershipDetails.endDate}</p>
          <p style="margin:0 0 8px;"><strong>Amount Paid:</strong> ${membershipDetails.amountPaid}</p>
          ${
            membershipDetails.invoiceNo
              ? `<p style="margin:0;"><strong>Invoice No:</strong> ${membershipDetails.invoiceNo}</p>`
              : ''
          }
        </div>
      `)}

      ${p('You can now enjoy all the benefits included in your membership. If you have any questions or need assistance, our support team is here to help you anytime.')}

      ${p('Thank you for choosing Vedic Health. We’re excited to support your wellness journey!')}
    `
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: email,
    subject: 'Your Vedic Health Membership is Now Active 🎉',
    text: `Hello ${customerName || 'Customer'},

Your Vedic Health membership has been successfully activated.

Plan: ${membershipDetails.planName}
Duration: ${membershipDetails.duration}
Start Date: ${membershipDetails.startDate}
End Date: ${membershipDetails.endDate}
Amount Paid: ${membershipDetails.amountPaid}
${
  membershipDetails.invoiceNo
    ? `Invoice No: ${membershipDetails.invoiceNo}`
    : ''
}

You can now access all membership benefits.

Thank you for choosing Vedic Health.

Regards,  
Vedic Health Team`,
    html: buildEmailHtml(
      'Your Vedic Health Membership is Now Active 🎉',
      bodyContent,
      false
    ),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Membership purchase confirmation email sent successfully');
    return { status: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending purchase confirmation email:', error);
    return { status: false, message: 'Failed to send email.' };
  }
}

export async function sendMembershipPurchaseAdminMail(
  adminEmail: string,
  customerName: string,
  customerEmail: string,
  membershipDetails: {
    planName: string;
    duration: string;
    startDate: string;
    endDate: string;
    amountPaid: string;
    invoiceNo?: string;
  }
) {
  const transporter = createTransporter();

  const bodyContent = buildBodyContent(
    'Admin',
    `
      ${p('A new <strong>Vedic Health</strong> membership has been purchased successfully.')}

      ${infoBox(`
        <div style="text-align:left;font-size:15px;color:#84431d;font-family:'Poppins',Arial,sans-serif;line-height:1.6;">
          <p style="margin:0 0 8px;"><strong>Customer Name:</strong> ${customerName}</p>
          <p style="margin:0 0 8px;"><strong>Email:</strong> ${customerEmail}</p>
          <p style="margin:0 0 8px;"><strong>Membership Plan:</strong> ${membershipDetails.planName}</p>
          <p style="margin:0 0 8px;"><strong>Duration:</strong> ${membershipDetails.duration}</p>
          <p style="margin:0 0 8px;"><strong>Start Date:</strong> ${membershipDetails.startDate}</p>
          <p style="margin:0 0 8px;"><strong>End Date:</strong> ${membershipDetails.endDate}</p>
          <p style="margin:0 0 8px;"><strong>Amount Paid:</strong> ${membershipDetails.amountPaid}</p>
          ${
            membershipDetails.invoiceNo
              ? `<p style="margin:0;"><strong>Invoice No:</strong> ${membershipDetails.invoiceNo}</p>`
              : ''
          }
        </div>
      `)}

      ${p('The membership has been activated successfully. Please keep this information for your records.')}
    `
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: adminEmail,
    subject: `New Membership Purchase - ${customerName}`,
    text: `A new membership has been purchased.

Customer Name: ${customerName}
Customer Email: ${customerEmail}

Membership Details:
- Plan: ${membershipDetails.planName}
- Duration: ${membershipDetails.duration}
- Start Date: ${membershipDetails.startDate}
- End Date: ${membershipDetails.endDate}
- Amount Paid: ${membershipDetails.amountPaid}
${
  membershipDetails.invoiceNo
    ? `- Invoice No: ${membershipDetails.invoiceNo}`
    : ''
}

Please review this purchase in the admin panel.

Regards,
Vedic Health System`,
    html: buildEmailHtml(
      `New Membership Purchase - ${customerName}`,
      bodyContent,
      false
    ),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Membership purchase notification sent to admin');
    return { status: true, message: 'Admin email sent successfully' };
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return { status: false, message: 'Failed to send admin email.' };
  }
}

export async function sendMembershipCancellationAdminMail(
  adminEmail: string,
  customerName: string,
  customerEmail: string,
  membershipDetails: {
    planName: string;
    startDate: string;
    amountPaid: string;
    invoiceNo?: string;
  }
) {
  const transporter = createTransporter();

  const bodyContent = buildBodyContent(
    'Admin',
    `
      ${p('A <strong>Vedic Health</strong> membership has been cancelled.')}

      ${infoBox(`
        <div style="text-align:left;font-size:15px;color:#84431d;font-family:'Poppins',Arial,sans-serif;line-height:1.6;">
          <p style="margin:0 0 8px;"><strong>Customer Name:</strong> ${customerName}</p>
          <p style="margin:0 0 8px;"><strong>Email:</strong> ${customerEmail}</p>
          <p style="margin:0 0 8px;"><strong>Membership Plan:</strong> ${membershipDetails.planName}</p>
          <p style="margin:0 0 8px;"><strong>Start Date:</strong> ${membershipDetails.startDate}</p>
          <p style="margin:0 0 8px;"><strong>Amount Paid:</strong> ${membershipDetails.amountPaid}</p>
          ${
            membershipDetails.invoiceNo
              ? `<p style="margin:0;"><strong>Invoice No:</strong> ${membershipDetails.invoiceNo}</p>`
              : ''
          }
        </div>
      `)}

      ${p('This membership has been cancelled successfully. Please update your records if any additional action is required.')}
    `
  );

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: adminEmail,
    subject: `Membership Cancelled - ${customerName}`,
    text: `A membership has been cancelled.

Customer Name: ${customerName}
Customer Email: ${customerEmail}

Membership Details:
- Plan: ${membershipDetails.planName}
- Start Date: ${membershipDetails.startDate}
- Amount Paid: ${membershipDetails.amountPaid}
${
  membershipDetails.invoiceNo
    ? `- Invoice No: ${membershipDetails.invoiceNo}`
    : ''
}

The membership has been cancelled successfully.

Regards,
Vedic Health System`,
    html: buildEmailHtml(
      `Membership Cancelled - ${customerName}`,
      bodyContent,
      false
    ),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Membership cancellation notification sent to admin');
    return { status: true, message: 'Admin email sent successfully' };
  } catch (error) {
    console.error('Error sending membership cancellation email to admin:', error);
    return { status: false, message: 'Failed to send admin email.' };
  }
}

export async function sendOrderDeliveredAdminEmail(
  adminEmail: string,
  customerName: string,
  customerEmail: string,
  order: any,
  footerData: any
) {
  const pdfBuffer = await generateInvoicePdfBuffer(order, footerData);
  const transporter = createTransporter();

  const itemsHtml = order?.orderItems?.length
    ? `
      <div style="margin:10px 0;">
        <ul style="padding-left:18px; margin:0;">
          ${order.orderItems
            .map(
              (item: any) => `
                <li style="margin-bottom:6px;">
                  ${item.productName} – ${item.quantity} ${
                    item.quantity > 1 ? "Units" : "Unit"
                  }
                </li>
              `
            )
            .join("")}
        </ul>
      </div>
    `
    : `<p>No items found</p>`;

  const itemsText = order?.orderItems?.length
    ? order.orderItems
        .map(
          (item: any) =>
            `${item.productName} - ${item.quantity} ${
              item.quantity > 1 ? "Units" : "Unit"
            }`
        )
        .join("\n")
    : "No items found";

  const deliveredDate =
    order?.deliveredDate || new Date().toLocaleDateString();

  const bodyContent = buildBodyContent(
    "Admin",
    `
      ${p(
        `An order has been <strong>successfully delivered</strong> to the customer.`
      )}

      ${infoBox(`
        ${infoRow("Order ID", `Ved${order.invoiceNo}`)}
        ${infoRow("Customer", customerName)}
        ${infoRow("Customer Email", customerEmail)}
        ${infoRow("Delivered Date", deliveredDate)}
        ${infoRow(
          "Status",
          '<span style="color:#2e7d32;font-weight:700;">Delivered</span>'
        )}
      `)}

      ${p("<strong>Delivered Items:</strong>")}
      ${itemsHtml}

      ${p(
        "The order has been marked as delivered successfully. The invoice is attached for your records."
      )}
    `,
    "Regards,"
  );

  const { hasLogo, attachments } = getLogoAttachment();

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Vedic Health" <info@vedichealth.org>',
    to: adminEmail,
    subject: `Order Delivered - Ved${order.invoiceNo}`,

    text: `An order has been delivered successfully.

Order ID: Ved${order.invoiceNo}
Customer Name: ${customerName}
Customer Email: ${customerEmail}
Delivered Date: ${deliveredDate}

Items:
${itemsText}

The order has been marked as delivered successfully.

Regards,
Vedic Health System`,

    html: buildEmailHtml(
      `Order Delivered - Ved${order.invoiceNo}`,
      bodyContent,
      hasLogo
    ),

    attachments: [
      ...attachments,
      {
        filename: `Invoice-Ved${order.invoiceNo}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Order delivered notification sent to admin");
    return { status: true };
  } catch (error) {
    console.error("Error sending order delivered email to admin:", error);
    return { status: false };
  }
}