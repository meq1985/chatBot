import express from "express"
import axios from "axios"
import cors from "cors"

import { buscarContexto } from "./rag.js"

const app = express()

app.use(cors())
app.use(express.json())

app.post("/chat", async (req,res)=>{

const pregunta = req.body.pregunta

const contexto = await buscarContexto(pregunta)

console.log("Contexto encontrado:")
console.log(contexto)

const prompt = `
Eres un asistente técnico experto.

Responde en español utilizando únicamente la información del manual.

Si la información no está en el contexto, indica que no aparece en el manual.

Incluye al final de la respuesta la fuente del manual cuando sea posible.

Contexto técnico:
${contexto}

Pregunta del usuario:
${pregunta}

Respuesta técnica:
`

const response = await axios.post(
"http://localhost:11434/api/generate",
{
model:"phi3",
prompt:prompt,
stream:false
}
)

res.json({
respuesta:response.data.response
})

})

app.listen(3000,()=>{
console.log("Servidor iniciado en puerto 3000")
})