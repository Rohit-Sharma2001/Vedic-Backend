import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;
export type ProductDocument = Product & Document;
export type ZohoTokenDocument = ZohoToken & Document;
export type CouponDocument = Coupon & Document;
export type MasterDocument = Master & Document;
export type CenterManagementDocument = CenterManagement & Document;
export type JobManagementDocument = JobManagement & Document;
export type TestimonialDocument = Testimonial & Document;
export type ContentDocument = Content & Document;
export type MainBannerDocument = MainBanner & Document;
export type LandingPageDocument = LandingPage & Document;
export type BlogManagementDocument = BlogManagement & Document
export type BlogContentManagementDocument = BlogContentManagement & Document
export type ContactManagementDocument = ContactManagement & Document
export type faqsDocument = faqs & Document
export type faqManagementDocument = faqManagement & Document
export type NotesDocument = Notes & Document;
export type EnquiryDocument = Enquiry & Document;
export type CartDocument = cartManagement & Document;
export type OrderDocument = orderManagement & Document;
export type emailOtpDocument = emailOtp & Document;
export type smsOtpDocument = smsOtp & Document;
export type suscribeDocument = suscribe & Document;
export type addressDocument = address & Document;
export type reviewDocument = review & Document;
export type returnOrderDocument = returnOrder & Document;
export type AyurVedicNaturalHealingDocument = AyurVedicNaturalHealing & Document;
export type EmployeeDocument = Employee & Document;
export type CenterResourcesDocument = CenterResources & Document;
export type AddOnsDocument = AddOns & Document;
export type ServicePriceDocument = ServicePrice & Document;
export type AppointmentManagementDocument = AppointmentManagement & Document;
export type WaitlistManagementDocument = WaitlistManagement & Document;
export type UserFamilyDocument = UserFamily & Document;
export type RoleTableDocument = RoleTable & Document;



@Schema()
export class Enquiry {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  phone: Number;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: false, default: Date.now })
  createdAt: Date;
}
const EnquirySchema = SchemaFactory.createForClass(Enquiry);

@Schema()
export class Notes {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  mobile: number;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: false, default: Date.now })
  createdAt: Date;
}
const NotesSchema = SchemaFactory.createForClass(Notes);

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  // ✅ NEW
  @Prop({ required: false })
  lastName?: string;

  // add this field in User class
  @Prop({ required: false })
  image?: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  mobileNo: number;

  @Prop({ required: false })
  file: string;

  @Prop({ required: false })
  dob: string;

  @Prop({ required: false })
  stripeCustomerId: string;

  // ✅ NEW (optional profile address fields)
  @Prop({ required: false })
  address1?: string;

  @Prop({ required: false })
  address2?: string;

  @Prop({ required: false })
  city?: string;

  @Prop({ required: false })
  state?: string;

  @Prop({ required: false })
  zipcode?: string;

  @Prop({ required: false })
  country?: string;

  @Prop({ required: false })
  gender?: string;

  @Prop({ required: true, default: 'member' })
  role: string;

  @Prop({ required: true, default: 1 })
  status: number;

  @Prop({ required: true, default: 0 })
  is_deleted: number;

  @Prop({ required: false })
  vedicCustomerId: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'role_table',
    default: null,
  })
  roleId: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;

}

const UserSchema = SchemaFactory.createForClass(User);


@Schema()
export class Product extends Document {
  @Prop({ required: false })
  productName: string;

  @Prop({ required: false })
  title: string;

  @Prop({ required: false })
  sku_id: string;

  @Prop({ required: false })
  buy_one_get_one: boolean;

  @Prop({ required: false, type: Types.ObjectId })
  brand: Types.ObjectId;

  @Prop({ required: false })
  category: Types.ObjectId;

  @Prop({ required: false, type: Types.ObjectId })
  subCategory: Types.ObjectId;

  @Prop({ required: false })
  itemType: Types.ObjectId;

  @Prop({ required: false, default: 1 })
  stock: number;

  @Prop({ required: false })
  price: number;

  @Prop({ required: false })
  mrp: number;

  @Prop({ required: false })
  cost: number;

  @Prop({ required: false })
  discounted_price: number;

  @Prop({ required: false, default: 0 })
  buy_count: number;

  @Prop({ required: false, default: 1 })
  minOrderQuantity: number;

  @Prop({ required: false, default: 10 })
  maxOrderQuantity: number;

  @Prop({ required: false })
  product_description: string;

  @Prop({ required: false, type: String })
  ingredients: string;


  @Prop({ required: false })
  coverImage: string;

  @Prop({ required: false, type: [String] })  // Define as an array of strings
  additionalImages: string[];

  @Prop({ required: false })
  weight: number;

  @Prop({ required: false })
  length: number;

  @Prop({ required: false })
  width: number;

  @Prop({ required: false })
  height: number;

  @Prop({ required: false })
  inventory_status: number;

  @Prop({ required: false, default: false })
  is_show: boolean;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}
const ProductSchema = SchemaFactory.createForClass(Product);

@Schema()
export class ZohoToken extends Document {
  @Prop({ required: true })
  accessToken: string;

  @Prop({ required: true })
  refreshToken: string;

  @Prop({ required: true })
  expiresAt: Date;
}
const ZohoTokenSchema = SchemaFactory.createForClass(ZohoToken);


@Schema()
export class Coupon extends Document {
  @Prop({ required: false })
  title: string;

  @Prop({ required: false })
  couponCode: string;

  @Prop({ required: false })
  discountType: string;

  @Prop({ required: false })
  discountValue: number;

  @Prop({ required: false })
  thresholdAmount: number;

  @Prop({ required: false })
  maxDiscount: number;

  @Prop({ required: false })
  totalUserLimit: number;

  @Prop({ required: false })
  perUserLimit: number;

  @Prop({ required: false })
  startDateTime: Date;

  @Prop({ required: false })
  expiryType: string;

  @Prop({ required: false })
  expiryDate: Date;

  @Prop({ required: false })
  applicableTo: string;

  @Prop({ required: false })
  specificProducts: [];

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  customerType: string;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}
const CouponSchema = SchemaFactory.createForClass(Coupon);

@Schema()
export class Master extends Document {
  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  order: number;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  instructor_title: string;

  @Prop({ required: false })
  instructor_subtitle: string;

  @Prop({ required: false })
  all_courses_title: string;

  @Prop({ required: false })
  all_courses_subtitle: string;

  @Prop({ required: false })
  dropdown_type: string;

  @Prop({ required: false, type: Types.ObjectId, ref: 'Category' })
  category_id: Types.ObjectId;

  @Prop({ required: false })
  file: string;

  @Prop({ required: false })
  icon_file: string;

  // ✅ New optional fields
  @Prop({ required: false })
  address: string;

  @Prop({ required: false })
  email: string;

  @Prop({ required: false })
  number: string;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}

const MasterSchema = SchemaFactory.createForClass(Master);

@Schema({ collection: 'yogadocuments' })
export class YogaDocument extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  file: string; // file path or URL

  @Prop({ default: 1 })
  status: number; // 1=active, 0=inactive

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  modifiedAt: Date;
}

export const YogaDocumentSchema = SchemaFactory.createForClass(YogaDocument);
export type YogaDocumentDocument = YogaDocument & Document;
@Schema({ collection: 'courses' })
export class CourseManagement extends Document {
  @Prop({ required: true })
  courseName: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  description: string;

  @Prop({ required: false })
  icon_file: string; // ✅ NEW FIELD

  @Prop({ type: Types.ObjectId, ref: 'Master', required: true })
  categoryId: Types.ObjectId;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({
    type: [
      {
        title: { type: String, required: true },
      },
    ],
    default: [],
  })
  learnings: { title: string }[];

  // ✅ Correct nested structure
  @Prop({
    type: [
      {
        sectionTitle: { type: String, required: true },
        lectures: [
          {
            type: { type: String, enum: ['video', 'document'], required: true },
            title: { type: String, required: true },
            videoCategoryId: { type: Types.ObjectId, ref: 'Master', required: false },
            videoId: { type: Types.ObjectId, ref: 'YogaVideos', required: false },
            documentId: { type: Types.ObjectId, ref: 'YogaDocument', required: false }, // ✅ ADD THIS LINE
            documentFile: { type: String, required: false },
          },
        ],
      },
    ],
    default: [],
  })

  courseContent: {
    sectionTitle: string;
    lectures: {
      type: 'video' | 'document';
      title: string;
      videoCategoryId?: Types.ObjectId;
      videoId?: Types.ObjectId;
      documentFile?: string;
    }[];
  }[];

  @Prop({ type: Number, default: 1 })
  status: number;

