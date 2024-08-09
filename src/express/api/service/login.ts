/**
 * 登入 API
 */
export const path = '/api/service/login';
export const method = 'POST';
export const loginRequired = false;


import cookie from "cookie";

import { rangeCheck } from '../../../utils/rangeCheck.js';
import { LoadType } from '../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../lib/database/MySQL.js';
import type { Logger } from "../../../lib/logger/Logger.js";
import type { SessionManager } from '../../../lib/session-manager/SessionManager.js';
import type { ApiConfig } from '../../../@types/Config.types.js';
import type { ResultData } from "../../../@types/Express.types.js";


export async function execute(req: Request, res: Response, config: ApiConfig, db: Database, sessionManager: SessionManager, logger: Logger): Promise<ResultData> {

    // 參數檢查
    if (
        (typeof (req.body.username) !== 'string' || !rangeCheck.string_length(req.body.username, 100) || containsSpecialChars(req.body.username)) ||
        (typeof (req.body.password) !== 'string' || !rangeCheck.string_length(req.body.password, 100) || containsSpecialChars(req.body.password))
    ) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }


    const username = req.body.username;
    const password = req.body.password;
    const userIp = (req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip) as string;

    // 檢查是否嘗試過多登入
    if (sessionManager.ipBlocker.checkBlocked(userIp)) {
        logger.emit('normal-login', username, userIp, false);

        return {
            loadType: LoadType.BLOCKED_LOGIN,
            data: []
        };
    }


    const cookies = cookie.parse(req.headers.cookie as string || '');
    const cookieSessionId = cookies.sessionId;

    // 已登入的狀態跳過登入 (存在 sessionId)
    if (sessionManager.checkSession(cookieSessionId)) {
        logger.emit('normal-login', username, userIp, true);
        sessionManager.refreshSession(cookieSessionId);

        return {
            loadType: LoadType.SESSION_EXISTS,
            data: [
                {
                    sessionId: cookieSessionId
                }
            ]
        };
    }


    const sessionId = await sessionManager.createSession(username, password);

    // 登入失敗 (帳號密碼錯誤)
    if (!sessionId) {
        logger.emit('normal-login', username, userIp, false);
        sessionManager.ipBlocker.add(userIp);

        return {
            loadType: LoadType.FAILED_LOGIN,
            data: []
        };
    }


    // 登入成功
    logger.emit('normal-login', username, userIp, true);
    sessionManager.ipBlocker.delete(userIp);

    res.cookie('sessionId', sessionId);

    return {
        loadType: LoadType.SUCCEED,
        data: [
            {
                sessionId: sessionId
            }
        ]
    };
}


const containsSpecialChars = (str: string): boolean => {
    const specialChars = [' ', '/', '\\', '|', '<', '>', '=', '\'', '"'];
    return specialChars.some(char => str.includes(char));
};