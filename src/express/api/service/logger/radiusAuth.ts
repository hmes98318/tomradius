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
import type { ApiConfig } from '../../../../@types/Config.types.js';
import type { ResultData } from '../../../../@types/Express.types.js';


export async function execute(req: Request, res: Response, config: ApiConfig, db: Database): Promise<ResultData> {
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


    /**
     * 資料庫 TIMESTAMP 獲取的時區為 UTC (+0:00) (2024-07-29T05:05:05.000Z)
     * 需轉換成 UTC+8 (2024-06-23 13:05:05) // ISO 8601 
     * 不在 DB 端處理時區轉換, server 端處理就好
     */
    result = result.map((item: any) => {
        item.authdate = new Date(item.authdate as string).toISOString().slice(0, 19).replace('T', ' ');
        return item;
    });


    return {
        loadType: LoadType.SUCCEED,
        data: result as object[]
    };
}