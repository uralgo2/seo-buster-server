import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import mongoose from 'mongoose'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    app.enableCors({
        credentials: true,
        origin: ['*', 'http://localhost:3000', 'http://192.168.43.83:3000'], //['https://seobuster.ru', 'http://seobuster.ru', '*'],
        allowedHeaders: [
            'Content-Type',
            'Origin',
            'X-Requested-With',
            'Accept',
            'Set-Cookie',
        ],
        methods: ['PUT', 'PATCH', 'GET', 'POST', 'DELETE'],
        exposedHeaders: ['Set-Cookie'],
    })

    app.use(cookieParser())
    await mongoose.connect('mongodb://localhost:27017/seo-buster-db')
    await app.listen(3007)
}
bootstrap()
