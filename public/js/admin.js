"use strict";

const moment = require("moment");

let USERS = {};
let PRODUCTS = {};
let CURRENT_PAGE = "users";
let UPLOADED_IMAGE = "";
let currentId = null;
let ORDERS = {};
let ordersChart;

$(document).ready(async function () {   
    await load_users();
   
    display_users_list();
    await load_products();
    await load_orders();
    
});


$(document).on('click', '.nav_butt', async function (e) {
    $('.nav_butt').removeClass('active');
    $(this).addClass('active');
    $('.popup').fadeOut();
    const page_name = $(this).data("id");
    navigate_to(page_name);
});

async function navigate_to(page_name){
    CURRENT_PAGE = page_name;
    ordersChart?.destroy();
    switch (page_name) {
        case "users": display_users_page(); break;
        case "products": display_products_page(); break;
        case "orders": display_orders_page(); break;
        case "dashboard": 
            const {labels, graphData} = await formatGraphData();
            setTimeout(() => display_orders_graph(labels, graphData), 0);
            setTimeout(() => display_users_graph(labels, graphData), 0);
            break;
    
        default: display_users_list(); break;
    }

    $(".page").css("display", "none");
    $(`.page[data-name=${page_name}`).css("display", "block");
}

function display_orders_page(){
    $("#bar_admin .page_name").text("COMMANDES");
    display_orders_list();
}
let numberOfUsers = 0;
async function load_users() {
    const all_users = await $.ajax({ method: "POST", url: "/load_users", async: true });
    numberOfUsers=0;
    for (const user of all_users) {
        USERS[user.id] = await user; 
        numberOfUsers += 1;
    };
  

    return all_users;
}
let numberOfProducts = 0 ;
async function load_products() {
    const all_products =  await $.ajax({ method: "POST", url: "/load_products_all", async: true });
     numberOfProducts = 0 ;
    for (var i in all_products) {
        PRODUCTS[all_products[i].id] = all_products[i];
        numberOfProducts += 1;
    };
    return all_products
}


/////////////////////////////////////////////////////////// 
//////////////////      USERS PAGE    //////////////////// 
/////////////////////////////////////////////////////////// 


function display_users_page(){
    $("#bar_admin .page_name").text("UTILISATEURS")
    display_users_list();
}


function users_title() {
    const html = `
        <div>Identité</div>
        <div>N° de téléphone</div>
        <div>Email</div>
        <div>Adresse</div>
        <div>Date d'inscription</div>`;

    $('.table-element.title').html(html)
};


$(document).on('click', '.users-table-header .add_item', async function (e) {
    currentId = null;
    $(".form_case input").val("");
    if (CURRENT_PAGE === "users") { // users page
       
        showDrawer("user_drawer");
     
    } else {
        showDrawer("product_drawer");
    }
    

    $('#film').fadeIn();
    $('.popup').fadeOut();
    // console.log(productss);

});

$(document).on('click', '#user_drawer', function (e) {
    // e.stopPropagation();
});

const is_mobile = () => window.matchMedia("(max-width: 801px)").matches;

function display_users_list(users = USERS, search_term) {
    let models_html = "";
    for (let pid in users) {
        const user = users[pid];
        if(is_mobile()){models_html += user_list_element_mobile(user, search_term)
        }else{

            models_html += user_list_element(user, search_term) ;
        };
        // console.log(Object.keys(user))
    }

    $("#users-list").html(models_html);
}

