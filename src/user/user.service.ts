import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma';
import { RedisService } from 'src/redis/redis.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  @Inject(PrismaService)
  private readonly prismaService: PrismaService;
  @Inject(RedisService)
  private readonly redisService: RedisService;

  REGISTER_REDIS_KEY = 'register_captcha_';
  SALT_ROUNDS = 10;

  async create(data: CreateUserDto) {
    console.log('🚀 ~ UserService ~ create ~ data:', data);
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

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
