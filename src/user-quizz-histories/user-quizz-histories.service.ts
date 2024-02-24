import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserQuizzHistoryDto } from './dto/create-user-quizz-history.dto';
import { UpdateUserQuizzHistoryDto } from './dto/update-user-quizz-history.dto';
import { PG_CONNECTION } from '../../src/constants';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { JwtService } from '@nestjs/jwt';
import { nanoid } from 'nanoid';

@Injectable()
export class UserQuizzHistoriesService {
  constructor(
    @Inject(PG_CONNECTION) private db: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
  ) {}
  async create(
    createUserQuizzHistoryDto: CreateUserQuizzHistoryDto,
    accessToken: string,
  ) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const data = this.jwtService.decode(accessToken);

    const payload = {
      id: nanoid(40),
      userId: data.sub as string,
      ...createUserQuizzHistoryDto,
    };
    const quizzHistory = await this.db
      .insert(schema.userQuizzHistories)
      .values(payload)
      .returning({ id: schema.userQuizzHistories.id });
    const answerPayload = createUserQuizzHistoryDto.answers.map((answer) => ({
      id: nanoid(40),
      quizzHistoryId: quizzHistory[0].id,
      ...answer,
    }));

    await this.db.insert(schema.userQuizzAnswerHistories).values(answerPayload);

    console.log(answerPayload);
    return {
      status: 'success',
    };
  }

  async findAll(moduleId: string, accessToken) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = this.jwtService.decode(accessToken);

    const data = await this.db.query.userQuizzHistories.findMany({
      where: (userQuizzHistories, { and, eq }) =>
        and(
          eq(userQuizzHistories.moduleId, moduleId),
          eq(userQuizzHistories.userId, user.sub as string),
        ),
    });

    console.log(data);
    return {
      status: 'sucess',
      data,
    };
  }

  async findOne(id: string, accessToken: string) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = this.jwtService.decode(accessToken);

    const data = await this.db.query.userQuizzHistories.findFirst({
      where: (userQuizzHistories, { and, eq }) =>
        and(
          eq(userQuizzHistories.id, id),
          eq(userQuizzHistories.userId, user.sub as string),
        ),
      with: {
        answers: {
          with: {
            question: {
              columns: {
                id: true,
                text: true,
              },
              with: {
                answers: {
                  where: (answerChoices, { eq }) =>
                    eq(answerChoices.isDeleted, false),
                },
              },
            },
            answer: {
              columns: {
                id: true,
                text: true,
                isCorrect: true,
              },
            },
          },
        },
      },
    });

    console.log(data);
    return {
      status: 'sucess',
      data,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateUserQuizzHistoryDto: UpdateUserQuizzHistoryDto) {
    return `This action updates a #${id} userQuizzHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} userQuizzHistory`;
  }
}
