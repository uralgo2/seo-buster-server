import { Injectable } from '@nestjs/common'
import { IProject, Project } from '../schemas/project.schema'

@Injectable()
export class ProjectsService {
    async GetProjects(): Promise<IProject[]> {
        return await Project.find()
            .sort({
                lastTaskCreationDate: -1,
            })
            .populate('lastTask')
            .populate('user')
            .exec()
    }

    async GetProjectById(projectId: string): Promise<IProject> {
        return await Project.findOne()
            .where({ _id: projectId })
            .populate('lastTask')
            .populate('user')
            .exec()
    }

    async GetUsersProjects(userId: string): Promise<IProject[]> {
        return await Project.find()
            .where({ user: userId })
            .sort({
                lastTaskCreationDate: -1,
            })
            .populate('lastTask')
            .populate('user')
            .exec()
    }

    async GetProjectsPage(page = 0): Promise<IProject[]> {
        return await Project.find()
            .sort({
                lastTaskCreationDate: -1,
            })
            .skip(page * 10)
            .limit(10)
            .populate('lastTask')
            .populate('user')
            .exec()
    }

    async GetProjectsCount(): Promise<number> {
        return await Project.find().count().exec()
    }

    async InsertProject(data: IProject): Promise<IProject> {
        const project = new Project(data)

        await project.save()

        return await this.GetProjectById(project._id)
    }

    async PatchProject(projectId: string, updateTo: any): Promise<IProject> {
        await Project.updateOne(
            {
                _id: projectId,
            },
            updateTo,
        ).exec()

        return Project.findOne()
            .where({ _id: projectId })
            .populate('lastTask')
            .populate('user')
            .exec()
    }

    async DeleteProject(projectId: string) {
        await Project.deleteOne({
            _id: projectId,
        })
    }
}
