import { Injectable } from '@nestjs/common'
import { IUser, User } from '../schemas/user.schema'
import { Nullable, UserRoleEnum } from '../utils.types'

@Injectable()
export class UsersService {
    async GetUsers(): Promise<IUser[]> {
        return await User.find().exec()
    }

    async GetUsersByRole(role: UserRoleEnum): Promise<IUser[]> {
        return await User.find()
            .where({
                role: role,
            })
            .exec()
    }

    async GetUserById(id: string): Promise<Nullable<IUser>> {
        return await User.findOne()
            .where({
                _id: id,
            })
            .exec()
    }

    async GetUserByTelegram(tg: string): Promise<Nullable<IUser>> {
        return await User.findOne()
            .where({
                telegram: tg,
            })
            .exec()
    }

    async GetUserByLogin(login: string): Promise<Nullable<IUser>> {
        return (
            (await User.findOne()
                .where({
                    login: login,
                })
                .exec()) ?? null
        )
    }

    async UpdateUser(id: string, updateTo: IUser): Promise<IUser> {
        await User.updateOne(
            {
                _id: id,
            },
            updateTo,
        ).exec()

        return User.findOne().where({ _id: id }).exec()
    }

    async PatchUser(id: string, updateTo: any): Promise<IUser> {
        await User.updateOne(
            {
                _id: id,
            },
            updateTo,
        ).exec()

        return User.findOne().where({ _id: id }).exec()
    }

    async InsertUser(data: Partial<IUser>): Promise<IUser> {
        const user = await new User(data)

        await user.save()

        return await this.GetUserByLogin(data.login)
    }

    async DeleteUser(id: string) {
        await User.deleteOne({
            _id: id,
        }).exec()
    }
}
