import { mkdir, mkdirSync } from 'fs'

export class Helper {
    static customFileName(req, file, cb) {
        const name = file.originalname //.replace(/\s/g, '_')

        cb(null, name)
    }

    static destinationPath(req, file, cb) {
        const userId = req.session.userId
        const postfix = Date.now() + '-' + Math.round(Math.random() * 1e9)

        mkdirSync(`../files/${userId}/${postfix}/`, {
            recursive: true,
        })

        cb(null, `../files/${userId}/${postfix}/`)
    }
}
