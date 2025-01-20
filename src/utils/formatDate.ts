/**
 * 把時間統一格式化成 YYYY-MM-DD 給資料庫 (DATE 格式)
 * @param date - 時間格式
 * @returns - YYYY-MM-DD
 */
const formatDate = (date: string | number | Date | null) => {
    if (date === null) {
        return null;
    }

    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) {
        month = '0' + month;
    }
    if (day.length < 2) {
        day = '0' + day;
    }

    return [year, month, day].join('-');
};

/**
 * 檢查字串是否符合 YYYY-MM-DD HH:mm:ss 格式 (ISO 8601)
 * @param {string} dateTime - 要檢查的日期時間字串
 * @returns {boolean} - 如果符合格式則返回 true，否則返回 false
 */
const checkValidDateTime = (dateTime: string): boolean => {
    const timeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

    // 檢查格式
    if (!timeRegex.test(dateTime)) {
        return false;
    }

    // 檢查日期是否有效
    const [datePart, timePart] = dateTime.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);

    const date = new Date(year, month - 1, day, hour, minute, second);

    return (date.getFullYear() === year) &&
        (date.getMonth() === month - 1) &&
        (date.getDate() === day) &&
        (date.getHours() === hour) &&
        (date.getMinutes() === minute) &&
        (date.getSeconds() === second);
};

/**
 * 檢查字串是否為有效的 Unix Timestamp
 * @param {string} timestamp - Timestamp string
 * @returns {boolean}
 */
const checkValidUnixTimestamp = (timestamp: string): boolean => {
    // 檢查是否為正整數的字串
    if (!/^\d+$/.test(timestamp)) {
        return false;
    }

    const num = Number(timestamp);
    const date = new Date(num * 1000);

    if (!date.getTime()) {
        return false;
    }

    // 檢查範圍
    const minTimestamp = 0;             // Unix epoch
    // const maxTimestamp = 2147483647;    // 2038-01-19 03:14:07 UTC (不檢查最大值)

    return num >= minTimestamp;// && num <= maxTimestamp;
};

/**
 * 檢查日期字串是否符合 YYYY-MM-DD 格式
 * @param {string} dateString - 要檢查的日期字串
 * @returns {boolean}
 */
const isValidDateString = (dateString: string): boolean => {
    return (/^\d{4}-\d{2}-\d{2}$/).test(dateString);
}

export { checkValidDateTime, checkValidUnixTimestamp, formatDate, isValidDateString };