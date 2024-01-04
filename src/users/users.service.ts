import { BadRequestException, Inject, Injectable } from '@nestjs/common';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { PG_CONNECTION } from '../constants';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

export type User = {
  userId: number;
  username: string;
  password: string;
};

@Injectable()
export class UsersService {
  constructor(
    @Inject(PG_CONNECTION) private db: NodePgDatabase<typeof schema>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = {
        id: `user-${nanoid(20)}`,
        ...createUserDto,
        password: hashedPassword as unknown as string,
      };

      await this.db.insert(schema.users).values(user);
    } catch (error) {
      throw new BadRequestException(error.message, {
        cause: new Error(),
        description: error.message + 'password: ' + createUserDto.password,
      });
    }
  }

  async findAll() {
    return 'This action returns a users';
  }

  async findOne(username: string) {
    const user = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, username),
    });
    return user;
  }

  async findOneWithEmail(email: string) {
    const user = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });
    return user;
  }

  async getRole(username: string) {
    const user = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, username),
      columns: {
        role: true,
      },
    });
    return user;
  }

  update(id: number) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
