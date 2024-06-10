import * as mysql from "mysql2";
const config = useRuntimeConfig()

const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPswd,
    database: config.dbName,
    timezone: "+00:00",
});

export default defineEventHandler(async (event: any) => {
    const query = getQuery(event);
    const results = await new Promise((resolve, reject) => {
        const sql = `
            SELECT
                tl.symbol_code,
                s.name symbol_name,
                tl.current_datetime,
                tl.current_price,
                tl.opening_price,
                tl.previous_close_price,
                tl.opening_price,
                tl.vwap,
                tl.trading_value,
                tl.recent_value,
                tl.bid_sign,
                tl.ask_sign
            FROM
                top_line tl
            LEFT JOIN
                symbols s
            ON
                tl.symbol_code = s.code
            WHERE
                tl.opening_date = ?
        `
        pool.query(sql, [query.today], (err, rows, fields) => {
            resolve(rows);
        });
    });

    return results;
});
