import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'
import { CitiesService } from '../services/cities.service'
import { Level } from '../decorators'
import { UserRoleEnum } from '../utils.types'

@Controller('/api/cities')
export class CitiesController {
    constructor(private readonly citiesService: CitiesService) {}

    @Level(UserRoleEnum.Authenticated)
    @Get('')
    @HttpCode(HttpStatus.OK)
    async GetAll() {
        return await this.citiesService.GetCities()
    }
}
