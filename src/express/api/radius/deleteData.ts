/**
 * 刪除一筆 radius 授權帳號
 * 
 * 參數 : 
 * radcheck_id (number)         該帳號的資料庫 index
 */
export const path = '/api/radius/deleteData';
export const method = 'DELETE';
export const loginRequired = true;


import { LoadType } from '../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../lib/database/MySQL.js';
import type { ApiConfig } from '../../../@types/Config.types.js';
import type { ResultData } from '../../../@types/Express.types.js';


export async function execute(req: Request, res: Response, config: ApiConfig, db: Database): Promise<ResultData> {

    // 參數檢查
    if (typeof (req.body.radcheck_id) !== 'number' || !Number.isInteger(req.body.radcheck_id)) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }


    const radcheck_id = Number(req.body.radcheck_id);

    try {
        /**
         * ResultSetHeader {
         *     fieldCount: 0,
         *     affectedRows: 1,
         *     insertId: 0,
         *     info: '',
         *     serverStatus: 2,
         *     warningStatus: 0,
         *     changedRows: 0
         * }
         */
        const accountQuery = `DELETE FROM radcheck WHERE id = ${radcheck_id};`;
        const result = await db.query(accountQuery);
        const affectedRows = Number((result as any)['affectedRows'] ?? -1);

        // radcheck_id 不存在
        if (affectedRows <= 0) {
            return {
                loadType: LoadType.ACCOUNT_NOT_EXISTS,
                data: [
                    {
                        radcheck_id: radcheck_id
                    }
                ]
            };
        }
    } catch (error) {
        console.log(path, error);
        return {
            loadType: LoadType.QUERY_FAILED,
            data: []
        };
    }


    return {
        loadType: LoadType.SUCCEED,
        data: []
    };
}