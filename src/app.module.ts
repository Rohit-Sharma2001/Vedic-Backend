import { Module, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './api/user/user.module';
// import { multer } from './middlewares/multer/multer.module';
import { ProductModule } from './api/inventory/inventory.module';
import { CenterManagementModule } from './api/center_management/center_management.module';
import { JobManagementModule } from './api/job_management/job_management.module';

import { MainBannerModule } from './api/main_banner/main_banner.module';
import { LandingPageModule } from './api/landing_page/landing_page.module';
import { BlogManagementModule } from './api/blog_management/blog_management.module';

import { CouponModule } from './api/coupon/coupon.module';
import { ContentModule } from './api/content/content.module';
import { TestimonialModule } from './api/testimonial/testimonial.module';
import { MasterModule } from './api/master/master.module';
import { UploadModule } from './api/upload/upload.module'
import { AuthenticationModule } from './authentication/authentication.module';
import { ZohoModule } from './api/zoho/zoho.module';
// import { CronService } from './middlewares/cron/cron.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ZohoCronModule } from './middlewares/cron/cron.module';
import { YogaClasses, ZohoTokenDocument } from './schema/schema'; // if req change

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { ContactManagementModule } from './api/contact_management/contact_management.module';
import { FaqManagementModule } from './api/faq_management/faq_management.module';
import { NotesManagementModule } from './api/notes_management/notes_management.module';
import { EnquiryManagementModule } from './api/enquiry_management/enquiry_management.module';
import { CartManagementModule } from './api/cart_management/cart_management.module';
import { TranslationModuleModule } from './api/translation-module/translation-module.module';
import { OrderManagementModule } from './api/order_management/order_management.module';
import { ReturnOrderModule } from './api/returnOrder/returnOrder.module';
import { AyurVedicHealingModule } from './api/Ayurvedic_Natural_Healing/ayurvedic_natutal_healing.module';
import { BalancingDietModule } from './api/Balancing_Diet_Pages/balancing_diet.module';
import { LifestyleModule } from './api/lifestyle_pages/lifestyle.module';
import { ReviewModule } from './api/review/review.module';
import { TreatingDoshaModule } from './api/treating_dosha/treating_dosha.module';
import { DoshasCmsModule } from './api/doshas_cms/doshas_cms.module';
import { QuizPageContentModule } from './api/quiz_page_content/quiz_page_content.module';
import { JobPageContentModule } from './api/job_page_content/job_page_content.module';
import { ArticleModule }  from './api/article_contentmanagement/article_contentmanagement.module'; 
import { ArticleManagementModule } from './api/article_management/article_management.module';
import { CaseStoryTypeModule } from './api/case_story_type/case_story_type.module';
import { CaseStoryProviderModule } from './api/case_story_provider/case_story_provider.module';
import { ContactAmitaModule } from './api/contact_amita/contact_amita.module';
import { ClinicBannerModule } from './api/clinic_banner/clinic_banner.module';
import { ClinicSectionsModule } from './api/clinic_sections/clinic_sections.module';
import { AmitaJainScheduleModule } from './api/amita_jain_schedule/amita_jain_schedule.module';
import { TalksModule } from './api/talks/talks.module';
import { YogaClassesModule} from './api/yoga_classes/yoga_classes.module';
import { YogaClassesPageContentModule } from './api/yoga_class_content/yoga_class_content.module';
import { OurFamilyBannerModule } from './api/our_family_banner/our_family_banner.module';
import { TeamMembersModule } from './api/team_members/team_members.module';
import { ImpactSectionModule } from './api/impact_section/impact_section.module';
import { AmitaProjectModule } from './api/amita_project/amita_project.module';
import { AmitaProjectSectionModule } from './api/amita_project_section/amita_project_section.module';
import { AmitaJainLandingPageModule } from './api/amitajain_landingpage/amitajain_landingpage.module';
import { AmitaJainQuoteModule } from './api/amitajain_quote/amitajain_quote.module';
import { AppointmentPageContentModule } from './api/appointment_page_content/appointment_page_content.module';
import { ServicesManagementModule } from './api/services_management/services_management.module';
import { ServiceTypeModule } from './api/service_type/service_type.module';
import { EmployeeManagementModule } from './api/employee/employee.module';
import { CenterResourcesModule } from './api/center_resources/center_resources.module';
import { AddOnsModule } from './api/add_ons/add_ons.module';
import { RoleModuleServiceModule  } from './api/role_module_service/role_module_service.module';
import { AppointmentManagementModule } from './api/appointment_management/appointment_management.module';
import { WaitlistModule } from './api/waitlist/waitlist.module';
import { EmployeeReviewModule } from './api/employee-review/employee-review.module';
import { userFamilyModule } from './api/user_family/user_family.module';
import { ParticipationDetailsModule } from './api/participationdetails/participationdetails.module';
import { EventManagementModule } from './api/event_management/event_management.module';
import { YogaClassManagementModule } from './api/yoga_class_management/yoga_class_management.module';
import { YogaVideoModule } from './api/yoga_videos/yoga_videos.module';
import { MembershipManagementModule } from './api/membership_management/membership_management.module';
import { CourseManagementModule } from './api/course_management/course_management.module';
import { YogaDocumentsModule } from './api/yoga_documents/yoga_documents.module';
import { MembershipBuyManagementModule } from './api/membership_buy_history/membership_buy_history.module';
import { BusinessDetailModule } from './api/business_details/business_details.module';
import { DonationModule } from './api/donation/donation.module';
import { StripeWebhookModule } from './api/stripe_webhook/stripe_webhook.module';
import { SubscribeEmailModule } from './api/subscribe-email/subscribe-email.module';
import { DashboardModule } from './api/dashboard/dashboard.module';
@Module({

  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }),
  MongooseModule.forRoot(process.env.MongoDB, {
    connectionFactory: (connection) => {
      connection.on('error', (error) => {
        Logger.error('MongoDB connection error:', error);
      });
      connection.on('connected', () => {
        Logger.log('MongoDB connected successfully');
      });
      connection.on('disconnected', () => {
        Logger.warn('MongoDB disconnected');
      });
      return connection;
    },
  }),

  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'uploads'),  // This serves files from the `uploads` folder
    serveRoot: '/uploads',  // URL prefix for static files (e.g., http://localhost:3000/uploads/)
  }),
  ProductModule,  // Import ProductModule here
  CartManagementModule,
  BlogManagementModule,
  FaqManagementModule,
  NotesManagementModule,
  TranslationModuleModule,
  EnquiryManagementModule,
  
  ScheduleModule.forRoot(),
    UserModule,
    ProductModule,
    UploadModule,
    TranslationModuleModule,
    ZohoModule,
    ZohoCronModule,
    AuthenticationModule,
    CouponModule,
    MasterModule,
    CenterManagementModule,
    TestimonialModule,
    ContentModule,
    JobManagementModule,
    MainBannerModule,
    LandingPageModule,
    ContactManagementModule,
    OrderManagementModule,
    ReturnOrderModule,
    AyurVedicHealingModule,
    BalancingDietModule,
    LifestyleModule,
    ReviewModule,
    TreatingDoshaModule,
    DoshasCmsModule,
    QuizPageContentModule,
    JobPageContentModule,
    ArticleModule,
    ArticleManagementModule,
    CaseStoryTypeModule,
    CaseStoryProviderModule,
    ContactAmitaModule,
    ClinicBannerModule,
    ClinicSectionsModule,
    AmitaJainScheduleModule,
    TalksModule,
    YogaClassesModule,
    YogaClassesPageContentModule,
    OurFamilyBannerModule,
    TeamMembersModule,
    ImpactSectionModule,
    AmitaProjectModule,
    AmitaProjectSectionModule,
    AmitaJainLandingPageModule,
    AmitaJainQuoteModule,
    AppointmentPageContentModule,
    ServicesManagementModule,
    ServiceTypeModule,
    EmployeeManagementModule,
    CenterResourcesModule,
    AddOnsModule,
    AppointmentManagementModule,
    WaitlistModule,
    EmployeeReviewModule,
    userFamilyModule,
    ParticipationDetailsModule,
    EventManagementModule,
    YogaVideoModule,
    MembershipManagementModule,
    CourseManagementModule,
    YogaDocumentsModule,
    MembershipBuyManagementModule,
    BusinessDetailModule,
    DonationModule,
    StripeWebhookModule,
    RoleModuleServiceModule,
    SubscribeEmailModule,
    YogaClassManagementModule,
    DashboardModule

    // CronModule,
    // multer
    // YourSchemaModule, // Import your modules here
  ],
  controllers: [AppController],
  providers: [AppService,],
})

export class AppModule { }
console.log(process.env.MongoDB,"process.env.MongoDB")
