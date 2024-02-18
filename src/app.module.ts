import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinksModule } from './links/links.module';
import { WildcardModule } from './wildcard/wildcard.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'postgres',
      password: 'databasepg',
      database: 'postgres',
      autoLoadEntities: true,
      synchronize: true,
    }),
    LinksModule,
    WildcardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}