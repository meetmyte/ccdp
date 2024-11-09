import { ApiProperty } from '@nestjs/swagger';

export class PaginationFilterDto {
  @ApiProperty({ description: 'Page number', example: 1, required: false })
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
  })
  limit?: number = 10;

  @ApiProperty({
    description: 'Sort order (asc/desc)',
    example: 'asc',
    required: false,
  })
  sortOrder?: 'asc' | 'desc' = 'asc';

  @ApiProperty({
    description: 'Sort by field',
    example: 'first_name',
    required: false,
  })
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description:
      'Search filters as a JSON string (e.g., {"first_name":"John", "gender":"Male"})',
    example: '{"first_name":"John", "gender":"Male"}',
    required: false,
  })
  filters?: string;
}
