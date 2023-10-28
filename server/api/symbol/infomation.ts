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

const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPswd,
    database: config.dbName
});

export default defineEventHandler(async (event: any) => {
    const query = getQuery(event);
    if (query.code === undefined) {
        return null;
    }
    const symbolCode = query.code;
    const p: Promise<any> = new Promise((resolve, reject) => {
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
    const symbol: Symbol = await p.then((result) => {
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

    return { symbol }
});
