console.log("TraceQ - US-Title-Search script injected");

const website_var = "www_ustitlesearch_net";

function iframeRef(frameRef) {
	return frameRef.contentWindow ? frameRef.contentWindow.document : frameRef.contentDocument
}

const page_promise = () => {
	return new Promise((resolve, reject) => {
		let interval = setInterval(() => {
			const page_frame = document.querySelector("frame[name='page']");
			const page_content = iframeRef(page_frame);
			const frame = page_content?.querySelector("frame");
			if(frame){
				clearInterval(interval);
				resolve(frame);
			}
		}, 1000);
	})
}

function get_the_credentials(){
	chrome.storage.local.get([website_var]).then(async (result) => {
		try{

			if(result[website_var] && result[website_var]['password'] && result[website_var]['username']){
				const { username, password } = result[website_var];

				let username_input = null;
				let password_input = null;

				// CHANGE MAIN PAGE MAIN PAGE
				const frame_1 = await page_promise();
				frame_1.src = 'https://www.ustitlesearch.net/logon.asp?';			

				const frame_2 = await page_promise();

				let interval = setInterval(() => {
					const inputs = iframeRef(frame_2)?.querySelectorAll("form input");
					if(inputs && inputs.length >= 2){
						clearInterval(interval);

						const inputs = iframeRef(frame_2)?.querySelectorAll("form input");
						inputs.forEach((input, i) => {
							let name = input.getAttribute("name");
							if(name == "username"){
								username_input = input;
							}
							else if(name == "password"){
								password_input = input
							}
						})

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