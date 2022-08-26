import { FactorEnum, TariffEnum } from '../utils.types'
import mongoose, { Model, Schema } from 'mongoose'
import { ITask, TaskSchema } from './task.schema'
import { IUser } from './user.schema'

export interface IProject {
    _id?: string

    site: string
    pages?: number
    queries?: number
    clicksPerDay?: number
    expensePerDay?: number
    tariff?: TariffEnum
    expensePerMonth?: number
    factor: FactorEnum

    createdAt?: Date
    endingAt?: Date

    city: string

    user?: IUser | string

    lastTask?: ITask | string

    lastTaskCreationDate?: Date

    notificatedAboutExpires?: boolean
    notificatedAboutExpired?: boolean
}

export const ProjectSchema = new Schema<IProject>({
    site: {
        type: String,
        required: true,
    },
    pages: {
        type: Number,
        default: 0,
    },
    queries: {
        type: Number,
        default: 0,
    },
    clicksPerDay: {
        type: Number,
        default: 0,
    },
    expensePerDay: {
        type: Number,
        default: 0,
    },
    tariff: {
        type: Number,
        enum: TariffEnum,
        default: TariffEnum.None,
    },
    expensePerMonth: {
        type: Number,
        default: 0,
    },
    factor: {
        type: Number,
        enum: FactorEnum,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    endingAt: {
        type: Date,
        default: () => {
            const today = new Date()

            return today.setDate(today.getDate() + 30)
        },
    },
    city: {
        type: String,
        required: true,
    },
    user: {
        type: String,
        required: true,
        ref: 'User',
    },
    lastTask: {
        type: String,
        required: false,
        default: null,
        ref: 'Task',
    },
    lastTaskCreationDate: {
        type: Date,
        required: false,
        default: null,
    },
    notificatedAboutExpired: {
        type: Boolean,
        default: false,
    },
    notificatedAboutExpires: {
        type: Boolean,
        default: false,
    },
})

export const Project = mongoose.model('Project', ProjectSchema)
