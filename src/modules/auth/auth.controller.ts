import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common'
import type { Response, Request } from 'express'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { JwtAuthGuard } from './jwt-auth.guard'
import { CurrentUser } from '../../common/current-user.decorator'
import { ActivityLogService } from '../../common/activity-log.service'

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private activityLogs: ActivityLogService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto)
    if (result.refresh_token) {
      res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
      })
    }
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string) || 'system'
    await this.activityLogs.logEvent({
      tenantId: result?.user?.tenant_id,
      userId: result?.user?.id,
      action: 'login',
      description: `User ${result?.user?.email ?? 'unknown'} logged in`,
      ipAddress,
    })
    return result
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const result = await this.authService.register(dto)
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string) || 'system'
    await this.activityLogs.logEvent({
      tenantId: result?.user?.tenant_id,
      userId: result?.user?.id,
      action: 'register',
      description: `Tenant registered with email ${result?.user?.email ?? dto.email}`,
      ipAddress,
    })
    return result
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@CurrentUser() user: any) {
    return this.authService.profile(user.user_id)
  }

  @Post('refresh')
  async refresh(@Req() req: Request) {
    const token = req.cookies?.refresh_token
    return this.authService.refresh(token)
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token')
    return { success: true }
  }
}
