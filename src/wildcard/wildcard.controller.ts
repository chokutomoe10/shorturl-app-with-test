import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { Link } from '../links/links.entity';
import { LinksService } from '../links/links.service';
import { FindOneOptions } from 'typeorm';

@Controller()
export class WildcardController {
    constructor(private readonly linksService: LinksService) {}

    @Get('/:name')
    async handleRedirect(@Param('name') name: string, @Res() res: Response) {
        const nameCondition: FindOneOptions<Link> = {
            where: {
                name: name
            }
        };
        let link = await this.linksService.getLink(nameCondition);

        if (!link) {
            const idCondition: FindOneOptions<Link> = {
                where: {
                    id: name
                }
            };
            link = await this.linksService.getLink(idCondition);
        }
        // console.log("Ini url redirect", link.url);
        // if (link) {
        //     return res.redirect(301, link.url)
        // }
        return res.redirect(301, link.url);
    }
}
