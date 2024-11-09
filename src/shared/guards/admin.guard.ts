import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { USER_TYPE } from 'src/helpers/enums';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new ForbiddenException('No token provided');
    }

    const decodedToken = this.jwtService.decode(token) as any;

    if (!decodedToken || decodedToken.role !== USER_TYPE.ADMIN) {
      throw new ForbiddenException('Access restricted to admin users');
    }

    return true;
  }
}
