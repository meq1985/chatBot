<template>
  <div class="chat-container">

    <div class="chat-box">
      <div v-for="(m,index) in mensajes" :key="index">
        <b>Usuario:</b> {{ m.pregunta }}
        <br>
        <b>Bot:</b> {{ m.respuesta }}
        <hr>
      </div>
    </div>

    <input v-model="mensaje" @keyup.enter="enviar"/>
    <button @click="enviar">Enviar</button>

  </div>
</template>

<script>
import axios from "axios"

export default {

data(){
return{
mensaje:"",
mensajes:[]
}
},

methods:{

async enviar(){

if(!this.mensaje) return

const pregunta=this.mensaje

this.mensaje=""

const res=await axios.post("http://localhost:3000/chat",{
pregunta
})

this.mensajes.push({
pregunta,
respuesta:res.data.respuesta
})

}

}

}
</script>

<style>

.chat-container{
width:600px;
margin:auto;
}

.chat-box{
height:400px;
overflow:auto;
border:1px solid #ccc;
margin-bottom:10px;
padding:10px;
}

</style>