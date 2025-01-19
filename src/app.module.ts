// app.module.ts (or database.module.ts)
import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
// ^ your custom function returning a MongoClient with autoEncryption
import * as mongoose from 'mongoose';

// other imports...
import { AdminModule } from './admin/admin.module';
import { MobileModule } from './mobile/mobile.module';
import { SharedModule } from './shared/shared.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PatientsModule } from './admin/patients/patients.module';
import { SeedsModule } from './seeds/seeds.module';
import { createEncryptedClient } from './helpers/encryption/encryption-client';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Setup Mongoose with connectionFactory
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<MongooseModuleOptions> => {
        // 1) read your env
        const uri =
          configService.get<string>('MONGO_URI') ||
          'mongodb://localhost:27017/health-connect';

        // 2) create your encrypted MongoClient
        const encryptedClient = await createEncryptedClient(uri);

        // 3) return a config object with a dummy uri + connectionFactory
        return {
          uri: 'mongodb://fake', // dummy, won't be used
          connectionFactory: (connection) => {
            // Force Mongoose to use the existing DB from encryptedClient
            // Pass the exact DB name "health-connect" that you want to use
            connection.db = encryptedClient.db('health-connect');

            // Optional: add some logging or event hooks
            connection.on('connected', () => {
              console.log(
                '[Mongoose] Connected with CSFLE client to health-connect DB',
              );
            });

            return connection;
          },
        };
      },
    }),

    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '4h' },
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
    // Listen to Mongoose's default connection events
    const db = mongoose.connection;

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