  @Prop({ required: false, default: null, type: {} })
  paymentDetails: {};

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  modified: Date;
}

export const CourseManagementSchema = SchemaFactory.createForClass(CourseManagement);

@Schema({ collection: 'course_ratings' })
export class CourseRating extends Document {
  @Prop({ type: Types.ObjectId, ref: 'CourseManagement', required: true })
  course_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const CourseRatingSchema = SchemaFactory.createForClass(CourseRating);
CourseRatingSchema.index({ course_id: 1, user_id: 1 }, { unique: true });
export type CourseRatingDocument = CourseRating & Document;
export type CourseManagementDocument = CourseManagement & Document;

@Schema()
export class ParticipationDetails extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  dob: Date;

  @Prop({ required: true })
  homeAddress: string;

  @Prop({ required: true })
  cardNumber: string;

  @Prop({ required: true })
  cardLocation: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ParticipationDetailsSchema =
  SchemaFactory.createForClass(ParticipationDetails);
@Schema()
export class CenterManagement extends Document {
  @Prop({ required: false })
  centerName: string;

  @Prop({ required: false })
  address: string;

  @Prop({ required: false })
  openingTime: string;

  @Prop({ required: false })
  closingTime: string;

  @Prop({ required: false })
  file: string;

  @Prop({ required: false })
  phone_number: string;

  @Prop({ required: false })
  email: string;

  @Prop({ required: false })
  details: string;

  @Prop({ required: false })
  longitude: string;

  @Prop({ required: false })
  latitude: string;

  @Prop({ required: false })
  city: string;

  @Prop({ required: false })
  state: string;

  @Prop({ required: false })
  country: string;

  @Prop({ required: false })
  pincode: string;

  @Prop({ required: false })
  shippoAddressId: string;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}
const CenterManagementSchema = SchemaFactory.createForClass(CenterManagement);

@Schema()
export class Testimonial extends Document {
  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  firstName: string;

  @Prop({ required: false })
  lastName: string;

  @Prop({ required: false })
  email: string;

  @Prop({ default: false })
  isAnonymous: boolean;

  @Prop({ required: false })
  mobile: number;

  @Prop({ required: false })
  designation: string;

  @Prop({ required: false })
  practionerName: string;

  @Prop({ required: false })
  comment: string;

  @Prop({ required: false })
  review: string;

  @Prop({ required: false })
  note: string;

  @Prop({ required: false })
  rating: number;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}
const TestimonialSchema = SchemaFactory.createForClass(Testimonial);

@Schema()
export class EventManagement extends Document {
  @Prop() eventname: string;
  @Prop() date: Date;
  @Prop() time: string;
  @Prop() address: string;
  @Prop() file: string;
  @Prop({ default: false }) is_rsvp: boolean;
  @Prop() coverImage: string;
  @Prop() format: string;
  @Prop() Price: number;
  @Prop() description: string;
  @Prop() longitude: string;
  @Prop() meeting_link: string;
  @Prop() latitude: string;
  @Prop() city: string;
  @Prop() state: string;
  @Prop() country: string;
  @Prop() pincode: string;
  @Prop() speakername: string;
  @Prop() speakerdesignation: string;
  @Prop() speakerdescription: string;
  @Prop() icon_file: string;
  @Prop() host_name: string;
  @Prop({ default: false })
  is_recurring: boolean;

  @Prop({ type: String, enum: ['weekly', 'monthly', 'yearly', null], default: null })
  recurrence_type: string; // how often to repeat

  @Prop({ type: Date, default: null })
  recurrence_end_date: Date; // until when it repeats

  // @Prop({ default: false }) is_exclusive: boolean;
  // @Prop() membership_id: string;
  @Prop({ required: false, default: 0 })
  max_tickets: number;
  @Prop({ required: false, default: 5 })
  maxTicketsPerUser: number;
  @Prop() event_type: string;
  @Prop({ default: false }) is_exclusive: boolean;
  @Prop() membership_id: string;
  @Prop({ type: [{ membership_id: String, membership_name: String, price: Number }], default: [] })
  membership_pricing: { membership_id: string; membership_name: string; price: number }[];
  @Prop({ default: 0 }) is_deleted: number;
  @Prop({ default: 1 }) status: number;
  @Prop({ default: Date.now }) date_created: Date;
  @Prop({ default: Date.now }) modified: Date;
}

export type EventManagementDocument = EventManagement & Document;
export const EventManagementSchema = SchemaFactory.createForClass(EventManagement);
@Schema()
export class Content extends Document {
  @Prop({ required: false })
  file: string;

  @Prop({ required: false })
  quote_image: string;

  @Prop({ required: false })
  career_image: string;

  @Prop({ required: false, type: Object })
  career?: Record<string, any>;

  @Prop({ required: false })
  bannerQuote: string;

  @Prop({ required: false })
  bannerheading: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  quote: string;

  @Prop({ required: false })
  writerName: string;

  @Prop({ required: false })
  heading: string;

  @Prop({ required: false })
  subheading: string;

  @Prop({ required: false })
  buttonLabel: string;

  @Prop({ required: false })
  linkToButton: string;

  @Prop({ required: false })
  content_heading: string;

  @Prop({ required: false })
  cardTexts: [];

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}
const ContentSchema = SchemaFactory.createForClass(Content);

@Schema()
export class JobManagement extends Document {
  @Prop({ required: false })
  jobTitle: string;

  @Prop({ required: false })
  jobDescription: string;

  @Prop({ required: false })
  jobLocation: string;

  @Prop({ required: false })
  jobType: string;

  @Prop({ required: false })
  salary: number;

  @Prop({ required: false })
  paymentType: string;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}
const JobManagementSchema = SchemaFactory.createForClass(JobManagement);

@Schema({ collection: 'job_applications' })
export class JobApplication extends Document {
  @Prop({ type: Types.ObjectId, ref: 'JobManagement', required: true })
  job_id: Types.ObjectId;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: false })
  availableDate: Date;

  @Prop({ required: false })
  resumeLink: string;

  // New, Contacted, Rejected, Selected
  @Prop({ required: true, default: 'New' })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const JobApplicationSchema = SchemaFactory.createForClass(JobApplication);
JobApplicationSchema.index({ job_id: 1, email: 1 }, { unique: false });
export type JobApplicationDocument = JobApplication & Document;

@Schema()
export class MainBanner extends Document {
  @Prop({ required: false })
  title: string;

  @Prop({ required: false })
  org_title: string;

  @Prop({ required: false })
  sub_title: string;

  @Prop({ required: false })
  type: string;

  @Prop({ required: false })
  heading: string;

  @Prop({ required: false })
  descriptions: string;

  @Prop({ required: false })
  button_label: string;

  @Prop({ required: false })
  button_route: string;

  @Prop({ required: false })
  file: string;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}
const MainBannerSchema = SchemaFactory.createForClass(MainBanner);


@Schema()
export class LandingPage extends Document {
  @Prop({ required: false })
  type: string;

  @Prop({ required: false })
  title: string;

  @Prop({ required: false })
  descriptions: string;

  @Prop({ required: false })
  button_label: string;

  @Prop({ required: false })
  button_route: string;

  @Prop({ required: false })
  file: string;

  @Prop({ required: false })
  video_file: string;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}
const LandingPageSchema = SchemaFactory.createForClass(LandingPage);

@Schema()
export class BlogManagement extends Document {
  @Prop({ required: false })
  file: string;

  @Prop({ required: false })
  title: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  type: string;

  @Prop({ required: false })
  status: string;

  @Prop({ required: false, default: 0 })
  isDeleted: string;

  @Prop({ required: false, default: 0 })
  viewCount: Number;

  @Prop({ required: false, default: false })
  isFeaturedPost: Number;

