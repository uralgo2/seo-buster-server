import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Logger,
    Param,
    Post,
    Put,
    Session,
} from '@nestjs/common'
import { Level } from '../decorators'
import { ISession, StatusEnum, TaskEnum, UserRoleEnum } from '../utils.types'
import { TasksService } from '../services/tasks.service'
import { ProjectsService } from '../services/projects.service'
import { ApiException } from '../exceptions'
import { ITask } from '../schemas/task.schema'
import { UsersService } from '../services/users.service'
import { TelegramBotService } from '../services/telegram.bot.service'

@Controller('/api/projects/:projectId/tasks')
export class TasksController {
    constructor(
        private readonly tasksService: TasksService,
        private readonly projectsService: ProjectsService,
        private readonly usersService: UsersService,
        private readonly telegramBotService: TelegramBotService,
    ) {}

    @Level(UserRoleEnum.Authenticated)
    @Get('last')
    @HttpCode(HttpStatus.OK)
    async GetLast(
        @Session() session: ISession,
        @Param('projectId') projectId: string,
    ) {
        const project = await this.projectsService.GetProjectById(projectId)

        if (session.role !== UserRoleEnum.Admin) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (project.user._id.toString() !== session.userId)
                throw new ApiException('Доступ запрещен.', HttpStatus.FORBIDDEN)
        }
        return await this.tasksService.GetLastTaskByProjectId(projectId)
    }

    @Level(UserRoleEnum.Authenticated)
    @Get(':taskId')
    @HttpCode(HttpStatus.OK)
    async Get(
        @Session() session: ISession,
        @Param('projectId') projectId: string,
        @Param('taskId') taskId: string,
    ) {
        const project = await this.projectsService.GetProjectById(projectId)
        const task = await this.tasksService.GetTaskById(taskId)

        if (session.role !== UserRoleEnum.Admin) {
            if (
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                project.user._id.toString() !== session.userId &&
                task?.projectId != projectId
            )
                throw new ApiException('Доступ запрещен.', HttpStatus.FORBIDDEN)
        }
        return task
    }

    @Level(UserRoleEnum.Authenticated)
    @Post('')
    @HttpCode(HttpStatus.OK)
    async Create(
        @Session() session: ISession,
        @Param('projectId') projectId: string,
        @Body('task') task: ITask,
    ) {
        const project = await this.projectsService.GetProjectById(projectId)

        if (session.role !== UserRoleEnum.Admin) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (project.user._id.toString() !== session.userId)
                throw new ApiException('Доступ запрещен.', HttpStatus.FORBIDDEN)
        }

        task.projectId = projectId
        task.status = StatusEnum.Execute

        const inserted = await this.tasksService.InsertTask(task)

        await this.projectsService.PatchProject(projectId, {
            lastTask: inserted._id,
        })

        await this.telegramBotService.NotifyAdmin('Поступила новая задача')

        return inserted
    }

    @Level(UserRoleEnum.Admin)
    @Put(':taskId')
    @HttpCode(HttpStatus.OK)
    async Update(
        @Session() session: ISession,
        @Param('taskId') taskId: string,
        @Body('task') task: ITask,
        @Param('projectId') projectId: string,
    ) {
        const old = await this.tasksService.GetTaskById(taskId)

        if (old.projectId !== projectId)
            throw new ApiException(
                'Индентификаторы проекта не совпадают.',
                HttpStatus.BAD_REQUEST,
            )

        if (
            old.status === StatusEnum.Execute &&
            task.status === StatusEnum.Done &&
            old.type === TaskEnum.AddSite
        ) {
            const project = await this.projectsService.GetProjectById(projectId)

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await this.usersService.PatchUser(project.user._id, {
                $inc: {
                    balance: -project.expensePerDay,
                },
            })
        }

        return await this.tasksService.PatchTask(taskId, task)
    }

    @Level(UserRoleEnum.Authenticated)
    @Get('')
    @HttpCode(HttpStatus.OK)
    async GetAll(
        @Session() session: ISession,
        @Param('projectId') projectId: string,
    ) {
        const project = await this.projectsService.GetProjectById(projectId)

        if (session.role !== UserRoleEnum.Admin) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (project.user._id.toString() !== session.userId)
                throw new ApiException('Доступ запрещен.', HttpStatus.FORBIDDEN)
        }
        return await this.tasksService.GetTasksByProjectId(projectId)
    }
}
