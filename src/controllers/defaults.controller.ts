import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Put,
} from '@nestjs/common'
import { IDefaults } from '../schemas/defaults.schema'
import { Level } from '../decorators'
import { UserRoleEnum } from '../utils.types'
import { DefaultsService } from '../services/defaults.service'

@Controller('/api/defaults')
export class DefaultsController {
    constructor(private readonly defaultsService: DefaultsService) {}

    @Level(UserRoleEnum.Admin)
    @Put('')
    @HttpCode(HttpStatus.OK)
    async Save(@Body('defaults') defaults: IDefaults) {
        return await this.defaultsService.Save(defaults)
    }

    @Level(UserRoleEnum.Admin)
    @Get('')
    @HttpCode(HttpStatus.OK)
    async Get() {
        return await this.defaultsService.Get()
    }
}
