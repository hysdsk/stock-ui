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
            TRIM(s.name) symbol_name,
            d.name division_name,
            b.name bis_category_name,
            recent.closing_price,
            aggregated.average_volume,
            s.total_stocks * recent.closing_price * 10000 market_price
        FROM
            symbols s
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
                latter_closing_price closing_price
            FROM
                kabu.symbol_daily_info
            WHERE
                opening_date = ?
        ) recent
        ON
            s.code = recent.symbol_code
        INNER JOIN (
            SELECT
                sdi.symbol_code symbol_code,
                TRUNCATE(AVG(sdi.trading_volume) * 1000, 0) average_volume,
                MAX(sdi.first_high_price) - MIN(sdi.first_high_price) +
                MAX(sdi.latter_high_price) - MIN(sdi.latter_high_price) diff_range
            FROM
                kabu.symbol_daily_info sdi
            WHERE
                sdi.opening_date >= ?
            GROUP BY
                sdi.symbol_code
        ) aggregated
        ON
            s.code = aggregated.symbol_code
        WHERE
            s.total_stocks is not null
        AND
            (s.total_stocks * recent.closing_price) < 3000000
        AND
            recent.closing_price <= 500
        AND
            aggregated.average_volume < 500000
        ORDER BY
            aggregated.diff_range
        `
        pool.query(sql, [days.shift(), days.pop()], (err, rows, fields) => {
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
            closingPrice: Number(row.closing_price),
            marketPrice: Number(row.market_price)
        });
    });

    return { symbols };
});
