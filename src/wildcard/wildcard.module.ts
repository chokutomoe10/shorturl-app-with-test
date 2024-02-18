import { Module } from '@nestjs/common';
import { WildcardController } from './wildcard.controller';
import { LinksModule } from '../links/links.module';

@Module({
  imports: [LinksModule],
  controllers: [WildcardController],
})
export class WildcardModule {}