function user_list_element(user, search_term) {

    if (user.phone_number == null) {
        user.phone_number = "";
    }
    //  console.log( user.name
    const html = `
                <div class="table-element mc1 acenter" data-id="${user.id}">
                    <div>
                        <div class="blue_name bold">${highlight_search_term(user.name, search_term)}</div> 
                        <div>Particulier</div> 
                    </div>
                    <div>${highlight_search_term(user.phone_number, search_term)}</div>
                    <div>${highlight_search_term(user.email, search_term)}</div>
                    <div>${highlight_search_term(user.address, search_term)}</div>
                    <div class="fr1-auto acenter">
                        <div class="gray">${moment(user.date).format("DD-MM-YYYY")}</div>
                        <i class="open-popup fas fa-ellipsis-v"></i>
                    </div>
                </div>
                `;
    return html;
};
function user_list_element_mobile(user, search_term) {

    if (user.phone_number == null) {
        user.phone_number = "";
    }
    //  console.log( user.name
    const html = `
                <div class="table-element mc1 acenter" data-id="${user.id}">
                    <div class="c2">
                        <div>Nom :</div>
                        <div class="fr1-auto">
                            <div class="blue_name bold">${highlight_search_term(user.name, search_term)}</div> 
                            
                            <i class="open-popup fas fa-ellipsis-v"></i>
                        </div>

                    </div>
                    <div class="c2">
                        <div>N° de tel :</div>
                        <div>${highlight_search_term(user.phone_number, search_term)}</div>
                    </div>
                    <div class="c2">
                        <div>Email :</div>
                        <div>${highlight_search_term(user.email, search_term)}</div>
                    </div>
                    <div class="c2">
                        <div>Address :</div>
                        <div>${highlight_search_term(user.address, search_term)}</div>
                    </div>
                    <div class="c2 acenter">
                        <div>Date :</div>
                        <div class="gray">${moment(user.date).format("DD-MM-YYYY")}</div>
                        
                    </div>
                </div>
                `;
    return html;
};

function highlight_search_term(value, term){
    value = value.replace(term, `<span class="red">${term}</span>`);
   
    return (value);
}




function getUserInfo() {
    let id = currentId;
    const info = {};
    $("#user_drawer .form_case input:not([type='file'])").each(function (i, v) {
        const key = $(v).data("id");
        info[key] = $(v).val();
    });

    if (id !== null) {
        info["id"] = id;
    }
    
    return info;
}
function getProductInfo() {
    let id = currentId;
    let image =(UPLOADED_IMAGE);
    if  (image == "") {
        image = "placeholder.png";
    }
    console.log(image)
    const info = {image};
    $("#product_drawer .form_case input:not([type='file'])").each(function (i, v) {
        const key = $(v).data("id");
        info[key] = $(v).val();
    });
    
    if (id !== null) {
        info["id"] = id;
    }
    console.log(info)
    
    return info;
}



    ///////////////////////////////////////////////////////////////////
    //////////////////////      products     //////////////////////////
    ///////////////////////////////////////////////////////////////////

    function display_products_page(){
        $("#bar_admin .page_name").text("PRODUITS")
        display_products_list();  
    }


    async function display_products_list(products = PRODUCTS, search_term) {
        let models_html = "";
        for (let pid in products) {
            const product = products[pid];
            // product_info(product, search_term);
            models_html += product_element(product, search_term);
            // console.log(Object.keys(user))
        }


        if(Object.keys(products).length === 0){
            $("#products-list").html(`<p class="center">Aucun élément n'a été trouvé.</p>`);
        }else{
            $("#products-list").html(models_html);
        }
    }
 

    function product_element(product, search_term) {
        let testHtml = ""
        console.log(product)
        if(is_mobile()){
            testHtml = `<div class="mc1 gap5">
                            <div>${highlight_search_term(product.name, search_term)}</div>
                            <div>$ ${product.price}</div>
                            <div>(${product.rating}/5)</div>
                            <div>${product.category}</div>
                            <div class="fr1-auto acenter">
                                <div class="gray">${moment(product.date).format("DD-MM-YYYY")}</div>
                                <i class="open-popup fas fa-ellipsis-v"></i>
                            </div>
                        </div>`;
        } else {
            testHtml = `<div>${highlight_search_term(product.name, search_term)}</div>
                        <div>$ ${product.price}</div>
                        <div>(${product.rating}/5)</div>
                        <div>${product.category}</div>
                        <div class="fr1-auto acenter">
                            <div class="gray">${moment(product.date).format("DD-MM-YYYY")}</div>
                            <i class="open-popup fas fa-ellipsis-v"></i>
                        </div>`;
        }
      

        const html = `
                <div class="table-element acenter  " data-id="${product.id}">
                    <div class="card_imag acenter">
                        <img src="./images/${product.image}" alt="">
                    </div>
                    ${testHtml}
                        
                    
                </div>
                `;
        return html;
    };

    



    $(document).on('click', '.open-popup', function (e) {
        order_products_html();
        let mouseX = e.clientX;
        let mouseY = e.pageY;
        console.log("hell");

        $('.popup').css("top", `${mouseY - 20}px`);
        $('.popup').css("left", `${mouseX - 250}px`);
       
        $('.orders-popup').css("top", `${mouseY - 20}px`);
        $('.orders-popup').css("left", `${mouseX - 250}px`);
        
        $('.table-element').removeClass('active');

        $(this).closest('.table-element').addClass('active');
        if (CURRENT_PAGE === "orders") {
            $('.orders-popup').fadeIn();
            
    
        }else{ $('.popup').fadeIn();};
       
        // $('.orders-popup').fadeIn();
       
        
        currentId = $(this).closest('.table-element').data("id");
        

    });

    $(document).on('click', '#annul_drawer  ', function (e) {
        $('#content_status button').removeClass('active')
        closeDrawer();
    
    });


    $(document).on('click', '.close-popup  ', function (e) {
        $('.popup').fadeOut();
        $('.orders-popup').fadeOut();
        // $('.status-popup').fadeOut();
        
    });

    $(document).on('click', '.popup .modif', function (e) {
        // console.log(currentId);
        // $('#c .title').text("Modifier");
        
        $('.popup').fadeOut();
        
        if (CURRENT_PAGE === "users") {
            $("#user_drawer .form_case input").each(function (i, v) {
                const key = $(v).data("id");
                $(v).val(USERS[currentId][key]);
            });
            showDrawer("user_drawer");
        }
       
        if (CURRENT_PAGE === "products") {
            const product = PRODUCTS[currentId];
            console.log(CURRENT_PAGE);
            console.log(product.image);
            $("#product_drawer .form_case input:not(#avatar)").each(function (i, v) {
                const key = $(v).data("id");
                $(v).val(product[key]);
            });
            if (product.image == "") {
                product.image = "placeholder.png";
            }
            $("#product_img").attr("src", "/images/" + product.image);
            
            showDrawer("product_drawer");
        }
        
    });


    $(document).on('click', '#save_item', async function (e) {
        e.stopPropagation();
        const savHtml = $(this).html()
        $(this).html(` <img  src="./images/save.gif" alt="">`);
        if (CURRENT_PAGE === "users") { // users page
            let itemInfo = getUserInfo();
            const dbUser = await saveUser(itemInfo);
            USERS[dbUser.id] = dbUser;
            display_users_list();
        } else {
            // const product = PRODUCTS[currentId]
           
            let itemInfo = getProductInfo();
            console.log(itemInfo);
            const dbProduct = await saveProduct(itemInfo);
            PRODUCTS[dbProduct.id] = dbProduct;
            display_products_list();

        }
        
        $(this).html(`${savHtml}`)
            closeDrawer();
       
        
    });

 
    $(document).on('click', '.popup .deleted',async function (e) {
        $('.popup').fadeOut();

        if (CURRENT_PAGE === "users") {
            await deleteItem({id: currentId});
            delete USERS[currentId];
            display_users_list();

        }else{
            await deleteItem({id: currentId});
            delete PRODUCTS[currentId];
            display_products_list();
        }
    });




