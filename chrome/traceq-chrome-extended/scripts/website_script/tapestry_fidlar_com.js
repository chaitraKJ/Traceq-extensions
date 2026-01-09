console.log("TraceQ - Fildlar - Tapestry script injected");

const website_var = "tapestry_fidlar_com";

function go_to_login(){
	chrome.storage.local.get([website_var]).then(async (result) => {
		try{

			if(result[website_var] && result[website_var]['password'] && result[website_var]['username']){

				const main_div = document.getElementById("Login");
				const login_btn = main_div.querySelector("#btnLogin");

				const username_input = main_div.querySelector("#LoginView1_Login1_UserName");
				const password_input = main_div.querySelector("#LoginView1_Login1_Password");

				if(login_btn){				
					login_btn.click();

					await chrome.runtime.sendMessage({
						type: "REGISTER",
						url: "https://tapestry.fidlar.com/tapestry2/Default.aspx",
						file_name: website_var
					});
				}
				else if(username_input && password_input){
					const { username, password } = result[website_var];
					
					Static_global.password_input = password_input;
					var myp5 = new p5(s);

					username_input.value = atob(username);
					password_input.value = atob(password);

					username_input.setAttribute("readonly", true);
					password_input.setAttribute("readonly", true);
					password_input.style.filter = "blur(5px)";

					await chrome.runtime.sendMessage({
						type: "UNREGISTER"
					});

					await chrome.storage.local.remove([website_var], () => { 				
						var error = chrome.runtime.lastError;
						if (error) {
							console.error(error);
						} 
					});
				}			
				
			}
		}
		catch(error){
			console.log("TraceQ Extension Content-Script Error: "+error);
		}
	})
	.catch((error) => {
		console.log("TraceQ Extension Content-Script Error: "+error);
	})
}
go_to_login();