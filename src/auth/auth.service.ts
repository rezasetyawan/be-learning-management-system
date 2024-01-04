import {
  BadRequestException,
  Injectable,
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
      throw new UnauthorizedException('Invalid Credentials');
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
      await this.usersService.create(signUpDto);
      const user = await this.usersService.findOne(signUpDto.username);
      const payload = { sub: user.id, username: user.username };

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
}
