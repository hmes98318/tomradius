import { EventEmitter } from 'events';
import { OPType } from '../../@types/Logger.types.js';

import type { Database } from '../../lib/database/MySQL.js';
import type { LoggerEvents } from '../../@types/Logger.types.js';


export class Logger extends EventEmitter {
    #db: Database;

    constructor(db: Database) {
        super();

        this.#db = db;

        this.#startListening();
    }

    public emit<EventName extends keyof LoggerEvents>(event: EventName, ...args: Parameters<LoggerEvents[EventName]>): boolean {
        return super.emit(event, ...args);
    }

    public on<EventName extends keyof LoggerEvents>(event: EventName, listener: LoggerEvents[EventName]): this {
        return super.on(event, listener);
    }

    public once<EventName extends keyof LoggerEvents>(event: EventName, listener: LoggerEvents[EventName]): this {
        return super.once(event, listener);
    }


    /**
     * 外部 emit()
     * class 內 listen
     */
    #startListening() {
        /**
         * Login event
         * @param {string} user - Ubuntu user name (max length 64)
         * @param {string} ip - IP address (max length 45)
         * @param {boolean} isSuccess - 此次操作紀錄是否成功
         */
        this.on('normal-login', async (user: string, ip: string, isSuccess: boolean = false) => {
            if (!user || !ip) {
                throw TypeError(`Logger "normal-login" event invalid parameter. user: ${user}, ip: ${ip}, isSuccess: ${isSuccess}`);
            }


            try {
                /**
                 * CREATE PROCEDURE InsertRecord_Login(
                 * IN p_creator VARCHAR(64), 
                 * IN p_op_type TINYINT UNSIGNED,
                 * IN p_success BOOLEAN,
                 * IN p_ip VARCHAR(45)
                 * )
                 */
                const query = `CALL InsertRecord_Login(?, ?, ?, ?);`;
                await this.#db.query(query, [
                    user,
                    OPType.LOGIN,
                    isSuccess ? true : false,
                    this.#trimStringLength(ip, 45)
                ]);
            } catch (error) {
                console.log(`Logger "normal-login" event error [user: ${user}, ip: ${ip}]`, error);
                return false;
            }

            return true;
        });

        /**
         * Radius operation record event
         * @param {string} user - Ubuntu user name (max length 64)
         * @param {OPType} opType - 操作類型 (OPType.RAD_*)
         * @param {boolean} isSuccess - 此次操作紀錄是否成功
         * @param {string | null} macAddress - MAC address 修改描述 (max length 255)
         * @param {string | null} computerName - 電腦名稱修改描述 (max length 255)
         * @param {string | null} employeeName - 員工名稱修改描述 (max length 255)
         * @param {string | null} description - 描述修改描述 (max length 255)
         */
        this.on('radcheck', async (
            user: string,
            opType: OPType,
            isSuccess: boolean = false,
            macAddress: string | null = null,
            computerName: string | null = null,
            employeeName: string | null = null,
            description: string | null = null
        ) => {
            if (
                (!user || !opType) ||
                ![OPType.RAD_ADD, OPType.RAD_EDIT, OPType.RAD_DELETE].includes(opType)
            ) {
                throw TypeError(`Logger radcheck event invalid parameter. opType: ${opType}, user: ${user}`);
            }


            try {
                /**
                 * CREATE PROCEDURE InsertRecord_Rad(
                 * IN p_creator VARCHAR(64), 
                 * IN p_op_type TINYINT UNSIGNED,
                 * IN p_success BOOLEAN,
                 * IN p_radcheck_id INT UNSIGNED,
                 * IN p_mac_address VARCHAR(255),
                 * IN p_computer_name VARCHAR(255),
                 * IN p_employee_name VARCHAR(255),
                 * IN p_description VARCHAR(255)
                 * )
                 */
                const query = `CALL InsertRecord_Rad(?, ?, ?, ?, ?, ?, ?);`;
                await this.#db.query(query, [
                    user,
                    opType,
                    isSuccess ? true : false,
                    macAddress === null ? null : `"${this.#trimStringLength(macAddress, 255)}"`,
                    computerName === null ? null : `"${this.#trimStringLength(computerName, 255)}"`,
                    employeeName === null ? null : `"${this.#trimStringLength(employeeName, 255)}"`,
                    description === null ? null : `"${this.#trimStringLength(description, 255)}"`
                ]);
            } catch (error) {
                console.log(`Logger radcheck event error [opType: ${opType}, user: ${user}]`, error);
                return false;
            }

            return true;
        });
    }


    #trimStringLength(input: string, maxLength: number): string {
        return input.length > maxLength ? input.substring(0, maxLength) : input;
    }

}