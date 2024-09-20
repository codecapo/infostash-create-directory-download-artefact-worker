import { Module } from '@nestjs/common';
import { DigitalOceanSpacesService } from './digital-ocean-spaces.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [DigitalOceanSpacesService],
  exports: [DigitalOceanSpacesService],
})
export class DigitalOceanSpacesModule {}
