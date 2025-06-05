/**
 * 獲取 radius 授權帳號清單
 * 
 * 參數:
 * type (number)                獲取的清單類型 (All: 1, specific: 2)
 * id? (number)                 type = 2 時需帶入目標 id
 * limit? (number | 'ALL')      獲取數量 (default: 50)
 * before? (number)             只獲取 id 小於指定值的記錄
 * 
 * type = 1 時的過濾參數:
 * search? (string)             全域搜尋 (搜尋 MAC 地址、電腦名稱、員工名稱)
 * mac_address? (string)        MAC 地址模糊搜尋
 * computer_name? (string)      電腦名稱模糊搜尋
 * employee_name? (string)      員工名稱模糊搜尋
 * creator? (string)            創建者模糊搜尋
 * created_at_start? (string)   創建時間搜尋 (Unix Timestamp)
 * created_at_end? (string)
 */
export const path = '/api/radius/list';
export const method = 'GET';
export const loginRequired = true;


import { checkValidUnixTimestamp } from '../../../utils/formatDate.js';
import { LoadType } from '../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2/promise';
import type { Database } from '../../../lib/database/MySQL.js';
import type { AppConfig } from '../../../@types/Config.types.js';
import type { ResultData } from '../../../@types/Express.types.js';


export async function execute(req: Request, res: Response, config: AppConfig, db: Database): Promise<ResultData> {
    let result: object[] = [];
    let isAll = false;

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

    if (String(req.query.limit).toUpperCase() === 'ALL') {
        isAll = true;
    }

    const limit = isAll ? null : Math.max(parseInt(req.query.limit as string) || 50, 1);
    const before = parseInt(req.query.before as string) || null;
    const listId = Number(req.query.id);

    try {
        if (listType === 1) {
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
                WHERE 1=1`;

            const params: any[] = [];

            // 如果有 before 參數，則只獲取 id 小於 before 的資料
            if (before) {
                query += ` AND id < ?`;
                params.push(before);
            }

            // ---------------------------------------------------------------------
            // 過濾參數處理：

            // 全域搜尋：同時搜尋 MAC 地址、電腦名稱、員工名稱
            if (req.query.search) {
                const searchTerm = req.query.search as string;
                query += ` AND (username LIKE ? OR computer_name LIKE ? OR employee_name LIKE ?)`;
                params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
            }

            // MAC 地址
            if (req.query.mac_address) {
                query += ` AND username LIKE ?`;
                params.push(`%${req.query.mac_address}%`);
            }

            // 電腦名稱
            if (req.query.computer_name) {
                query += ` AND computer_name LIKE ?`;
                params.push(`%${req.query.computer_name}%`);
            }

            // 員工名稱
            if (req.query.employee_name) {
                query += ` AND employee_name LIKE ?`;
                params.push(`%${req.query.employee_name}%`);
            }

            // 創建者
            if (req.query.creator) {
                query += ` AND creator LIKE ?`;
                params.push(`%${req.query.creator}%`);
            }

            // 創建時間範圍
            if (req.query.created_at_start && req.query.created_at_end) {
                const startTime = req.query.created_at_start as string;
                const endTime = req.query.created_at_end as string;

                if (checkValidUnixTimestamp(startTime) && checkValidUnixTimestamp(endTime)) {
                    query += ` AND created_at BETWEEN FROM_UNIXTIME(?) AND FROM_UNIXTIME(?)`;
                    params.push(startTime, endTime);
                }
            }

            // ---------------------------------------------------------------------


            query += ` ORDER BY id DESC`;

            if (!isAll) {
                query += ` LIMIT ?;`;
                params.push(limit);
            }
            else {
                query += ';';
            }

            result = await db.query(query, params) as RowDataPacket[];
        }
        else if (listType === 2) {
            const query = `
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
                    id = ?;
            `;
            result = await db.query(query, [listId]) as RowDataPacket[];
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
        data: result as object[]
    };
}