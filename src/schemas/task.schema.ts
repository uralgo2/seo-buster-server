import { FactorEnum, Nullable, StatusEnum, TaskEnum } from '../utils.types'
import mongoose, { Model, Schema, Types } from 'mongoose'

export interface ITask {
    _id?: string

    projectId: string

    type: TaskEnum

    factorToChange?: FactorEnum
    fileName?: string
    filePath?: string

    status: StatusEnum

    message?: string

    createdAt?: Date
}

export const TaskSchema = new Schema<ITask>({
    projectId: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: TaskEnum,
        required: true,
    },
    factorToChange: {
        type: Number,
        enum: FactorEnum,
        required: false,
    },
    fileName: {
        type: String,
        required: false,
    },
    filePath: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: StatusEnum,
        default: StatusEnum.Execute,
    },
    message: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

export const Task = mongoose.model('Task', TaskSchema)
