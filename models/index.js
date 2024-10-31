require('dotenv').config()
const mongoose = require('mongoose')

mongoose.connect(process.env.LOCAL_URI, { useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{
        console.log('db connected')
    })
    .catch((error)=>{
        console.log(error.message)
    })

