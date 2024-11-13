import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ResponseDto } from 'src/helpers/dto/response.dto';
import { UserRepository } from 'src/shared/repositories/user.repository';
import { VerifyPatientDto } from './dto/verify-patient.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from 'src/helpers/email.service';
import { otpLoginTemplate } from 'src/helpers/emails/logn-otp-template';
import { JwtService } from '@nestjs/jwt';
import { TwilioService } from 'src/helpers/twillio.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private emailService: EmailService,
    private twillioService: TwilioService,
    private readonly jwtService: JwtService,
  ) {}

  private generateOtp(): number {
    // return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit numeric OTP
    return 123123;
  }

  private async updatePatientOtp(
    patientId: string,
    otp: number,
  ): Promise<void> {
    await this.userRepository.updateById(patientId, { otp });
    // TODO: Send OTP via SMS
    // await this.smsService.sendOtp(mobile, otp.toString());
  }

  async verifyHospitalCode(code: string): Promise<ResponseDto> {
    const hospitalCode = await this.userRepository.findByHospitalCode(code);
    if (hospitalCode) {
      return ResponseDto.success(
        hospitalCode,
        'Hospital code verified successfully.',
      );
    }
    throw new BadRequestException(
      ResponseDto.badRequest(null, 'Invalid or incorrect hospital code'),
    );
  }

  async verifyPatientDetails(
    hospitalCode: string,
    payload: VerifyPatientDto,
  ): Promise<ResponseDto> {
    const patient = await this.userRepository.findByHospitalCode(hospitalCode);

    if (!patient) {
      throw new BadRequestException(
        ResponseDto.badRequest(
          null,
          'Hospital code or patient details are incorrect',
        ),
      );
    }

    const otp = this.generateOtp();
    await this.updatePatientOtp(patient._id, otp);
    await this.userRepository.updateById(patient._id, { ...payload, otp });

    return ResponseDto.success(null, 'OTP sent to the mobile number');
  }

  async resendOtp(resendOtpDto: ResendOtpDto): Promise<ResponseDto> {
    const { mobile_no } = resendOtpDto;

    const patient: any = await this.userRepository.findInactiveMobile(
      mobile_no,
      false,
    );
    if (!patient) {
      throw new BadRequestException(
        ResponseDto.badRequest(null, 'Mobile number not found'),
      );
    }

    const otp = this.generateOtp();
    await this.updatePatientOtp(patient._id, otp);

    return ResponseDto.success(null, 'OTP sent to the mobile number');
  }

  async verifyOtp(verifyOtp: VerifyOtpDto): Promise<ResponseDto> {
    const { mobile_no, otp } = verifyOtp;

    const patient: any = await this.userRepository.findInactiveMobile(
      mobile_no,
      false,
    );
    if (!patient) {
      throw new BadRequestException(
        ResponseDto.badRequest(null, 'Mobile number not found'),
      );
    }

    if (patient.otp !== +otp) {
      throw new BadRequestException(
        ResponseDto.badRequest(null, 'Invalid OTP'),
      );
    }

    await this.userRepository.updateById(patient._id, {
      otp: null,
      is_active: true,
      is_mobile_verified: true,
    });

    return ResponseDto.success(null, 'Mobile verified successfully.');
  }

  async login(loginDto: LoginDto): Promise<ResponseDto> {
    const { identifier } = loginDto;
    const isMobile = /^\d{10}$/.test(identifier); // Assuming mobile number is 10 digits
    // await this.sendOtpBySms('+15005550001', 123456);

    let user: any;
    if (isMobile) {
      user = await this.userRepository.findInactiveMobile(identifier);
      if (!user) {
        throw new BadRequestException(
          ResponseDto.badRequest(null, 'Mobile number not found'),
        );
      }
    } else {
      user = await this.userRepository.findByEmail(identifier);
      if (!user) {
        throw new BadRequestException(
          ResponseDto.badRequest(null, 'Email not found'),
        );
      }
    }

    if (!user?.is_mobile_verified) {
      return ResponseDto.success(null, 'mobile is not verified', 301);
    }

    const otp = this.generateOtp();
    await this.userRepository.updateById(user._id, { login_otp: otp });

    if (isMobile) {
      // await this.sendOtpBySms(identifier, otp);
    } else {
      await this.sendOtpByEmail(otp, user);
    }

    return ResponseDto.success(null, 'OTP sent via SMS or email.');
  }

  private async sendOtpBySms(mobile: string, otp: number): Promise<void> {
    await this.twillioService.sendOtp(mobile, otp.toString());
  }

  private async sendOtpByEmail(otp: number, user: any): Promise<void> {
    const emailHtml = otpLoginTemplate(
      `${user.first_name} ${user.last_name}`,
      otp,
    );
    await this.emailService.sendMail(user.email, 'Login - OTP', emailHtml);
  }

  async verifyLoginOtp(loginDto: LoginDto): Promise<ResponseDto> {
    const { identifier, otp } = loginDto;

    const isMobile = /^\d{10}$/.test(identifier); // Assuming mobile number is 10 digits

    let user: any;
    if (isMobile) {
      user = await this.userRepository.findInactiveMobile(identifier);
      if (!user) {
        throw new BadRequestException(
          ResponseDto.badRequest(null, 'Mobile number not found'),
        );
      }
    } else {
      user = await this.userRepository.findByEmail(identifier);
      if (!user) {
        throw new BadRequestException(
          ResponseDto.badRequest(null, 'Email not found'),
        );
      }
    }

    if (!user) {
      throw new BadRequestException(
        ResponseDto.badRequest(null, 'User not found'),
      );
    }

    // Verify OTP
    if (user.login_otp !== +otp) {
      throw new UnauthorizedException(
        ResponseDto.unAuthorized(null, 'Invalid OTP'),
      );
    }

    // Update user status and clear OTP after successful verification
    await this.userRepository.updateById(user._id, {
      login_otp: null,
      is_active: true,
    });

    // Generate JWT token
    const payload = {
      userId: user?._id.toString(),
      role: user.role,
      email: user.email,
    };
    const token = this.jwtService.sign(payload);

    // Return user data with JWT token
    return ResponseDto.success(
      { user, token },
      'Login successful and JWT token generated',
    );
  }
}
