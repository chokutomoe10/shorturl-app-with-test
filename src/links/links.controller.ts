import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { LinksService } from './links.service';
import { Link } from './links.entity';
import { LinkDto } from './dto/link.dto';
import { GetLinkDto } from './dto/get-link.dto';

@Controller('links')
export class LinksController {
    constructor(private readonly linksService: LinksService) {}

    @Get()
    async getAllLinks(): Promise<Array<Link>> {
        return this.linksService.getAllLinks()
    }

    @Post()
    async createLink(@Body() createLinkDto: LinkDto): Promise<Link> {
        return this.linksService.createLink(createLinkDto);
    }

    @Delete('/:id')
    async deleteLink(@Param() getLinkDto: GetLinkDto): Promise<void> {
        return this.linksService.deleteLink(getLinkDto);
    }

    @Put('/:id')
    async updateLink(@Param() getLinkDto: GetLinkDto, @Body() updateLinkDto: LinkDto): Promise<Link> {
        return this.linksService.updateLink(getLinkDto, updateLinkDto);
    }
}
