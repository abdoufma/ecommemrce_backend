async function ajax(url, data, method = "POST"){
    return await $.ajax({method: method,  url , data,  async: true});
}

async function upload(input){
    const fd = new FormData();
    fd.append("file", input.files[0]);
    return await $.ajax({method: "POST",  url : "/uploads" , data: fd, processData:false, contentType : false, async: true});
}



async function saveUser(user){
    console.log(user);
    return await $.ajax({method: "POST",  url : "/save_user", data: {user}, async: true});
}


async function saveProduct(product){
    console.log(product);
    
    return await $.ajax({method: "POST",  url : "/save_prod", data: product, async: true}); 
}

async function saveOrder(product){
    console.log(product);
    
    return await $.ajax({method: "POST",  url : "/save_order", data: product, async: true}); 
}

async function saveStatu({id, status}){
    return await $.ajax({method: "POST",  url : "/save_status", data: {id, status}, async: true}); 
}

function showDrawer(id){
    $(".drawer").removeClass("active");
    $("#"+id).addClass("active");
    $('#film').fadeIn();
}


function closeDrawer(){
    $(".drawer").removeClass("active");
    $('#film').fadeOut();
}




$(document).on('click', '#film, .close-drawer', function (e) {
    e.stopPropagation();
    closeDrawer("user_drawer");

    $('#film').fadeOut();
    $('.drawer_user').removeClass('active')
});

async function load_orders(param) {
    
    const all_orders =  await $.ajax({ method: "POST", url: "/load_orders" ,data: { id : param } , async: true });
    numberOrders = 0;
    for (var i in all_orders) {
        ORDERS[all_orders[i].id] = all_orders[i];
        ORDERS[all_orders[i].id].products = JSON.parse(ORDERS[all_orders[i].id].products);
        numberOrders += 1 ;
    };
    return all_orders
}