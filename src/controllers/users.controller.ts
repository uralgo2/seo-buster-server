import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Logger,
    Param,
    Patch,
    Post,
    Put,
    Query,
    Req,
    Session,
} from '@nestjs/common'
import { UsersService } from '../services/users.service'
import { Level } from '../decorators'
import { IRequest, ISession, UserRoleEnum } from '../utils.types'
import { ApiException } from '../exceptions'
import { TasksService } from '../services/tasks.service'
import { ProjectsService } from '../services/projects.service'
import { TelegramBotService } from '../services/telegram.bot.service'
import { TelegramInfo } from '../schemas/telegram.info.schema'
import { IUser } from '../schemas/user.schema'

@Controller('/api/users')
export class UsersController {
    private readonly logger = new Logger(UsersController.name)

    constructor(
        private readonly dbService: UsersService,
        private readonly tasksService: TasksService,
        private readonly projectsService: ProjectsService,
        private readonly telegramBotService: TelegramBotService,
    ) {}

    @Level(UserRoleEnum.Admin)
    @Get(':id/deduct')
    @HttpCode(HttpStatus.OK)
    async Deduct(@Query('sum') sum: number, @Param('id') id: string) {
        await this.dbService.PatchUser(id, {
            $inc: {
                balance: -sum,
            },
        })

        return {}
    }

    @Level(UserRoleEnum.All)
    @Get(':telegram/restore')
    @HttpCode(HttpStatus.OK)
    async Restore(@Param('telegram') telegram: string) {
        const exist = await this.dbService.GetUserByTelegram(telegram)

        if (!exist)
            throw new ApiException(
                'Пользователя с таким логинов телеграм не существует',
            )

        await this.telegramBotService.NotifyUser(
            exist._id,
            `Ваш пароль: ${exist.password}`,
        )

        return {}
    }

    @Level(UserRoleEnum.Authenticated)
    @Get('logout')
    @HttpCode(HttpStatus.OK)
    async Logout(@Session() session: ISession) {
        session.role = session.userId = undefined

        return {}
    }

    @Level(UserRoleEnum.Authenticated)
    @Patch('me/telegram')
    @HttpCode(HttpStatus.OK)
    async Patch(@Session() session: ISession, @Body('telegram') telegram) {
        if (!telegram) throw new ApiException('Поле телеграмм пустое')

        if (await this.dbService.GetUserByTelegram(telegram))
            throw new ApiException('Этот телеграм логин уже используется')

        return await this.dbService.PatchUser(session.userId, {
            $set: {
                telegram: telegram,
            },
            $unset: {
                telegramChatId: 1,
            },
        })
    }

    @Level(UserRoleEnum.Admin)
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async Delete(@Session() session: ISession, @Param('id') id) {
        await this.dbService.DeleteUser(id)

        const projects = await this.projectsService.GetUsersProjects(id)

        for (const project of projects) {
            await this.tasksService.DeleteTasksWhereProjectIdIs(project._id)

            await this.projectsService.DeleteProject(project._id)
        }

        return {}
    }

    @Level(UserRoleEnum.Admin)
    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async Put(
        @Session() session: ISession,
        @Body('user') user,
        @Param('id') id,
    ) {
        return await this.dbService.UpdateUser(id, user)
    }

    @Level(UserRoleEnum.Authenticated)
    @Get('me')
    @HttpCode(HttpStatus.OK)
    async GetMe(@Session() session: ISession) {
        const user = await this.dbService.GetUserById(session.userId)

        if (!user) {
            session.role = session.userId = undefined

            throw new ApiException('Доступ запрещен.', HttpStatus.FORBIDDEN)
        }

        return user
    }

    @Level(UserRoleEnum.Admin)
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async GetOne(@Session() session: ISession, @Param('id') id) {
        return await this.dbService.GetUserById(id)
    }

    @Level(UserRoleEnum.Admin)
    @Get('')
    @HttpCode(HttpStatus.OK)
    async GetAll() {
        return await this.dbService.GetUsers()
    }

    @Level(UserRoleEnum.All)
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async Login(
        @Req() req: IRequest,
        @Body('login') login: string,
        @Body('password') password: string,
    ) {
        const user = await this.dbService.GetUserByLogin(login)

        if (!user)
            throw new ApiException('Пользователя с таким логином не существует')

        if (user.password !== password)
            throw new ApiException('Неправильный логин или пароль')

        req.session.role = user.role
        req.session.userId = user._id

        return user
    }

    @Level(UserRoleEnum.All)
    @Post('signup')
    @HttpCode(HttpStatus.OK)
    async SignUp(
        @Req() req: IRequest,
        @Body('login') login: string,
        @Body('password') password: string,
        @Body('telegram') telegram: string,
    ) {
        const existingUser = await this.dbService.GetUserByLogin(login)

        if (existingUser)
            throw new ApiException(
                'Пользователь с таким логином уже существует',
            )

        if (telegram && (await this.dbService.GetUserByTelegram(telegram)))
            throw new ApiException('Этот телеграм логин уже используется')

        const credentials: Partial<IUser> = {
            balance: 0,
            login: login,
            password: password,
            telegram: telegram ?? undefined,
        }

        if (telegram) {
            const info = await TelegramInfo.findOne({
                login: telegram,
            }).exec()

            if (!info) throw new ApiException('Телеграм не подтвержден')

            credentials.telegramChatId = info.chatId
        }

        const user = await this.dbService.InsertUser(credentials)

        req.session.role = user.role
        req.session.userId = user._id

        return user
    }

    @Level(UserRoleEnum.Admin)
    @Post('')
    @HttpCode(HttpStatus.OK)
    async Create(
        @Req() req: IRequest,
        @Body('login') login: string,
        @Body('password') password: string,
        @Body('telegram') telegram: string,
    ) {
        const existingUser = await this.dbService.GetUserByLogin(login)

        if (existingUser)
            throw new ApiException(
                'Пользователь с таким логином уже существует',
            )

        return await this.dbService.InsertUser({
            balance: 0,
            login: login,
            password: password,
            telegram: telegram ?? undefined,
        })
    }
}
