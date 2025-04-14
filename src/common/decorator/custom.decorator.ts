import { createParamDecorator, SetMetadata } from '@nestjs/common';

export const RequireLogin = () => SetMetadata('require-login', true);

export const UserInfo = createParamDecorator((data, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  if (!request.user) {
    return null;
  }
  return data ? request.user[data] : request.user;
});
