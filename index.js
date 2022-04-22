const express = require('express')
const path = require('path');

const app = express()
const port = 8080
console.log('test')
app.use(express.static(path.resolve(__dirname , 'u/public'  )))


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})