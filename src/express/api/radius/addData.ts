/**
 * 添加一筆 radius 授權帳號
 * 
 * 參數 : 
 * mac_address (string)         MAC address (不可重複)
 * computer_name (string)       電腦名稱
 * employee_name (string)       員工名稱
 * description (string)         其他描述 (選填)
 */
export const path = '/api/radius/addData';
export const method = 'POST';
export const loginRequired = true;


import cookie from "cookie";

import { OPType } from "../../../@types/Logger.types.js";
import { rangeCheck } from '../../../utils/rangeCheck.js';
import { LoadType } from '../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { QueryResult, ResultSetHeader } from 'mysql2/promise';
import type { Database } from '../../../lib/database/MySQL.js';
import type { Logger } from "../../../lib/logger/Logger.js";
import type { SessionManager } from '../../../lib/session-manager/SessionManager.js';
import type { AppConfig } from '../../../@types/Config.types.js';
import type { ResultData } from '../../../@types/Express.types.js';


export async function execute(req: Request, res: Response, config: AppConfig, db: Database, sessionManager: SessionManager, logger: Logger): Promise<ResultData> {

    // 參數檢查
    if (
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
    const cookieSessionId = cookies.sessionId || '';
    const sessionData = sessionManager.getSession(cookieSessionId);

    if (!sessionData) {
        return {
            loadType: LoadType.UNAUTHORIZED,
            data: []
        };
    }

    const newData = {
        mac_address: req.body.mac_address,
        computer_name: req.body.computer_name,
        employee_name: req.body.employee_name,
        description: req.body.description,
        creator: sessionData.username
    };
    let result: ResultSetHeader;

    try {
        // Check if mac_address exist
        const checkQuery = `
            SELECT EXISTS (
                SELECT 1 FROM radcheck WHERE username = ?
            ) AS record_exists;
        `;
        const checkResult = await db.query(checkQuery, [newData.mac_address]) as QueryResult[];

        if (!!Number((checkResult[0] as any).record_exists)) {
            logger.emit('radcheck', newData.creator, OPType.RAD_ADD, false, `添加了已存在的 MAC_ADDRESS (${newData.mac_address})`);

            return {
                loadType: LoadType.DATA_EXISTED,
                data: []
            };
        }


        const query = `
            INSERT INTO radcheck (
                username, 
                attribute, 
                op, 
                value, 
                computer_name, 
                employee_name, 
                description, 
                creator
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;
        result = await db.query(query, [
            newData.mac_address,
            'Cleartext-Password',
            ':=',
            newData.mac_address,
            newData.computer_name,
            newData.employee_name,
            newData.description,
            newData.creator
        ]) as ResultSetHeader;
        console.log(path, result);

    } catch (error) {
        console.log(path, error);
        return {
            loadType: LoadType.QUERY_FAILED,
            data: []
        };
    }


    logger.emit('radcheck', newData.creator, OPType.RAD_ADD, true, newData.mac_address, newData.computer_name, newData.employee_name, newData.description);

    return {
        loadType: LoadType.SUCCEED,
        data: []
    };
}