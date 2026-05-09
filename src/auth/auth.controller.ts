import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get()
  async twitchRedirect() {}

  @Get()
  async getTwitchCallback() {}
}
