import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'src/helpers/dto/response.dto';
import { VerifyPatientDto } from './dto/verify-patient.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';

@Controller('patient')
@ApiTags('Patient Onboarding (MOBILE)')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('onboard/hospital-code/:code')
  @ApiOperation({ summary: 'Verify hospital code for patient onboarding' })
  @ApiResponse({
    status: 200,
    description: 'Hospital code verified successfully.',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or incorrect hospital code.',
    type: ResponseDto,
  })
  async verifyHospitalCode(
    @Param('code', new ValidationPipe()) code: string,
  ): Promise<ResponseDto> {
    return this.authService.verifyHospitalCode(code);
  }

  @Post('onboard/verify-details/:hospitalCode')
  @ApiOperation({
    summary: 'Verify patient details and send OTP for mobile verification',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent to the mobile number.',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Patient details or hospital code is incorrect.',
    type: ResponseDto,
  })
  async verifyPatientDetails(
    @Param('hospitalCode') hospitalCode: string,
    @Body(ValidationPipe) verifyPatientDto: VerifyPatientDto,
  ): Promise<ResponseDto> {
    return this.authService.verifyPatientDetails(
      hospitalCode,
      verifyPatientDto,
    );
  }

  @Post('resend-otp')
  @ApiOperation({ summary: 'Resend OTP to the provided mobile number' })
  @ApiResponse({
    status: 200,
    description: 'OTP sent to the mobile number.',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Mobile number not found or other error.',
    type: ResponseDto,
  })
  async resendOtp(
    @Body(ValidationPipe) resendOtpDto: ResendOtpDto,
  ): Promise<ResponseDto> {
    return this.authService.resendOtp(resendOtpDto);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'OTP verification' })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully.',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or incorrect OTP',
    type: ResponseDto,
  })
  async verifyOtp(
    @Body(ValidationPipe) verifyOtp: VerifyOtpDto,
  ): Promise<ResponseDto> {
    return this.authService.verifyOtp(verifyOtp);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with mobile number or email to receive OTP' })
  @ApiResponse({
    status: 200,
    description: 'OTP sent via SMS or email.',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid identifier provided.',
    type: ResponseDto,
  })
  async login(@Body(ValidationPipe) loginDto: LoginDto): Promise<ResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('verify-login-otp')
  @ApiOperation({ summary: 'Verify OTP for login and return JWT' })
  @ApiResponse({
    status: 200,
    description: 'OTP verified and JWT token generated',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid OTP',
    type: ResponseDto,
  })
  async verifyLoginOtp(
    @Body(ValidationPipe) loginDto: LoginDto,
  ): Promise<ResponseDto> {
    return this.authService.verifyLoginOtp(loginDto);
  }
}
