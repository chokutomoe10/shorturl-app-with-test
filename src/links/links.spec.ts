import { ValidationPipe, INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../app.module";
import * as request from 'supertest';
import { FindOneOptions, Repository } from "typeorm";
import { Link } from "./links.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { LinksService } from "./links.service";
import { faker } from '@faker-js/faker';

describe('Links', () => {
    let app: INestApplication;
    let linksRepository: Repository<Link>;
    let linksService: LinksService;
    const createLinkBody = () => {
        return {
            name: faker.word.noun(),
            url: faker.internet.url(),
        }
    }

    const createLinkItem = async () => {
        const linkBody = createLinkBody();
        const linkItem = await linksService.createLink(linkBody);
        // const linkItem = await linksService.createLink({ name: faker.word.noun(), url: faker.internet.url()});
        return linkItem;
    }

    const createInvalidLinkBodies = () => {
        const validLink = createLinkBody();

        return [
            undefined,
            {},

            {name: undefined, url: validLink.url},
            {name: null, url: validLink.url},
            {name: faker.datatype.boolean(), url: validLink.url},
            {name: faker.number.int(), url: validLink.url},
            {name: '', url: validLink.url},

            {name: validLink.name, url: undefined},
            {name: validLink.name, url: null},
            {name: validLink.name, url: faker.datatype.boolean()},
            {name: validLink.name, url: faker.number.int()},
            {name: validLink.name, url: ''}
        ]
    };

    const createInvalidIds = () => {
        return [faker.number.int(), faker.word.noun()];
    };

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());

        linksRepository = moduleRef.get(getRepositoryToken(Link));
        linksService = moduleRef.get(LinksService);

        await app.init();
    })

    beforeEach(async () => {
        await linksRepository.delete({});
    })

    describe('/links (GET)', () => {
        it('should handle without data', async () => {
            const res = await request(app.getHttpServer()).get('/links');

            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('should handle with data', async () => {
            const promises: Array<Promise<Link>> = [];
            const linksCount = 3;

            for (let i=0; i<linksCount; i++) {
                promises.push(createLinkItem());
            }

            const links = await Promise.all(promises);
            const res = await request(app.getHttpServer()).get('/links');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(expect.arrayContaining(links));
            // expect(res.body).toHaveLength(linksCount);
        });
    });

    describe('/links (POST)', () => {
        it('should NOT accept invalid data', async () => {
            const promises: Array<Promise<void>> = [];
            const invalidData = createInvalidLinkBodies();

            invalidData.forEach((payload) => {
                promises.push((async () => {
                    const res = await request(app.getHttpServer()).post('/links').send(payload);

                    expect(res.status).toBe(400);
                    expect(res.body.error).toBe('Bad Request');
                    expect(res.body.message).toEqual(expect.arrayContaining([expect.any(String)]));
                })());
            })

            await Promise.all(promises);
        });

        it('should accept valid data', async () => {
            const linkBody = createLinkBody();
            const res = await request(app.getHttpServer()).post('/links').send(linkBody);

            expect(res.status).toBe(201);
            expect(res.body).toEqual({
                ...linkBody,
                id: expect.any(String),
            });
        })

        it('should handle already exists', async () => {
            const existingLink = await createLinkItem()
            const linkBody = createLinkBody()

            const res = await request(app.getHttpServer()).post('/links').send({
                name: existingLink.name,
                url: linkBody.url,
            })

            expect(res.status).toBe(409);
            expect(res.body.error).toEqual('Conflict');
            expect(res.body.message).toEqual('url short name already exists');
        });

        it('should handle unexpected error', async () => {
            const linksRepositorySaveMock = jest.spyOn(linksRepository, 'save').mockRejectedValue({});
            const link = createLinkBody();

            const res = await request(app.getHttpServer()).post('/links').send(link);

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Internal Server Error');
            
            linksRepositorySaveMock.mockRestore();
        });
    });

    describe('/links/:id (DELETE)', () => {
        it('should NOT accept invalid id', async () => {
            const invalidId = createInvalidIds();
            const promises: Array<Promise<void>> = [];

            invalidId.forEach((linkId) => {
                promises.push((async () => {
                    const res = await request(app.getHttpServer()).delete(`/links/${linkId}`)

                    expect(res.status).toBe(400);
                    expect(res.body.error).toBe('Bad Request');
                    expect(res.body.message).toEqual(expect.arrayContaining([expect.any(String)]));
                })());
            })

            await Promise.all(promises);
        });

        it('should handle not found', async () => {
            const linkId = faker.string.uuid();
            const res = await request(app.getHttpServer()).delete(`/links/${linkId}`);

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Not Found');
            expect(res.body.message).toBe(`Link with id: "${linkId}" is not found`);
        });

        it('should handle delete', async () => {
            const link = await createLinkItem();
            const linkId = link.id;

            const res = await request(app.getHttpServer()).delete(`/links/${linkId}`);

            expect(res.status).toBe(200);
        });
    });

    describe('/links/:id (PUT)', () => {
        it('should NOT accept invalid id', async () => {
            const invalidId = createInvalidIds();
            const promises: Array<Promise<void>> = [];

            invalidId.forEach((linkId) => {
                promises.push((async () => {
                    const res = await request(app.getHttpServer()).put(`/links/${linkId}`)

                    expect(res.status).toBe(400);
                    expect(res.body.error).toBe('Bad Request');
                    expect(res.body.message).toEqual(expect.arrayContaining([expect.any(String)]));
                })());
            })

            await Promise.all(promises);
        });

        it('should NOT accept invalid data', async () => {
            const linkId = faker.string.uuid();
            const promises: Array<Promise<void>> = [];
            const invalidData = createInvalidLinkBodies();

            invalidData.forEach((payload) => {
                promises.push((async () => {
                    const res = await request(app.getHttpServer()).put(`/links/${linkId}`).send(payload);

                    expect(res.status).toBe(400);
                    expect(res.body.error).toBe('Bad Request');
                    expect(res.body.message).toEqual(expect.arrayContaining([expect.any(String)]));
                })());
            })

            await Promise.all(promises);
        });

        it('should handle not found', async () => {
            const linkId = faker.string.uuid();
            const linkBody = createLinkBody();
            const res = await request(app.getHttpServer()).put(`/links/${linkId}`).send(linkBody);

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Not Found');
        });

        it('should handle update', async () => {
            const link = await createLinkItem();
            const linkId = link.id;
            const linkBody = createLinkBody();

            const res = await request(app.getHttpServer()).put(`/links/${linkId}`).send(linkBody);

            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                ...linkBody,
                id: linkId,
            })

            const idCondition: FindOneOptions<Link> = {
                where: {id:linkId}
            }
            const updatedlink = await linksRepository.findOne(idCondition);

            expect(updatedlink).toEqual(res.body);
        });
    });
})