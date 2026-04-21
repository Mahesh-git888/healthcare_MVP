import { Body, Controller, Post } from '@nestjs/common';
import { AccessLinkLoginDto } from './dto/access-link-login.dto';
import { PhoneLoginDto } from './dto/phone-login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('access-link-login')
  accessLinkLogin(@Body() body: AccessLinkLoginDto) {
    return this.authService.exchangeAccessLinkToken(body.token);
  }

  @Post('login')
  login(@Body() body: PhoneLoginDto) {
    return this.authService.loginPartnerByPhone(body.phone);
  }
}

