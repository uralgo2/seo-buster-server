import { MiddlewareConsumer, Module, Scope } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersService } from './services/users.service'
import { ProjectsService } from './services/projects.service'

import { SessionModule } from 'nestjs-session'
import { UsersController } from './controllers/users.controller'

import * as session from 'express-session'
import * as connectRedis from 'connect-redis'
import { createClient } from 'redis'
import { APP_FILTER } from '@nestjs/core'
import { ErrorFilter, HttpExceptionFilter } from './exceptions'
import { TasksService } from './services/tasks.service'
import { ProjectsController } from './controllers/projects.controller'
import { TelegramModule } from 'nestjs-telegram'
import { TelegramBotService } from './services/telegram.bot.service'
import { ScheduleModule } from '@nestjs/schedule'
import { DeductService } from './services/deduct.service'
import { NotificationService } from './services/notification.service'
import { TasksController } from './controllers/tasks.controller'
import { CitiesController } from './controllers/cities.controller'
import { UploadController } from './controllers/upload.controller'
import { CitiesService } from './services/cities.service'
import { UploadService } from './services/upload.service'
import LogsMiddleware from './middlewares'
import { DefaultsController } from './controllers/defaults.controller'
import { DefaultsService } from './services/defaults.service'
import { TasksWithoutProjectController } from './controllers/tasks.without.project.controller'
import { ConfigModule } from "@nestjs/config";

const RedisStore = connectRedis(session)
const redisClient = createClient({ legacyMode: true })
redisClient.connect().catch(console.error)

@Module({
    imports: [
        SessionModule.forRoot({
            session: {
                secret: 'my secret 9821983jdsnciwq1~~',
                store: new RedisStore({ client: redisClient }),
                cookie: {
                    maxAge: 60 * 60 * 24 * 90 * 1000, // 3 months
                    secure: false,
                    httpOnly: true,
                },
                saveUninitialized: false,
                resave: true,
            },
        }),
        ScheduleModule.forRoot(),
        TelegramModule.forRoot({
            botKey: '5440063911:AAHGkRUiLU8inTRrx8OC8mrvEe2w-QQ-gjY',
        }),
        ConfigModule.forRoot(),
    ],
    controllers: [
        AppController,
        UsersController,
        TasksController,
        ProjectsController,
        CitiesController,
        UploadController,
        DefaultsController,
        TasksWithoutProjectController,
    ],
    providers: [
        AppService,
        UsersService,
        ProjectsService,
        TasksService,
        TelegramBotService,
        DeductService,
        NotificationService,
        CitiesService,
        UploadService,
        DefaultsService,
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
            scope: Scope.DEFAULT,
        },
        {
            provide: APP_FILTER,
            useClass: ErrorFilter,
            scope: Scope.DEFAULT,
        },
    ],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LogsMiddleware).forRoutes('*')
    }
}
