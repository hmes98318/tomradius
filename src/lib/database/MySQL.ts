/**
 * Use the 'mysql2' module instead of the 'mysql' module 
 * because the mysql module does not support promise syntax.
 * 
 * Caching_sha2_password authentication was introduced in MySQL 8.0, 
 * but the mysql module does not implement this function 
 * and can only use the less secure mysql_native_password authentication.
 * 
 * https://github.com/sidorares/node-mysql2
 * https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server
 */
import mysql from 'mysql2/promise';


export class Database {
    #pool: mysql.Pool;

    constructor(config: mysql.PoolOptions) {
        this.#pool = mysql.createPool(config);
    }


    /** 
     * Get mariadb connection
     * @private
     */
    async #getConnection() {
        return await this.#pool.getConnection();
    }

    /**
     * Execute SQL query
     * @param {string} sql - The SQL query string to be executed.
     * @throws - If there is an error executing the query, an error is thrown.
     * @returns {Promise<mysql.QueryResult>} - A promise that resolves with an array of rows matching the query.
     */
    public async query(sql: string, value: any = null): Promise<mysql.QueryResult> {
        let conn;
        try {
            conn = await this.#getConnection();
            const [rows, fields] = await conn.query(sql, value);
            return rows;
        }
        catch (error) {
            throw error;
        }
        finally {
            if (conn) conn.release();
        }
    }
}