async function deleteItem(user) {
        
    if (CURRENT_PAGE === "users") {
        await $.ajax({ method: "POST", url: "/delete_user", data:  user , async: true });        
        // console.log(load_users())
    };
    
    if (CURRENT_PAGE === 2) {
        await $.ajax({ method: "POST", url: "/delete_prod", data: user, async: true });
        await load_products();
        await display_products_list(PRODUCTS);
        
    };
    
}


$(document).on('click', "#product_img", function(e){
    $("#avatar").click();
});

$("#avatar").on("change", async function(){
    try {
        const input = $("#avatar")[0];
        const {file_name} = await upload(input);
        
        $("#product_img").attr("src", "images/" +  file_name);
        UPLOADED_IMAGE =  file_name;
    } catch (error) {
        console.error(error);    
    }
    console.log(UPLOADED_IMAGE);
})

//////////////////////////////////////////////////////////////////
////////////////         orders              /////////////////////
//////////////////////////////////////////////////////////////////

let nombreOrders = 0;
 function display_orders_list(elements = ORDERS , search_term) {
    let models_html = "";
    
    // console.log(ordersInfo)
    for (let pid in elements) {
       const element = elements[pid];
        models_html += orderElement(element , search_term);
        
    }
 
   
    if(Object.keys(elements).length === 0){
        $("#orders-list").html(`<p class="center">Aucun élément n'a été trouvé.</p>`);
    }else{
        $("#orders-list").html(models_html);
    }

}


 function orderElement(order , search_term) {
    const user = USERS[order.user_id]
    const order_products = order_products_html(order.products);

    const html = ` 
                <div class="table-element acenter gap30" data-id="${order.id}">
                    <div class="card_imag  acenter">
                    ${order_products}
                    </div>
                    <div class="user_info_orders mc2">
                        <div class="div_mobile">Nom :</div>
                        <div class="bold">${highlight_search_term(user.name, search_term)}</div>
                        <div class=" div_mobile">N° de tel :</div>
                        <div class="gray">${highlight_search_term(user.phone_number, search_term)}</div>
                        <div class="div_mobile">Email :</div>
                        <div class="gray">${highlight_search_term(user.email, search_term)}</div>
                        <div class="div_mobile">address :</div>
                        <div class="gray">${highlight_search_term(user.address, search_term)}</div>
                    </div>
                    <div class=" mc2">
                        <div class="div_mobile">Prix :</div>
                        <div>$ ${order.price}</div>
                    </div>
                    <div class=" mc2">
                        <div class="div_mobile">Status :</div>
                        <div id="${order.status}"class="gray">${highlight_search_term(order.status, search_term)}</div>
                    </div>
                    <div class="mc2 acenter ">
                        <div class="div_mobile">Date :</div>
                        <div class="fr1-auto acenter">
                            <div class="gray">${moment(order.date).format("DD-MM-YYYY")}</div>
                            <i class="open-popup fas fa-ellipsis-v"></i>
                        </div>
                    </div>
                </div>`;      
               
    return html;
    
};


