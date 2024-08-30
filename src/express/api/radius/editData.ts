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
import { OPType } from "../../../@types/Logger.types.js";

import type { Request, Response } from 'express';
import type { QueryResult, RowDataPacket } from 'mysql2/promise';
import type { Database } from '../../../lib/database/MySQL.js';
import type { Logger } from '../../../lib/logger/Logger.js';
import type { SessionManager } from '../../../lib/session-manager/SessionManager.js';
import type { AppConfig } from '../../../@types/Config.types.js';
import type { ResultData } from '../../../@types/Express.types.js';


export async function execute(req: Request, res: Response, config: AppConfig, db: Database, sessionManager: SessionManager, logger: Logger): Promise<ResultData> {

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
    const oldData = {
        mac_address: '',
        computer_name: '',
        employee_name: '',
        description: ''
    };

    try {
        const getDataQuery = `
            SELECT 
                username,
                computer_name,
                employee_name,
                description
            FROM 
                radcheck
            WHERE
                id = ${newData.radcheck_id};
        `;
        const getDataResult = await db.query(getDataQuery) as RowDataPacket[];

        if (getDataResult.length === 0) {
            logger.emit('radcheck', newData.creator, OPType.RAD_DELETE, false, `未找到請求修改的 MAC_ADDRESS (${newData.mac_address})`);
            return {
                loadType: LoadType.DATA_NOT_FOUND,
                data: []
            };
        }


        // oldData 用來好判斷參數而已 0.0
        oldData.mac_address = getDataResult[0].username;
        oldData.computer_name = getDataResult[0].computer_name;
        oldData.employee_name = getDataResult[0].employee_name;
        oldData.description = getDataResult[0].description;


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
            logger.emit('radcheck', newData.creator, OPType.RAD_EDIT, false, `添加了已存在的 MAC_ADDRESS (${newData.mac_address})`);
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


    // 檢查修改了哪些值並寫入 log
    newData.mac_address = (newData.mac_address === oldData.mac_address ? 'NULL' : `新值(${newData.mac_address}), 舊值(${oldData.mac_address})`);
    newData.computer_name = (newData.computer_name === oldData.computer_name ? 'NULL' : `新值(${newData.computer_name}), 舊值(${oldData.computer_name})`);
    newData.employee_name = (newData.employee_name === oldData.employee_name ? 'NULL' : `新值(${newData.employee_name}), 舊值(${oldData.employee_name})`);
    newData.description = (newData.description === oldData.description ? 'NULL' : `新值(${newData.description}), 舊值(${oldData.description})`);

    logger.emit('radcheck', newData.creator, OPType.RAD_EDIT, true, newData.mac_address, newData.computer_name, newData.employee_name, newData.description);

    return {
        loadType: LoadType.SUCCEED,
        data: []
    };
}