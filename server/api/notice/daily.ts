import { find } from "~/utils/kabu";

export default defineEventHandler(async (event: any) => {
    const query = getQuery(event);
    const sql = `
        SELECT
            tl.symbol_code,
            s.name symbol_name,
            tl.opening_date,
            tl.current_price,
            tl.opening_price,
            tl.previous_close_price,
            tl.opening_price,
            tl.vwap,
            tl.trading_value,
            tl.recent_value,
            tl.large_buy_value,
            tl.middle_buy_value,
            tl.small_buy_value,
            tl.large_sell_value,
            tl.middle_sell_value,
            tl.small_sell_value,
            tl.bid_sign,
            tl.ask_sign
        FROM
            top_lines tl
        LEFT JOIN
            symbols s
        ON
            tl.symbol_code = s.code
        WHERE
            tl.symbol_code = ?
        AND
            tl.opening_date <= STR_TO_DATE(?, '%Y-%m-%d')
        AND
            tl.opening_date >= (STR_TO_DATE(?, '%Y-%m-%d') - INTERVAL 28 DAY)
        ;
    `
    return find(sql, [query.code, query.from, query.from]);
});
