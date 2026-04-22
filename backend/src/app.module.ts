import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { Admin } from './database/entities/admin.entity';
import { Partner } from './database/entities/partner.entity';
import { EarningsModule } from './earnings/earnings.module';
import { GoogleSheetsModule } from './google-sheets/google-sheets.module';
import { LeadModule } from './lead/lead.module';
import { PartnerModule } from './partner/partner.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.getOrThrow<string>('DATABASE_URL'),
        entities: [Admin, Partner],
        autoLoadEntities: true,
        synchronize: true,
        ssl: shouldUseSsl(configService.get<string>('DATABASE_URL')),
      }),
    }),
    AuthModule,
    PartnerModule,
    LeadModule,
    AdminModule,
    GoogleSheetsModule,
    EarningsModule,
  ],
})
export class AppModule {}

function shouldUseSsl(databaseUrl?: string) {
  if (!databaseUrl) {
    return false;
  }

  const isLocal =
    databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');

  return isLocal ? false : { rejectUnauthorized: false };
}
