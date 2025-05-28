/**
 * 登出 API
 */
export const path = '/api/service/logout';
export const method = 'POST';
export const loginRequired = true;


import cookie from "cookie";

import { LoadType } from '../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../lib/database/MySQL.js';
import type { SessionManager } from '../../../lib/session-manager/SessionManager.js';
import type { AppConfig } from '../../../@types/Config.types.js';
import type { ResultData } from "../../../@types/Express.types.js";


export async function execute(req: Request, res: Response, config: AppConfig, db: Database, sessionManager: SessionManager): Promise<ResultData> {

    /**
     * 從 cookie.sessionId 獲取使用者
     */
    const cookies = cookie.parse(req.headers.cookie as string || '');
    const cookieSessionId = cookies.sessionId || '';

    sessionManager.destroySession(cookieSessionId);

    res.clearCookie('sessionId');
    return {
        loadType: LoadType.SUCCEED,
        data: []
    };
}