import { formatDate } from "./formatDate.js";


const rangeCheck = {
    /**
     * 檢查是否為 SQL INT 範圍
     * -2,147,483,648 (-2^31) 到 2,147,483,647 (2^31 – 1)
     * @param num - Number
     * @returns {true | false} - true 範圍內, false: 範圍外
     */
    int: (num: number): true | false => {
        return Number.isInteger(num) && (num >= Math.pow(-2, 31) && num <= Math.pow(2, 31) - 1);
    },

    /**
     * 檢查是否為 SQL INT_UNSIGNED 範圍
     * 0 到 4,294,967,295
     * @param num - Number
     * @returns {true | false} - true 範圍內, false: 範圍外
     */
    int_unsigned: (num: number): true | false => {
        return Number.isInteger(num) && (num >= 0 && num <= 4294967295);
    },

    /**
     * 檢查是否為 SQL SMALLINT_UNSIGNED 範圍
     * 0 到 65,535
     * @param num - Number
     * @returns {true | false} - true 範圍內, false: 範圍外
     */
    smallint_unsigned: (num: number): true | false => {
        return Number.isInteger(num) && (num >= 0 && num <= 65535);
    },

    /**
     * 檢查是否為 SQL TINYINT_UNSIGNED 範圍
     * 0 到 255
     * @param num - Number
     * @returns {true | false} - true 範圍內, false: 範圍外
     */
    tinyint_unsigned: (num: number): true | false => {
        return Number.isInteger(num) && (num >= 0 && num <= 255);
    },

    /**
     * 檢查字串是否在指定長度內
     * @param str - String
     * @param len - 字串最大長度
     * @param equal - 待檢查字串是否需與指定長度相等
     * @returns {true | false} - true 範圍內, false: 範圍外
     */
    string_length: (str: string, len: number, equal: boolean = false): true | false => {
        if (equal) {
            return str.length === len;
        }
        else {
            return str.length <= len;
        }
    },

    /**
     * 檢查日期格式是否符合 SQL DATE
     * YYYY-MM-DD
     * @param date - 日期
     * @returns {true | false} - true 符合, false: 不符合
     */
    date: (date: string): true | false => {
        return date === formatDate(date);
    }
}

export { rangeCheck };