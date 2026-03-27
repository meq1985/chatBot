import fs from "fs"
import path from "path"
import { createRequire } from "module"

const require = createRequire(import.meta.url)

const pdfModule = require("pdf-parse")
const pdfParse = pdfModule.default || pdfModule

const docsPath = "./docs"

async function cargarPDFs(){

  const files = fs.readdirSync(docsPath)

  for(const file of files){

    if(!file.endsWith(".pdf")) continue

    const buffer = fs.readFileSync(path.join(docsPath,file))

    const data = await pdfParse(buffer)

    console.log("Documento cargado:", file)
    console.log(data.text.substring(0,200))
    console.log("--------------")

  }

}

cargarPDFs()