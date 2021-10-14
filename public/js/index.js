// const { Chart } = require("chart.js");

let SELECTED_PRODUCT_ID = null;

let prod = {};

let products = {};

let watches = {};

let proW = {};

const cart = {};

const order_history = {}


$(document).on('click', '.navigate_but', async function (e) {
    $('.navigate_but').removeClass('active');
    $(this).addClass('active');
    closeDrawer();
    const page_name = $(this).data("id");
    navigate_to(page_name);
});

 function navigate_to(page_name){
    CURRENT_PAGE = page_name;
    console.log(page_name)
    switch (page_name) {
        case "catalog":  displayCatalog(products); break;
        case "favorie": fill_fav_list(); break;
        case "historic": historic_orders(ORDERS); break;
              
        case "account" :; break;
    
        default: displayCatalog(products); break;
    }

    $(".page").css("display", "none");
    $(`.page[data-name=${page_name}`).css("display", "block");
}

async function productsf(){
    const result = await $.ajax({method: "POST",  url : "/load_products" , async: true});
    return result; 
}
async function productsW(){
    const result = await $.ajax({method: "POST",  url : "/load_products_watch" , async: true});
    return result; 
}

 

 $(document).on('click', '.watches',  function(e){
     displayCatalog(watches);
     
    
    $('.module-border').removeClass('active')
    $(this).closest('.module-border').addClass('active')
    
    
});

$(document).on('click', '.sneakers',  function(e){
    displayCatalog(products);
    $('.module-border').removeClass('active')
    $(this).closest('.module-border').addClass('active')
    
});
let ORDERS = {};
$(document).ready(async function(){
    currentUser.favs = JSON.parse(currentUser.favs);
    await load_orders(currentUser.id);
    
    prod = await productsf();
    for (var i in prod) {
        products[prod[i].id]=prod[i]
    }

    proW = await productsW();
    for (var i in proW) {
        watches[proW[i].id]=proW[i]
    }

    // console.log(proW,all_products)
    displayCatalog();
    fillProfilePage();
    
    
    
});
    

function fillProfilePage(){
    $("#info_user_profile, input").each(function(i, v){
        const key = $(v).data("id");
        if( $(v).attr("type") === "file"){
            $("#user_profile_img").attr("src", "images/" +  currentUser.photo || "profile.png");
            return;
        }
        $(v).val(currentUser[key]);
    });

    const imgSrc = '/images/' +  currentUser.photo || "profile.png";
    console.log(imgSrc);
    console.log( currentUser.photo);

    $("#user_profile_img").attr("src", imgSrc);
}


$(document).on('click', "#user_profile_img", function(e){
    $("#avatar").click();
});


$(document).on('click', '#modif_but', async function(e){
    e.stopPropagation();
    const user =  { id : currentUser.id, photo :  UPLOADED_IMAGE };
    $("#info_user_profile input:not([type='file'])").each(function(i, v){
        const key = $(v).data("id");
        user[key] = $(v).val();
    });

    await saveUser(user);
    currentUser = {...currentUser, ...user};
    displayCatalog();
    fillProfilePage(); 
});


$("#avatar").on("change", async function(){
    try {
        const input = $("#avatar")[0];
        const {file_name} = await upload(input);
        $("#user_profile_img").attr("src", "images/" +  file_name);
        $("#product_img").attr("src", "images/" +  file_name);
        UPLOADED_IMAGE = file_name;
    } catch (error) {
        console.error(error);    
    }
})





function displayCatalog(catalog_products = products){
    let models_html = "";
    for (let pid in catalog_products){
        const product = catalog_products[pid];
        models_html += productElement(product);
    }

    $("#content_products").html(models_html);
    // console.log(models_html)
}


