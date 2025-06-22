import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import ConnectDB from './Config/db.js'
import SessionRoutes from './Routes/SessionRoutes.js'

dotenv.config();
 const app = express();
 app.use(cors())
 app.use(express.json());

 // connecting the db

 ConnectDB();

 app.use('/api',SessionRoutes);
app.get('/server',(req,res)=>{
  res.json('hello from server')
})
 const PORT = process.env.APP_PORT || 4000
 app.listen(PORT,()=>{
  console.log(`App is running on ${PORT}`)
 })