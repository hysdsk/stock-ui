import * as mysql from "mysql2";
import dayjs from "dayjs";
dayjs.locale("ja");
const config = useRuntimeConfig()

interface SymbolWeeklyInfo {
    weekendDate: string;
    sellBalance: number;
    buyBalance: number;
    lendBalance: number;
    lendBalanceRegressionLine: number;
    buyBalanceRegressionLine: number;
}

interface RegressionLine {
    slope: number;
    intercept: number;
}

interface RegressionLines {
    lendBalance: RegressionLine;
    buyBalance: RegressionLine;
}

const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPswd,
    database: config.dbName,
    namedPlaceholders: true
});

export default defineEventHandler(async (event: any) => {
    const query = getQuery(event);
    let p: Promise<any> = new Promise((resolve, reject) => {
        const sql: string = `
        SELECT
            weekend_date,
            sell_balance,
            buy_balance,
            lend_balance
        FROM
            kabu.symbol_weekly_info
        WHERE
            symbol_code = :symbol_code
        AND
            weekend_date >= :from_date
        AND
            weekend_date <= :to_date
        `;
        const statements = {
            symbol_code: query.code,
            from_date: query.from,
            to_date: query.to
        }
        pool.query(sql, statements, (err, rows, fields) => {
            resolve(rows);
        });
    });
    let symbolWeeklyInfo: SymbolWeeklyInfo[] = [];
    await p.then((result) => {
        symbolWeeklyInfo = result?.map((e: any) => <SymbolWeeklyInfo>{
            weekendDate: String(e.weekend_date),
            sellBalance: Number(e.sell_balance),
            buyBalance: Number(e.buy_balance),
            lendBalance: Number(e.lend_balance)
        });
    });

    p = new Promise((resolve, reject) => {
        const sql: string = `
        SELECT
            (COUNT(*) * SUM(t.row_no * t.lend_balance) - SUM(t.row_no) * SUM(t.lend_balance)) / (COUNT(*) * SUM(t.row_no * t.row_no) - SUM(t.row_no) * SUM(t.row_no)) AS lend_slope,
            (SUM(t.lend_balance) - ((COUNT(*) * SUM(t.row_no * t.lend_balance) - SUM(t.row_no) * SUM(t.lend_balance)) / (COUNT(*) * SUM(t.row_no * t.row_no) - SUM(t.row_no) * SUM(t.row_no))) * SUM(t.row_no)) / COUNT(*) AS lend_intercept,
            (COUNT(*) * SUM(t.row_no * t.buy_balance) - SUM(t.row_no) * SUM(t.buy_balance)) / (COUNT(*) * SUM(t.row_no * t.row_no) - SUM(t.row_no) * SUM(t.row_no)) AS buy_slope,
            (SUM(t.buy_balance) - ((COUNT(*) * SUM(t.row_no * t.buy_balance) - SUM(t.row_no) * SUM(t.buy_balance)) / (COUNT(*) * SUM(t.row_no * t.row_no) - SUM(t.row_no) * SUM(t.row_no))) * SUM(t.row_no)) / COUNT(*) AS buy_intercept
        FROM
            (
                SELECT
                    ROW_NUMBER() OVER(ORDER BY weekend_date) AS row_no,
                    weekend_date,
                    lend_balance,
                    buy_balance
                FROM
                    symbol_weekly_info
                WHERE
                    symbol_code = :symbol_code
                AND
                    weekend_date >= :from_date
                AND
                    weekend_date <= :to_date
            ) AS t
        `;
        const statements = {
            symbol_code: query.code,
            from_date: query.from,
            to_date: query.to
        }
        pool.query(sql, statements, (err, rows, fields) => {
            resolve(rows);
        });
    });
    let regressionLines: RegressionLines;
    await p.then((result) => {
        regressionLines = result?.map((e: any) => <RegressionLines>{
            lendBalance: <RegressionLine> {
                slope: Number(e.lend_slope),
                intercept: Number(e.lend_intercept)
            },
            buyBalance: <RegressionLine> {
                slope: Number(e.buy_slope),
                intercept: Number(e.buy_intercept)
            }
        })[0];
    });

    symbolWeeklyInfo?.forEach((e: SymbolWeeklyInfo, i: number) => {
        const rl = regressionLines
        e.lendBalanceRegressionLine = rl.lendBalance.intercept + (rl.lendBalance.slope * i)
        e.buyBalanceRegressionLine = rl.buyBalance.intercept + (rl.buyBalance.slope * i)
    });

    const weeklyInfoForChart = {
        weekendDate: symbolWeeklyInfo?.map((e) => {
            const year = e.weekendDate.substring(0, 4);
            const month = e.weekendDate.substring(4, 6);
            const day = e.weekendDate.substring(6, 8);
            return dayjs(`${year}-${month}-${day}`).format("YYYY/MM/DD（dd）");
        }),
        sellBalance: symbolWeeklyInfo?.map((e) => {return e.sellBalance}),
        buyBalance: symbolWeeklyInfo?.map((e) => {return e.buyBalance}),
        lendBalance: symbolWeeklyInfo?.map((e) => {return e.lendBalance}),
        lendBalanceRegressionLine: symbolWeeklyInfo?.map((e) => {return e.lendBalanceRegressionLine}),
        buyBalanceRegressionLine: symbolWeeklyInfo?.map((e) => {return e.buyBalanceRegressionLine})
    }

    return { weeklyInfoForChart }
});
