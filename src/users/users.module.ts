import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { SanctionEntity } from './entities/sanction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, SanctionEntity])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
