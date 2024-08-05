import { randomBytes } from 'crypto';
import { Authorizer } from './Authorizer.js';
import { IPBlocker } from "./IPBlocker.js";

import type { IPBlockerConfig, SessionManagerConfig } from '../../@types/Config.types.js';


export type SessionData = {
    username: string            // 登入的帳號名稱
    createdAt: number;          // Create time (ms)
}


export class SessionManager {
    #sessionMap: Map<string, SessionData>;      // <sessionId, sessionData>
    #validTime: number;
    #cleanupInterval: number;

    public ipBlocker: IPBlocker;
    public auth: Authorizer;


    /**
     * @param {Authorizer} auth - Authorizer instance
     * @param {SessionManagerConfig} config - Session manager config
     * @param {IPBlockerConfig} ipBlockerConfig - IP blocker config
     */
    constructor(auth: Authorizer, config?: SessionManagerConfig, ipBlockerConfig?: IPBlockerConfig | undefined) {
        this.auth = auth;

        if (config) {
            this.#validTime = config.validTime;
            this.#cleanupInterval = config.cleanupInterval;
        }
        else {
            this.#validTime = 10 * 60 * 1000;
            this.#cleanupInterval = 5 * 60 * 1000;
        }


        this.#sessionMap = new Map<string, SessionData>();
        this.ipBlocker = new IPBlocker(ipBlockerConfig);

        this.#autoCheckExpires(this.#cleanupInterval);
    }


    /**
     * Create a new session or refresh a session
     * @param username - account name
     * @param password - account password
     * @returns {string | false} - Session id or login failed
     */
    public async createSession(username: string, password: string): Promise<string | false> {
        const permissions = await this.auth.login(username, password);

        if (!permissions) {
            return false;
        }

        const sessionId = this.generateSessionKey();
        const sessionData = {
            username: username,
            createdAt: Date.now()
        };

        this.#sessionMap.set(sessionId, sessionData);

        return sessionId;
    }

    /**
     * Check if the session exists
     * @param {string} sessionId - Session id
     * @returns {boolean}
     */
    public checkSession(sessionId: string): boolean {
        const session = this.#sessionMap.get(sessionId);

        return session ? true : false;
    }

    /**
     * Destroy session
     * @param {string} sessionId - Session id
     * @returns {boolean}
     */
    public destroySession(sessionId: string): boolean {
        return this.#sessionMap.delete(sessionId);
    }

    /**
     * Refresh an existing session
     * @param {string} sessionId - Session id
     */
    public refreshSession(sessionId: string): boolean {
        const session = this.#sessionMap.get(sessionId);

        if (!session) {
            return false;
        }

        session.createdAt = Date.now();
        return true;
    }

    /**
     * Get all session data
     */
    public getAll(): [string, SessionData][] {
        return Array.from(this.#sessionMap.entries());
    }

    /**
     * Get the session if the session exists
     * @param {string} sessionId - Session id
     * @returns {SessionData | false}
     */
    public getSession(sessionId: string): SessionData | false {
        const session = this.#sessionMap.get(sessionId);

        if (!session) {
            return false;
        }

        return session;
    }

    /**
     * Generate a 64-character session key
     * @returns {string}
     */
    public generateSessionKey(): string {
        let sessionKey = randomBytes(32).toString('hex');

        if (this.#sessionMap.get(sessionKey)) {
            sessionKey = this.generateSessionKey();
        }

        return sessionKey;
    }


    /**
     * Automatically delete expired sessions
     * @private
     */
    #autoCheckExpires(cleanupInterval: number) {
        setInterval(() => {
            const now = Date.now();
            for (const [sessionId, sessionData] of this.#sessionMap) {
                if (now - sessionData.createdAt >= this.#validTime) {
                    this.destroySession(sessionId);
                }
            }
        }, cleanupInterval);
    }
}
