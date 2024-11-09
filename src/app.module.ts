import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from './admin/admin.module';
import { MobileModule } from './mobile/mobile.module';
import * as mongoose from 'mongoose';
import { SharedModule } from './shared/shared.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PatientsModule } from './admin/patients/patients.module';
import { SeedsModule } from './seeds/seeds.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET, // JWT Secret from .env
      signOptions: { expiresIn: '4h' }, // Token expiration
    }),
    SharedModule,
    AdminModule,
    MobileModule,
    PatientsModule,
    SeedsModule,
  ],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  async onModuleInit() {
    // Listening to MongoDB connection events
    const db = mongoose.connection;

    // TODO:
    db.on('connected', () => {
      this.logger.log('MongoDB connected successfully');
    });

    db.on('error', (err) => {
      this.logger.error(`MongoDB connection error: ${err}`);
    });

    db.on('disconnected', () => {
      this.logger.warn('MongoDB disconnected');
    });
  }
}
