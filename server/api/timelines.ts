import * as mysql from "mysql2";
const config = useRuntimeConfig()

const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPswd,
    database: config.dbName
});

export default defineEventHandler(async (event: any) => {
    const query = getQuery(event);
    const results = await new Promise((resolve, reject) => {
        const sql = `
            SELECT
                opening_date,
                symbol_code,
                tick_time,
                opening_price,
                high_price,
                low_price,
                close_price,
                vwap,
                large_buy_value,
                middle_buy_value,
                small_buy_value,
                large_sell_value,
                middle_sell_value,
                small_sell_value,
                bid_limit_order,
                ask_limit_order,
                bid_market_order,
                ask_market_order,
                bid_over_order,
                ask_under_order
            FROM
                time_lines
            WHERE
                opening_date = ?
            AND
                tick_time >= ?;
        `
        pool.query(sql, [query.today, query.lastTime], (err, rows, fields) => {
            resolve(rows);
        });
    });
    return results;
});
