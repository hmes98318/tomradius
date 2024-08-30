/**
 * 檢查 session 是否還有效
 * 用 sessionId 獲取資料
 */
export const path = '/api/service/session/validSession';
export const method = 'GET';
export const loginRequired = false;


import cookie from "cookie";
import { LoadType } from '../../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../../lib/database/MySQL.js';
import type { SessionManager } from '../../../../lib/session-manager/SessionManager.js';
import type { AppConfig } from '../../../../@types/Config.types.js';
import type { ResultData } from "../../../../@types/Express.types.js";


export async function execute(req: Request, res: Response, config: AppConfig, db: Database, sessionManager: SessionManager): Promise<ResultData> {

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


    return {
        loadType: LoadType.SUCCEED,
        data: []
    };
}