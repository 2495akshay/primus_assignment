const express       = require("express");
const mongoose      = require("mongoose");
const bodyParser    = require('body-parser');
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

// root API
app.get("/", (req, res) =>{
    res.send("hello");
})

app.post("/sales/populate", async (req, res) => {
   const insertedData = await sales.insertMany(populateSales);
   res.send(insertedData);
})

app.post("/sales/create",async (req, res) =>{
   const addedSale = await sales.create(req.body);
   res.send(addedSale);
})

app.get("/sales/:id",async (req, res)=>{
    const {id} = req.params;

    const groupCondition = {
        sum: {$sum: 1},
        amount: {$sum: '$amount'}
    };

    if (id === 'monthly') {
        groupCondition._id = {$dayOfMonth: '$date'};
    } else if (id === 'weekly') {
        groupCondition._id = {$dayOfWeek: '$date'};
    } else if (id === 'daily') {
        groupCondition._id = {$hour: '$date'};
    } 

    const allSales = await sales.aggregate([
        {
            $group: groupCondition
        },
        {
            $sort: {
                _id: 1
            }
        }
    ]);

    const weekMap = {
        1: 'Sunday',
        2: 'Monday',
        3: 'Tuesday',
        4: 'Wednesday',
        5: 'Thursday',
        6: 'Friday',
        7: 'Saturday'
    }

    let finalDataToBeSent = [];

    if (id === 'monthly') {
        for(let i = 0; i <= 31; i++) {
            const currentDayOfMonth = allSales.find(sale => sale._id === i);
            finalDataToBeSent.push({day: i, amount: currentDayOfMonth ? currentDayOfMonth.amount : 0});
        }
    } else if (id === 'weekly') {
        finalDataToBeSent = allSales.map(sale => {
            return ({Day: weekMap[sale._id], amount: sale.amount})
        });
    } else if (id === 'daily') {
        for(let i = 0; i < 24; i++) {
            const currentHourData = allSales.find(sale => sale._id === i);
            finalDataToBeSent.push({hour: i, amount: currentHourData ? currentHourData.amount : 0});
        }
    } 

    res.send(finalDataToBeSent);
})

app.listen(port, ()=>{
    console.log('running');
})