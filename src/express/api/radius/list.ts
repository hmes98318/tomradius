/**
 * 獲取 radius 清單
 */
export const path = '/api/radius/list';
export const method = 'GET';
export const loginRequired = true;


import { LoadType } from '../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../lib/database/MySQL.js';
import type { ApiConfig } from '../../../@types/Config.types.js';
import type { ResultData } from '../../../@types/Express.types.js';


export async function execute(req: Request, res: Response, config: ApiConfig, db: Database): Promise<ResultData> {

    const query = `SELECT * FROM radcheck;`;
    const result = await db.query(query);

    console.log('result', result);

    return {
        loadType: LoadType.SUCCEED,
        data: result as object[]
    };
}