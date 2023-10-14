import * as mysql from "mysql2";
import dayjs from 'dayjs';
dayjs.locale("ja");
const config = useRuntimeConfig()

interface Symbol {
    symbolCode: string;
    symbolName: string;
    exchangeName: string;
    divisionName: string;
    bisCategoryName: string;
    marketCapitalization: number;
    totalStocks: number;
    fiscalYearEndBasic: number
}

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
    database: config.dbName
});

export default defineEventHandler(async (event: any) => {
    const query = getQuery(event);
    if (query.code === undefined || query.period === undefined) {
        return [];
    }
    const symbolCode = query.code;
    let p: Promise<any> = new Promise((resolve, reject) => {
        const symbol_detail_sql: string = `
        SELECT
            s.code,
            s.name symbol_name,
            e.name exchange_name,
            d.name division_name,
            bc.name bis_category_name,
            s.total_market_value market_capitalization,
            s.total_stocks * 1000 total_stocks,
            s.fiscal_year_end_basic
        FROM
            kabu.symbols s
        INNER JOIN
            kabu.bis_categories bc
        ON
            s.bis_category_code = bc.code
        INNER JOIN
            kabu.exchanges e
        ON
            s.exchange_code = e.code
        LEFT JOIN
            kabu.divisions d
        ON
            s.division_code = d.code
        INNER JOIN (
            SELECT
                symbol_code,
                latter_closing_price
            FROM
                kabu.symbol_daily_info
            WHERE
                symbol_code = ?
            ORDER BY
                opening_date DESC
            LIMIT 1) sdi
        ON
            s.code = sdi.symbol_code
        WHERE
            s.code = ? 
        `;
        pool.query(symbol_detail_sql, [symbolCode, symbolCode], (err, rows, fields) => {
            resolve(rows);
        });
    });
    let symbol: Symbol = await p.then((result) => {
        return result?.map((e: any) => <Symbol>{
            symbolCode: String(e.code),
            symbolName: String(e.symbol_name),
            exchangeName: String(e.exchange_name),
            divisionName: String(e.division_name),
            bisCategoryName: String(e.bis_category_name),
            marketCapitalization: Number(e.market_capitalization),
            totalStocks: Number(e.total_stocks),
            fiscalYearEndBasic: Number(e.fiscal_year_end_basic)
        })[0];
    });

    const month: number = Number(query.period);
    let startDate: string = dayjs().subtract(month + 1, "M").format("YYYYMMDD");

    p = new Promise((resolve, reject) => {
        const sql: string = `
        SELECT
            weekend_date,
            sell_balance,
            buy_balance,
            lend_balance
        FROM
            kabu.symbol_weekly_info
        WHERE
            symbol_code = ?
        AND
            weekend_date >= ?
        `;
        pool.query(sql, [symbolCode, startDate], (err, rows, fields) => {
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
                    symbol_code = ?
                AND weekend_date >= ?
            ) AS t
        `;
        pool.query(sql, [symbolCode, startDate], (err, rows, fields) => {
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


    // 表示対象期間内に短縮している
    startDate = dayjs().subtract(month, "M").format("YYYYMMDD");
    symbolWeeklyInfo = symbolWeeklyInfo.filter(e => Number(e.weekendDate) >= Number(startDate));

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

    return {
        symbol,
        weeklyInfoForChart
    }
});