  @Prop({
    type: [
      {
        user_id: { type: Types.ObjectId, ref: 'User' },
        comment: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  comments: { user_id: Types.ObjectId; comment: string; date: Date }[];

   @Prop({
    type: [
      {
        user_id: { type: Types.ObjectId, ref: 'User' },
        date: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  likes: { user_id: Types.ObjectId; date: Date }[];

  @Prop({ required: false, default: Date.now })
  created_at: Date;
}
const BlogManagementSchema = SchemaFactory.createForClass(BlogManagement);

@Schema()
export class BlogContentManagement extends Document {
  @Prop({ required: false })
  file: string;

  @Prop({ required: false })
  heading: string;

  @Prop({ required: false })
  subheading: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  post_text: string;

  @Prop({ required: false })
  articles_text: string;

  @Prop({ required: false, default: Date.now })
  created_at: Date;
}
const BlogContentManagementSchema = SchemaFactory.createForClass(BlogContentManagement);

@Schema()
export class ContactManagement extends Document {
  @Prop({ required: false })
  file: string;

  @Prop({ required: false })
  heading: string;

  @Prop({ required: false })
  text: string;

  @Prop({ required: false })
  opening_closing_details: string;

  @Prop({ required: false, default: Date.now })
  created_at: Date;
}
const ContactManagementSchema = SchemaFactory.createForClass(ContactManagement);

@Schema()
export class faqs extends Document {
  @Prop({ required: false })
  question: string;

  @Prop({ required: false })
  answer: string;

  @Prop({ required: false, default: Date.now })
  created_at: Date;
}
const faqsSchema = SchemaFactory.createForClass(faqs);

@Schema()
export class faqManagement extends Document {
  @Prop({ required: false })
  file: string;

  @Prop({ required: false })
  heading: string;

  @Prop({ required: false })
  subheading: string;

  @Prop({ required: false })
  buttonsLabel: string;

  @Prop({ required: false })
  buttonRoute: string;

  @Prop({ required: false, default: Date.now })
  created_at: Date;
}
const faqManagementSchema = SchemaFactory.createForClass(faqManagement);

@Schema()
export class cartManagement extends Document {

  @Prop({ required: false, type: Types.ObjectId })
  productId: Types.ObjectId;

  @Prop({ required: false, default: 1 })
  quantity: Number;

  @Prop({ required: false, type: Types.ObjectId })
  userId: Types.ObjectId;

  @Prop({ required: false, default: 'notBuyed' })
  status: string;

  @Prop({ required: false, default: Date.now })
  created_at: Date;

  @Prop({ required: false, default: 1 })
  selected: Number;

  @Prop({ required: false, default: 'shop' })
  type: string;

  @Prop({ required: false, type: Types.ObjectId })
  appointmentId: Types.ObjectId;
}
const cartManagementSchema = SchemaFactory.createForClass(cartManagement);
@Schema()
export class translationManagement extends Document {


  @Prop({ required: true })
  key: String;

  @Prop({ required: true, type: String })
  value: String;

  @Prop({ required: true })
  code: string;

  @Prop({ required: false, default: Date.now })
  created_at: Date;
}
const translationsSchema = SchemaFactory.createForClass(translationManagement);

@Schema()
export class orderManagement extends Document {

  @Prop({ required: false })
  invoiceNo: string;

  @Prop({ required: false, type: [] })
  cartIds: [];

  @Prop({ required: false, type: [] })
  orderItems: [];

  @Prop({ required: false, default: 1 })
  totalAmount: Number;

  @Prop({ required: false, default: 1 })
  deliveryCharge: Number;

  @Prop({ required: false, type: Types.ObjectId })
  userId: Types.ObjectId;

  @Prop({ required: false, default: 0 })
  discountAmount: Number;

  @Prop({ required: false, default: 0 })
  adminDiscount: Number;

  @Prop({ required: false, default: 0 })
  grandTotal: Number;

  @Prop({ required: false, default: null })
  couponId: Types.ObjectId | null;

  @Prop({ required: false })
  coupanTittle: string;

  @Prop({ required: false })
  billingAddress1: string;

  @Prop({ required: false })
  billingAddress2: string;

  @Prop({ required: false })
  billingCity: string;

  @Prop({ required: false })
  billingState: string;

  @Prop({ required: false })
  billingCountry: string;

  @Prop({ required: false })
  billingZipcode: string;

  @Prop({ required: false })
  shippingId: string;

  @Prop({ required: false })
  tracking_number: string;

  @Prop({ required: false })
  shipping_label_url: string;

  @Prop({ required: false })
  carrier: string;

  @Prop({ required: false, default: 'ordered' })
  status: string;

  @Prop({ required: false, default: null })
  orderStatus: string;

  @Prop({ required: false, default: 'online' })
  paymentMethod: String;

  @Prop({ required: false, default: null })
  addressId: Types.ObjectId | null;

  @Prop({ required: false, default: null })
  pickupDate: string;

  @Prop({ required: false, default: null })
  paymentSessionId: string;

  @Prop({ required: false })
  paymentIntent: String

  @Prop({ required: false })
  orderType: string;

  @Prop({ required: false, default: null, type: {} })
  paymentDetails: {};

  @Prop({ required: false, default: null })
  membershipId: Types.ObjectId | null;

  @Prop({ required: false, default: null })
  appointmentId: Types.ObjectId | null;

  @Prop({ required: false, default: Date.now })
  created_at: Date;

  @Prop({ required: false, default: null })
  orderPackDate: Date;

  @Prop({ required: false, default: null })
  orderReadyDate: Date;

  @Prop({ required: false, default: null })
  pickupDoneDate: Date;

  @Prop({ required: false, default: null, type: {} })
  deliveryDates: {};

  @Prop({ required: false })
  currentStatus: String;
}
const orderManagementSchema = SchemaFactory.createForClass(orderManagement)

@Schema()
export class emailOtp extends Document {

  @Prop({ required: false })
  email: string;

  @Prop({ required: false })
  otp: Number;

  @Prop({ required: false })
  expire_in: Date;
}
const emailOtpSchema = SchemaFactory.createForClass(emailOtp)

@Schema()
export class smsOtp extends Document {

  @Prop({ required: false })
  mobile: Number;

  @Prop({ required: false })
  otp: Number;

  @Prop({ required: false })
  expire_in: Date;
}
const smsOtpSchema = SchemaFactory.createForClass(smsOtp)


@Schema()
export class suscribe extends Document {

  @Prop({ required: false })
  email: string;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;


}
const suscribeSchema = SchemaFactory.createForClass(suscribe)

@Schema()
export class address extends Document {

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  mobile: string;

  @Prop({ required: false })
  flatNo: string;

  @Prop({ required: false })
  area: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: false, type: Types.ObjectId })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  pincode: string;

  @Prop({ required: true })
  countryCode: string;

  @Prop({ required: true })
  stateCode: string;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false })
  shippoAddressId: string;

  @Prop({ required: false, default: 0 })
  primary: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;


}
const addressSchema = SchemaFactory.createForClass(address)

@Schema()
export class review extends Document {

  @Prop({ required: false, type: Types.ObjectId })
  user_id: Types.ObjectId;

  @Prop({ required: false, type: Types.ObjectId })
  product_id: Types.ObjectId;

  @Prop({ required: false, type: Types.ObjectId })
  addressId: Types.ObjectId;

  @Prop({ required: false })
  coverImage: string;

  @Prop({ required: false, type: [String] })  // Define as an array of strings
  additionalImages: string[];

  @Prop({ required: false })
  review: string;

  @Prop({ required: false })
  rating: number;

  @Prop({ required: false, default: 0 })
  is_approved: number;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;


}
const reviewSchema = SchemaFactory.createForClass(review)

@Schema()
export class returnOrder extends Document {

  @Prop({ required: false, type: Types.ObjectId })
  user_id: Types.ObjectId;

  @Prop({ required: false, type: Types.ObjectId })
  orderId: Types.ObjectId;

  @Prop({ required: false, type: [] })
  productId: [];

  @Prop({ required: false, type: [] })
  products: [];

  @Prop({ required: false })
  reason: string;

  @Prop({ required: false })
  comment: string;

  @Prop({ required: false, default: 'returnPlaced' })
  status: string;

  @Prop({ required: false, default: Date.now })
  created_at: Date;

}
const returnOrderSchema = SchemaFactory.createForClass(returnOrder)


@Schema()
export class AyurVedicNaturalHealing extends Document {
  @Prop({ required: false })
  file: string;

  @Prop({ required: false })
  banner_title: string;

  @Prop({ type: [String], required: false })
  diseases: string[];

  @Prop({ type: Object, required: false })
  pagecontent: Record<string, any>;

  @Prop({ required: false, default: Date.now })
  created_at: Date;
}

const AyurVedicNaturalHealingSchema = SchemaFactory.createForClass(AyurVedicNaturalHealing);

@Schema()
export class BalancingDiet extends Document {
  @Prop({ required: false })
  type: string;

  @Prop({ required: false })
  file: string;

  @Prop({ required: false })
  banner_title: string;

  @Prop({ required: false })
  begin_journey_title: string;

  @Prop({ required: false })
  begin_journey_subtitle: string;

  @Prop({ required: false })
  gallery_image_title: string;

  @Prop({ required: false })
  gallery_image_subtitle: string;

  @Prop({ required: false })
  gallery_video_title: string;

  @Prop({ required: false })
  gallery_video_subtitle: string;

  @Prop({ required: false })
  service_title: string;

  @Prop({ required: false })
  service_subtitle: string;

  @Prop({ required: false })
  yoga_classes_title: string;

  @Prop({ required: false })
  yoga_classes_subtitle: string;

   @Prop({ required: false })
  yoga_class_section_title: string;

  @Prop({ required: false })
  yoga_class_section_subtitle: string;

  @Prop({ required: false })
  resource_title: string;

  @Prop({ required: false })
  resource_subtitle: string;

  @Prop({ required: false })
  testimonial_title: string;

  @Prop({ required: false })
  testimonial_subtitle: string;

  @Prop({ required: false })
  event_section_title: string;

  @Prop({ required: false })
  event_section_subtitle: string;

  @Prop({ required: false })
  title: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  diet_section_heading: string;

  @Prop({ required: false })
  diet_description: string;

  @Prop({ type: [String], required: false })
  suggestions_list: string[];

  @Prop({ required: false })
  food_suggestion_section_heading: string;

  @Prop({ required: false })
  food_suggestion_section_description: string;

  @Prop({
    type: [
      {
        title: String,
        text: String,
      },
    ],
    required: false,
  })
  food_suggestions_list: { title: string; text: string }[];

  @Prop({ required: false, default: Date.now })
  created_at: Date;
}

export const BalancingDietSchema = SchemaFactory.createForClass(BalancingDiet);
export type BalancingDietDocument = BalancingDiet & Document;

@Schema()
export class Lifestyle extends Document {
  @Prop({ required: false })
  type: string;

  @Prop({ required: false })
  file: string;

  @Prop({ required: false })
  banner_title: string;

  @Prop({ required: false })
  title: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  button_label: string;

  @Prop({ required: false })
  button_route: string;

  @Prop({ required: false })
  balancing_kapha_dosha_text: string;

  @Prop({ required: false })
  balancing_kapha_dosha_description: string;

  @Prop({ type: [String], required: false })
  balancing_kapha_dosha_list: string[];

  @Prop({ required: false, default: Date.now })
  created_at: Date;
}

export const LifestyleSchema = SchemaFactory.createForClass(Lifestyle);
export type LifestyleDocument = Lifestyle & Document;

@Schema()
export class OurFamilyBanner extends Document {
  @Prop({ required: false })
  title: string;

  @Prop({ required: false })
  subtitle: string;

  @Prop({ required: false })
  file: string;

  @Prop({ required: false, default: Date.now })
  created_at: Date;
}

export const OurFamilyBannerSchema = SchemaFactory.createForClass(OurFamilyBanner);
export type OurFamilyBannerDocument = OurFamilyBanner & Document;



@Schema({ collection: 'review_page_content' })
export class Review extends Document {
  @Prop({ required: false }) file: string;
  @Prop({ required: false }) banner_title: string;
  @Prop({ required: false }) banner_text: string;
  @Prop({ required: false }) button_route: string;
  @Prop({ required: false }) button_label: string;
  @Prop({ required: false }) your_stories_heading: string;
  @Prop({ required: false }) your_stories_text: string;
  @Prop({ required: false }) your_stories_button_route: string;
  @Prop({ required: false }) your_stories_button_label: string;
  @Prop({ required: false, default: Date.now }) created_at: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
export type ReviewDocument = Review & Document;

@Schema({ collection: 'treating_dosha_imbalance' })
export class TreatingDoshaImbalance extends Document {
  @Prop({ required: false })
  banner_image: string;

  @Prop({ required: false })
  banner_title: string;

  @Prop({
    type: {
      kapha_title: String,
      kapha_description: String,
      kapha_signs_heading_text: String,
      kapha_signs_list: [String],
      kapha_button_1_route: String,
      kapha_button_1_label: String,
      kapha_button_2_route: String,
      kapha_button_2_label: String,

      pitta_title: String,
      pitta_description: String,
      pitta_signs_heading_text: String,
      pitta_signs_list: [String],
      pitta_button_1_route: String,
      pitta_button_1_label: String,
      pitta_button_2_route: String,
      pitta_button_2_label: String,

      vata_title: String,
      vata_description: String,
      vata_signs_heading_text: String,
      vata_signs_list: [String],
      vata_button_1_route: String,
      vata_button_1_label: String,
      vata_button_2_route: String,
      vata_button_2_label: String,
    },
    required: false,
  })
  dosha_content: {
    kapha_title: string;
    kapha_description: string;
    kapha_signs_heading_text: string;
    kapha_signs_list: string[];
    kapha_button_1_route: string;
    kapha_button_1_label: string;
    kapha_button_2_route: string;
    kapha_button_2_label: string;

    pitta_title: string;
    pitta_description: string;
    pitta_signs_heading_text: string;
    pitta_signs_list: string[];
    pitta_button_1_route: string;
    pitta_button_1_label: string;
    pitta_button_2_route: string;
    pitta_button_2_label: string;

    vata_title: string;
    vata_description: string;
    vata_signs_heading_text: string;
    vata_signs_list: string[];
    vata_button_1_route: string;
    vata_button_1_label: string;
    vata_button_2_route: string;
    vata_button_2_label: string;
  };

  @Prop({ required: false, default: Date.now })
  created_at: Date;
}


export const TreatingDoshaImbalanceSchema = SchemaFactory.createForClass(TreatingDoshaImbalance);
export type TreatingDoshaImbalanceDocument = TreatingDoshaImbalance & Document;

@Schema({ collection: 'doshas_cms_content' })
export class DoshasCmsContent extends Document {
  @Prop() banner_image: string;
  @Prop() banner_title: string;

  @Prop() vata_card_title: string;
  @Prop() vata_card_description: string;
  @Prop() vata_card_button_label: string;
  @Prop() vata_card_button_route: string;

  @Prop() pitta_card_title: string;
  @Prop() pitta_card_description: string;
  @Prop() pitta_card_button_label: string;
  @Prop() pitta_card_button_route: string;

  @Prop() kapha_card_title: string;
  @Prop() kapha_card_description: string;
  @Prop() kapha_card_button_label: string;
  @Prop() kapha_card_button_route: string;

  @Prop() vata_section_title: string;
  @Prop() vata_section_description: string;

  @Prop() pitta_section_title: string;
  @Prop() pitta_section_description: string;

  @Prop() kapha_section_title: string;
  @Prop() kapha_section_description: string;

  @Prop() bottom_quote_title: string;
  @Prop() bottom_quote_description: string;
  @Prop() bottom_quote_image: string;
  @Prop() bottom_quote_button_route: string;
  @Prop() bottom_quote_button_label: string;
  @Prop() bottom_quote: string;

  @Prop({ default: Date.now }) created_at: Date;
}

export const DoshasCmsContentSchema = SchemaFactory.createForClass(DoshasCmsContent);
export type DoshasCmsContentDocument = DoshasCmsContent & Document;

@Schema()
export class QuizPageContent extends Document {
  @Prop({ required: false })
  file: string;

  @Prop({ required: false })
  heading: string;

  @Prop({ required: false })
  subheading: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  button_label: string;

  @Prop({ required: false })
  button_route: string;

  @Prop({ required: false, default: Date.now })
  created_at: Date;
}

export const QuizPageContentSchema = SchemaFactory.createForClass(QuizPageContent);
export type QuizPageContentDocument = QuizPageContent & Document;

@Schema({ timestamps: true })
export class AppointmentPageContent {
  @Prop() heading: string;
  @Prop() button_label: string;
  @Prop() file: string; // image path
}

export type AppointmentPageContentDocument = AppointmentPageContent & Document;
export const AppointmentPageContentSchema = SchemaFactory.createForClass(AppointmentPageContent);

@Schema()
export class JobPageContent extends Document {
  @Prop({ required: false })
  file: string;

  @Prop({ required: false })
  banner_text: string;

  @Prop({ required: false })
  heading: string;

  @Prop({ required: false })
  subheading: string;

  @Prop({ required: false, default: Date.now })
  created_at: Date;
}

export const JobPageContentSchema = SchemaFactory.createForClass(JobPageContent);
export type JobPageContentDocument = JobPageContent & Document;

@Schema()
export class Article extends Document {
  @Prop({ required: false })
  heading: string;

  @Prop({ required: false })
  sub_heading: string;

  @Prop({ required: false })
  article_text: string;

  @Prop({ required: false })
  article_description: string;

  @Prop({ required: false })
  book_text: string;

  @Prop({ required: false })
  book_description: string;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}
const ArticleSchema = SchemaFactory.createForClass(Article);
export type ArticleDocument = Article & Document;

@Schema()
export class ArticleManagement extends Document {

  @Prop({ required: false })
  title: string;

  @Prop({ required: false })
  file: string;

  @Prop({ required: false })
  descriptions: string;

  @Prop({ required: false })
  article_content: string;

  @Prop({ required: false })
  auther_name: string;

  @Prop({ required: false })
  image: string;

  @Prop({
    type: [
      {
        user_id: { type: Types.ObjectId, ref: 'User' },
        comment: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  comments: { user_id: Types.ObjectId; comment: string; date: Date }[];

  @Prop({
    type: [
      {
        user_id: { type: Types.ObjectId, ref: 'User' },
        date: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  likes: { user_id: Types.ObjectId; date: Date }[];

  @Prop({ required: false, default: 0 })
  viewCount: number;

  @Prop({ required: false, default: 0 })
  is_featured_article: number;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}
const ArticleManagementSchema = SchemaFactory.createForClass(ArticleManagement);
export type ArticleManagementDocument = ArticleManagement & Document;

@Schema()
export class CaseStoryType extends Document {
  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}
const CaseStoryTypeSchema = SchemaFactory.createForClass(CaseStoryType);
export type CaseStoryTypeDocument = CaseStoryType & Document;

@Schema()
export class CaseStoryProvider extends Document {

  @Prop({ required: false })
  title: string;

  @Prop({ required: false })
  case_story_type_id: Types.ObjectId;

  @Prop({ required: false })
  descriptions: string;

  @Prop({ required: false })
  image: string;

  @Prop({ required: false, default: 0 })
  viewCount: number;

  @Prop({ required: false, default: 0 })
  is_featured: number;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false })
  author_name: string;

  @Prop({ required: false })
  author_designation: string;

  @Prop({ required: false })
  author_description: string;

  @Prop({ required: false })
  file: string;


  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}
const CaseStoryProviderSchema = SchemaFactory.createForClass(CaseStoryProvider);
export type CaseStoryProviderDocument = CaseStoryProvider & Document;

@Schema()
export class ContactAmita extends Document {

  @Prop({ required: false })
  banner_text: string;

  @Prop({ required: false })
  banner_description: string;

  @Prop({ required: false })
  image: string;

  @Prop({ required: false })
  number: string;

  @Prop({ required: false })
  email: string;

  @Prop({ required: false })
  address: string;

  @Prop({ required: false })
  fb_link: string;

  @Prop({ required: false })
  insta_link: string;

  @Prop({ required: false })
  twitter_link: string;

  @Prop({ required: false })
  youtube_link: string;

  @Prop({ required: false })
  linkedIn_link: string;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}
const ContactAmitaSchema = SchemaFactory.createForClass(ContactAmita);
export type ContactAmitaDocument = ContactAmita & Document;

@Schema()
export class MembershipManagement extends Document {
  @Prop({ required: true })
  plan_name: string;

  @Prop({ required: false })
  plan_description?: string;

  @Prop({ required: true })
  tier: Number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'courses' }], default: [] })
  courses: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'yogavideos' }], default: [] })
  yoga_videos: Types.ObjectId[];

  // ✅ NEW FIELD: Product Categories
  @Prop({
    type: [
      {
        category_id: { type: Types.ObjectId, ref: 'category', required: true },
        discount: { type: Number, required: false, default: 0 }, // % discount
      },
    ],
    default: [],
  })
  product_categories: { category_id: Types.ObjectId; discount: number }[];

  @Prop({
    type: [
      {
        ServiceType_id: { type: Types.ObjectId, ref: 'ServiceTypeService', required: true },
        discount: { type: Number, required: false, default: 0 }, // % discount
      },
    ],
    default: [],
  })
  serviceType_categories: { ServiceType_id: Types.ObjectId; discount: number }[];


  @Prop({ required: false })
  image?: string;

  @Prop({
    type: [
      {
        title: { type: String, required: false },
        description: { type: String, required: false },
      },
    ],
    default: [],
  })
  plan_details: { title?: string; description?: string }[];

  @Prop({ required: false, default: 10 })
  price: number;

  @Prop({ required: false, default: 10 })
  expiring_in: number;

  @Prop({ required: false, default: 0 })
  is_bestvalue: number;

  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ required: false, default: "" })
  stripePriceId: string;

  @Prop({ required: false, default: "" })
  stripeProductId: string;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: Date.now })
  created_date: Date;

  @Prop({ required: false, default: Date.now })
  modified_date: Date;
}


