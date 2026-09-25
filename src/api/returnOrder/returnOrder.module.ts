import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { orderManagement, orderManagementSchema, Master, MasterSchema, Product, ProductSchema, returnOrder, returnOrderSchema } from '../../schema/schema';
import { returnOrderController } from './returnOrder.controller';
import { returnOrderService } from './returnOrder.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: orderManagement.name, schema: orderManagementSchema },
        { name: Master.name, schema: MasterSchema },
        { name: Product.name, schema: ProductSchema },
        { name: returnOrder.name, schema: returnOrderSchema }
        ])
    ],
    controllers: [returnOrderController],
    providers: [returnOrderService]
})


export class ReturnOrderModule implements NestModule {
    configure = (consumer: MiddlewareConsumer) => {
        consumer
            .apply(MulterMiddleware)
        //   .forRoutes('cart_management/add','cart_management/update/:id'); // Apply to specific route
    };
}
