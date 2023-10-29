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
        LIMIT 30
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
            WITH max_vols AS (
                SELECT
                    t.symbol_code,
                    t.vwap,
                    ROUND(SUM(t.trading_value) * 1000) trading_value
                FROM (
                    SELECT
                        opening_date,
                        symbol_code,
                        ROUND(vwap/10)*10 vwap,
                        trading_value
                    FROM
                        symbol_daily_info
                    WHERE
                        opening_date >= ?
                ) t
                GROUP BY
                    t.symbol_code, t.vwap
            )
                
            SELECT
                s.code symbol_code,
                s.name symbol_name,
                d.name division_name,
                bc.name bis_category_name,
                sdi.trading_value trading_value,
                sdi.latter_closing_price closing_price
            FROM
                symbol_daily_info sdi
            INNER JOIN
                kabu.symbols s
            ON
                sdi.symbol_code = s.code
            INNER JOIN
                kabu.divisions d
            ON
                d.code = s.division_code
            AND d.code IN ('01', '02', '03')
            INNER JOIN
                kabu.bis_categories bc
            ON
                s.bis_category_code = bc.code
            INNER JOIN (
                SELECT 
                    main.symbol_code,
                    main.vwap,
                    main.trading_value
                FROM
                    max_vols main
                INNER JOIN (
                    SELECT
                        symbol_code,
                        MAX(trading_value) trading_value
                    FROM
                        max_vols
                    GROUP BY
                        symbol_code
                ) max
                ON
                    main.symbol_code = max.symbol_code
                AND main.trading_value = max.trading_value
            ) i
            ON
                sdi.symbol_code = i.symbol_code
            AND sdi.latter_closing_price >= i.vwap
            WHERE
                sdi.opening_date = ?
            AND i.trading_value > ?
        `
        pool.query(sql, [days[days.length-1], days[0], 1000000000], (err, rows, fields) => {
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
            averageVolume: Number(row.trading_value)
        });
    });

    return { symbols };
});
