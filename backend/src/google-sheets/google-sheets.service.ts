import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Partner } from '../database/entities/partner.entity';
import { CreateLeadDto } from '../lead/dto/create-lead.dto';

@Injectable()
export class GoogleSheetsService {
  constructor(private readonly configService: ConfigService) {}

  async appendLead(partner: Partner, lead: CreateLeadDto) {
    const spreadsheetId = this.configService.get<string>(
      'GOOGLE_SHEETS_SPREADSHEET_ID',
    );
    const sheetName =
      this.configService.get<string>('GOOGLE_SHEETS_SHEET_NAME') ?? 'Sheet1';
    const clientEmail = this.configService.get<string>(
      'GOOGLE_SHEETS_CLIENT_EMAIL',
    );
    const privateKey = this.configService
      .get<string>('GOOGLE_SHEETS_PRIVATE_KEY')
      ?.replace(/\\n/g, '\n');

    if (!spreadsheetId || !clientEmail || !privateKey) {
      throw new InternalServerErrorException(
        'Google Sheets configuration is incomplete',
      );
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:L`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [
            new Date().toISOString(),
            partner.name,
            partner.phone,
            partner.role,
            lead.city,
            lead.area,
            lead.patientName,
            lead.phone,
            lead.serviceType,
            lead.shiftType ?? '',
            'NEW',
            '',
          ],
        ],
      },
    });
  }
}

