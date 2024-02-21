import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/sign-up-dto';
import { SignInDto } from './dto/sign-in-dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto) {
    const user = await this.usersService.findOneWithEmail(signInDto.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordCorrect = await bcrypt.compare(
      signInDto.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const payload = { sub: user.id, username: user.username };
    // const refresh_token = await this.jwtService.signAsync(payload, {
    //   secret: 'inisangatsecretbangetcoeg',
    // });

    return {
      status: 'success',
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(signUpDto: SignUpDto) {
    try {
      const user = await this.usersService.findOne(signUpDto.username);
      const userByEmail = await this.usersService.findOneWithEmail(
        signUpDto.email,
      );

      if (user && user.id) {
        throw new BadRequestException(
          'Gagal untuk meregister, username sudah digunakan',
        );
      }

      if (userByEmail && userByEmail.id) {
        throw new BadRequestException(
          'Gagal untuk meregister, email sudah digunakan',
        );
      }

      const newUser = await this.usersService.create(signUpDto);

      const payload = { sub: newUser.id, username: newUser.username };

      const access_token = await this.jwtService.signAsync(payload);

      return {
        status: 'success',
        access_token,
        // refresh_token,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async verifyAccessToken(token: string) {
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }
    const isTokenValid = await this.jwtService.verifyAsync(token);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const data = this.jwtService.decode(token);
    return {
      data: {
        is_token_valid: true,
        username: data.username,
      },
      status: 'success',
      message: 'Access Token valid',
    };
  }
}
