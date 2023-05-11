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

const connection = mysql.createConnection({
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
        connection.query(sql,
            [oneWeekBefore, threeMonthBefore, oneWeekBefore],
            (err, rows, fields) => {
            resolve(rows);
        });
    });
    const increaseVolumeSymbols: symbol[] = await p.then((reslut) => {
        return reslut.map((row: any) => <Symbol> {
            symbolCode: String(row.symbol_code),
            symbolName: String(row.symbol_name),
            divisionName: String(row.division_name),
            bisCategoryName: String(row.bis_category_name),
            closingPrice: Number(row.latter_closing_price),
            recentVolume: Number(row.recent_volume),
            averageVolume: Number(row.average_volume),
            increaseRate: Number(row.increase_rate)
        });
    });

    p = new Promise((resolve, reject) => {
        const sql: string = `
        SELECT DISTINCT
        	opening_date
        FROM
        	kabu.symbol_daily_info
        ORDER BY
        	opening_date DESC
        LIMIT 60
        `
        connection.query(sql, [], (err, rows, fields) => {
            resolve(rows);
        });
    });
    const days: string[] = await p.then((result) => {
        return result.map((row: any) => { return row.opening_date });
    });
    
    p = new Promise((resolve, reject) => {
        const sql: string = `
        SELECT
            s.code symbol_code,
            s.name symbol_name,
            d.name division_name,
            bc.name bis_category_name,
            today.latter_closing_price closing_price,
            truncate(
                ( today.trading_volume
                + yesterday.trading_volume
                + two_days_ago.trading_volume) * 1000 / 3,
            0) average_volume,
            ROUND(today.latter_closing_price / two_days_ago.first_opening_price * 100 - 100, 0) increase_rate
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
                first_opening_price,
                latter_closing_price,
                trading_volume
            FROM
                kabu.symbol_daily_info
            WHERE
                opening_date = ?
        ) today
        ON
            s.code = today.symbol_code
        INNER JOIN (
            SELECT
                symbol_code,
                first_opening_price,
                latter_closing_price,
                trading_volume
            FROM
                kabu.symbol_daily_info
            WHERE
                opening_date = ?
        ) yesterday
        ON
            s.code = yesterday.symbol_code
        INNER JOIN (
            SELECT
                symbol_code,
                first_opening_price,
                latter_closing_price,
                trading_volume
            FROM
                kabu.symbol_daily_info
            WHERE
                opening_date = ?
        ) two_days_ago
        ON
            s.code = two_days_ago.symbol_code
        WHERE
            today.latter_closing_price > today.first_opening_price
        AND
            today.latter_closing_price > yesterday.latter_closing_price
        AND
            yesterday.latter_closing_price > yesterday.first_opening_price
        AND
            yesterday.latter_closing_price > two_days_ago.latter_closing_price
        AND
            two_days_ago.latter_closing_price > two_days_ago.first_opening_price
        AND
            ( today.trading_volume
            + yesterday.trading_volume
            + two_days_ago.trading_volume)
            / 3 > 100
        ORDER BY
            increase_rate DESC
        `
        connection.query(sql, [days[0], days[1], days[2]], (err, rows, fields) => {
            resolve(rows);
        });
    });
    const increasePriceSymbols: Symbol[] = await p.then((reslut) => {
        return reslut.map((row: any) => <Symbol> {
            symbolCode: String(row.symbol_code),
            symbolName: String(row.symbol_name),
            divisionName: String(row.division_name),
            bisCategoryName: String(row.bis_category_name),
            closingPrice: Number(row.closing_price),
            averageVolume: Number(row.average_volume),
            increaseRate: Number(row.increase_rate)
        });
    });

    p = new Promise((resolve, reject) => {
        const sql: string = `
        SELECT DISTINCT
            weekend_date
        FROM
        	kabu.symbol_weekly_info
        ORDER BY
            weekend_date DESC
        LIMIT 5
        `
        connection.query(sql, [], (err, rows, fields) => {
            resolve(rows);
        });
    });
    const weekEndDates: string[] = await p.then((result) => {
        return result.map((row: any) => { return row.weekend_date });
    });

    p = new Promise((resolve, reject) => {
        const sql: string = `
        SELECT
            c.symbol_code,
            s.name symbol_name,
            d.name division_name,
            b.name bis_category_name,
            d.trading_volume average_volume,
            c.sell_balance,
            c.buy_balance,
            truncate(c.buy_balance / c.sell_balance, 3) balance_rate
        FROM
            kabu.symbol_weekly_info c 
        INNER JOIN
            kabu.symbols s
        ON
            c.symbol_code = s.code
        INNER JOIN
            kabu.divisions d
        ON
            d.code = s.division_code
        INNER JOIN
            kabu.bis_categories b
        ON
            s.bis_category_code = b.code
        INNER JOIN (
            SELECT
                symbol_code,
                truncate(avg(trading_volume) * 1000, 0) trading_volume
            FROM
                kabu.symbol_daily_info
            GROUP BY
                symbol_code) d
        ON
            c.symbol_code = d.symbol_code
        INNER JOIN (
            SELECT
                symbol_code,
                buy_balance,
                sell_balance
            FROM
                kabu.symbol_weekly_info
            WHERE
                weekend_date = ?) p
        ON
            c.symbol_code = p.symbol_code
        WHERE
            c.weekend_date = ?
        AND c.buy_balance < p.buy_balance
        AND c.sell_balance > p.sell_balance
        AND c.sell_balance > c.buy_balance
        AND c.sell_balance > 1000000
        ORDER BY
            balance_rate;
        `
        connection.query(sql, [weekEndDates.pop(), weekEndDates.shift()], (err, rows, fields) => {
            resolve(rows);
        });
    });
    const increaseSellBalance: Symbol[] = await p.then((reslut) => {
        return reslut.map((row: any) => <Symbol> {
            symbolCode: String(row.symbol_code),
            symbolName: String(row.symbol_name),
            divisionName: String(row.division_name),
            bisCategoryName: String(row.bis_category_name),
            averageVolume: Number(row.average_volume),
            sellBalance: Number(row.sell_balance),
            buyBalance: Number(row.buy_balance),
            balanceRate: Number(row.balance_rate)
        });
    });

    p = new Promise((resolve, reject) => {
        const sql: string = `
        SELECT
            s.code symbol_code,
            TRIM(s.name) symbol_name,
            d.name division_name,
            b.name bis_category_name,
            recent.closing_price,
            aggregated.average_volume,
            s.total_stocks * recent.closing_price * 10000 market_price
        FROM
            symbols s
        INNER JOIN
            kabu.divisions d
        ON
            d.code = s.division_code
        INNER JOIN
            kabu.bis_categories b
        ON
            s.bis_category_code = b.code
        INNER JOIN (
            SELECT
                symbol_code,
                latter_closing_price closing_price
            FROM
                kabu.symbol_daily_info
            WHERE
                opening_date = ?
        ) recent
        ON
            s.code = recent.symbol_code
        INNER JOIN (
            SELECT
                sdi.symbol_code symbol_code,
                TRUNCATE(AVG(sdi.trading_volume) * 1000, 0) average_volume,
                MAX(sdi.first_high_price) - MIN(sdi.first_high_price) +
                MAX(sdi.latter_high_price) - MIN(sdi.latter_high_price) diff_range
            FROM
                kabu.symbol_daily_info sdi
            WHERE
                sdi.opening_date >= ?
            GROUP BY
                sdi.symbol_code
        ) aggregated
        ON
            s.code = aggregated.symbol_code
        WHERE
            s.total_stocks is not null
        AND
            (s.total_stocks * recent.closing_price) < 3000000
        AND
            recent.closing_price <= 500
        AND
            aggregated.average_volume < 500000
        ORDER BY
            aggregated.diff_range
        `
        connection.query(sql, [days.shift(), days.pop()], (err, rows, fields) => {
            resolve(rows);
        });
    });
    
    const lowRankSymbols: Symbol[] = await p.then((reslut) => {
        return reslut.map((row: any) => <Symbol> {
            symbolCode: String(row.symbol_code),
            symbolName: String(row.symbol_name),
            divisionName: String(row.division_name),
            bisCategoryName: String(row.bis_category_name),
            averageVolume: Number(row.average_volume),
            closingPrice: Number(row.closing_price),
            marketPrice: Number(row.market_price)
        });
    });

    return {
        increaseVolumeSymbols,
        increasePriceSymbols,
        increaseSellBalance,
        lowRankSymbols
    };
});
