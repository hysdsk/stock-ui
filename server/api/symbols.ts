import * as mysql from "mysql2";
const config = useRuntimeConfig()

interface Symbol {
    code: string;
    name: string;
}

const connection = mysql.createConnection({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPswd,
    database: config.dbName
});

export default defineEventHandler(async (event: any) => {
    let p: Promise<any> = new Promise((resolve, reject) => {
        const sql: string = `
        SELECT
            code,
            name
        FROM
            kabu.symbols
        ORDER BY
            code
        `;
        connection.query(sql, [], (err, rows, fields) => {
            resolve(rows);
        });
    });
    const symbols: symbol[] = await p.then((reslut) => {
        return reslut?.map((row: any) => <Symbol> {
            code: String(row.code),
            name: String(row.name)
        });
    });

    return {
        symbols
    };
});
