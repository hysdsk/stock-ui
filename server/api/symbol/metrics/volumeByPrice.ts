import * as mysql from "mysql2";
import dayjs from 'dayjs';
dayjs.locale("ja");
const config = useRuntimeConfig()

interface SymbolDailyInfo {
    price: number;
    tradingValue: number;
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
    const p: Promise<any> = new Promise((resolve, reject) => {
        const daily_info_sql: string = `
            SELECT
                filterd.vwap price,
                ROUND(SUM(filterd.trading_value) * 1000) trading_value
            FROM (
                SELECT
                    CASE
                        WHEN vwap > 10000 THEN ROUND(vwap/50) * 50
                        WHEN vwap >  5000 THEN ROUND(vwap/20) * 20
                        WHEN vwap >  2000 THEN ROUND(vwap/10) * 10
                        WHEN vwap >   500 THEN ROUND(vwap/ 5) *  5
                        ELSE                   ROUND(vwap)
                    END vwap,
                    trading_value
                FROM
                    symbol_daily_info
                WHERE
                    symbol_code = :symbol_code
                AND
                    opening_date >= :from_date
                AND
                    opening_date <= :to_date
            ) filterd
            GROUP BY
                filterd.vwap
            ORDER BY
                filterd.vwap DESC
        `;
        const statements = {
            symbol_code: query.code,
            from_date: query.from,
            to_date: query.to
        }
        pool.query(daily_info_sql, statements, (err, rows, fields) => {
            resolve(rows);
        });
    });
    let symbolDailyInfo: SymbolDailyInfo[] = [];
    await p.then((result) => {
        symbolDailyInfo = result?.map((e: any) => <SymbolDailyInfo>{
            price: Number(e.price),
            tradingValue: Number(e.trading_value)
        });
    });

    const dailyInfoForChart = {
        price: symbolDailyInfo?.map((e) => {return e.price}),
        tradingValue: symbolDailyInfo?.map((e) => {return e.tradingValue})
    };

    return { dailyInfoForChart }
});
