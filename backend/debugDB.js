import { getTable } from "./vectorDB.js"

const table = await getTable()

const rows = await table.search().limit(10)

console.log(rows)