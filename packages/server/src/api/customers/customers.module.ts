import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CustomersProcessor } from './customers.processor';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import {
  CustomerKeys,
  CustomerKeysSchema,
} from './schemas/customer-keys.schema';
import { AccountsModule } from '../accounts/accounts.module';
import { SegmentsModule } from '../segments/segments.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../accounts/entities/accounts.entity';
import { AudiencesHelper } from '../audiences/audiences.helper';
import { AudiencesModule } from '../audiences/audiences.module';
import { JourneysModule } from '../journeys/journeys.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
    ]),
    MongooseModule.forFeature([
      { name: CustomerKeys.name, schema: CustomerKeysSchema },
    ]),
    BullModule.registerQueue({
      name: 'customers',
    }),
    AccountsModule,
    SegmentsModule,
    AudiencesModule,
    JourneysModule,
    TypeOrmModule.forFeature([Account]),
  ],
  controllers: [CustomersController],
  providers: [CustomersService, CustomersProcessor, AudiencesHelper],
  exports: [CustomersService],
})
export class CustomersModule {}
