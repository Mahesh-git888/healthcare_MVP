import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AccessLinkLoginDto } from './dto/access-link-login.dto';
import { PhoneLoginDto } from './dto/phone-login.dto';
import { AuthService } from './auth.service';
import { PartnerService } from '../partner/partner.service';
import { RegisterPartnerDto } from '../partner/dto/register-partner.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly partnerService: PartnerService,
  ) {}

  @Post('access-link-login')
  @HttpCode(HttpStatus.OK)
  accessLinkLogin(@Body() body: AccessLinkLoginDto) {
    return this.authService.exchangeAccessLinkToken(body.token);
  }

  // Alias for partner registration to match API contracts that prefer /auth/register.
  @Post('register')
  register(@Body() body: RegisterPartnerDto) {
    return this.partnerService.register(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: PhoneLoginDto) {
    return this.authService.loginPartnerByPhone(body.phone);
  }
}