function productElement(product){    
    const html = `
    <div class="card_product center" data-id="${product.id}">
        <div class="auto-1fr center">
            <div class="remise">${product.remise}</div>
            ${productFavHTML(product.id)}
        </div>

        <div class="model_content">
            <div class="background_product ">
                <img src="./images/${product.bg}" alt="">
            </div>
            <div class="model">
                <img src="./images/${product.image}" alt="">
            </div>
        </div>
        <div class="fs18">${product.name}</div>
        <div class="bold fs20">$${product.price}.00</div>
        <div>
            <div class="fas ">
                ${ratingHTML(product.rating)}
            </div>
            <span class="gray fs15">(${product.rating})</span>
        </div>

    </div>`;

    return html;
};



function ratingHTML(rating){
    let html = "";
    
    /**@TODO modiifer cette logique opur qu'elle prenne en charge les rating en decimal */

    for (let i = 1; i <= rating; i++) {
        html += `<span class="fas fa-star b1"></span>`;
    }

    const ratingIsEven = rating == parseInt(rating)

    if(!ratingIsEven){ // rating est un entier
        html += `<span class="fas fa-star b3"></span>`;
    }

    const NbrEtoilesGrises = ratingIsEven ? 5 - rating :  5 - rating - 1;

    for (let i = 1; i <= (Math.ceil(NbrEtoilesGrises)) ; i++) {
        html += `<span class="fas fa-star b2"></span>`;
    }

    return html;
}


///////////////////////////////////////////////////
///////////////    PRODUCT PAGE    ////////////////
///////////////////////////////////////////////////


$(document).on('click', '.card_product', function(e){
    const product_id = $(this).data("id");
    SELECTED_PRODUCT_ID = product_id;
    const product = products[product_id];
    console.log(SELECTED_PRODUCT_ID);
    showProductPage(product);
    
     
}) ;


function showProductPage(product){
    const imageHTML = productImagesHTML(product);
    const remiseHTML = productRemiseHTML(product);
    const infosHTML = productHTML(product);
    const priceHTML = productPriceHTML(product);
    const addCartHTML = productAddCartHTML(product);
    
    $(".model_choose").html(imageHTML);
    $("#product-page .remise").html(remiseHTML);
    $("#product-page .add_to_fav")[0].outerHTML = (productFavHTML(product.id));
    $(".content").html(infosHTML);
    $(".end .price").html(priceHTML);
    $(".end .add_cart").html(addCartHTML);

    showDrawer("product-page");
}



function productImagesHTML(product){
    return `<img  src="./images/${product.image}" alt="">`
}

function productRemiseHTML(product){
    return `<div>${product.remise}</div>`;
}

function productPriceHTML(product){
    return `<div>$ ${product.price}.00</div>`;
}

function productFavHTML(pid){
    const isFav = currentUser.favs.includes(pid);
    // console.log(typeof pid);
    // console.log(`${pid}`, isFav);
    return `
        <div class="add_to_fav fa_icon right ${isFav ? "active" : "" }">
                <i class="${isFav ? "fas" : "far" } fa-heart"></i>
        </div>`
}

function productAddCartHTML(product){
    return ` <div><img src="./images/icons8-trolley-96.png" alt=""></div>
                <div class="add fs15"data-id="${product.id}">Add To Cart</div>
            `;
}


function productHTML(product){
    return `        
        <div class=" blue line-h30">
            <div class="fr1-auto acenter">
                <div class="fs25 bold">${product.name}</div>
                <div class="auto2 acenter gap5">
                    <div class="fas fa-star b1"></div>
                    <div class="gray fs15">(${product.rating})</div>
                </div>
            </div>
            <div class="fs18">${product.description}</div>
        </div>
        <div class="auto-1fr fs18 acenter">
            <div class="gray ">Size:</div>
            <div class="size_choose acenter">
                <div class="bold size active">US 6</div>
                <div class="bold size">US 7</div>
                <div class="bold size">US 8</div>
                <div class="bold size">US 9</div>
            </div> 
        </div>
        <div class="auto-1fr fs18 acenter">
            <div class="gray ">Avalable Color:</div>
            <div class="color_choose acenter">
                
                <div class="bold color color_red"></div>
                <div class="bold color color_yellow active"></div>
                <div class="bold color color_purple"></div>
                <div class="bold color color_blue"></div>
            </div> 
        </div>`
  
};




