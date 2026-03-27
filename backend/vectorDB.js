import * as vectordb from "vectordb"

export async function getTable(){

  const db = await vectordb.connect("./vector-db")

  try{
    return await db.openTable("manuales")
  }catch{

    return await db.createTable("manuales",[
      {
        id:0,
        text:"",
        vector:new Array(768).fill(0),
        source:""
      }
    ])

  }

}