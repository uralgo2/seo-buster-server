import { Injectable } from '@nestjs/common'
import { City, ICity } from '../schemas/city.schema'

@Injectable()
export class CitiesService {
    async GetCities(): Promise<ICity[]> {
        return await City.find().exec()
    }
}
