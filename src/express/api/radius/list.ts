/**
 * 獲取 radius 授權帳號清單
 * 
 * 參數:
 * type (number)        獲取的清單類型 (All: 1, specific: 2)
 * id? (number)         type = 1 時需帶入目標 id
 */
export const path = '/api/radius/list';
export const method = 'GET';
export const loginRequired = true;


import { LoadType } from '../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2/promise';
import type { Database } from '../../../lib/database/MySQL.js';
import type { ApiConfig } from '../../../@types/Config.types.js';
import type { ResultData } from '../../../@types/Express.types.js';


export async function execute(req: Request, res: Response, config: ApiConfig, db: Database): Promise<ResultData> {
    let result: object[] = [];

    // 參數檢查
    if (![1, 2].includes(Number(req.query.type))) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }

    const listType = Number(req.query.type);

    if ((listType === 2) && (!Number.isInteger(Number(req.query.id)) || Number(req.query.id) === 0)) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }


    const listId = Number(req.query.id);

    try {
        // listType = 1
        let query = `
            SELECT 
                id, 
                username as mac_address,
                computer_name,
                employee_name,
                description,
                creator,
                created_at
            FROM 
                radcheck;
        `;

        if (listType === 2) {
            query = `
                SELECT 
                    id, 
                    username as mac_address,
                    computer_name,
                    employee_name,
                    description,
                    creator,
                    created_at
                FROM 
                    radcheck
                WHERE
                    id = ${listId};
            `;
        }

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
     * 需轉換成 UTC+8 (2024-06-23 13:05:05)
     * 不在 DB 端處理時區轉換, server 端處理就好
     */
    result = result.map((item: any) => {
        item.created_at = new Date(item.created_at as string).toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        return item;
    });


    return {
        loadType: LoadType.SUCCEED,
        data: result as object[]
    };
}