export type MembershipManagementDocument = MembershipManagement & Document;
export const MembershipManagementSchema =
  SchemaFactory.createForClass(MembershipManagement);
@Schema()
export class ClinicBanner extends Document {

  @Prop({ required: false })
  banner_text: string;

  @Prop({ required: false })
  image: string;

  @Prop({ required: false })
  button_label: string;

  @Prop({ required: false })
  button_route: string;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}
const ClinicBannerSchema = SchemaFactory.createForClass(ClinicBanner);
export type ClinicBannerDocument = ClinicBanner & Document;

@Schema()
export class ClinicSections extends Document {

  @Prop({ required: false })
  heading: string;

  @Prop({ required: false })
  text: string;

  @Prop({ required: false })
  image: string;

  @Prop({ required: false })
  upper_details_section: string;

  @Prop({ required: false })
  lower_details_section: string;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}
const ClinicSectionsSchema = SchemaFactory.createForClass(ClinicSections);
export type ClinicSectionsDocument = ClinicSections & Document;

class ScheduleDetail {
  @Prop({ required: false })
  class_title: string;

  @Prop({ required: false })
  duration: string;

  @Prop({ required: false })
  date: string;

  @Prop({ required: false })
  time: string;

  @Prop({ required: false })
  location: string;
}

@Schema()
export class AmitaJainSchedule extends Document {
  @Prop({ required: false })
  image: string;

