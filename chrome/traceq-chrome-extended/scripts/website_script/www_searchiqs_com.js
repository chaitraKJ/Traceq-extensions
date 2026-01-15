console.log("TraceQ - SearchIQ script injected");

const website_var = "www_searchiqs_com";

function get_the_credentials(){
	chrome.storage.local.get([website_var]).then(async (result) => {
		try{

			if(result[website_var] && result[website_var]['password'] && result[website_var]['username']){
				const { username, password } = result[website_var];

				let interval = setInterval(() => {

					let username_input = document.getElementById("username");
					let password_input = document.getElementById("password");

					if(username_input && password_input){
						clearInterval(interval);

						Static_global.password_input = password_input;
						var myp5 = new p5(s);
					
						password_input.style.filter = "blur(5px)";

						username_input.click();
						username_input.value = atob(username);
						username_input.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
						username_input.setAttribute("readonly", true);
						
						password_input.click();
						password_input.value = atob(password);
						password_input.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
						password_input.setAttribute("readonly", true);						
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