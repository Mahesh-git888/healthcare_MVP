import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
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

    try {
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
    } catch (error) {
      const details = getGoogleSheetsErrorDetails(error);

      console.error('Google Sheets append failed', {
        spreadsheetId,
        sheetName,
        clientEmail,
        details,
      });

      throw new BadGatewayException(details);
    }
  }
}

function getGoogleSheetsErrorDetails(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    const message = error.message;

    if (
      message.includes('Unable to parse range') ||
      message.includes('Range') ||
      message.includes('range')
    ) {
      return 'Google Sheets tab name is invalid. Check GOOGLE_SHEETS_SHEET_NAME.';
    }

    if (
      message.includes('The caller does not have permission') ||
      message.includes('permission')
    ) {
      return 'Google Sheets permission denied. Share the sheet with the service account email as Editor.';
    }

    if (
      message.includes('invalid_grant') ||
      message.includes('Invalid JWT') ||
      message.includes('DECODER routines')
    ) {
      return 'Google Sheets service account credentials are invalid. Recheck GOOGLE_SHEETS_CLIENT_EMAIL and GOOGLE_SHEETS_PRIVATE_KEY.';
    }

    if (message.includes('Requested entity was not found')) {
      return 'Google Spreadsheet ID was not found. Check GOOGLE_SHEETS_SPREADSHEET_ID.';
    }

    return `Google Sheets request failed: ${message}`;
  }

  return 'Google Sheets request failed for an unknown reason.';
}
