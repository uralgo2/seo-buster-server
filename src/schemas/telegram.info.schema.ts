import { Nullable } from '../utils.types'
import mongoose, { Model, Schema, Types } from 'mongoose'

export interface ITelegramInfo {
    _id?: string

    login: string

    chatId: number
}

export const TelegramInfoSchema = new Schema<ITelegramInfo>({
    login: {
        type: String,
        required: true,
    },
    chatId: {
        type: Number,
        required: true,
    },
})

export const TelegramInfo = mongoose.model('TelegramInfo', TelegramInfoSchema)
