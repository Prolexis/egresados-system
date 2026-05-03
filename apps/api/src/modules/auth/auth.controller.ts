import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register/egresado')
  registerEgresado(@Body() body: any) {
    return this.authService.registerEgresado(body);
  }

  @Post('register/empresa')
  registerEmpresa(@Body() body: any) {
    return this.authService.registerEmpresa(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Request() req: any) {
    return this.authService.me(req.user.sub);
  }
}
