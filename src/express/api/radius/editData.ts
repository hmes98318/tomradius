/**
 * 修改一筆 radius 授權帳號
 * 
 * 參數 : 
 * radcheck_id (number)         該帳號的資料庫 index (不可更改)
 * mac_address (string)         MAC address (不可重複)
 * computer_name (string)       電腦名稱
 * employee_name (string)       員工名稱
 * description (string)         其他描述 (選填)
 */
export const path = '/api/radius/editData';
export const method = 'PUT';
export const loginRequired = true;


import cookie from "cookie";
import { rangeCheck } from '../../../utils/rangeCheck.js';
import { LoadType } from '../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { QueryResult } from 'mysql2/promise';
import type { Database } from '../../../lib/database/MySQL.js';
import type { SessionManager } from '../../../lib/session-manager/SessionManager.js';
import type { ApiConfig } from '../../../@types/Config.types.js';
import type { ResultData } from '../../../@types/Express.types.js';


export async function execute(req: Request, res: Response, config: ApiConfig, db: Database, sessionManager: SessionManager): Promise<ResultData> {

    // 參數檢查
    if (
        typeof (req.body.radcheck_id) !== 'number' || !Number.isInteger(req.body.radcheck_id) ||
        (typeof (req.body.mac_address) !== 'string' || !(/^[0-9a-fA-F]{12}$/).test(req.body.mac_address)) ||
        (typeof (req.body.computer_name) !== 'string' || req.body.computer_name.trim() === '' || !rangeCheck.string_length(req.body.computer_name, 64)) ||
        (typeof (req.body.employee_name) !== 'string' || req.body.employee_name.trim() === '' || !rangeCheck.string_length(req.body.employee_name, 64)) ||
        (typeof (req.body.description) !== 'string' || !rangeCheck.string_length(req.body.description, 255))
    ) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }


    /**
     * 從 cookie.sessionId 獲取使用者
     */
    const cookies = cookie.parse(req.headers.cookie as string || '');
    const cookieSessionId = cookies.sessionId;
    const sessionData = sessionManager.getSession(cookieSessionId);

    if (!sessionData) {
        return {
            loadType: LoadType.UNAUTHORIZED,
            data: []
        };
    }

    const newData = {
        radcheck_id: Number(req.body.radcheck_id),
        mac_address: req.body.mac_address,
        computer_name: req.body.computer_name,
        employee_name: req.body.employee_name,
        description: req.body.description,
        creator: sessionData.username
    };

    try {
        // 檢查新的 mac_address 是否有衝突(已存在)
        const checkQuery = `
            SELECT EXISTS (
                SELECT 1 
                FROM 
                    radcheck 
                WHERE 
                    id != ${newData.radcheck_id} AND
                    username = "${newData.mac_address}"
            ) AS record_exists;
        `;
        const checkResult = await db.query(checkQuery) as QueryResult[];

        if (!!Number((checkResult[0] as any).record_exists)) {
            return {
                loadType: LoadType.DATA_EXISTED,
                data: []
            };
        }


        const query = `
            UPDATE 
                radcheck
            SET 
                username = "${newData.mac_address}", 
                attribute  = "Cleartext-Password", 
                op = ":=", 
                value = "${newData.mac_address}", 
                computer_name = "${newData.computer_name}", 
                employee_name = "${newData.employee_name}", 
                description = "${newData.description}", 
                creator = "${newData.creator}", 
                created_at = CURRENT_TIMESTAMP()
            WHERE 
                id = ${newData.radcheck_id};
        `;
        const result = await db.query(query);
        console.log(path, result);

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