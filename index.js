const express       = require("express");
const mongoose      = require("mongoose");
const bodyParser    = require('body-parser');
const dayjs         = require('dayjs');
const populateSales = require('./src/populate/populate-sales');
const sales         = require('./src/model/sales.js');

var port = 3000;
var mongoUri = 'mongodb://localhost:27017/salesRecord'

// mongoose connection
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const connection = mongoose.connection;
connection.once('open', ()=> {
    console.log('database connection has been established')
})

let app = express();

// parse various different custom JSON types as JSON
app.use(bodyParser.json());
 
// // parse some custom thing into a Buffer
// app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))
 
// // parse an HTML body into a string
// app.use(bodyParser.text({ type: 'text/html' }))

app.get("/", (req, res) =>{
    
    res.send("hello");
})

app.post("/populateData", (req, res) =>{
    sales.insertMany(populateSales, (err, result)=>{
        if (err) {
            res.send(err);
          } else {
            res.send(result);
          }
    })
})

app.post("/addSales",async (req, res) =>{
   const addedSale = await sales.create(req.body);
   console.log(addedSale);
   res.send(addedSale);
})

app.get("/fetchSales",async (req, res)=>{
    const allSales = await sales.find({});
    for(let i = 0; i < allSales.length ; i++){
        let hour = allSales[i].date; 
        console.log(dayjs(hour));
        console.log(hour)
    }
})

app.listen(port, ()=>{
    console.log('running');
})