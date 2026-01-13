console.log("TraceQ - Fildlar - Tapestry script injected");

const website_var = "www_idocmarket_com";

function go_to_login(){
	chrome.storage.local.get([website_var]).then(async (result) => {
		try{

			if(result[website_var] && result[website_var]['password'] && result[website_var]['username']){

				const login_btn = document.querySelector(".login-button");

				if(login_btn){				
					login_btn.click();

					await chrome.runtime.sendMessage({
						type: "REGISTER",
						url: "https://identity.tylerportico.com/*",
						file_name: website_var
					});
				}
				else{
					const { username, password } = result[website_var];

					const mainInterval = setInterval(async () => {	
						try{
							const username_input = document.querySelector("#identifier");
							const next_btn = document.querySelector("button[type='submit']")					

							if(next_btn && username_input){
								clearInterval(mainInterval);

								username_input.click();							
								username_input.value = atob(username);;
								username_input.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
								username_input.setAttribute("readonly", true);

								setTimeout(() => {
									next_btn.click();
								}, 4000);

								let interval = setInterval(async () => {
									try{
										const password_input = document.querySelector("#credentials\\.passcode");
										const select_password = document.querySelector('ul[data-se="authenticator-verify-list"]  button[aria-label="Select Password."]');
										
										if(select_password){
											select_password.click();
										}
										else if(password_input){
											clearInterval(interval);

											Static_global.password_input = password_input;
											var myp5 = new p5(s);

											password_input.click();
											password_input.style.filter = "blur(5px)";															
											password_input.value = atob(password);
											password_input.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
											password_input.setAttribute("readonly", true);										

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
									catch(error){
										console.log("TraceQ Extension Content-Script Error: "+error);
									}							
								}, 1000);
							}
						}
						catch(error){
							console.log("TraceQ Extension Content-Script Error: "+error);
						}
					}, 1000);

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