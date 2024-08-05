/**
 * 獲取 radius 授權紀錄
 * 
 * 參數:
 * 無參數
 */
export const path = '/api/radius/authRecord';
export const method = 'GET';
export const loginRequired = true;


import { LoadType } from '../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../lib/database/MySQL.js';
import type { ApiConfig } from '../../../@types/Config.types.js';
import type { ResultData } from '../../../@types/Express.types.js';


export async function execute(req: Request, res: Response, config: ApiConfig, db: Database): Promise<ResultData> {

    const query = `SELECT * FROM radpostauth;`;
    const result = await db.query(query);


    return {
        loadType: LoadType.SUCCEED,
        data: result as object[]
    };
}