function order_products_html(products){
  
    let htmlimage = "";
    for (let i in products) {
        htmlimage += `<div class="card_products">
        
        <img src="./images/${products[i].image}" alt=""></img>
        <div>
            <div>${PRODUCTS[products[i].product_id].name}</div>
            <div class=" blue_name">$ ${products[i].price}</div>
        </div>
        
        <div class="right blue_name">x${products[i].qty} </div>
        </div>
        `;
        // console.log(PRODUCTS[products[i].product_id].name);
    }
    // ${PRODUCTS[i].name} 
    return htmlimage;
    
};

 





 

$(document).on('click', '.modif_status', function (e) {
    e.stopPropagation();
    console.log(currentId)
    
    $('.orders-popup').fadeOut()
    $('.popup').fadeOut()
    showDrawer("status-popup-drawer");
    // $('.status-popup').fadeIn();
})  
$(document).on('click', '#save_statu',async function (e) {
    e.stopPropagation();
    const order_info = {status:statusBT, id:currentId};
    saveOrder(order_info);
    await load_orders();
    display_orders_list(ORDERS);
    $('#content_status button').removeClass('active')
    closeDrawer();
    
})  
let statusBT ="";
$(document).on('click', '#content_status button',async function (e) {
    e.stopPropagation();
   
    $('#content_status button').removeClass('active')
   
     statusBT =  $(this).closest('.btn-status').data("id");
    $(this).addClass('active')

    // $('.status-popup').fadeOut();
})  


///////////////////////////////////////////////
//////////       search      ///////////////////
///////////////////////////////////////////////


// let jj = months.splice(4, 1);
$("#search").on("keyup",  function(){
   
    let usersSearch = {} ;
    let ordersSearch = {} ;
    let productsSearch = {} ;
    let search = $(this).val();
    if (search === "" ){
        display_users_list();
        display_orders_list();
        display_products_list();
        return;
    }

    for (const i in USERS) {
        let user = USERS[i];
        if (user.name.includes(search) || user.phone_number.includes(search) || user.email.includes(search)|| user.address.includes(search)) {
            usersSearch[i] = user;
        }
    }
    
    for (const i in ORDERS) {
        let order = ORDERS[i];
        let element = USERS[order.user_id];
        if (element.name.includes(search) || element.phone_number.includes(search) || element.email.includes(search) || element.address.includes(search)|| order.status.includes(search)) {
            ordersSearch[i] = order;
        }
    }

    for (const i in PRODUCTS) {
        let prod = PRODUCTS[i];
      
        if (prod.name.includes(search) || prod.name.includes(search.charAt(0).toUpperCase() + search.slice(1)) ) {
            productsSearch[i] = prod ;
        }
        console.log(prod.name);        
    }

    display_orders_list(ordersSearch, search);
    display_users_list(usersSearch, search);
    display_products_list(productsSearch, search)
    // console.log(USERS[i].name);
    // console.log(usersSearch);
    console.log(productsSearch);
});

