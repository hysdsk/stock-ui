import * as mysql from "mysql2";
import dayjs from 'dayjs';
dayjs.locale("ja");
const config = useRuntimeConfig()

const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPswd,
    database: config.dbName,
    namedPlaceholders: true
});

interface TradingValueByDivision {
    openingDate: string;
    divisionCode: string;
    divisionName: string;
    tradingValue: number;
}

const getOpeningDates = (tvbd: TradingValueByDivision) => {
    const year = tvbd.openingDate.substring(0, 4);
    const month = tvbd.openingDate.substring(4, 6);
    const day = tvbd.openingDate.substring(6, 8);
    return dayjs(`${year}-${month}-${day}`).format("YYYY/MM/DD（dd）");
}

export default defineEventHandler(async (event: any) => {
    const query = getQuery(event);
    const p: Promise<any> = new Promise((resolve, reject) => {
        const sql: string = `
            SELECT
                main.opening_date,
                IFNULL(d.code, '00') division_code,
                IFNULL(d.name, 'その他') division_name,
                main.trading_value
            FROM
                (
                    SELECT
                        sdi.opening_date,
                        s.division_code,
                        SUM(sdi.trading_value) trading_value
                    FROM
                        symbol_daily_info sdi
                    INNER JOIN
                        symbols s
                    ON
                        sdi.symbol_code = s.code
                    WHERE
                        sdi.opening_date >= :from_date
                    AND
                        sdi.opening_date <= :to_date
                    GROUP BY
                        sdi.opening_date,
                        s.division_code
                ) main
                LEFT JOIN
                    divisions d
                ON  main.division_code = d.code
            ORDER BY
                main.opening_date,
                d.code
        `;
        const statements = {
            from_date: query.from,
            to_date: query.to
        }
        pool.query(sql, statements, (err, rows, fields) => {
            resolve(rows);
        });
    });
    const tvbd: TradingValueByDivision[] = await p.then((result) => {
        return result?.map((e: any) => <TradingValueByDivision>{
            openingDate: String(e.opening_date),
            divisionCode: String(e.division_code),
            divisionName: String(e.division_name),
            tradingValue: Number(e.trading_value)
        });
    });

    const prime = {
        openingDate: tvbd.filter(e => e.divisionCode == "01").map(getOpeningDates),
        tradingValue: tvbd.filter(e => e.divisionCode == "01").map(e => e.tradingValue),
    }
    const standard = {
        openingDate: tvbd.filter(e => e.divisionCode == "02").map(getOpeningDates),
        tradingValue: tvbd.filter(e => e.divisionCode == "02").map(e => e.tradingValue),
    }
    const growth = {
        openingDate: tvbd.filter(e => e.divisionCode == "03").map(getOpeningDates),
        tradingValue: tvbd.filter(e => e.divisionCode == "03").map(e => e.tradingValue),
    }

    return { prime, standard, growth }
});
