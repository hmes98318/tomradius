/**
 * 獲取 radius 授權紀錄
 * 
 * 參數:
 * startDate? (string)      開始日期 (YYYY-MM-DD)
 * endDate? (string)        結束日期 (YYYY-MM-DD)
 */
export const path = '/api/service/logger/radiusAuth';
export const method = 'GET';
export const loginRequired = false;


import { isValidDateString } from '../../../../utils/formatDate.js';
import { LoadType } from '../../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2/promise';
import type { Database } from '../../../../lib/database/MySQL.js';
import type { AppConfig } from '../../../../@types/Config.types.js';
import type { ResultData } from '../../../../@types/Express.types.js';


export async function execute(req: Request, res: Response, config: AppConfig, db: Database): Promise<ResultData> {
    let result: object[] = [];
    const { startDate, endDate } = req.query;

    if (
        startDate && typeof startDate !== 'string' ||
        endDate && typeof endDate !== 'string' ||
        startDate && typeof startDate === 'string' && !isValidDateString(startDate) ||
        endDate && typeof endDate === 'string' && !isValidDateString(endDate)
    ) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }


    try {
        const start = startDate ? `${startDate} 00:00:00` : (new Date().toISOString().slice(0, 10) + ' 00:00:00');
        const end = endDate ? `${endDate} 23:59:59` : (new Date().toISOString().slice(0, 10) + ' 23:59:59');

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
                radpostauth
            WHERE 
                authdate BETWEEN ? AND ?
            ORDER BY 
                authdate DESC;
        `;

        result = await db.query(query, [start, end]) as RowDataPacket[];
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