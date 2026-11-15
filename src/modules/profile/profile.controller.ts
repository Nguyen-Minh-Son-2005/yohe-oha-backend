import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../../entities/user.entity';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Post()
  createOrUpdate(@GetUser() user: User, @Body() dto: CreateProfileDto) {
    return this.profileService.createOrUpdateProfile(user.id, dto);
  }

  @Get()
  getProfile(@GetUser() user: User) {
    return this.profileService.getProfile(user.id);
  }
}
