import { getTable } from "./vectorDB.js"
import { elegirManual } from "./router.js"



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



function keywordScore(text,pregunta){

  const palabras = pregunta.toLowerCase().split(" ")

  let score = 0

  for(const p of palabras){

    if(text.toLowerCase().includes(p)){
      score++

    }

  }

  return score

}



async function obtenerManuales(table, vector){

  const rows = await table
    .search(vector)
    .limit(50)
    .execute()

  const manuales = new Set()

  for(const r of rows){

    if(r.source){
      manuales.add(r.source)
    }

  }

  return Array.from(manuales)

}



async function rerank(pregunta,resultados){

  const prompt = `
Evalúa qué fragmentos responden mejor la pregunta técnica.

Pregunta:
${pregunta}

Fragmentos:
${resultados.map((r,i)=>`(${i}) ${r.text}`).join("\n\n")}

Devuelve SOLO los números de los 5 fragmentos más relevantes separados por coma.
`

  const res = await fetch("http://localhost:11434/api/generate",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({
      model:"phi3",
      prompt:prompt,
      stream:false
    })
  })

  const data = await res.json()

  const indexes = data.response
    .match(/\d+/g)
    ?.map(n=>parseInt(n)) || []

  return indexes.map(i=>resultados[i]).filter(Boolean)

}



export async function buscarContexto(pregunta){

  const table = await getTable()



  const vector = await embedding(pregunta)

    const manuales = await obtenerManuales(table, vector)


  let manualElegido = await elegirManual(pregunta, manuales)



  // limpiar respuesta del modelo
  if(manualElegido){
    manualElegido = manualElegido
  .split("\n")[0]
  .replace(/["']/g,"")
  .trim()
  }



  console.log("Manual elegido:",manualElegido)



  // validar que el manual exista
  if(!manuales.includes(manualElegido)){

    console.log("Router devolvió manual inválido, buscando en todos")

    manualElegido = null

  }



  



  // vector search
  const results = await table
    .search(vector)
    .limit(20)
    .execute()



  if(!results || results.length === 0){

    console.log("Sin resultados en vector search")

    return ""

  }



  // filtrar por manual (sin usar .where)
  let filtered = results

  if(manualElegido){

    filtered = results.filter(r => r.source === manualElegido)

    if(filtered.length === 0){

      filtered = results

    }

  }



  // ranking híbrido
  const ranked = filtered.map(r => {

    const keyword = keywordScore(r.text,pregunta)

    return {
      ...r,
      hybridScore:(1-(r._distance||0))+keyword
    }

  })



  ranked.sort((a,b)=>b.hybridScore-a.hybridScore)



  const reranked = await rerank(pregunta,ranked)



  const top = reranked.slice(0,5)



  const contexto = top.map(r=>{

    return `[Fuente: ${r.source}]
${r.text}`

  }).join("\n\n")



  return contexto

}