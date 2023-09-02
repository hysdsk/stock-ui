import * as mysql from "mysql2";
import dayjs from 'dayjs';
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
}

const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPswd,
    database: config.dbName
});

export default defineEventHandler(async (event: any) => {
    const oneWeekBefore: string = dayjs().subtract(1, "w").format("YYYYMMDD");
    const threeMonthBefore: string = dayjs().subtract(3, "M").format("YYYYMMDD");
    let p: Promise<any> = new Promise((resolve, reject) => {
        const sql: string = `
        SELECT
            s.code symbol_code,
            s.name symbol_name,
            d.name division_name,
            bc.name bis_category_name,
            ROUND(recent.avg_volume * 1000, 0) recent_volume,
            ROUND(past.avg_volume * 1000, 0) average_volume,
            ROUND(recent.avg_volume / past.avg_volume * 100 - 100, 0) increase_rate
        FROM
            kabu.symbols s
        INNER JOIN
            kabu.divisions d
        ON
            d.code = s.division_code
        INNER JOIN
            kabu.bis_categories bc
        ON
            s.bis_category_code = bc.code
        INNER JOIN (
            SELECT
                symbol_code,
                AVG(trading_volume) avg_volume
            FROM kabu.symbol_daily_info
                WHERE opening_date >= ?
            GROUP BY symbol_code
        ) recent
        ON
            s.code = recent.symbol_code
        INNER JOIN (
            SELECT
                symbol_code,
                AVG(trading_volume) avg_volume
            FROM kabu.symbol_daily_info
                WHERE opening_date BETWEEN ? AND ?
            GROUP BY symbol_code
            ) past
        ON
            s.code = past.symbol_code
        WHERE
            recent.avg_volume > 500
        AND
            recent.avg_volume > past.avg_volume * 2
        AND
            s.division_code not in ('21', '22', '31', '32')
        ORDER BY
            increase_rate DESC
        `;
        pool.query(sql,
            [oneWeekBefore, threeMonthBefore, oneWeekBefore],
            (err, rows, fields) => {
            resolve(rows);
        });
    });
    const symbols: symbol[] = await p.then((reslut) => {
        return reslut?.map((row: any) => <Symbol> {
            symbolCode: String(row.symbol_code),
            symbolName: String(row.symbol_name),
            divisionName: String(row.division_name),
            bisCategoryName: String(row.bis_category_name),
            closingPrice: Number(row.latter_closing_price),
            // recentVolume: Number(row.recent_volume),
            averageVolume: Number(row.average_volume),
            increaseRate: Number(row.increase_rate)
        });
    });

    return {
        symbols
    };
});
