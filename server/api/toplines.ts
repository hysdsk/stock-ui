import { find } from "~/utils/kabu";

export default defineEventHandler(async (event: any) => {
    const query = getQuery(event);
    const sql = `
        SELECT
            tl.symbol_code,
            s.name symbol_name,
            tl.current_datetime,
            tl.current_price,
            tl.opening_price,
            tl.previous_close_price,
            tl.opening_price,
            tl.vwap,
            tl.trading_value,
            tl.recent_value,
            tl.bid_sign,
            tl.ask_sign
        FROM
            top_lines tl
        LEFT JOIN
            symbols s
        ON
            tl.symbol_code = s.code
        WHERE
            tl.opening_date = ?
    `
    return find(sql, [query.today]);
});
