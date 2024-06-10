import * as mysql from "mysql2";
const config = useRuntimeConfig()

const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPswd,
    database: config.dbName,
    timezone: "+00:00",
});

export const find = async (sql: string, params: any) => {
    return await new Promise((resolve, reject) => {
        pool.query(sql, params, (err, rows, fields) => {
            if (err) {
                console.error(err);
            }
            resolve(rows);
        });
    });
}
