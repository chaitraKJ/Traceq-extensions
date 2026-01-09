console.log("TraceQ - Icounty script injected");

const website_var = "icounty_org";

function get_the_credentials(){
	chrome.storage.local.get([website_var]).then(async (result) => {
		try{

			if(result[website_var] && result[website_var]['password'] && result[website_var]['username']){
				const { username, password } = result[website_var];

				const interval = setInterval(() => {	
					username_input = document.querySelector("form input[name='loginModel.username1']");
					password_input = document.querySelector("form input[name='loginModel.password']");	

					if(username_input && password_input){
						clearInterval(interval);

						Static_global.password_input = password_input;
						var myp5 = new p5(s);

						username_input.setAttribute("readonly", true);
						password_input.setAttribute("readonly", true);
						password_input.style.filter = "blur(5px)";

						username_input.value = atob(username);
						password_input.value = atob(password);
					}
				}, 1000);
				
			}
		}
		catch(error){
			console.log("TraceQ Extension Content-Script Error: "+error);
		}
		finally{
			await chrome.storage.local.remove([website_var], () => {
				var error = chrome.runtime.lastError;
				if (error) {
					console.error(error);
				} 
			});
		}	
	});
}
get_the_credentials();