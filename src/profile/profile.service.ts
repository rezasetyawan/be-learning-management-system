import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PG_CONNECTION } from 'src/constants';
import * as schema from '../drizzle/schema';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(PG_CONNECTION) private db: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
  ) {}
  async find(token: string) {
    const isTokenValid = await this.jwtService.verifyAsync(token);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const data = this.jwtService.decode(token);
    const user = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, data.username),
    });
    return user;
  }
}
