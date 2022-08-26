import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Query,
} from '@nestjs/common'
import { TasksService } from '../services/tasks.service'
import { ProjectsService } from '../services/projects.service'
import { UsersService } from '../services/users.service'
import { TelegramBotService } from '../services/telegram.bot.service'
import { Level } from '../decorators'
import { UserRoleEnum } from '../utils.types'

@Controller('/api/tasks')
export class TasksWithoutProjectController {
    constructor(
        private readonly tasksService: TasksService,
        private readonly projectsService: ProjectsService,
        private readonly usersService: UsersService,
        private readonly telegramBotService: TelegramBotService,
    ) {}

    @Level(UserRoleEnum.Admin)
    @Get('')
    @HttpCode(HttpStatus.OK)
    async GetAll(@Query('page') page: number) {
        const tasks = await this.tasksService.GetTasksPage(page)

        const projects: any = {}

        for (const task of tasks) {
            projects[task.projectId] =
                await this.projectsService.GetProjectById(task.projectId)
        }

        return {
            count: await this.tasksService.GetTasksCount(),
            tasks: tasks,
            projects: projects,
        }
    }

    @Level(UserRoleEnum.Admin)
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async GetTaskAndProject(@Param('id') taskId: string) {
        const task = await this.tasksService.GetTaskById(taskId)
        const project = await this.projectsService.GetProjectById(
            task.projectId,
        )

        return {
            task: task,
            project: project,
        }
    }
}