///////////////////////////////////////////////////
///////////////////    GENERAL  ///////////////////
///////////////////////////////////////////////////

$(document).on('click','.back_btn', function(e){
    closeDrawer();
    navigate_to("catalog");
});




$(document).on('click','.size', function(e){
    $('.size').removeClass('active');
    $(this).addClass('active'); 
    
});
$(document).on('click','.color', function(e){
    $('.color').removeClass('active');
    $(this).addClass('active'); 
    
});

///////////////////////////////////////
/////////////  cart  //////////////////
///////////////////////////////////

$(document).on('click', '.add_cart', function(e){
    const product_id = $('.add').data("id");
   
    const product = products[product_id];

     const cart_item = {
        product_id:product_id,
        // size : SELECTED_SIZE,
        // color: SELECTED_COLOR,
        price : product.price,
        image : product.image,
        qty : 1,
    }
    
    addItemToCart(cart_item);
    showCart();

}) ;

function incrementProductQty(product_id){
    cart[product_id].qty++;
    showCart();
}

function decrementProductQty(product_id){
    cart[product_id].qty--;
    if (cart[product_id].qty <0) {
        cart[product_id].qty=0
    }
    showCart();
}

function addItemToCart(cart_item){
    cart[cart_item.product_id] = cart_item;
}



function showCart(){
    let cartHTML="";
    let total = 0;
    
    for (const product_id in cart) {
        const cart_item = cart[product_id];
        
        total += cart_item.qty * cart_item.price;
        cartHTML += cartItemHTML(cart_item);
    }
    
    let tax = 40;
    if (total===0) {
        tva=0
    }

    $("#cart_page .container").html(cartHTML);
    $(".cart-subtotal").text(  `$${total}`);
 
    $(".tota_html").html(`<div class="cart-total" data-id="${total+tax}">$ ${total+tax}.00</div>`)
    showDrawer("cart_page");
}

function cartItemHTML(order_info){
    const product_info = products[order_info.product_id];
    const all_info = {...product_info, ...order_info};

    return `
            <div class="card_content gap15 p10  acenter"data-id="${all_info.id}" >
                <div class=""><img src="./images/${all_info.bg}" alt=""></div>
                <div class="model_in_cart"><img src="./images/${all_info.image}" alt=""></div>

                <div class="info_card line-h30 blue">
                    <div class="fs18">${all_info.name}</div>
                    <div class="fs20 bold">$${all_info.price}.00</div>
                </div>

                <div class="quantity center fs18 p10 ">
                    <div class="minus">-</div>
                    <div class="qty">${all_info.qty}</div>
                    <div class="plus">+</div>
                </div>
             </div>`;
};


$(document).on('click','.minus',function(e){
    const product_id  = $(this).closest('.card_content').data('id');
    decrementProductQty(product_id);
});

$(document).on('click','.plus', function(e) {
    const product_id = $(this).closest('.card_content').data('id');
    incrementProductQty(product_id);
});


$(document).on('click','#product-page .add_to_fav', function(e) {
    const product = products[SELECTED_PRODUCT_ID];
    const isFav = currentUser.favs.includes(SELECTED_PRODUCT_ID);

    isFav ? removeItemFromFav() : addItemToFav(product.id);

    this.outerHTML = productFavHTML(SELECTED_PRODUCT_ID);
    displayCatalog();
});


$(document).on('click','.card_product .add_to_fav', function(e) {
    e.stopPropagation();
    const pid = parseInt($(this).closest(".card_product").data("id"));

    const isFav = currentUser.favs.includes(pid);

    isFav ? removeItemFromFav(pid) : addItemToFav(pid);

    this.outerHTML = productFavHTML(pid);
});


