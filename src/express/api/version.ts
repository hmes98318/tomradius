/**
 * API版本
 */
export const path = '/api/version';
export const method = 'GET';
export const loginRequired = false;     // 此API調用是否需要登入


import * as fs from 'fs';
import { LoadType } from '../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../lib/database/MySQL.js';
import type { ApiConfig } from '../../@types/Config.types.js';
import type { ResultData } from '../../@types/Express.types.js';


const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

export async function execute(req: Request, res: Response, config: ApiConfig, db: Database): Promise<ResultData> {

    return {
        loadType: LoadType.SUCCEED,
        data: [
            {
                version: pkg.version
            }
        ]
    };
}