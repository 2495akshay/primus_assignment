const express       = require("express");
const mongoose      = require("mongoose");
const bodyParser    = require('body-parser');
const populateSales = require('./src/populate/populate-sales');
const sales         = require('./src/model/sales.js');


var port = 3000;
var mongoUri = 'mongodb://localhost:27017/salesRecord'

// Initialize mongoose connection
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
// Establishing mongoose connection
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

// API for populating the database with meaningfull data
app.post("/sales/populate", async (req, res) => {
   const insertedData = await sales.insertMany(populateSales); 
   res.send(insertedData);
})

//===========================  TASK 1 : API to add data to the database ===========================
app.post("/sales/create",async (req, res) =>{
   const addedSale = await sales.create(req.body);
   res.send(addedSale);
})

//=========================== TASK 2 : Fetching stats from the data base ===========================
app.get("/sales/:id",async (req, res)=>{
    const {id} = req.params;

    const groupCondition = {
        numOfSales: {$sum: 1},    //displaying total number of sales made
        amount: {$sum: '$amount'} //sum of amount
    };

    // Assigning id to each object along with assigning date and time for the sales made
    if (id === 'monthly') {
        groupCondition._id = {$dayOfMonth: '$date'};
    } else if (id === 'weekly') {
        groupCondition._id = {$dayOfWeek: '$date'};
    } else if (id === 'daily') {
        groupCondition._id = {$hour: '$date'};
    } 

    // sorting the operation done based on "id"
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

    // Mapping the name of the day in accordance to the id
    const weekMap = {
        1: 'Sunday',
        2: 'Monday',
        3: 'Tuesday',
        4: 'Wednesday',
        5: 'Thursday',
        6: 'Friday',
        7: 'Saturday'
    }

    // sending the final data according to day, week or month in the form of an array
    let finalDataToBeSent = [];
    // sending monthly data starting from day 1
    if (id === 'monthly') {
        for(let i = 0; i <= 31; i++) {
            const currentDayOfMonth = allSales.find(sale => sale._id === i);
            finalDataToBeSent.push({day: i, amount: currentDayOfMonth ? currentDayOfMonth.amount : 0});
        }
    // sending weekly data from day 1
    } else if (id === 'weekly') {
        finalDataToBeSent = allSales.map(sale => {
            return ({Day: weekMap[sale._id], amount: sale.amount})
        });
    // sending hourly data starting from time 00:00
    } else if (id === 'daily') {
        for(let i = 0; i < 24; i++) {
            const currentHourData = allSales.find(sale => sale._id === i);
            finalDataToBeSent.push({hour: i, amount: currentHourData ? currentHourData.amount : 0});
        }
    } 

    res.send(finalDataToBeSent);
})

// Establishing connection at port 3000
app.listen(port, ()=>{
    console.log('running');
})