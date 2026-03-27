import fs from "fs"
import path from "path"
import { createRequire } from "module"
import { getTable } from "./vectorDB.js"

const require = createRequire(import.meta.url)

const pdfModule = require("pdf-parse")
const pdfParse = pdfModule.default || pdfModule

const docsPath = "./docs"



function limpiarTexto(text){

  return text
    .replace(/\r/g," ")
    .replace(/\n+/g,"\n")
    .replace(/[ \t]+/g," ")
    .replace(/\s{2,}/g," ")
    .trim()

}



function detectarSeccion(text){

  const lineas = text.split("\n")

  for(const l of lineas){

    if(l.match(/chapter|section|warning|procedure|fault|alarm/i)){
      return l.trim()
    }

  }

  return "general"

}



function dividirTexto(texto, size = 800, overlap = 200){

  const chunks = []

  let start = 0

  while(start < texto.length){

    const end = start + size

    const chunk = texto.slice(start,end)

    chunks.push(chunk)

    start += size - overlap

  }

  return chunks

}



async function embedding(text){

  const res = await fetch("http://localhost:11434/api/embeddings",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({
      model:"nomic-embed-text",
      prompt:text
    })
  })

  const data = await res.json()

  return data.embedding

}



async function indexar(){

  const table = await getTable()

  const files = fs.readdirSync(docsPath)

  let id = 0

  for(const file of files){

    if(!file.endsWith(".pdf")) continue

    console.log("Procesando:",file)

    const buffer = fs.readFileSync(path.join(docsPath,file))

    const data = await pdfParse(buffer)

    const texto = limpiarTexto(data.text)

    const chunks = dividirTexto(texto)

    console.log("Chunks:",chunks.length)

    for(const chunk of chunks){

      const vector = await embedding(chunk)

      const seccion = detectarSeccion(chunk)

      await table.add([{
        id:id++,
        text:chunk,
        vector:vector,
        source:file,
        section:seccion
      }])

    }

    console.log("Indexado:",file)

  }

  console.log("Indexación finalizada")

}



indexar()