async function addItemToFav(pid){
    if(!currentUser.favs.includes(pid)) currentUser.favs.push(pid);
    const favs = JSON.stringify(currentUser.favs);
    const user = {id : currentUser.id, favs};
    await $.ajax({method: "POST",  url : "/save_user", data: {user}, async: true});
    fill_fav_list();
}

async function removeItemFromFav(pid = SELECTED_PRODUCT_ID){
    const IdToBeDeleted = currentUser.favs.indexOf(pid);
    if (IdToBeDeleted === -1) return;
    console.log(`je vais supprimer ${pid}(${IdToBeDeleted})`);
    currentUser.favs.splice(IdToBeDeleted, 1);
    const favs = JSON.stringify(currentUser.favs);
    const user = {id : currentUser.id, favs};
    await $.ajax({method: "POST",  url : "/save_user", data: {user}, async: true});
}

function fill_fav_list(fav_products = currentUser.favs){
    let models_html = "";
    for (let pid of fav_products){
        const product = products[pid];
        //console.log(product);
        //console.log(product);
        models_html += productElement(product);
    }

    $("#content_products_favs").html(models_html);
   
}
$(document).on('click', '.favorie', function(e){
    fill_fav_list();
    showDrawer("favorie_page");
}) ;


//////////////////////////////////////
///////////   Supprimer  ////////////
//////////////////////////////////////

$(document).on('click', ".supprimer", function(e){
    for (const product_id in cart) {
        delete cart[product_id];
    }
   
    showCart();
});

/**
 * @TODO UI : font family, icones, cercle_dots.
 * @TODO Interactivity  size, color select, add_to_fav, filters.
 * @TODO Pages : Cart, Wishlist.
*/



///////////////////////////////////////////
/////////     account setting     ///////////////////
///////////////////////////////////////////





$(document).on('click', '.trolley', function(e){
    showDrawer("cart_page");
});


$(document).on('click', '#check_out',async function(e){
    const totalPrice = $('.cart-total').data("id");
    
    const order_info = {status:"confirm", user_id:currentUser.id,products:cart, price:totalPrice};
    // saveStatu(order_info);
    // await saveOrder(order_info);
    await saveOrder(order_info);
    console.log(order_info);
});



$(document).on('click', '.historic', function(e){
    // showDrawer('historic_page');
    console.log(ORDERS);
    historic_orders(ORDERS);
      

});
 

function historic_orders(elements = ORDERS) {
    let models_html = "";
    
    for (let pid in elements) {
       const element = elements[pid];
        models_html +=  historic_order_element(element);
       
    }

    if(Object.keys(elements).length === 0){
        $("#orders-list").html(`<p class="center">Aucun élément n'a été trouvé.</p>`);
    }else{
        $("#history .container").html(models_html);
    }       

}

 function historic_order_element(order) {
    
    const orderQty = TotalQtyProducts(order.products);
    console.log(order.status)
    const html = `
                <div class="order_card acenter c1 "  data-id="${order.id}">

                    <div class="fr1-auto">
                        <div>Quantity of items :</div>
                        <div class="blue_name">${orderQty} </div>
                    </div>
                    
                    <div class="fr1-auto acenter">
                        <div>Totale price :</div>
                        <div class="blue_name">$ ${order.price}</div>
                    </div>
                        
                    <div class="fr1-auto acenter">
                        <div id="${order.status}" class="fs25">${order.status}</div>
                        <div class="gray">${moment(order.date).format("DD-MM-YYYY")}</div>
                    </div>
                   
                </div>`;      

    return html;
};

function TotalQtyProducts(element){
    let totalQty = 0;
    for (let i in element) {
        let qq = element[i].qty;
        totalQty +=  qq++;
    }
    console.log(totalQty)
    return totalQty;
    
};