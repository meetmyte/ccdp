import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AdminAuthService } from './auth.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginAdminDto } from './dto/login-admin.dto';
import { ResponseDto } from 'src/helpers/dto/response.dto';

@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Sign up a new admin user' }) // Endpoint description
  @ApiResponse({
    status: 201,
    description: 'Admin successfully created',
    type: ResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async signUpAdmin(
    @Body(new ValidationPipe()) createAdminDto: CreateAdminDto,
  ): Promise<ResponseDto> {
    try {
      return await this.authService.signUpAdmin(createAdminDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Admin login' }) // Description of the endpoint
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    schema: {
      example: {
        access_token: 'your_jwt_token',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginAdminDto: LoginAdminDto) {
    const { email, password } = loginAdminDto;
    return await this.authService.loginAdmin(email, password);
  }
}
