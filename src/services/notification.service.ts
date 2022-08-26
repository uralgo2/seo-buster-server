import { Injectable, Logger } from '@nestjs/common'
import { ProjectsService } from './projects.service'
import { UsersService } from './users.service'
import { CronExpression, Interval } from '@nestjs/schedule'
import { TelegramBotService } from './telegram.bot.service'

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name)

    constructor(
        private readonly projectsService: ProjectsService,
        private readonly usersService: UsersService,
        private readonly telegramBotService: TelegramBotService,
    ) {}

    // every one minute
    @Interval(60 * 1000)
    async CheckExpireDate() {
        const projects = await this.projectsService.GetProjects()
        const today = new Date()

        for (const project of projects) {
            const endingAt = new Date(project.endingAt)
            if (today > endingAt && !project.notificatedAboutExpired) {
                const user = await this.usersService.GetUserById(
                    project.user as string,
                )
                if (user.balance <= 100) {
                    await this.telegramBotService.NotifyUser(
                        project.user as string,
                        `Здравствуйте, в сервисе seobuster.ru у вас баланс менее 100 руб. При необходимости пополните баланс для возобновления работы.`,
                    )
                    await this.projectsService.PatchProject(project._id, {
                        notificatedAboutExpired: true,
                    })
                }
            }
            // 10 - 12 == -2
            const diffTime = today.getTime() - endingAt.getTime()
            const diffDay = diffTime / (1000 * 3600 * 24)

            if (
                diffDay >= -1 &&
                diffDay < 0 &&
                !project.notificatedAboutExpires
            ) {
                const localizedDate = endingAt.toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                })
                await this.telegramBotService.NotifyUser(
                    project.user as string,
                    `Здравствуйте, в сервисе seobuster.ru проект ${project.site} заканчивается ${localizedDate} включительно. Не забудьте пополнить баланс.`,
                )
                await this.projectsService.PatchProject(project._id, {
                    notificatedAboutExpires: true,
                })
            }
        }
    }
}
