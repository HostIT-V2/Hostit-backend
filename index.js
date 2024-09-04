require('dotenv').config();
const express = require("express"),
    app = express(),
    cors = require('cors'),
    attendanceRoute = require('./routes/attendance'),
    verfiedusersRoute = require('./routes/user'),
    models = require('./models')
    
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.use(cors())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

app.use('/api/attendance', attendanceRoute);
app.use('/api/verified-user', verfiedusersRoute);

app.listen(process.env.PORT, () => {
    console.log("HostIT backend running on:", process.env.PORT);
})