  @Prop({ required: false })
  banner_text: string;

  @Prop({ required: false })
  button_label: string;

  @Prop({ required: false })
  button_route: string;

  @Prop({ required: false })
  schedule_heading: string;

  @Prop({ required: false })
  schedule_description: string;

  @Prop({ required: false })
  schedule_button: string;

  @Prop({ required: false })
  schedule_button_route: string;

  @Prop({ type: [ScheduleDetail], required: false })
  schedule_details: ScheduleDetail[];

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}

const AmitaJainScheduleSchema = SchemaFactory.createForClass(AmitaJainSchedule);
export type AmitaJainScheduleDocument = AmitaJainSchedule & Document;

@Schema()
export class BusinessDetail extends Document {
  @Prop({ required: true })
  heading: string;

  @Prop()
  description: string;

  @Prop({ default: 1 }) // why: enable soft on/off without delete
  status: number;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export type BusinessDetailDocument = BusinessDetail & Document;
export const BusinessDetailSchema = SchemaFactory.createForClass(BusinessDetail);
@Schema()
export class ServiceType extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: 1 }) // <-- ADD THIS (1 = active, 0 = inactive)
  status: number;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}


export type ServiceTypeDocument = ServiceType & Document;
export const ServiceTypeSchema = SchemaFactory.createForClass(ServiceType);

@Schema()
export class ServicesManagement extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  file: string;

  @Prop()
  description: string;

  @Prop()
  price: Number;

  @Prop({ type: Types.ObjectId, ref: 'ServiceType', required: true })
  service_type: Types.ObjectId;  // newly added reference

  @Prop()
  centerId: Types.ObjectId[];

  @Prop({ default: [] })
  resource: Types.ObjectId[];

  @Prop({ default: [] })
  add_ons: Types.ObjectId[];

  @Prop({ default: false })
  live_stream: Boolean;

  @Prop({ default: false })
  mobile_service: Boolean;

  @Prop({ default: 0 })//in minutes
  cleanup_time: Number;

  @Prop({ default: 'hide' }) //hide or service or service&price
  show_online: String;

  @Prop({ default: 1 })
  status: number;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;

}

export type ServicesManagementDocument = ServicesManagement & Document;
export const ServicesManagementSchema = SchemaFactory.createForClass(ServicesManagement);

@Schema()
export class Talks extends Document {
  @Prop({ required: false })
  lecture: string;

  @Prop({ required: false })
  title: string;

  @Prop({ required: false })
  image: string;

  @Prop({ required: false })
  video_link: string;

  @Prop({ required: false })
  video_file: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}

const TalksSchema = SchemaFactory.createForClass(Talks);
export type TalksDocument = Talks & Document;


@Schema()
export class YogaClasses extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  image: string;

  @Prop({ type: Number, default: 0 })
  view_count: number;

  @Prop({ type: Number, default: 0 })
  is_featured: number;

  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}

const YogaClassesSchema = SchemaFactory.createForClass(YogaClasses);
export type YogaClassesDocument = YogaClasses & Document;


@Schema()
export class YogaClassesPageContent extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  text: string;

  @Prop({ required: false })
  image: string;

  @Prop({ required: false })
  button_label: string;

  @Prop({ required: false })
  button_route: string;

  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}

