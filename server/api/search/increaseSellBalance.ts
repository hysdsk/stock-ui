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
    lendBalance: number;
    lendSlope: number;
    lendIntercept: number;
    buySlope: number;
    buyIntercept: number;
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
            SELECT
                s.code symbol_code,
                s.name symbol_name,
                d.name division_name,
                latest_swi.lend_balance lend_balance,
                latest_swi.buy_balance buy_balance,
                rl.lend_slope lend_slope,
                rl.lend_intercept lend_intercept,
                rl.buy_slope buy_slope,
                rl.buy_intercept buy_intercept
            FROM
                kabu.symbols s
            INNER JOIN
                kabu.divisions d
            ON
                s.division_code = d.code
            AND
                s.division_code in ('02', '03')
            INNER JOIN (
                SELECT
                    symbol_code,
                    lend_balance,
                    buy_balance
                FROM
                    symbol_weekly_info
                WHERE
                    weekend_date = (
                        SELECT MAX(weekend_date) FROM symbol_weekly_info
                    )
            ) latest_swi
            ON
                s.code = latest_swi.symbol_code
            AND
                latest_swi.lend_balance > 0
            AND
                latest_swi.buy_balance > 0
            INNER JOIN (
                SELECT
                    swi.symbol_code,
                    count(*) weeks_count,
                    (COUNT(*) * SUM(swi.row_no * swi.lend_balance) - SUM(swi.row_no) * SUM(swi.lend_balance)) / (COUNT(*) * SUM(swi.row_no * swi.row_no) - SUM(swi.row_no) * SUM(swi.row_no)) AS lend_slope,
                    (SUM(swi.lend_balance) - ((COUNT(*) * SUM(swi.row_no * swi.lend_balance) - SUM(swi.row_no) * SUM(swi.lend_balance)) / (COUNT(*) * SUM(swi.row_no * swi.row_no) - SUM(swi.row_no) * SUM(swi.row_no))) * SUM(swi.row_no)) / COUNT(*) AS lend_intercept,
                    (COUNT(*) * SUM(swi.row_no * swi.buy_balance) - SUM(swi.row_no) * SUM(swi.buy_balance)) / (COUNT(*) * SUM(swi.row_no * swi.row_no) - SUM(swi.row_no) * SUM(swi.row_no)) AS buy_slope,
                    (SUM(swi.buy_balance) - ((COUNT(*) * SUM(swi.row_no * swi.buy_balance) - SUM(swi.row_no) * SUM(swi.buy_balance)) / (COUNT(*) * SUM(swi.row_no * swi.row_no) - SUM(swi.row_no) * SUM(swi.row_no))) * SUM(swi.row_no)) / COUNT(*) AS buy_intercept
                FROM
                    (
                        SELECT
                            ROW_NUMBER() OVER(ORDER BY weekend_date) AS row_no,
                            symbol_code,
                            weekend_date,
                            lend_balance + sell_balance lend_balance,
                            buy_balance
                        FROM
                            symbol_weekly_info
                        WHERE
                            weekend_date >= DATE_FORMAT(CURDATE() - INTERVAL 6 MONTH, "%Y%m%d")
                    ) AS swi
                GROUP BY
                    swi.symbol_code
            ) rl
            ON
                s.code = rl.symbol_code
            AND
                rl.lend_slope > 0
            AND
                rl.buy_slope > 0
            AND
                latest_swi.lend_balance >= rl.lend_intercept + (rl.lend_slope * (rl.weeks_count - 1))
            AND
                (latest_swi.lend_balance / (s.total_stocks * 1000)) * 100 >= 20
        `
        pool.query(sql, [], (err, rows, fields) => {
            resolve(rows);
        });
    });
    let symbols: Symbol[] = await p.then((result) => {
        return result?.map((row: any) => <Symbol>{
            symbolCode: row.symbol_code,
            symbolName: row.symbol_name,
            divisionName: row.division_name,
            lendBalance: row.lend_balance,
            buyBalance: row.buy_balance,
            lendSlope: row.lend_slope,
            lendIntercept: row.lend_intercept,
            buySlope: row.buy_slope,
            buyIntercept: row.buy_intercept
        });
    });

    return { symbols };
});
