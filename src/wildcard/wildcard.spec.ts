import { ValidationPipe, INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../app.module";
import * as request from 'supertest';
import { Repository } from "typeorm";
import { Link } from "../links/links.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { LinksService } from "../links/links.service";
import { faker } from '@faker-js/faker';

describe('Wildcard', () => {
    let app: INestApplication;
    let linksRepository: Repository<Link>;
    let linksService: LinksService;

    const createLinkItem = async () => {
        const linkItem = await linksService.createLink({
            name: faker.word.noun(),
            url: faker.internet.url(),
        });
        return linkItem;
    }

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());

        linksRepository = moduleRef.get(getRepositoryToken(Link));
        linksService = moduleRef.get(LinksService);

        await app.init();
    });

    beforeEach(async () => {
        await linksRepository.delete({});
    });

    describe('/:name (GET)', () => {
        it('should handle not found', async () => {
            const urlshortname = faker.word.noun();
            const res = await request(app.getHttpServer()).get(`/${urlshortname}`);

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Not Found');
        });

        it('should handle redirect', async () => {
            const link = await createLinkItem();
            const res = await request(app.getHttpServer()).get(`/${link.name}`);

            expect(res.status).toBe(301);
            expect(res.headers.location).toBe(link.url);
        });
    });
})