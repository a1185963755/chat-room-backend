import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { RedisModule } from './redis/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './common/guard/auth/auth.guard';
import { FriendshipModule } from './friendship/friendship.module';
import { ChatroomModule } from './chatroom/chatroom.module';
import { HttpInterceptor } from './common/interceptor/http.interceptor';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    RedisModule,
    JwtModule.registerAsync({
      global: true,
      useFactory() {
        return {
          secret: 'oliver',
          signOptions: {
            expiresIn: '1d',
          },
        };
      },
    }),
    FriendshipModule,
    ChatroomModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: HttpInterceptor,
    },
  ],
})
export class AppModule {}
