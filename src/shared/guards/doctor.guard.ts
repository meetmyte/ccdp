import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_TYPE } from 'src/helpers/enums';

@Injectable()
export class DoctorGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== USER_TYPE.DOCTOR) {
      throw new ForbiddenException(
        'Access restricted to doctor and admins users',
      );
    }

    return true;
  }
}
