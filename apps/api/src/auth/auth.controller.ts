import { IsEmail, IsString } from 'class-validator';
import { Body, Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Public } from './jwt-auth.guard';

class LoginDto {
    @IsEmail()
    email!: string;

    @IsString()
    password!: string;
}

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto.email, dto.password);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    getProfile(@Request() req: any) {
        return { success: true, data: req.user };
    }
}
