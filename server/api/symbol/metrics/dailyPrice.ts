import * as mysql from "mysql2";
import dayjs from 'dayjs';
dayjs.locale("ja");
const config = useRuntimeConfig()

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
            first_opening_price,
            first_high_price,
            first_low_price,
            latter_opening_price,
            latter_high_price,
            latter_low_price,
            latter_closing_price,
            trading_volume * 1000 trading_volume
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
            firstOpeningPrice: Number(e.first_opening_price),
            firstHighPrice: Number(e.first_high_price),
            firstLowPrice: Number(e.first_low_price),
            latterOpeningPrice: Number(e.latter_opening_price),
            latterHighPrice: Number(e.latter_high_price),
            latterLowPrice: Number(e.latter_low_price),
            latterClosingPrice: Number(e.latter_closing_price),
            previousClosingPrice: Number(e.first_opening_price),
            tradingVolume: Number(e.trading_volume),
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
        })
    };

    return { dailyInfoForChart }
});
