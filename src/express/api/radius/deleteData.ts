/**
 * 刪除一筆 radius 授權帳號
 * 
 * 參數 : 
 * radcheck_id (number)         該帳號的資料庫 index
 */
export const path = '/api/radius/deleteData';
export const method = 'DELETE';
export const loginRequired = true;


import cookie from "cookie";

import { LoadType } from '../../../@types/Express.types.js';
import { OPType } from '../../../@types/Logger.types.js';

import type { Request, Response } from 'express';
import type { RowDataPacket } from "mysql2/promise";
import type { Database } from '../../../lib/database/MySQL.js';
import type { Logger } from '../../../lib/logger/Logger.js';
import type { SessionManager } from "../../../lib/session-manager/SessionManager.js";
import type { ApiConfig } from '../../../@types/Config.types.js';
import type { ResultData } from '../../../@types/Express.types.js';


export async function execute(req: Request, res: Response, config: ApiConfig, db: Database, sessionManager: SessionManager, logger: Logger): Promise<ResultData> {

    // 參數檢查
    if (typeof (req.body.radcheck_id) !== 'number' || !Number.isInteger(req.body.radcheck_id)) {
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

    const creator = sessionData.username;
    const radcheck_id = Number(req.body.radcheck_id);
    let mac_address = '';

    try {
        const checkQuery = `SELECT username FROM radcheck WHERE id = ${radcheck_id};`;
        const checkResult = await db.query(checkQuery) as RowDataPacket[];

        if (checkResult.length === 0) {
            logger.emit('radcheck', creator, OPType.RAD_DELETE, false, `未找到請求刪除的 MAC_ADDRESS (radcheck_id = ${radcheck_id})`);

            return {
                loadType: LoadType.DATA_NOT_FOUND,
                data: [
                    {
                        radcheck_id: radcheck_id
                    }
                ]
            };
        }

        mac_address = checkResult[0].username;


        const query = `DELETE FROM radcheck WHERE id = ${radcheck_id};`;
        await db.query(query);
    } catch (error) {
        console.log(path, error);
        return {
            loadType: LoadType.QUERY_FAILED,
            data: []
        };
    }


    logger.emit('radcheck', creator, OPType.RAD_DELETE, true, mac_address);

    return {
        loadType: LoadType.SUCCEED,
        data: []
    };
}