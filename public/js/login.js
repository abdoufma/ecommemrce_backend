"use strict";


$(document).on('click', '.sign', function(e){
    e.stopPropagation();
    $(".run").removeClass("active");
    $(".run_up").addClass("active");
    // productsf(products);
 
    
});

$(document).on('click', '.login', function(e){
    e.stopPropagation();
    $(".run").addClass("active");
    $(".run_up").removeClass("active");
   
});

$(document).on('click', '#login_but', function(e){
    const email = $("#login_form").find(`input[data-id="email"]`).val();
    const password = $("#login_form").find(`input[data-id="password"]`).val();
    let userInfo = {email, password};
    console.log(userInfo);
    login(userInfo)
});

async function login(user){
    const result = await $.ajax({method: "POST",  url : "/login", data: {user}, async: true});
    if(result.success){
        window.location.href = "/catalog" ;
        setTimeout(async () => {
            const result = await $.ajax({method: "POST",  url : "/test", data: {user}, async: true});
            console.log(result);
        }, 1000);
    }else{
        console.log(result.error);
    }
}



$(document).on('click', '#signup_but', async function(e){
    e.stopPropagation();
    const name = $("#signup_form").find(`input[data-id="username"]`).val();
    const email = $("#signup_form").find(`input[data-id="email"]`).val();
    const password = $("#signup_form").find(`input[data-id="password"]`).val();
    const confPassword = $("#signup_form").find(`input[data-id="confirm-password"]`).val();
    

    let error_msg = "";
    
    const accepted = $("#accept-terms:checked").length != 0;
    const passwordMatch = password === confPassword ;

    if (!passwordMatch){
        error_msg = "Les deux mot de passe ne sont pas identique";
    }

    if (!accepted){
        error_msg = "Vous devez accepter les termes et conditions";
    }

    if(error_msg === ""){
        let userInfo = {name, email, password};
         error_msg = await signup(userInfo);
    }

    $('.message_err').text(error_msg);
   
});


async function signup(user){
    const result = await $.ajax({method: "POST",  url : "/signup", data: {user}, async: true});
    if(result.error){
        console.log(result.error);
        $('#signup_form .message_err').text(result.error);
        return error
    }else{
        console.log("compte crée avec succès!");
    }

}





