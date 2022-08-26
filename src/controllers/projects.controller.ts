import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Put,
    Query,
    Session,
    UseFilters,
} from '@nestjs/common'
import { Level } from '../decorators'
import {
    FactorEnum,
    ISession,
    StatusEnum,
    TaskEnum,
    UserRoleEnum,
} from '../utils.types'
import { ApiException, HttpExceptionFilter } from '../exceptions'
import { IProject } from '../schemas/project.schema'
import { ProjectsService } from '../services/projects.service'
import { TasksService } from '../services/tasks.service'
import { TelegramBotService } from '../services/telegram.bot.service'
import { UsersService } from '../services/users.service'

@UseFilters(HttpExceptionFilter)
@Controller('/api/projects')
export class ProjectsController {
    constructor(
        private readonly projectsService: ProjectsService,
        private readonly tasksService: TasksService,
        private readonly telegramBotService: TelegramBotService,
        private readonly usersService: UsersService,
    ) {}

    @Level(UserRoleEnum.Authenticated)
    @Post('')
    @HttpCode(HttpStatus.OK)
    async Create(
        @Body('fileToAdd') fileToAdd: string,
        @Body('filePath') filePath: string,
        @Body('project') project: IProject,
        @Session() session: ISession,
    ) {
        project.user = session.userId

        const inserted = await this.projectsService.InsertProject(project)

        const task = await this.tasksService.InsertTask({
            projectId: inserted._id,
            status: StatusEnum.Execute,
            type: TaskEnum.AddSite,

            filePath: filePath,
            fileName: fileToAdd,
        })

        await this.telegramBotService.NotifyAdmin('Поступила новая задача')

        return await this.projectsService.PatchProject(inserted._id, {
            lastTaskCreationDate: task.createdAt,
            lastTask: task._id,
        })
    }

    @Level(UserRoleEnum.Authenticated)
    @Patch('/:id/factor')
    @HttpCode(HttpStatus.OK)
    async PatchFactor(
        @Body('factor') factor: FactorEnum,
        @Param('id') projectId: string,
        @Session() session: ISession,
    ) {
        const project = await this.projectsService.GetProjectById(projectId)

        if (!project)
            throw new ApiException(
                'Проекта не существует.',
                HttpStatus.NOT_FOUND,
            )

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (project.user._id.toString() !== session.userId)
            throw new ApiException('Доступ запрешен.', HttpStatus.FORBIDDEN)

        const task = await this.tasksService.InsertTask({
            projectId: projectId,
            status: StatusEnum.Execute,
            type: TaskEnum.ChangeFactor,
            factorToChange: factor,
        })

        await this.telegramBotService.NotifyAdmin('Поступила новая задача')

        return await this.projectsService.PatchProject(projectId, {
            factor: factor,
            lastTask: task._id,
            lastTaskCreationDate: task.createdAt,
        })
    }

    @Level(UserRoleEnum.Admin)
    @Get('')
    @HttpCode(HttpStatus.OK)
    async GetAll(@Query('page') page) {
        if (page !== undefined)
            return {
                count: await this.projectsService.GetProjectsCount(),
                data: await this.projectsService.GetProjectsPage(page),
            }
        else return await this.projectsService.GetProjects()
    }

    @Level(UserRoleEnum.Admin)
    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async Put(
        @Param('id') projectId: string,
        @Body('project') project: IProject,
    ) {
        const old = await this.projectsService.GetProjectById(projectId)

        project.endingAt = new Date(project.endingAt)

        if (
            old.endingAt.toISOString().split('T')[0] !==
            project.endingAt.toISOString().split('T')[0]
        ) {
            project.notificatedAboutExpired = project.notificatedAboutExpires =
                false
        }

        return await this.projectsService.PatchProject(projectId, project)
    }

    @Level(UserRoleEnum.Authenticated)
    @Get('my')
    @HttpCode(HttpStatus.OK)
    async GetMy(@Session() session: ISession) {
        return await this.projectsService.GetUsersProjects(session.userId)
    }

    @Level(UserRoleEnum.Authenticated)
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async Get(@Param('id') projectId: string, @Session() session: ISession) {
        const project = await this.projectsService.GetProjectById(projectId)

        if (session.role !== UserRoleEnum.Admin) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (project.user._id.toString() !== session.userId)
                throw new ApiException('Доступ запрещен.', HttpStatus.FORBIDDEN)
        }

        return project
    }

    @Level(UserRoleEnum.Authenticated)
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async Delete(@Param('id') projectId: string, @Session() session: ISession) {
        const project = await this.projectsService.GetProjectById(projectId)

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (project.user._id.toString() !== session.userId)
            throw new ApiException('Доступ запрешен.', HttpStatus.FORBIDDEN)

        const user = await this.usersService.GetUserById(session.userId)

        await this.projectsService.DeleteProject(projectId)

        await this.tasksService.DeleteTasksWhereProjectIdIs(projectId)

        await this.telegramBotService.NotifyAdmin(
            `Пользователь ${user.login} удалил сайт ${project.site} #id${project._id}`,
        )

        return {}
    }
}
