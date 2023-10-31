const express = require("express")
const app = express()
const cors = require ('cors')
const userRoutes = require("./Routes/UserRoutes")
const mongoose = require('mongoose')
const adminRoute = require("./Routes/AdminRoutes")
mongoose.connect(process.env.Mongoconnect,{

}).then(()=>{
    console.log('mongoose connected');
}).catch((err)=>{
    console.log(err.message);
})

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin:[process.env.OrginPort],
    method:['GET','POST','PUT'],
    credentials:true
}))
app.use('/',userRoutes)
app.use('/admin',adminRoute)
app.listen(process.env.Port,()=>{
    console.log("Server is Running ");
})