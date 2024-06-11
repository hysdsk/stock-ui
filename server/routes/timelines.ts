import { save } from "~/utils/kabu"
import dayjs from "dayjs";
dayjs.locale("ja");

interface Data {
  currentDateTime: Date;
  symbolCode: string;
  currentPrice: number;
  previousClosePrice: number;
  todayOpeningPrice: number;
  tragingValue: number;
  recentValue: number;
  bidSign: string;
  askSign: string;
  openingPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  vwap: number;
  largeBuyValue: number;
  middleBuyValue: number;
  smallBuyValue: number;
  largeSellValue: number;
  middleSellValue: number;
  smallSellValue: number;
  bidLimitOrder: number;
  askLimitOrder: number;
  bidMarketOrder: number;
  askMarketOrder: number;
  bidOverOrder: number;
  askUnderOrder: number;
}

const put = (data: Data) => {
  const openingDate = dayjs(data.currentDateTime).format("YYYY/MM/DD");
  const tickTime = dayjs(data.currentDateTime).format("HH:mm:00");
  const top_lines_sql = `
    INSERT INTO top_lines (
      opening_date,
      symbol_code,
      current_datetime,
      current_price,
      previous_close_price,
      opening_price,
      vwap,
      trading_value,
      recent_value,
      bid_sign,
      ask_sign
    ) VALUES (
      ?,?,?,?,?,?,?,?,?,?,?
    ) ON DUPLICATE KEY UPDATE
      opening_date = VALUES(opening_date),
      symbol_code = VALUES(symbol_code),
      current_datetime = VALUES(current_datetime),
      current_price = VALUES(current_price),
      previous_close_price = VALUES(previous_close_price),
      opening_price = VALUES(opening_price),
      vwap = VALUES(vwap),
      trading_value = VALUES(trading_value),
      recent_value = VALUES(recent_value),
      bid_sign = VALUES(bid_sign),
      ask_sign = VALUES(ask_sign)
    ;
  `
  const top_lines_params = [
    openingDate,
    data.symbolCode,
    data.currentDateTime,
    data.currentPrice,
    data.previousClosePrice,
    data.todayOpeningPrice,
    data.vwap,
    data.tragingValue,
    data.recentValue,
    data.bidSign,
    data.askSign,
  ]
  save(top_lines_sql, top_lines_params);

  const time_lines_sql = `
    INSERT INTO time_lines (
      opening_date,
      symbol_code,
      tick_time,
      opening_price,
      high_price,
      low_price,
      close_price,
      vwap,
      large_buy_value,
      middle_buy_value,
      small_buy_value,
      large_sell_value,
      middle_sell_value,
      small_sell_value,
      bid_limit_order,
      ask_limit_order,
      bid_market_order,
      ask_market_order,
      bid_over_order,
      ask_under_order
    ) VALUES (
      ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
    ) ON DUPLICATE KEY UPDATE
      opening_price = VALUES(opening_price),
      high_price = VALUES(high_price),
      low_price = VALUES(low_price),
      close_price = VALUES(close_price),
      vwap = VALUES(vwap),
      large_buy_value = VALUES(large_buy_value),
      middle_buy_value = VALUES(middle_buy_value),
      small_buy_value = VALUES(small_buy_value),
      large_sell_value = VALUES(large_sell_value),
      middle_sell_value = VALUES(middle_sell_value),
      small_sell_value = VALUES(small_sell_value),
      bid_limit_order = VALUES(bid_limit_order),
      ask_limit_order = VALUES(ask_limit_order),
      bid_market_order = VALUES(bid_market_order),
      ask_market_order = VALUES(ask_market_order),
      bid_over_order = VALUES(bid_over_order),
      ask_under_order = VALUES(ask_under_order)
    ;
  `;
  const time_lines_params = [
    openingDate,
    data.symbolCode,
    tickTime,
    data.openingPrice,
    data.highPrice,
    data.lowPrice,
    data.closePrice,
    data.vwap,
    data.largeBuyValue,
    data.middleBuyValue,
    data.smallBuyValue,
    data.largeSellValue,
    data.middleSellValue,
    data.smallSellValue,
    data.bidLimitOrder,
    data.askLimitOrder,
    data.bidMarketOrder,
    data.askMarketOrder,
    data.bidOverOrder,
    data.askUnderOrder,
  ]
  save(time_lines_sql, time_lines_params);
}

export default defineEventHandler(async (event: any) => {
  const method = event.node.req.method;
  const body = await readBody(event);
  switch (method) {
    case "PUT":
      put({...body, currentDateTime: new Date(body.currentDateTime)});
    default:
      // do nothing
  }
})
