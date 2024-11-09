import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from 'src/shared/repositories/user.repository';
import { CreateAdminDto } from './dto/create-admin.dto';
import { USER_TYPE } from 'src/helpers/enums';
import { ResponseDto } from 'src/helpers/dto/response.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signUpAdmin(createAdminDto: CreateAdminDto): Promise<ResponseDto> {
    try {
      const { email, password, first_name, last_name } = createAdminDto;

      // Check if the user already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new BadRequestException(
          ResponseDto.error('User with this email already exists', 409),
        );
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new admin user
      const newUser = {
        first_name,
        last_name,
        email,
        password: hashedPassword, // Store hashed password
        role: USER_TYPE.ADMIN, // Set the role as 'admin'
        is_active: true, // By default, set admin as active
      };

      await this.userRepository.create(newUser); // Use repository to create the user
      return ResponseDto.success(null, 'Admin created successfully.');
    } catch (error) {
      throw new BadRequestException(ResponseDto.error(error?.message, 500));
    }
  }

  async loginAdmin(email, password): Promise<ResponseDto> {
    try {
      const admin = await this.userRepository.findByEmail(email);

      // Ensure the user is an admin and the password is valid
      if (
        admin &&
        admin.role === USER_TYPE.ADMIN &&
        (await bcrypt.compare(password, admin.password))
      ) {
        const { first_name, last_name, email, role } = admin;
        return ResponseDto.success(
          {
            first_name,
            last_name,
            email,
            access_token: this.jwtService.sign({ email, role }),
          },
          'Logged in successfully',
        );
      }
      return ResponseDto.unAuthorized(null);
    } catch (error) {
      throw new BadRequestException(ResponseDto.error(error?.message, 500));
    }
  }
}
