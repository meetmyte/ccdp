import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePatientDto } from './create-patient.dto';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  @ApiProperty({
    description: 'Update patient first name',
    example: 'John',
  })
  first_name?: string;

  @ApiProperty({
    description: 'Update patient last name',
    example: 'Doe',
  })
  last_name?: string;

  @ApiProperty({
    description: 'Update patient mobile number',
    example: '1234567890',
  })
  mobile?: number;

  @ApiProperty({
    description: 'Update patient gender',
    example: 'Male',
  })
  gender?: string;

  @ApiProperty({
    description: 'Update patient date of birth',
    example: '1990-01-01',
  })
  date_of_birth?: Date;
}
