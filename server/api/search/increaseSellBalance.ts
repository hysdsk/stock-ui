import * as mysql from "mysql2";
const config = useRuntimeConfig()

interface Symbol {
    symbolCode: string;
    symbolName: string;
    divisionName: string;
    bisCategoryName: string;
    closingPrice: number;
    recentVolume: number;
    averageVolume: number;
    increaseRate: number;
    sellBalance: number;
    buyBalance: number;
    balanceRate: number;
    marketPrice: number;
}

const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPswd,
    database: config.dbName
});

export default defineEventHandler(async (event: any) => {
    let p: Promise<any> = new Promise((resolve, reject) => {
        const sql: string = `
        SELECT DISTINCT
            weekend_date
        FROM
        	kabu.symbol_weekly_info
        ORDER BY
            weekend_date DESC
        LIMIT 5
        `
        pool.query(sql, [], (err, rows, fields) => {
            resolve(rows);
        });
    });
    const weekEndDates: string[] = await p.then((result) => {
        return result?.map((row: any) => { return row.weekend_date });
    });

    p = new Promise((resolve, reject) => {
        const sql: string = `
        SELECT
            c.symbol_code,
            s.name symbol_name,
            d.name division_name,
            b.name bis_category_name,
            d.trading_volume average_volume,
            c.sell_balance,
            c.buy_balance,
            truncate(c.buy_balance / c.sell_balance, 3) balance_rate
        FROM
            kabu.symbol_weekly_info c 
        INNER JOIN
            kabu.symbols s
        ON
            c.symbol_code = s.code
        INNER JOIN
            kabu.divisions d
        ON
            d.code = s.division_code
        INNER JOIN
            kabu.bis_categories b
        ON
            s.bis_category_code = b.code
        INNER JOIN (
            SELECT
                symbol_code,
                truncate(avg(trading_volume) * 1000, 0) trading_volume
            FROM
                kabu.symbol_daily_info
            GROUP BY
                symbol_code) d
        ON
            c.symbol_code = d.symbol_code
        INNER JOIN (
            SELECT
                symbol_code,
                buy_balance,
                sell_balance
            FROM
                kabu.symbol_weekly_info
            WHERE
                weekend_date = ?) p
        ON
            c.symbol_code = p.symbol_code
        WHERE
            c.weekend_date = ?
        AND c.buy_balance < p.buy_balance
        AND c.sell_balance > p.sell_balance
        AND c.sell_balance > c.buy_balance
        AND c.sell_balance > 1000000
        ORDER BY
            balance_rate;
        `
        pool.query(sql, [weekEndDates.pop(), weekEndDates.shift()], (err, rows, fields) => {
            resolve(rows);
        });
    });
    const symbols: Symbol[] = await p.then((reslut) => {
        return reslut?.map((row: any) => <Symbol> {
            symbolCode: String(row.symbol_code),
            symbolName: String(row.symbol_name),
            divisionName: String(row.division_name),
            bisCategoryName: String(row.bis_category_name),
            averageVolume: Number(row.average_volume),
            sellBalance: Number(row.sell_balance),
            buyBalance: Number(row.buy_balance),
            balanceRate: Number(row.balance_rate)
        });
    });

    return { symbols };
});