const YogaClassesPageContentSchema = SchemaFactory.createForClass(YogaClassesPageContent);
export type YogaClassesPageContentDocument = YogaClassesPageContent & Document;

@Schema()
export class TeamMember extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  experties: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  file: string;

  @Prop({ required: false, default: Date.now })
  created_at: Date;
}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);
export type TeamMemberDocument = TeamMember & Document;

@Schema()
export class ImpactSection extends Document {
  @Prop({ required: false })
  banner_text: string;

  @Prop({ required: false })
  file: string;

  @Prop({ required: false })
  button_label: string;

  @Prop({ required: false })
  donate_button_label: string;

  @Prop({ required: false })
  button_route: string;

  @Prop({
    type: [{ text: String, description: String }],
    required: false,
  })
  cards_details: { text: string; description: string }[];

  @Prop({ required: false })
  process_title: string;

  @Prop({ required: false })
  icon_file: string;

  @Prop({ required: false })
  process_image_description: string;

  @Prop({ required: false })
  process_description: string;

  @Prop({ required: false })
  note: string;

  @Prop({ type: [String], required: false })
  steps: string[];

  @Prop({
    type: [{ text: String, price: String }],
    required: false,
  })
  suggested_amounts: { text: string; price: string }[];

  @Prop({ required: false })
  suggested_modal_text: string;

  @Prop({ required: false, default: Date.now })
  created_at: Date;
}

export const ImpactSectionSchema = SchemaFactory.createForClass(ImpactSection);
export type ImpactSectionDocument = ImpactSection & Document;

@Schema()
export class AmitaProject extends Document {

  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  text: string;

  @Prop({ required: false })
  subText: string;

  @Prop({ required: false })
  project_name: string;

  @Prop({ required: false })
  signup_button_label: string;

  @Prop({ required: false })
  project_text: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  file: string;  // main image file

  @Prop({ required: false, type: [String], default: [] })
  additionalImages: string[];

  @Prop({ required: false })
  facilities: string;

  @Prop({ required: false })
  aboutProjectHeading: string;

  @Prop({ required: false })
  aboutProjectDescription: string;

  @Prop({ required: false })
  industrySectionHeading: string;

  @Prop({ required: false })
  articleSectionHeading: string;

  @Prop({ required: false })
  articleSectionText: string;

  @Prop({ required: false })
  section_heading: string;

  @Prop({ required: false })
  section_text: string;

  @Prop({ required: false })
  industrySectionText: string;

  @Prop({ required: false })
  industrySectionContent: string;

  @Prop({ required: false })
  image: string;

  @Prop({ required: false, default: 0 })
  viewCount: number;

  @Prop({ required: false, default: 0 })
  is_featured: number;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}
const AmitaProjectSchema = SchemaFactory.createForClass(AmitaProject);
export type AmitaProjectDocument = AmitaProject & Document;

@Schema()
export class AmitaProjectSection extends Document {
  @Prop({ required: false })
  text: string;

  @Prop({ required: false })
  heading: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  image: string;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false, default: 1 })
  status: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}

const AmitaProjectSectionSchema = SchemaFactory.createForClass(AmitaProjectSection);
export type AmitaProjectSectionDocument = AmitaProjectSection & Document;

@Schema()
export class AmitaJainLandingPageDetails extends Document {
  @Prop({ required: false })
  file: string;

  @Prop({ required: false })
  image: string;

  @Prop({ required: false })
  banner_title: string;

  @Prop({ required: false })
  button_route: string;

  @Prop({ required: false })
  button_label: string;

  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  line_one_text: string;

  @Prop({ required: false })
  line_two_text: string;

  @Prop({ required: false })
  line_three_text: string;

  @Prop({
    type: [
      {
        title: { type: String },
        text: { type: String },
      },
    ],
    required: false,
  })
  educations_and_training: { title: string; text: string }[];

  @Prop({ type: [String], required: false })
  professional_organisation: string[];

  @Prop({ required: false })
  section_button_label: string;

  @Prop({ required: false })
  section_button_route: string;

  @Prop({ required: false })
  background_section_heading: string;

  @Prop({ required: false })
  background_section_text: string;

  @Prop({ required: false })
  background_sections_description: string;
}

export const AmitaJainLandingPageSchema = SchemaFactory.createForClass(AmitaJainLandingPageDetails);

@Schema()
export class AmitaJainQuoteDetails extends Document {
  @Prop({ required: false })
  file: string;

  @Prop({ required: false })
  title: string;

  @Prop({ required: false })
  quote: string;

  @Prop({ required: false })
  button_label: string;

  @Prop({ required: false })
  button_route: string;

}

export const AmitaJainQuoteSchema = SchemaFactory.createForClass(AmitaJainQuoteDetails);

@Schema()
export class Employee extends Document {

  @Prop({ type: [{ type: Types.ObjectId, ref: 'servicemanagements' }], required: false })
  services: Types.ObjectId[];

  @Prop({ required: false })
  userId: Types.ObjectId

  @Prop({ required: false })
  centerId: Types.ObjectId[]

  @Prop({
    required: true,
    type: [{
      serviceId: { type: Types.ObjectId },
      hourlyRate: { type: Number }
    }]
  })
  salary: {
    serviceId: Types.ObjectId;
    hourlyRate: number;
  }[];

  @Prop({ required: true, default: [] })
  working_days: String[];

  @Prop({ required: false })
  working_time_start: String;

  @Prop({ required: false })
  working_time_end: String;

  @Prop({ required: false })
  skills: String[];

  @Prop({ required: false, default: 0 })
  is_deleted: Number;

  @Prop({ required: false })
  expertise: string;

  @Prop({ required: false, default: 1 })
  status: number;  // 1 = Active, 0 = Inactive


  @Prop({ required: false })
  designation: string;

  @Prop({ required: false, type: String })
  description: string;


  @Prop({ required: false, default: Date.now })
  created_at: Date;
}

const EmployeeSchema = SchemaFactory.createForClass(Employee);


@Schema({ collection: 'employee_reviews' })
export class EmployeeReview extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employee_id: Types.ObjectId;

  @Prop({ required: true })
  overall_review: number;

  @Prop({ required: true })
  punctuality: number;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true })
  service: number;

  @Prop({ required: false })
  comment: string;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const EmployeeReviewSchema = SchemaFactory.createForClass(EmployeeReview);
export type EmployeeReviewDocument = EmployeeReview & Document;

@Schema()
export class CenterResources extends Document {

  @Prop({ required: true })
  name: String

  @Prop({ required: false })
  centerId: Types.ObjectId

  @Prop({ required: false, default: Date.now })
  created_at: Date;
}

const CenterResourcesSchema = SchemaFactory.createForClass(CenterResources);

@Schema()
export class AddOns extends Document {

  @Prop({ required: true })
  name: String

  @Prop({ required: true })
  price: Number

  @Prop({ required: true })
  duration: String

  @Prop({ required: true })
  note: String

  @Prop({ required: false, default: Date.now })
  created_at: Date;

}

const AddOnsSchema = SchemaFactory.createForClass(AddOns);

@Schema()
export class ServicePrice extends Document {

  @Prop({ required: true })
  serviceId: Types.ObjectId

  @Prop({ required: true })
  userId: Types.ObjectId

  @Prop({ required: true })
  price: Number

  @Prop({ required: true })
  duration: String

  @Prop({ required: false, default: Date.now })
  created_at: Date;
}

const ServicePriceSchema = SchemaFactory.createForClass(ServicePrice);

@Schema()
export class AppointmentManagement extends Document {

  @Prop({ required: true })
  serviceId: Types.ObjectId

  @Prop({ required: true })
  employeeId: Types.ObjectId

  @Prop({ required: true })
  centerId: Types.ObjectId

  @Prop({ required: true })
  userId: Types.ObjectId //Appointment booked for

  @Prop({ required: false })
  created_by: Types.ObjectId;

  @Prop({ required: false })
  note: String

  @Prop({ required: true })
  date: Date

  @Prop({ required: true })
  time: String

  @Prop({ required: false })
  deposit: Number;

  @Prop({ required: false })
  billingAddress1: string;

  @Prop({ required: false })
  billingAddress2: string;

  @Prop({ required: false })
  billingCity: string;

  @Prop({ required: false })
  billingState: string;

  @Prop({ required: false })
  billingCountry: string;

  @Prop({ required: false })
  billingZipcode: string;

  @Prop({ required: false })
  repeat: string;

  @Prop({ required: false, default: Date.now })
  updated_at: Date;

  @Prop({ required: false })
  file: string;

  @Prop({ required: true })
  duration: Number

  @Prop({ required: true })
  price: Number

