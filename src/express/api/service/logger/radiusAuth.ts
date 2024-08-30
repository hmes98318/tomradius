/**
 * 獲取 radius 授權紀錄
 * 
 * 參數:
 * 無參數
 */
export const path = '/api/service/logger/radiusAuth';
export const method = 'GET';
export const loginRequired = true;


import { LoadType } from '../../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2/promise';
import type { Database } from '../../../../lib/database/MySQL.js';
import type { AppConfig } from '../../../../@types/Config.types.js';
import type { ResultData } from '../../../../@types/Express.types.js';


export async function execute(req: Request, res: Response, config: AppConfig, db: Database): Promise<ResultData> {
    let result: object[] = [];

    try {
        const query = `
            SELECT 
                id,
                username as mac_address,
                CASE 
                    WHEN reply = 'Access-Accept' THEN TRUE 
                    ELSE FALSE 
                END AS is_accepted,
                authdate
            FROM 
                radpostauth;
        `;
        result = await db.query(query) as RowDataPacket[];
    } catch (error) {
        console.log(path, error);
        return {
            loadType: LoadType.QUERY_FAILED,
            data: []
        };
    }


    return {
        loadType: LoadType.SUCCEED,
        data: result as object[]
    };
}