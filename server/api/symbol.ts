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
    fiscalYearEndBasic: number
}

interface SymbolDailyInfo {
    symbolCode: string;
    openingDate: string;
    firstOpeningPrice: number;
    firstHighPrice: number;
    firstLowPrice: number;
    latterOpeningPrice: number;
    latterHighPrice: number;
    latterLowPrice: number;
    latterClosingPrice: number;
    previousClosingPrice: number;
    tradingVolume: number;
    vwap: number;
    loaningAmount: number;
    paidLoaningAmount: number;
    loaningBalance: number;
    lendingAmount: number;
    paidLendingAmount: number;
    lendingBalance: number;
}

interface SymbolWeeklyInfo {
    weekendDate: string;
    sellBalance: number;
    buyBalance: number;
    lendBalance: number;
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
    let symbol: Symbol = await p.then((reslut) => {
        return reslut?.map((e: any) => <Symbol>{
            symbolCode: String(e.code),
            symbolName: String(e.symbol_name),
            exchangeName: String(e.exchange_name),
            divisionName: String(e.division_name),
            bisCategoryName: String(e.bis_category_name),
            marketCapitalization: Number(e.market_capitalization),
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
            first_opening_price,
            first_high_price,
            first_low_price,
            latter_opening_price,
            latter_high_price,
            latter_low_price,
            latter_closing_price,
            trading_volume * 1000 trading_volume,
            vwap,
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
    await p.then((reslut) => {
        symbolDailyInfo = reslut?.map((e: any) => <SymbolDailyInfo>{
            symbolCode: String(e.symbol_code),
            openingDate: String(e.opening_date),
            firstOpeningPrice: Number(e.first_opening_price),
            firstHighPrice: Number(e.first_high_price),
            firstLowPrice: Number(e.first_low_price),
            latterOpeningPrice: Number(e.latter_opening_price),
            latterHighPrice: Number(e.latter_high_price),
            latterLowPrice: Number(e.latter_low_price),
            latterClosingPrice: Number(e.latter_closing_price),
            previousClosingPrice: Number(e.first_opening_price),
            tradingVolume: Number(e.trading_volume),
            vwap: Number(e.vwap),
            loaningAmount: Number(e.loaning_amount),
            paidLoaningAmount: Number(e.paid_loaning_amount),
            loaningBalance: Number(e.loaning_balance),
            lendingAmount: Number(e.lending_amount),
            paidLendingAmount: Number(e.paid_lending_amount),
            lendingBalance: Number(e.lending_balance)
        });
    });

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
    await p.then((reslut) => {
        symbolWeeklyInfo = reslut?.map((e: any) => <SymbolWeeklyInfo>{
            weekendDate: String(e.weekend_date),
            sellBalance: Number(e.sell_balance),
            buyBalance: Number(e.buy_balance),
            lendBalance: Number(e.lend_balance)
        });
    });

    // 表示対象期間内に短縮している
    startDate = dayjs().subtract(month, "M").format("YYYYMMDD");
    symbolDailyInfo = symbolDailyInfo.filter(e => Number(e.openingDate) >= Number(startDate));
    symbolWeeklyInfo = symbolWeeklyInfo.filter(e => Number(e.weekendDate) >= Number(startDate));

    const dailyInfoForChart = {
        openingDate: symbolDailyInfo?.map((e) => {
            const year = e.openingDate.substring(0, 4);
            const month = e.openingDate.substring(4, 6);
            const day = e.openingDate.substring(6, 8);
            return dayjs(`${year}-${month}-${day}`).format("YYYY/MM/DD（dd）");
        }),
        tradingVolume: symbolDailyInfo?.map((e) => {return e.tradingVolume}),
        priceBody: symbolDailyInfo?.map((e) => {
            return [
                e.firstOpeningPrice == 0 ? e.latterOpeningPrice : e.firstOpeningPrice,
                e.latterClosingPrice == 0 ? e.firstOpeningPrice : e.latterClosingPrice]
        }),
        tickColor: symbolDailyInfo?.map((e) => {
            return e.firstOpeningPrice < e.latterClosingPrice ? "#ff1744" : "#00E676"
        }),
        highAndLow: symbolDailyInfo?.map((e) => {
            let highPrice: number = e.firstHighPrice > e.latterHighPrice ? e.firstHighPrice : e.latterHighPrice;
            let lowPrice: number = e.firstLowPrice > e.latterLowPrice ? e.latterLowPrice : e.firstLowPrice;
            lowPrice = lowPrice == 0 ? highPrice : lowPrice;
            return [highPrice, lowPrice];
        }),
        vwap: symbolDailyInfo?.map((e) => {return e.vwap}),
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

    const weeklyInfoForChart = {
        weekendDate: symbolWeeklyInfo?.map((e) => {
            const year = e.weekendDate.substring(0, 4);
            const month = e.weekendDate.substring(4, 6);
            const day = e.weekendDate.substring(6, 8);
            return dayjs(`${year}-${month}-${day}`).format("YYYY/MM/DD（dd）");
        }),
        sellBalance: symbolWeeklyInfo?.map((e) => {return e.sellBalance}),
        buyBalance: symbolWeeklyInfo?.map((e) => {return e.buyBalance}),
        lendBalance: symbolWeeklyInfo?.map((e) => {return e.lendBalance})
    }

    return {
        symbol,
        dailyInfoForChart,
        weeklyInfoForChart
    }
});
