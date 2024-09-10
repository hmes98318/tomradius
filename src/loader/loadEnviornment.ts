import * as dotenv from 'dotenv';
import type { EnvConfig } from '../@types/Config.types.js';


dotenv.config();

const loadEnviornment = (): EnvConfig => {
    const defaultEnv: EnvConfig = {
        dbConfig: {
            host: '',
            port: 3306,
            database: '',
            user: '',
            password: ''
        }
    };

    // Load database config
    if (!process.env.DB_HOST) throw new TypeError('Database host not set');
    if (!process.env.DB_PORT) throw new TypeError('Database port not set');
    if (!process.env.DB_DATABASE) throw new TypeError('Database name not set');
    if (!process.env.DB_USER) throw new TypeError('Database user not set');
    if (!process.env.DB_PASSWORD) throw new TypeError('Database password not set');

    defaultEnv.dbConfig = {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    };

    // console.log('defaultEnv', defaultEnv);
    return defaultEnv;
};

export { loadEnviornment };
