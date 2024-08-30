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
import type { AppConfig } from '../../../@types/Config.types.js';
import type { ResultData } from '../../../@types/Express.types.js';


export async function execute(req: Request, res: Response, config: AppConfig, db: Database): Promise<ResultData> {
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
                radcheck
            ORDER BY 
                created_at DESC;
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


    return {
        loadType: LoadType.SUCCEED,
        data: result as object[]
    };
}