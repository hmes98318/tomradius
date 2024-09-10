import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';

import bodyParser from 'body-parser';
import cookie from "cookie";
import express, { Request, Response } from 'express';
import { LoadType } from '../@types/Express.types.js';

import type { Database } from '../lib/database/MySQL.js';
import type { Logger } from '../lib/logger/Logger.js';
import type { SessionManager } from '../lib/session-manager/SessionManager.js';
import type { AppConfig } from '../@types/Config.types.js';
import type { EventListeners, Route } from '../@types/Express.types.js';


export interface AppEvents {
    once: EventListeners<this>;
    on: EventListeners<this>;
}


export class App extends EventEmitter implements AppEvents {
    public config: AppConfig;
    public readonly sitePath: string;

    #app;                               // Express
    #db: Database;                      // Database
    #routes: Route[] = [];              // Routes cache
    #sessionManager: SessionManager;    // Session manager
    #logger: Logger;                    // Logger


    constructor(config: AppConfig, db: Database, sessionManager: SessionManager, logger: Logger) {
        super();
        this.config = config;
        this.sitePath = config.siteDir;

        this.#db = db;
        this.#sessionManager = sessionManager;
        this.#logger = logger;

        this.#app = express();
        this.#setMiddleware();
        if (config.enableSite) this.#setSite();
    }


    /**
     * set up the Express middleware
     * @private
     */
    #setMiddleware(): void {
        this.#app.use(bodyParser.json());
        this.#app.use(bodyParser.urlencoded({ extended: true }));
        // this.#app.use(cors());

        this.emit('debug', 'Set express middleware succeeded');
    }

    /**
     * @private
     */
    #setSite(): void {
        this.#app.use(express.static(this.sitePath));
    }

    /**
     * start express framework
     */
    public startListening(): void {
        this.#app.listen(this.config.port, this.config.host, () => {
            this.emit('debug', `Server listening on http://${this.config.host}:${this.config.port}`);
        });
    }

    /**
     * Set up the routes for the application
     * @returns {Promise<void>}
     */
    public async setRoutes(): Promise<void> {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const apiPath = path.join(__dirname, 'api');

        const stack = [apiPath];
        const registeredPaths = new Set<string>();

        this.emit('debug', '---------- loading routes ----------');

        while (stack.length > 0) {
            const currentPath = stack.pop();
            const files = await fs.promises.readdir(currentPath!, { withFileTypes: true });

            for (const file of files) {
                const filePath = path.join(currentPath!, file.name);

                if (file.isDirectory()) {
                    stack.push(filePath);
                }
                else if (file.name.endsWith('.ts') || file.name.endsWith('.js')) {
                    const routePath = path.join('file://', filePath);
                    const route: Route = await import(routePath);

                    // 檢查路徑是否已註冊
                    if (registeredPaths.has(route.path)) {
                        throw new Error(`Duplicate API detected, please ensure all API paths are unique. API: ${route.path}. File path: ${filePath}.`);
                    }

                    registeredPaths.add(route.path);
                    this.#routes.push(route);

                    this.emit('debug', `${route.method}\t${route.path}`);
                }
            }
        }

        registeredPaths.clear();

        this.emit('debug', '---------- loading routes finished ----------');

        this.#registerRoutes();
    }

    /**
     * Register the routes in the Express app
     * @private
     */
    #registerRoutes() {
        this.emit('debug', '---------- registering routes ----------');

        for (const routeModule of this.#routes) {
            const { path, method, loginRequired, execute } = routeModule;

            switch (method) {
                case 'GET': {
                    if (loginRequired) {
                        this.#app.get(path, this.#authenticateLogin(), this.#handleRouteExecution(execute));
                    }
                    else {
                        this.#app.get(path, this.#handleRouteExecution(execute));
                    }
                    this.emit('debug', `${method}\t${path}`);
                    break;
                }
                case 'POST': {
                    if (loginRequired) {
                        this.#app.post(path, this.#authenticateLogin(), this.#handleRouteExecution(execute));
                    }
                    else {
                        this.#app.post(path, this.#handleRouteExecution(execute));
                    }
                    this.emit('debug', `${method}\t${path}`);
                    break;
                }
                case 'PUT': {
                    if (loginRequired) {
                        this.#app.put(path, this.#authenticateLogin(), this.#handleRouteExecution(execute));
                    }
                    else {
                        this.#app.put(path, this.#handleRouteExecution(execute));
                    }
                    this.emit('debug', `${method}\t${path}`);
                    break;
                }
                case 'DELETE': {
                    if (loginRequired) {
                        this.#app.delete(path, this.#authenticateLogin(), this.#handleRouteExecution(execute));
                    }
                    else {
                        this.#app.delete(path, this.#handleRouteExecution(execute));
                    }
                    this.emit('debug', `${method}\t${path}`);
                    break;
                }
                default: {
                    throw new Error(`Invalid HTTP method "${method}" for route: ${path}`);
                }
            }
        }

        this.#app.get('*', (req, res) => res.sendFile(path.join(this.sitePath, 'index.html')));
        this.#app.all('*', this.#handleRouteNotFoundError);
        this.emit('debug', '---------- registering routes finished ----------');
    }

    /**
     * Middleware for login authentication
     * @private
     */
    #authenticateLogin(): (req: Request, res: Response, next: () => void) => void {
        return (req: Request, res: Response, next: () => void): void => {
            const cookies = cookie.parse(req.headers.cookie as string || '');
            const cookieSessionId = cookies.sessionId;

            if (!cookieSessionId) {
                // 如果 session 不存在，返回未授權的錯誤
                res.json({
                    loadType: LoadType.UNAUTHORIZED,
                    data: []
                });

                this.emit('requestFail', (req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip), 'UNAUTHORIZED', req.path);
                return;
            }


            const session = this.#sessionManager.getSession(cookieSessionId);

            if (!session) {
                res.json({
                    loadType: LoadType.UNAUTHORIZED,
                    data: []
                });

                this.emit('requestFail', (req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip), 'UNAUTHORIZED', req.path);
                return;
            }


            // 刷新 user session
            this.#sessionManager.refreshSession(cookieSessionId);

            return next();
        };
    }

    /**
     * Handle the execution of the route
     * @private
     * @param {Function} execute - The route execution function
     * @returns {Function} - The route handling function
     */
    #handleRouteExecution(execute: Route["execute"]): (req: Request, res: Response) => Promise<void> {
        return async (req: Request, res: Response): Promise<void> => {
            this.emit('request', req);

            try {
                const result = await execute(req, res, this.config, this.#db, this.#sessionManager, this.#logger);
                res.json(result);

                this.emit('response', res);
            } catch (error) {
                this.emit('error', error);
                this.#handleServerError(res, error);
            }
        };
    }

    /**
     * Handle unmatched paths
     * @private
     */
    #handleRouteNotFoundError(req: Request, res: Response): void {
        res.json({
            loadType: LoadType.PATH_ERROR,
            data: []
        });
    }

    /**
     * Handle unmatched paths
     * @private
     */
    #handleServerError(res: Response, error: any): void {
        res.status(500).json({
            loadType: LoadType.SERVER_ERROR,
            error: error
        });
    }
}