$(document).on('click','.search_bar',function (e) {
    if(is_mobile()){
        $('#bar_admin input').css('background-color','rgba(214, 214, 214, 0.6)');
        $('.add_item').css('display','none');
    };
});

//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

$(document).on('click','#main-content , #nav_bar_admin',function (e) {
    $('#bar_admin input').css('background','none');
    $('.add_item ').css('display','block');
    $("#bar_admin input").val("");
})


async function formatGraphData() {
    await load_users();
    await load_orders();
    await  load_products();
    $('#nomber_command').text(`${numberOrders} Commande`);
    $('#nomber_users').text(`${numberOfUsers} Utilisateur`);
    $('#nomber_products').text(`${numberOfProducts} Produits`);
    const stat_orders = await ajax("/get_stat_orders", null, "GET");
    const labels = Object.keys(stat_orders);
    const sortedLabels = labels.sort((a, b) => parseInt(a) - parseInt(b));

    const sortedValues = [];
    for(const label of sortedLabels){
        sortedValues.push(stat_orders[label]);
    }
    // console.log(sortedLabels);
    // console.log(sortedValues);
    const graphData = sortedValues.map( arr => arr.length);

    // console.log(graphData);

    return {labels : sortedLabels, graphData};
}

function display_orders_graph(labels, graphData) {
    $("#orders-graph").html(`<canvas id="orders-chart"></canvas>`);
    const ctx = document.getElementById('orders-chart').getContext('2d');
    const datasets = [{
        label: 'Nombre de commandes',
        data: graphData,
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1
    }, 
    ];

    ordersChart = graph(ctx, labels, datasets);
}


function display_users_graph(labels, graphData) {
    $("#users-graph").html(`<canvas id="users-chart"></canvas>`);
    const ctx = document.getElementById('users-chart').getContext('2d');
    const datasets = [{
        label: 'Nombre d\'utilisateurs actifs',
        data: graphData,
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1
    }, 
    ];

    ordersChart = graph(ctx, labels, datasets);
}

function graph(ctx, labels, datasets) { 
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels : labels || [],
            datasets : datasets || [],
        },
        options: {
            plugins : {
                legend : {
                    labels : {
                        boxHeight : 10
                    }
                }
            },
            transitions: {
                show: {
                  animations: {
                    x: {
                      from: 0
                    },
                    y: {
                      from: 1
                    }
                  }
                },
                hide: {
                  animations: {
                    x: {
                      to: 0
                    },
                    y: {
                      to: 0
                    }
                  }
                }
              },
            scales: {
                y: {
                    ticks : {
                        beginAtZero: true,
                        type : "tick",
                        stepSize: 1,
                    }
                }
            }
        }
    });
}

////////////////////////////////////////////////////////
////////////////////     trie         //////////////////
////////////////////////////////////////////////////////

// $(document).on('click','value ="1"',fun)
$(".select_trie").on("change", async function(e){
   
    let value = $(this).val();
    let arryAtrier;
    console.log(CURRENT_PAGE);
    if ( CURRENT_PAGE ==   "users") {
        arryAtrier =  await load_users();
        const objectTrier = trieCurrentPage(arryAtrier, value);
        display_users_list(objectTrier);
    }

    if (CURRENT_PAGE == "products" ) {
        arryAtrier =  await load_products();
        const objectTrier = trieCurrentPage(arryAtrier, value);
        display_products_list(objectTrier);
    }
    if (CURRENT_PAGE == "orders" ) {
        arryAtrier =  await load_orders();
        console.log(arryAtrier)
        const objectTrier = trieCurrentPage(arryAtrier, value);
        display_orders_list(objectTrier);
    }


});

function trieCurrentPage(arry, value,) {
    let objectTrier = {};
    console.log(value[0])
    
    if (value == "rating" || value == "price" || value == "phone_number"  || value == "category") {
        arry.sort((a, b) => a[value] - (b[value]))
    } else if(value === "date"){
        arry.sort((a, b) => moment(a).diff(b))
    }else{
        arry.sort((a, b) => a[value].localeCompare(b[value]))  ;
    }

    for (const i in arry) {
        objectTrier[i] =  arry[i]
    };


    return objectTrier
}