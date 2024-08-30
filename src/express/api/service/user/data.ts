/**
 * 獲取指定使用者個人資料
 * 使用者用
 * 用 sessionId 獲取資料
 */
export const path = '/api/service/user/data';
export const method = 'GET';
export const loginRequired = true;
export const allowPermissions = [];


import cookie from "cookie";
import { LoadType } from '../../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../../lib/database/MySQL.js';
import type { SessionManager } from '../../../../lib/session-manager/SessionManager.js';
import type { AppConfig } from '../../../../@types/Config.types.js';
import type { ResultData } from "../../../../@types/Express.types.js";


export async function execute(req: Request, res: Response, config: AppConfig, db: Database, sessionManager: SessionManager): Promise<ResultData> {

    /**
     * 從 cookie.sessionId 獲取使用者名稱
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


    return {
        loadType: LoadType.SUCCEED,
        data: [sessionData]
    };
}