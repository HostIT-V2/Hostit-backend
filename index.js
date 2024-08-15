require('dotenv').config();
const express = require("express"),
    app = express(),
    cors = require('cors'),
    attendanceRoute = require('./routes/attendance');
    
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.use(cors())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

app.use('/api/attendance', attendanceRoute);

app.listen(process.env.PORT, () => {
    console.log("HostIT backend running on:", process.env.PORT);
})