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

    return {
        symbol,
        dailyInfoForChart
    }
});
