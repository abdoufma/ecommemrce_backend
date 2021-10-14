const {select, insert} = require("./db");


async function hello(){
    return new Promise(function(resolve, reject) {
        resolve("3");    
    });
}


function hello2(){
    return "3";
}


async function main(){
    console.log("1");   
    
    setTimeout(() => {
        console.log("2");   
    }, 0);

    let product = await select("*", "products", {id : 99});
    
    console.log(product);

    console.log("4");    
}

async function insert_products(){
    
    for (const k in products) {
        const product = products[k];         
        await insert("products", product);
        console.log(`Je viens d'inserer ${product.id}`);
    }
   
}

//insert_products();


//main()