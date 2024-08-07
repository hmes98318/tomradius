import { App } from "./express/App.js";
import { Authorizer } from "./lib/session-manager/Authorizer.js";
import { Database } from "./lib/database/MySQL.js";
import { Logger } from "./lib/logger/Logger.js";
import { SessionManager } from "./lib/session-manager/SessionManager.js";
import { loadEnviornment } from "./loader/loadEnviornment.js";

import { config } from "../config.js";

import type { Config } from "./@types/Config.types.js";


export class Controller {
    public config: Config;
    public app?: App;

    #db: Database;
    #logger: Logger;
    #sessionManager: SessionManager;


    constructor() {
        this.config = config;
        const env = loadEnviornment();

        this.#db = new Database(env.dbConfig);
        this.#logger = new Logger(this.#db);
        this.#sessionManager = new SessionManager(new Authorizer(), this.config.sessionManager, this.config.ipBlocker);
        this.app = new App(this.config.apiConfig, this.#db, this.#sessionManager, this.#logger);
    }


    /**
     * Start express framework
     */
    public async initializeExpress(): Promise<void> {
        await this.app?.setRoutes();
        this.app?.startListening();
    }
}