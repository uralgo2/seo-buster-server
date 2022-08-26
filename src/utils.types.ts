import { Request } from 'express'

export type Nullable<T> = T | null
export enum FactorEnum {
    ZeroOne = 0.1,
    ZeroTwo = 0.2,
    ZeroThree = 0.3,
    ZeroFour = 0.4,
    ZeroFive = 0.5,
    ZeroSix = 0.6,
    ZeroSeven = 0.7,
    ZeroEight = 0.8,
    ZeroNine = 0.9,
    One = 1,
}

export enum TariffEnum {
    UpTo75Clicks = 0.11,
    UpTo125Clicks = 0.102,
    UpTo200Clicks = 0.082,
    UpTo250Clicks = 0.073,
    UpTo350Clicks = 0.066,
    UpTo450Clicks = 0.059,
    More = 0.055,
    None = 0,
}

export enum TaskEnum {
    ChangeFactor = 'Поменять кф',
    AddQueries = 'Добавить запросы',
    DeleteQueries = 'Удалить запросы',
    AddSite = 'Добавить сайт',
}

export enum StatusEnum {
    Execute = 'Выполнить',
    Done = 'Готово',
    Error = 'Ошибка',
}

export class Tariff {
    public static GetTariff(clicks: number): TariffEnum {
        return clicks < 75
            ? TariffEnum.UpTo75Clicks
            : clicks < 125
            ? TariffEnum.UpTo125Clicks
            : clicks < 200
            ? TariffEnum.UpTo200Clicks
            : clicks < 250
            ? TariffEnum.UpTo250Clicks
            : clicks < 350
            ? TariffEnum.UpTo350Clicks
            : clicks < 450
            ? TariffEnum.UpTo450Clicks
            : TariffEnum.More
    }
}

export enum UserRoleEnum {
    All,
    Authenticated,
    Admin,
}

export interface IRequest extends Request {
    session: any
}

export interface ISession {
    userId: string
    role: number
}

export const translit = (word: string): string => {

    const converter = {

        'а': 'a',    'б': 'b',    'в': 'v',    'г': 'g',    'д': 'd',

        'е': 'e',    'ё': 'e',    'ж': 'zh',   'з': 'z',    'и': 'i',

        'й': 'y',    'к': 'k',    'л': 'l',    'м': 'm',    'н': 'n',

        'о': 'o',    'п': 'p',    'р': 'r',    'с': 's',    'т': 't',

        'у': 'u',    'ф': 'f',    'х': 'h',    'ц': 'c',    'ч': 'ch',

        'ш': 'sh',   'щ': 'sch',  'ь': '',     'ы': 'y',    'ъ': '',

        'э': 'e',    'ю': 'yu',   'я': 'ya'

    };



    word = word.toLowerCase()



    let answer = ''

    for (let i = 0; i < word.length; ++i) {

        if (converter[word[i]] == undefined){

            answer += word[i]

        } else {

            answer += converter[word[i]]

        }

    }



    answer = answer.replace(/[^-0-9a-z]/g, '-')

    answer = answer.replace(/[-]+/g, '-')

    answer = answer.replace(/^\-|-$/g, '')

    return answer

}