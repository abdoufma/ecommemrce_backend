//@ts-check
"use strict";

// fs est un module qui conotient des fonctions utiles pour la manpulation des fichiers
const fs = require("fs");
const express = require("express");
const multer = require("multer");
const session = require('express-session')
const path = require("path");
const db = require("./db");
const hbs = require("hbs");
const { randomBytes } = require("crypto");
const { extname, basename } = require("path");
const moment = require("moment");



const PORT = 80;
const baseUrl = path.join(__dirname, 'public');
const uploadDir = path.join(__dirname, 'public/images');


const app = express();

const sessionConfig = {
    secret: 'mypassword',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge : 1000 * 3600 * 24}
};

const generate_filename = (file) => randomBytes(24).toString('hex') + extname(file.originalname);

const storage = multer.diskStorage({
    destination:function(req, file, cb){cb(null, uploadDir);},
    filename: function(req, file, cb){cb(null, generate_filename(file));}
});
  


const upload = multer({storage});

app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(session(sessionConfig));
app.use(express.static(baseUrl));

//app.use(express.static(baseUrl));




app.set('view engine', 'html');
app.set('views', baseUrl);
app.engine('html', hbs.__express);


app.get("/", (req, res) => {
    const filePath = path.join(baseUrl, "index.html");
    const html_content = fs.readFileSync(filePath).toString();
    res.send(html_content);
});


app.get("/catalog", async (req, res) => {
    if(req.session.user_id){
        const user = await db.select("id, name, email, password, photo, favs", "users", {id : req.session.user_id}, "row");
        // console.log(user);
        res.render("catalog", {user : JSON.stringify(user)});
    }else{
        res.redirect("/login");
    }
});



app.get("/product/:id", async (req, res) => {
    const {id} = req.params;
    const [product] = await db.select("*", "products", {id});
    if(product){
        res.render("product", product);
    }else{
        res.status(404).send("<h2>Error 404 : Page not found</h2>");
    }
});



app.get("/login", (req, res) => {
    // console.log({"current_user": req.session.user_id});
    res.render("login");
});
app.get("/admin", (req, res) => {
  
    res.render("admin");
});


app.post(`/uploads`, upload.single('file'), (req, res, next) => {
	console.log('uploading....');
	if(req.file){
        console.log(req.file);
		const file_name = req.file.filename;
        //console.log(file_name);
		res.json({file_name});
	}else{
        console.log("OOOOPS");
    }
});


app.post("/load_products", async(req, res) => {
    const products = await db.select("*", "products",{category:1});
    res.send(products);
});

app.post("/load_products_all", async(req, res) => {
    const products = await db.select("*", "products");
    res.send(products);
});


app.post("/load_products_watch", async(req, res) => {    
    const products = await db.select("*", "products",{category:2});
    res.send(products);
});


app.post("/load_users", async(req, res) => {
    const users = await db.select("*", "users");    
    res.send(users);
});

app.post("/load_orders", async(req, res) => {
    const currentUser = req.body
    if (currentUser.id) {
        const orders = await db.select("*", "orders",{user_id :currentUser.id }); 
        
        res.send(orders);
    }else{
    const orders = await db.select("*", "orders");    
        
    res.send(orders);
    }
});


// endpoint = point de communication

app.post("/save_user", async(req, res) => {
    const {user} = req.body;
    if(user.id){
        await db.update("users", user, {id : user.id});
    }else{
        let {insertId} = await db.insert("users", user);
        user["id"] = insertId;
    }

    res.send(user);
});


app.post("/save_prod", async(req, res) => {
    const prod = req.body;
    console.log(prod)
    if(prod.id){
        await db.update("products", prod, {id : prod.id});
    }else{
        // console.log(prod);
        let {insertId} = await db.insert("products", prod);
        prod["id"] = insertId;
        console.log(prod,insertId)
    }
    res.send(prod);
});


app.post("/delete_user", async(req, res) => {
    const user = req.body;
    console.log(user)
    await db.delete("users",  {id : user.id},"row");
    res.end();
});

app.post("/delete_prod", async(req, res) => {
    const prod = req.body;
    // console.log(prod,{prod})
    await db.delete("products",  prod ,"row");
    res.end();
});


app.post('/login', async  (req, res) => {
    const {user} = req.body;
    const existingUser = await db.select("*", "users", {email : user.email, password : user.password}, "row");
    if(existingUser){
        req.session["user_id"] = existingUser.id;

        res.send({success: true});
    }else{
        res.send({error : "User not found!"});
    }
});




app.post('/signup', async  (req, res) => {
    const {user} = req.body;
    console.log(user);
    const existingUser = await db.select("*", "users", {email : user.email}, "row");
    if(existingUser){
        res.send({error : "User already exists!"});
    }else{
        await db.insert("users", {...user, favs : "[]",});
        res.send("ok");
    }
});

app.post('/add_product', async  (req, res) => {
    const prod = req.body;
    console.log(prod.user);
    // const existingUser = await db.select("*", "users", {email : user.email}, "row");
    // if(existingUser){
    //     res.send({error : "User already exists!"});

    await db.insert("products", prod.user);
    res.send("ok");
});


app.post("/save_order", async(req, res) => {
    const order = req.body;
    
    if(order.id){
        await db.update("orders", order, {id : order.id});
    }else{
        let {insertId} = await db.insert("orders", order);
        order["id"] = insertId;
    }

    res.send(order);
});


app.post("/save_status", async(req, res) => {
    const order = req.body;
    const {id, status} = req.body;

    await db.update("orders", {status}, {id});
   
    res.send(order);
});


app.get("/get_stat_orders", async(req, res) => {
    const start_date = moment().subtract(7, "days");
    const number_of_days = 7;
    console.log(start_date.format());
    let orders = await db.select("*","orders");
    orders = orders.filter(o => moment(o.date).diff(start_date, "day") >= 0);
    const orders_by_date = {};
    console.log(orders.length);
    for (const order of orders) {
        const orderDay = moment(order.date).format("DD MMM");
        if(orders_by_date[orderDay] === undefined){
            orders_by_date[orderDay] = [];
        }
        orders_by_date[orderDay].push(order);
    }
    // {"03-10" : [{},{}], "04-oct" : [{}], "07-10" : [{}]}

    console.log(orders_by_date);

    const firstDay = start_date.format("DD MMM");

    if(orders_by_date[firstDay] === undefined){
        orders_by_date[firstDay] = [];
    }

    for (let i = 0; i < number_of_days; i++) {
        const currentDay = start_date.add(1, "day").format("DD MMM");
        console.log(currentDay);
        if(orders_by_date[currentDay] === undefined){
            orders_by_date[currentDay] = [];
        }
    }

    res.send(orders_by_date);
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

app.listen(PORT, () => console.log(`server is listening on port ${PORT}` ));


