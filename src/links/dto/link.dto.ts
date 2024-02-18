import { IsNotEmpty, IsString, IsUrl } from "class-validator";

export class LinkDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsUrl()
    url: string;
}