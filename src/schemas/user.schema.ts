import { Nullable, UserRoleEnum } from '../utils.types'
import mongoose, { Model, Schema, Types } from 'mongoose'

export interface IUser {
    _id?: string

    login: string
    password: string
    telegram?: string

    balance: number

    role?: number

    telegramChatId?: number
}

export const UserSchema = new Schema<IUser>({
    login: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    telegram: {
        type: String,
        required: false,
    },
    balance: {
        type: Number,
        default: 0,
    },
    role: {
        type: Number,
        enum: UserRoleEnum,
        default: UserRoleEnum.Authenticated,
        min: UserRoleEnum.Authenticated,
    },
    telegramChatId: {
        type: Number,
        default: null,
    },
})

export const User: Model<IUser> = mongoose.model('User', UserSchema)
