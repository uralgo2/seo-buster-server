import {
    Controller,
    ParseFilePipeBuilder,
    Post,
    Session,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common'
import { Level } from '../decorators'
import { ISession, UserRoleEnum } from '../utils.types'
import { UploadService } from '../services/upload.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { Helper } from '../helper.file.upload'

@Controller('/api/files')
export class UploadController {
    constructor(private readonly uploadService: UploadService) {}

    @Level(UserRoleEnum.Authenticated)
    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: Helper.destinationPath,
                filename: Helper.customFileName,
            }),
        }),
    )
    uploadFileAndPassValidation(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType:
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                })
                .build(),
        )
        file: Express.Multer.File,
        @Session() session: ISession,
    ) {
        const prettyPath = file.path
            .replace(/\\/g, '/')
            .replace('../', '')


        return {
            uploadPath: prettyPath,
        }
    }
}
