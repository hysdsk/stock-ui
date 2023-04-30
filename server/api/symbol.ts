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
    sellBalance: number;
    buyBalance: number;
    rotationDays: number;
}

const connection = mysql.createConnection({
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
            s.total_stocks * sdi.latter_closing_price * 1000 market_capitalization,
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
        connection.query(symbol_detail_sql, [symbolCode, symbolCode], (err, rows, fields) => {
            resolve(rows);
        });
    });
    let symbol: Symbol = await p.then((reslut) => {
        return reslut.map((e: any) => <Symbol>{
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
        	d.symbol_code,
        	d.opening_date,
            d.first_opening_price,
            d.first_high_price,
            d.first_low_price,
            d.latter_opening_price,
            d.latter_high_price,
            d.latter_low_price,
        	d.latter_closing_price,
        	d.trading_volume * 1000 trading_volume,
            d.vwap,
            d.loaning_amount,
            d.paid_loaning_amount,
        	d.loaning_balance,
            d.lending_amount,
            d.paid_lending_amount,
        	d.lending_balance,
            w.sell_balance,
            w.buy_balance
        FROM
        	kabu.symbol_daily_info d
        LEFT JOIN
            kabu.symbol_weekly_info w
        ON
        	d.symbol_code = w.symbol_code
        AND
        	d.opening_date = w.weekend_date
        WHERE
        	d.symbol_code = ?
        AND
            d.opening_date >= ?
        `;
        connection.query(daily_info_sql, [symbolCode, startDate], (err, rows, fields) => {
            resolve(rows);
        });
    });
    let symbolDailyInfo: SymbolDailyInfo[] = [];
    await p.then((reslut) => {
        symbolDailyInfo = reslut.map((e: any) => <SymbolDailyInfo>{
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
            lendingBalance: Number(e.lending_balance),
            sellBalance: Number(e.sell_balance),
            buyBalance: Number(e.buy_balance)
        });
    });

    symbolDailyInfo.forEach((elem, idx, arr) => {
        if (0 != idx) {
            elem.previousClosingPrice = arr[idx - 1].latterClosingPrice;
            if (0 == elem.sellBalance) {
                elem.sellBalance = arr[idx - 1].sellBalance;
                elem.buyBalance = arr[idx - 1].buyBalance;
            }
            if (4 <= idx) {
                const rangeSymbls = arr.filter((e, i) => i <= idx && i >= (idx - 4));
                const avgLoaningBalance = rangeSymbls.map(e => e.loaningBalance).reduce((p, c) => p + c) / 5;
                const avgLendingBalance = rangeSymbls.map(e => e.lendingBalance).reduce((p, c) => p + c) / 5;
                const avgAmountAndPaid = rangeSymbls.map(e => e.loaningAmount + e.paidLoaningAmount + e.lendingAmount + e.paidLendingAmount).reduce((p, c) => p + c) / 5;
                elem.rotationDays = (avgLoaningBalance + avgLendingBalance) * 2 / avgAmountAndPaid;
            }
        }
    })

    startDate = dayjs().subtract(month, "M").format("YYYYMMDD");
    symbolDailyInfo = symbolDailyInfo.filter(e => Number(e.openingDate) >= Number(startDate));

    const dailyInfoForChart = {
        openingDate: symbolDailyInfo.map((e) => {
            const year = e.openingDate.substring(0, 4);
            const month = e.openingDate.substring(4, 6);
            const day = e.openingDate.substring(6, 8);
            return dayjs(`${year}-${month}-${day}`).format("YYYY/MM/DD（dd）");
        }),
        tradingVolume: symbolDailyInfo.map((e) => {return e.tradingVolume}),
        priceBody: symbolDailyInfo.map((e) => {
            return [
                e.firstOpeningPrice == 0 ? e.latterOpeningPrice : e.firstOpeningPrice,
                e.latterClosingPrice]
        }),
        tickColor: symbolDailyInfo.map((e) => {
            return e.firstOpeningPrice < e.latterClosingPrice ? "#ff1744" : "#00E676"
        }),
        highAndLow: symbolDailyInfo.map((e) => {
            let highPrice: number = e.firstHighPrice > e.latterHighPrice ? e.firstHighPrice : e.latterHighPrice;
            let lowPrice: number = e.firstLowPrice > e.latterLowPrice ? e.latterLowPrice : e.firstLowPrice;
            lowPrice = lowPrice == 0 ? highPrice : lowPrice;
            return [highPrice, lowPrice];
        }),
        vwap: symbolDailyInfo.map((e) => {return e.vwap}),
        loaningBalance: symbolDailyInfo.map((e) => {return e.loaningBalance}),
        lendingBalance: symbolDailyInfo.map((e) => {return e.lendingBalance}),
        sellBalance: symbolDailyInfo.map((e) => {
            return e.sellBalance - e.lendingBalance
        }),
        buyBalance: symbolDailyInfo.map((e) => {
            return e.buyBalance - e.loaningBalance
        }),
        rotationDays: symbolDailyInfo.map((e) => {
            return e.rotationDays.toFixed(1)
        })
    };
    return {
        symbol,
        dailyInfoForChart
    }
});
