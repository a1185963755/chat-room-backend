import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  @Inject(PrismaService)
  private readonly prismaService: PrismaService;
  @Inject(RedisService)
  private readonly redisService: RedisService;
  @Inject(JwtService)
  private readonly jwtService: JwtService;

  REGISTER_REDIS_KEY = 'register_captcha_';
  SALT_ROUNDS = 10;

  async create(data: CreateUserDto) {
    const captcha = await this.redisService.get(
      this.REGISTER_REDIS_KEY + data.email,
    );
    if (!captcha) {
      throw new HttpException('请先获取验证码', HttpStatus.BAD_REQUEST);
    }
    if (data.captcha !== captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }
    const foundUser = await this.prismaService.user.findUnique({
      where: {
        username: data.username,
      },
    });
    if (foundUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }
    try {
      const encryptedPassword = await bcrypt.hash(
        data.password,
        this.SALT_ROUNDS,
      );
      const result = await this.prismaService.user.create({
        data: {
          username: data.username,
          password: encryptedPassword,
          email: data.email,
          nickname: data.nickname,
        },
        select: {
          id: true,
          username: true,
          nickname: true,
          email: true,
          headPic: true,
          createdAt: true,
        },
      });
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async login(data: LoginUserDto) {
    const foundUser = await this.prismaService.user.findUnique({
      where: {
        username: data.username,
      },
    });
    if (!foundUser) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    const validPassword = await bcrypt.compare(
      data.password,
      foundUser.password,
    );
    if (!validPassword) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }
    const token = this.jwtService.sign({
      id: foundUser.id,
      username: foundUser.username,
    });
    const { password, ...safeUser } = foundUser;
    return {
      user: safeUser,
      token,
    };
  }

  async findOne(id: number) {
    const foundUser = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        username: true,
        nickname: true,
        email: true,
        headPic: true,
      },
    });
    return foundUser;
  }

  async searchUsers(keyword: string, userId: number) {
    const currentUser = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { username: true, nickname: true },
    });
    // 直接返回查询结果
    return await this.prismaService.user.findMany({
      where: {
        OR: [
          {
            username: {
              contains: keyword,
              ...(currentUser && { not: { contains: currentUser.username } }),
            },
          },
          {
            nickname: {
              contains: keyword,
              ...(currentUser && { not: { contains: currentUser.nickname } }),
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        nickname: true,
      },
    });
  }
}