  @Prop({ required: true, default: 'notPaid' })
  status: String

  @Prop({ required: true, default: 'Visit Pending' })
  apptStatus: String

  @Prop({ required: true, default: 'appointment' })
  type: String

  @Prop({ required: false })
  familyMemberId: Types.ObjectId

  @Prop({ required: false })
  paymentIntent: String

  @Prop({ required: false, default: null, type: {} })
  paymentDetails: {};

  @Prop({ required: false, default: Date.now })
  created_at: Date;
}

const AppointmentManagementSchema = SchemaFactory.createForClass(AppointmentManagement);

@Schema()
export class WaitlistManagement extends Document {

  @Prop({ required: true })
  serviceId: Types.ObjectId

  @Prop({ required: true })
  employeeId: Types.ObjectId

  @Prop({ required: true })
  userId: Types.ObjectId

  // ✅ NEW (optional)
  @Prop({ required: false, type: Types.ObjectId })
  familyMemberId?: Types.ObjectId;

  // @Prop({ required: true })
  // time: string

  @Prop({ required: true })
  date: Date
}
const WaitlistManagementSchema = SchemaFactory.createForClass(WaitlistManagement);

@Schema()
export class UserFamily extends Document {

  @Prop({ required: true })
  userId: Types.ObjectId

  @Prop({ required: true })
  relation: string

  @Prop({ required: true })
  email: string

  @Prop({ required: true })
  phone: number

  @Prop({ required: true })
  firstName: string

  @Prop({ required: true })
  lastName: string

  @Prop({ required: true })
  gender: string

  @Prop({ required: false, default: Date.now })
  createdAt: Date
}
const UserFamilySchema = SchemaFactory.createForClass(UserFamily);

@Schema({ collection: 'yogavideos' })
export class YogaVideos extends Document {

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  description: string

  @Prop({ required: true })
  duration: string

  @Prop({ required: true })
  employeeId: Types.ObjectId

  @Prop({ required: true })
  categoryId: Types.ObjectId

  @Prop({ required: true })
  levelId: Types.ObjectId

  @Prop({ required: false })
  coverImage: string

  @Prop({ required: true })
  video: string

  @Prop({ default: false }) is_exclusive: boolean;
  @Prop() membership_id: string;
  @Prop({ default: false }) is_show: boolean;
  @Prop({ type: Number, default: 0 })
  status: number;

  @Prop({ required: false, default: Date.now })
  createdAt: Date

  @Prop({ required: false, default: Date.now })
  modified: Date;
}
const YogaVideosSchema = SchemaFactory.createForClass(YogaVideos);
export type YogaVideosDocument = YogaVideos & Document;


@Schema({ collection: 'eventbookings' })
export class EventBooking extends Document {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'EventManagement' })
  eventId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ required: false })
  coupanId: string;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: false, default: 0 })
  discountAmount: number;

  @Prop({ required: true, type: Number })
  grandTotal: number;

  @Prop({ required: true, default: 'pending', type: String })
  status: string;

  @Prop({ required: false, type: String })
  paymentSessionId: string;

  @Prop({ required: false, type: String })
  stripePaymentIntentId: string;

  @Prop({ required: false, type: String })
  transactionId: string;

  @Prop({ required: false, type: String })
  ticketNumber: string;

  @Prop({ required: false, type: String })
  qrCode: string;

  @Prop({ required: false, default: Date.now })
  created_at: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}

export type EventBookingDocument = EventBooking & Document;
const EventBookingSchema = SchemaFactory.createForClass(EventBooking);

@Schema()
export class MembershipBuyHistroy extends Document {
  @Prop({ required: true, type: Types.ObjectId })
  membership_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  user_id: Types.ObjectId;

  @Prop({ required: true })//in days
  expire_in: Number

  @Prop({ required: false })//in days
  invoiceNo: String

  @Prop({ required: true, default: false })
  is_expired: boolean

  @Prop({ required: false })
  paymentSessionId: String

  @Prop({ required: false })
  membership_price: Number

  @Prop({ required: false })
  discount: Number

  @Prop({ required: false })
  totalPrice: Number

  @Prop({ required: false, default: 'notPaid' })
  status: String;

  @Prop({ required: false, default: '' })
  stripeSubscriptionId: string;

  @Prop({ required: false, default: Date.now })
  renewal_date: Date;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: null, type: {} })
  paymentDetails: {};

  @Prop({ required: false })
  paymentType: String;
   /*
  |------------------------------------------
  | STRIPE STATUS
  |------------------------------------------
  */

  @Prop({ required: false, default: 'inactive' })
  stripeSubscriptionStatus: string;

  /*
  |------------------------------------------
  | CANCEL AT PERIOD END
  |------------------------------------------
  */

  @Prop({ required: false, default: false })
  cancelAtPeriodEnd: boolean;

  /*
  |------------------------------------------
  | SUBSCRIPTION CANCEL DATE
  |------------------------------------------
  */

  @Prop({ required: false, default: null })
  cancelAt: Date;

  /*
  |------------------------------------------
  | ACTUAL CANCELLED DATE
  |------------------------------------------
  */

  @Prop({ required: false, default: null })
  cancelledAt: Date;

  /*
  |------------------------------------------
  | LAST RENEWAL DATE
  |------------------------------------------
  */

  @Prop({ required: false, default: null })
  lastRenewalDate: Date;

}
const MembershipBuyHistroySchema = SchemaFactory.createForClass(MembershipBuyHistroy);
export type MembershipBuyHistroyDocument = MembershipBuyHistroy & Document;


@Schema()
export class CoursesBuyHistroy extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'CourseManagement' }) // ✅ just add ref
  course_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' }) // ✅ just add ref
  user_id: Types.ObjectId;

  @Prop({ required: false })
  paymentSessionId: string;

  @Prop({ required: false, default: 'notPaid' })
  status: string;

  @Prop({ required: false, default: Date.now })
  date: Date;
}
const CoursesBuyHistroySchema = SchemaFactory.createForClass(CoursesBuyHistroy);
export type CoursesBuyHistroyDocument = CoursesBuyHistroy & Document;

@Schema()
export class Donation extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: false })
  paymentSessionId: string;

  @Prop({ required: false, default: 'notPaid' })
  status: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  message?: string;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  created_date: Date;

  @Prop({ required: false, default: Date.now })
  modified_date: Date;
}
const DonationSchema = SchemaFactory.createForClass(Donation);
export type DonationDocument = Donation & Document;

@Schema()
export class NonMemberaddress extends Document {

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  mobile: string;

  @Prop({ required: false })
  flatNo: string;

  @Prop({ required: false })
  area: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: false, type: Types.ObjectId })
  employee_user_id: Types.ObjectId;

  @Prop({ required: true })
  pincode: string;

  @Prop({ required: true })
  countryCode: string;

  @Prop({ required: true })
  stateCode: string;

  @Prop({ required: false, default: 0 })
  is_deleted: number;

  @Prop({ required: false })
  shippoAddressId: string;

  @Prop({ required: false, default: 0 })
  primary: number;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;


}
const NonMemberaddressSchema = SchemaFactory.createForClass(NonMemberaddress)
export type NonMemberaddressDocument = NonMemberaddress & Document;



@Schema({
  collection: 'role_module_table',
})
export class RoleModuleService extends Document {

  @Prop({ required: true })
  moduleName: string;

  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: 'role_module_table',
    default: null,
  })
  parent_id: Types.ObjectId;

  @Prop({
    required: false,
    default: '',
  })
  parent_management: string;

  @Prop({
    required: false,
    default: 1,
  })
  status: number;

  @Prop({
    required: false,
    default: Date.now,
  })
  date: Date;

  @Prop({
    required: false,
    default: Date.now,
  })
  modified: Date;
}

const RoleModuleServiceSchema = SchemaFactory.createForClass(RoleModuleService);
export type RoleModuleServiceDocument = RoleModuleService & Document;


@Schema({
  collection: 'role_table',
})
export class RoleTable extends Document {

  @Prop({
    required: true,
  })
  roleName: string;

  @Prop({
    required: false,
    type: [Types.ObjectId],
    ref: 'role_module_table',
    default: [],
  })
  roleModuleIds: Types.ObjectId[];

  @Prop({
    required: false,
    type: [Types.ObjectId],
    ref: 'users',
    default: [],
  })
  userIds: Types.ObjectId[];

  @Prop({
    required: false,
    default: '',
  })
  hierarchy: string;

  @Prop({
    required: false,
    default: '',
  })
  name: string;

  @Prop({
    required: false,
    default: 1,
  })
  status: number;

  @Prop({
    required: false,
    default: Date.now,
  })
  date: Date;

