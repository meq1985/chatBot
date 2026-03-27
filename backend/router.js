export async function elegirManual(pregunta, manuales){

const prompt = `
Eres un sistema que selecciona el manual técnico correcto.

Pregunta:
${pregunta}

Manuales disponibles:
${manuales.join("\n")}

Responde SOLO con el nombre EXACTO de uno de los manuales.
No agregues explicaciones.
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

return data.response.trim()

}