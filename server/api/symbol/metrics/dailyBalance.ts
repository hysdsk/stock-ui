import * as mysql from "mysql2";
import dayjs from 'dayjs';
dayjs.locale("ja");
const config = useRuntimeConfig()

interface SymbolDailyInfo {
    symbolCode: string;
    openingDate: string;
    tradingVolume: number;
    loaningAmount: number;
    paidLoaningAmount: number;
    loaningBalance: number;
    lendingAmount: number;
    paidLendingAmount: number;
    lendingBalance: number;
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
    const month: number = Number(query.period);
    let startDate: string = dayjs().subtract(month + 1, "M").format("YYYYMMDD");
    const p: Promise<any> = new Promise((resolve, reject) => {
        const daily_info_sql: string = `
        SELECT
            symbol_code,
            opening_date,
            trading_volume * 1000 trading_volume,
            loaning_amount,
            paid_loaning_amount,
            loaning_balance,
            lending_amount,
            paid_lending_amount,
            lending_balance
        FROM
            kabu.symbol_daily_info
        WHERE
            symbol_code = ?
        AND
            opening_date >= ?
        `;
        pool.query(daily_info_sql, [symbolCode, startDate], (err, rows, fields) => {
            resolve(rows);
        });
    });
    let symbolDailyInfo: SymbolDailyInfo[] = [];
    await p.then((result) => {
        symbolDailyInfo = result?.map((e: any) => <SymbolDailyInfo>{
            symbolCode: String(e.symbol_code),
            openingDate: String(e.opening_date),
            tradingVolume: Number(e.trading_volume),
            loaningAmount: Number(e.loaning_amount),
            paidLoaningAmount: Number(e.paid_loaning_amount),
            loaningBalance: Number(e.loaning_balance),
            lendingAmount: Number(e.lending_amount),
            paidLendingAmount: Number(e.paid_lending_amount),
            lendingBalance: Number(e.lending_balance)
        });
    });

    // 表示対象期間内に短縮している
    startDate = dayjs().subtract(month, "M").format("YYYYMMDD");
    symbolDailyInfo = symbolDailyInfo.filter(e => Number(e.openingDate) >= Number(startDate));

    const dailyInfoForChart = {
        openingDate: symbolDailyInfo?.map((e) => {
            const year = e.openingDate.substring(0, 4);
            const month = e.openingDate.substring(4, 6);
            const day = e.openingDate.substring(6, 8);
            return dayjs(`${year}-${month}-${day}`).format("YYYY/MM/DD（dd）");
        }),
        tradingVolume: symbolDailyInfo?.map((e) => {return e.tradingVolume}),
        loaningBalance: symbolDailyInfo?.map((e) => {return e.loaningBalance}),
        lendingBalance: symbolDailyInfo?.map((e) => {return e.lendingBalance}),
        rotationDays: symbolDailyInfo?.map((e) => {
            // ｛（融資残＋貸株残）×2 ｝÷（融資新規＋融資返済＋貸株新規＋貸株返済）
            const divider = e.loaningAmount + e.paidLoaningAmount + e.lendingAmount + e.paidLendingAmount;
            if (divider) {
                return ((e.loaningBalance + e.lendingBalance) * 2 / divider).toFixed(1)
            } else {
                return ((e.loaningBalance + e.lendingBalance) * 2 / 1).toFixed(1)
            }
        })
    };

    return { dailyInfoForChart }
});
