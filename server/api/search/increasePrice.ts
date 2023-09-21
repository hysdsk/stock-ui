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
        	opening_date
        FROM
        	kabu.symbol_daily_info
        ORDER BY
        	opening_date DESC
        LIMIT 60
        `
        pool.query(sql, [], (err, rows, fields) => {
            resolve(rows);
        });
    });
    const days: string[] = await p.then((result) => {
        return result?.map((row: any) => { return row.opening_date });
    });
    
    p = new Promise((resolve, reject) => {
        const sql: string = `
        SELECT
            s.code symbol_code,
            s.name symbol_name,
            d.name division_name,
            bc.name bis_category_name,
            today.latter_closing_price closing_price,
            truncate(
                ( today.trading_value
                + yesterday.trading_value
                + two_days_ago.trading_value) * 1000 / 3,
            0) average_volume,
            ROUND(today.latter_closing_price / two_days_ago.first_opening_price * 100 - 100, 0) increase_rate
        FROM
            kabu.symbols s
        INNER JOIN
            kabu.divisions d
        ON
            d.code = s.division_code
        INNER JOIN
            kabu.bis_categories bc
        ON
            s.bis_category_code = bc.code
        INNER JOIN (
            SELECT
                symbol_code,
                first_opening_price,
                latter_closing_price,
                trading_value
            FROM
                kabu.symbol_daily_info
            WHERE
                opening_date = ?
        ) today
        ON
            s.code = today.symbol_code
        INNER JOIN (
            SELECT
                symbol_code,
                first_opening_price,
                latter_closing_price,
                trading_value
            FROM
                kabu.symbol_daily_info
            WHERE
                opening_date = ?
        ) yesterday
        ON
            s.code = yesterday.symbol_code
        INNER JOIN (
            SELECT
                symbol_code,
                first_opening_price,
                latter_closing_price,
                trading_value
            FROM
                kabu.symbol_daily_info
            WHERE
                opening_date = ?
        ) two_days_ago
        ON
            s.code = two_days_ago.symbol_code
        WHERE
            today.latter_closing_price > today.first_opening_price
        AND
            today.latter_closing_price > yesterday.latter_closing_price
        AND
            yesterday.latter_closing_price > yesterday.first_opening_price
        AND
            yesterday.latter_closing_price > two_days_ago.latter_closing_price
        AND
            two_days_ago.latter_closing_price > two_days_ago.first_opening_price
        AND
            ( today.trading_value
            + yesterday.trading_value
            + two_days_ago.trading_value)
            / 3 > 100
        ORDER BY
            increase_rate DESC
        `
        pool.query(sql, [days[0], days[1], days[2]], (err, rows, fields) => {
            resolve(rows);
        });
    });
    const symbols: Symbol[] = await p.then((reslut) => {
        return reslut?.map((row: any) => <Symbol> {
            symbolCode: String(row.symbol_code),
            symbolName: String(row.symbol_name),
            divisionName: String(row.division_name),
            bisCategoryName: String(row.bis_category_name),
            closingPrice: Number(row.closing_price),
            averageVolume: Number(row.average_volume),
            increaseRate: Number(row.increase_rate)
        });
    });

    return { symbols };
});
