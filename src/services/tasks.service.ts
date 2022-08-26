import { Injectable } from '@nestjs/common'
import { ITask, Task } from '../schemas/task.schema'

@Injectable()
export class TasksService {
    async InsertTask(data: ITask): Promise<ITask> {
        const task = await new Task(data)

        await task.save()

        return await this.GetTaskById(task._id)
    }

    async GetTaskById(taskId: string): Promise<ITask> {
        return await Task.findOne().where({ _id: taskId }).exec()
    }

    async GetLastTaskByProjectId(projectId: string): Promise<ITask> {
        return await Task.findOne()
            .where({ projectId: projectId })
            .sort({ createdAt: -1 })
            .exec()
    }

    async GetTasksByProjectId(projectId: string): Promise<ITask[]> {
        return await Task.find()
            .where({ projectId: projectId })
            .sort({ createdAt: -1 })
            .exec()
    }

    async PatchTask(taskId: string, data: any): Promise<ITask> {
        await Task.updateOne(
            {
                _id: taskId,
            },
            data,
        ).exec()

        return this.GetTaskById(taskId)
    }

    async DeleteTask(taskId: string) {
        await Task.deleteOne({
            _id: taskId,
        }).exec()
    }

    async DeleteTasksWhereProjectIdIs(projectId: string) {
        await Task.deleteMany({
            projectId: projectId,
        }).exec()
    }

    async GetTasksPage(page = 0): Promise<ITask[]> {
        return await Task.find()
            .sort({
                createdAt: -1,
            })
            .skip(page * 10)
            .limit(10)
            .exec()
    }

    async GetTasksCount(): Promise<number> {
        return await Task.find().count().exec()
    }
}
