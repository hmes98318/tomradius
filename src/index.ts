import { Controller } from "./Controller.js";


const controller = new Controller();


const startApp = async () => {
    controller.app?.on('debug', (msg: any) => {
        console.log(getFormatTime(), '[api][debug]', msg);
    });

    controller.app?.on('request', (req: any) => {
        const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip;

        if (req.body && Object.keys(req.body).length === 0) {
            console.log(getFormatTime(), '[api][request]', ip, req.url);
        }
        else {
            console.log(getFormatTime(), '[api][request]', ip, req.url, req.body);
        }
    });

    controller.app?.on('requestFail', (ip: string, failType: 'UNAUTHORIZED' | 'FORBIDDEN', path: string) => {
        console.log(getFormatTime(), '[api][requestFail]', ip, failType, path);
    });

    controller.app?.on('response', (res: any) => {
        //console.log(getFormatTime(),'[api][response]', res);
    });

    controller.app?.on('error', (msg: any) => {
        console.log(getFormatTime(), color.red, msg, color.white);
    });

    controller.app?.on('warn', (msg: any) => {
        console.log(getFormatTime(), color.yellow, msg, color.white);
    });


    await controller.initializeExpress();
};




const parseFormatTokens = (format: string): string[] => {
    // Regular expression to match time tokens in the format string
    const timeTokenRegex = /(yyyy|mm|dd|HH|hh|MM|ss|l)/g;
    const matches = format.match(timeTokenRegex);

    // If there are matches, return the array of matched tokens
    return matches ? matches : [];
};

const format = 'yyyy/mm/dd HH:MM:ss.l';
const formatTokens = parseFormatTokens(format);

const getFormatTime = (): string => {
    const now = new Date();

    const timeValues: { [token: string]: string } = {
        'yyyy': String(now.getFullYear()),
        'mm': String(now.getMonth() + 1).padStart(2, '0'),
        'dd': String(now.getDate()).padStart(2, '0'),
        'HH': String(now.getHours()).padStart(2, '0'),
        'hh': String(now.getHours() % 12 || 12).padStart(2, '0'),
        'MM': String(now.getMinutes()).padStart(2, '0'),
        'ss': String(now.getSeconds()).padStart(2, '0'),
        'l': String(now.getMilliseconds()).padStart(3, '0'),
    };

    // Replace each token in the format string with its corresponding value
    const formattedTime = formatTokens.reduce(
        (result, token) => result.replace(token, timeValues[token]),
        format
    );

    // 12-hour clock
    if (formatTokens.includes('hh')) {
        const period = Number(timeValues['HH']) < 12 ? 'AM' : 'PM';
        return formattedTime + ` ${period}`;
    }

    return '[' + formattedTime + ']';
};


const color = {
    cyan: '\x1B[36m',
    green: '\x1B[32m',
    grey: '\x1B[2m',
    red: '\x1B[31m',
    white: '\x1B[0m',
    yellow: '\x1B[33m'
};




const main = async () => {
    await startApp();
};

main();
