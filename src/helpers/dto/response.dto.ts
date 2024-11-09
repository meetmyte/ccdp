export class ResponseDto<T = any> {
  statusCode: number;
  message: string;
  data: T | null;

  constructor(statusCode: number, message: string, data: T | null = null) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  static success<T>(
    data: T,
    message: string = 'Success',
    code = 200,
  ): ResponseDto<T> {
    return new ResponseDto(code, message, data);
  }

  static unAuthorized<T>(
    data: T,
    message: string = 'Invalid credentials',
  ): ResponseDto<T> {
    return new ResponseDto(401, message, data);
  }

  static badRequest<T>(
    data: T,
    message: string = 'Bad request',
  ): ResponseDto<T> {
    return new ResponseDto(404, message, data);
  }

  static error(
    message: string = 'Something went wrong',
    statusCode: number = 500,
  ): ResponseDto<null> {
    return new ResponseDto(statusCode, message, null);
  }
}