  @Prop({
    required: false,
    default: Date.now,
  })
  modified: Date;
}

const RoleTableSchema = SchemaFactory.createForClass(RoleTable);


// @Schema({
//   collection: 'groupForEmail',
// })
// export class GroupForEmail extends Document {
//   @Prop({
//     required: true,
//     unique: true,
//     trim: true,
//   })
//   groupName: string;

//   @Prop({
//     required: false,
//     default: '',
//   })
//   description: string;

//   @Prop({
//     required: false,
//     default: '',
//   })
//   emailTemplate: string;

//   @Prop({
//     required: false,
//     default: 1,
//   })
//   status: number;

//   @Prop({
//     required: false,
//     default: 'active',
//   })
//   status_d: string;

//   @Prop({
//     required: false,
//     default: Date.now,
//   })
//   date: Date;

//   @Prop({
//     required: false,
//     default: Date.now,
//   })
//   modified: Date;
// }
// const GroupForEmailSchema = SchemaFactory.createForClass(GroupForEmail);
// export type GroupForEmailDocument = GroupForEmail & Document;

@Schema({
  collection: 'groupForEmail',
})
export class GroupForEmail extends Document {
  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  groupName: string;

  @Prop({
    required: false,
    default: '',
  })
  description: string;

  @Prop({
    required: false,
    default: '',
  })
  emailTemplate: string;

  @Prop({
    required: false,
    default: 1,
  })
  status: number;

  @Prop({
    required: false,
    default: 'active',
  })
  status_d: string;

  @Prop({
    required: false,
    default: '',
  })
  send_email: string;

  @Prop({
    required: false,
    default: Date.now,
  })
  date: Date;

  @Prop({
    required: false,
    default: Date.now,
  })
  modified: Date;
}

const GroupForEmailSchema = SchemaFactory.createForClass(GroupForEmail);

// Helper function for send_email
function getSendEmail(groupName: string): string {
  const groupNameLower = groupName.toLowerCase();

  if (groupNameLower.includes('inactive')) {
    return 'inactive';
  } else if (groupNameLower.includes('active')) {
    return 'active';
  } else if (
    groupNameLower.includes('subscription') ||
    groupNameLower.includes('subscriber')
  ) {
    return 'subscription';
  } else {
    return '';
  }
}

// Helper function for status_d
function getStatusD(groupName: string): string {
  const groupNameLower = groupName.toLowerCase();

  if (
    groupNameLower.includes('inactive') ||
    groupNameLower.includes('active') ||
    groupNameLower.includes('subscription') ||
    groupNameLower.includes('subscriber')
  ) {
    return 'inactive';
  } else {
    return 'active'; // default for other groups
  }
}

// Pre-save middleware (CREATE)
GroupForEmailSchema.pre('save', function (next) {
  if (this.groupName) {
    this.send_email = getSendEmail(this.groupName);
    this.status_d = getStatusD(this.groupName);
  }
  next();
});

// Pre-findOneAndUpdate middleware (UPDATE)
GroupForEmailSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;

  if (update?.groupName) {
    update.send_email = getSendEmail(update.groupName);
    update.status_d = getStatusD(update.groupName);
  }

  next();
});

export type GroupForEmailDocument = GroupForEmail & Document;


@Schema({
  collection: 'groupingEmails',
})
export class GroupingEmails extends Document {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'groupForEmail',
  })
  groupId: Types.ObjectId;

  @Prop({
  type: Types.ObjectId,
  ref: 'users',
  default: null,
})
userId?: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
  })
  email: string;

  @Prop({
    required: false,
    default: 1,
  })
  status: number;

  @Prop({
    required: false,
    default: Date.now,
  })
  date: Date;

  @Prop({
    required: false,
    default: Date.now,
  })
  modified: Date;
}
const GroupingEmailsSchema = SchemaFactory.createForClass(GroupingEmails);
export type GroupingEmailsDocument = GroupingEmails & Document;

@Schema()
export class YogaClassManagement extends Document {
  @Prop() classname: string;
  @Prop() date: Date;
  @Prop() time: string;
  @Prop() address: string;
  @Prop() file: string;
  @Prop({ default: false }) is_rsvp: boolean;
  @Prop() coverImage: string;
  @Prop() format: string;
  @Prop() Price: number;
  @Prop() description: string;
  @Prop() longitude: string;
  @Prop() meeting_link: string;
  @Prop() latitude: string;
  @Prop() city: string;
  @Prop() state: string;
  @Prop() country: string;
  @Prop() pincode: string;
  @Prop() speakername: string;
  @Prop() speakerdesignation: string;
  @Prop() speakerdescription: string;
  @Prop() icon_file: string;
  @Prop() host_name: string;
  @Prop({default : "no"}) show_on_amita: string;
  @Prop({ default: false })
  is_recurring: boolean;

  @Prop({ type: String, enum: ['weekly', 'monthly', 'yearly', null], default: null })
  recurrence_type: string; // how often to repeat

  @Prop({ type: Date, default: null })
  recurrence_end_date: Date; // until when it repeats

  // @Prop({ default: false }) is_exclusive: boolean;
  // @Prop() membership_id: string;
  @Prop({ required: false, default: 0 })
  max_tickets: number;
  @Prop({ required: false, default: 5 })
  maxTicketsPerUser: number;
  @Prop() class_type: string;
  @Prop({ default: false }) is_exclusive: boolean;
  @Prop() membership_id: string;
  @Prop({ type: [{ membership_id: String, membership_name: String, price: Number }], default: [] })
  membership_pricing: { membership_id: string; membership_name: string; price: number }[];
  @Prop({ default: 0 }) is_deleted: number;
  @Prop({ default: 1 }) status: number;
  @Prop({ default: Date.now }) date_created: Date;
  @Prop({ default: Date.now }) modified: Date;
}
export type YogaClassManagementDocument = YogaClassManagement & Document;
const YogaClassManagementSchema = SchemaFactory.createForClass(YogaClassManagement);

@Schema({ collection: 'yogaClassbookings' })
export class yogaClassBooking extends Document {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'YogaClassManagement' })
  classId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ required: false })
  coupanId: string;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: false, default: 0 })
  discountAmount: number;

  @Prop({ required: true, type: Number })
  grandTotal: number;

  @Prop({ required: true, default: 'pending', type: String })
  status: string;

  @Prop({ required: false, type: String })
  paymentSessionId: string;

  @Prop({ required: false, type: String })
  stripePaymentIntentId: string;

  @Prop({ required: false, type: String })
  transactionId: string;

  @Prop({ required: false, type: String })
  ticketNumber: string;

  @Prop({ required: false, type: String })
  qrCode: string;

  @Prop({ required: false, default: Date.now })
  created_at: Date;

  @Prop({ required: false, default: Date.now })
  modified: Date;
}
export type yogaClassBookingDocument = yogaClassBooking & Document;
const yogaClassBookingSchema = SchemaFactory.createForClass(yogaClassBooking);






export {
  UserSchema,
  ProductSchema,
  ZohoTokenSchema,
  CouponSchema,
  MasterSchema,
  translationsSchema,
  CenterManagementSchema,
  TestimonialSchema,
  ContentSchema,
  JobManagementSchema,
  MainBannerSchema,
  LandingPageSchema,
  BlogManagementSchema,
  BlogContentManagementSchema,
  ContactManagementSchema,
  faqManagementSchema,
  faqsSchema,
  NotesSchema,
  EnquirySchema,
  cartManagementSchema,
  orderManagementSchema,
  emailOtpSchema,
  smsOtpSchema,
  suscribeSchema,
  addressSchema,
  reviewSchema,
  returnOrderSchema,
  AyurVedicNaturalHealingSchema,
  ArticleSchema,
  ArticleManagementSchema,
  CaseStoryTypeSchema,
  CaseStoryProviderSchema,
  ContactAmitaSchema,
  ClinicBannerSchema,
  ClinicSectionsSchema,
  AmitaJainScheduleSchema,
  TalksSchema,
  YogaClassesSchema,
  YogaClassesPageContentSchema,
  AmitaProjectSchema,
  AmitaProjectSectionSchema,
  EmployeeSchema,
  CenterResourcesSchema,
  AddOnsSchema,
  ServicePriceSchema,
  AppointmentManagementSchema,
  WaitlistManagementSchema,
  UserFamilySchema,
  YogaVideosSchema,
  EventBookingSchema,
  MembershipBuyHistroySchema,
  CoursesBuyHistroySchema,
  DonationSchema,
  NonMemberaddressSchema,
  RoleModuleServiceSchema,
  RoleTableSchema,
  GroupForEmailSchema,
  GroupingEmailsSchema,
  YogaClassManagementSchema,
  yogaClassBookingSchema
};