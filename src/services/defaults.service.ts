import { Injectable } from '@nestjs/common'
import { Defaults, IDefaults } from '../schemas/defaults.schema'

@Injectable()
export class DefaultsService {
    async Save(defaults: IDefaults): Promise<IDefaults> {
        await Defaults.updateOne({}, defaults).exec()

        return this.Get()
    }

    async Get(): Promise<IDefaults> {
        return await Defaults.findOne().exec()
    }
}
