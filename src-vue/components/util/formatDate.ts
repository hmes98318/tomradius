/**
 * 將 UTC+8 時間字串轉換為 UTC+8 時間字串，並格式化為 'YYYY-MM-DD HH:mm:ss'
 * @param {string} utcDateString - ISO 8601 時間格式 (ex: '2024-08-12T07:37:42.000Z')
 * @returns {string} - 'YYYY-MM-DD HH:mm:ss'
 */
const convertUTCtoLocal = (utcDateString: string): string => {
    const utcDate = new Date(utcDateString);

    const localDateString = utcDate.toLocaleString('zh-TW', {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    // 'YYYY/MM/DD HH:mm:ss' -> 'YYYY-MM-DD HH:mm:ss'
    const formattedDate = localDateString.replaceAll('/', '-');

    return formattedDate;
};

/**
 * 把時間統一格式化成 YYYY-MM-DD (DATE 格式)
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

export { convertUTCtoLocal, formatDate };