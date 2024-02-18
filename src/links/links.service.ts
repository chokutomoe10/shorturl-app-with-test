import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Link } from './links.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { LinkDto } from './dto/link.dto';
import { GetLinkDto } from './dto/get-link.dto';

@Injectable()
export class LinksService {
    constructor(
        @InjectRepository(Link) private readonly linksRepository: Repository<Link>,
    ) {}

    async getAllLinks(): Promise<Array<Link>> {
        return this.linksRepository.find({})
    }

    async createLink(createLinkDto: LinkDto): Promise<Link> {
        const link = this.linksRepository.create(createLinkDto)
        try {
            await this.linksRepository.save(link);
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException('url short name already exists');
            } else {
                throw new InternalServerErrorException();
            }
        }

        return link;
    }

    async getLink(condition: FindOneOptions<Link>): Promise<Link> {
        const link = await this.linksRepository.findOne(condition);

        if (!link) {
            throw new NotFoundException();
        }

        return link;
    }

    async deleteLink(getLinkDto: GetLinkDto): Promise<void> {
        const {id} = getLinkDto
        const res = await this.linksRepository.delete({ id });

        if (res.affected === 0) {
            throw new NotFoundException(`Link with id: "${id}" is not found`)
        }
    }

    async updateLink(getLinkDto: GetLinkDto, updateLinkDto: LinkDto): Promise<Link> {
        const {id} = getLinkDto;
        const {name, url} = updateLinkDto;
        const condition: FindOneOptions<Link> = {
            where: {
                id: id
            }
        }
        const link = await this.getLink(condition);

        link.name = name
        link.url = url

        await this.linksRepository.save(link);

        return link;
    }
}
