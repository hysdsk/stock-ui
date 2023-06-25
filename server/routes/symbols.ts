import * as mysql from "mysql2";
const config = useRuntimeConfig()

const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPswd,
    database: config.dbName
});

interface Symbol {
    symbolCode: string;
    symbolName: string;
    totalStocks: number;
}

export default defineEventHandler(async (event: any) => {
    const query = getQuery(event);
    if (!query.hasOwnProperty("code") || query.code == null) {
        return [];
    }
    const codelist = String(query.code).split(",");
    let p: Promise<any> = new Promise((resolve, reject) => {
        const symbol_detail_sql: string = `
        SELECT
            code,
            name,
            total_stocks
        FROM
            kabu.symbols
        WHERE
            code in (${new Array<String>(codelist.length).fill("?").join(",")})
        `;
        pool.query(symbol_detail_sql, codelist, (err, rows, fields) => {
            resolve(rows);
        });
    });
    const symbols: Symbol[] = await p.then((reslut) => {
        return reslut.map((e: any) => <Symbol>{
            symbolCode: String(e.code),
            symbolName: String(e.name),
            totalStocks: Number(e.total_stocks)
        });
    });

    if (symbols.length == 1) {
        return symbols[0];
    } else {
        return symbols;
    }
})
