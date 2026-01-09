console.log("TraceQ Extension - Content Script is collecting user info");

function ext_capture(){
	try{
		const logged_user_ele = document.getElementById("logger_username");
		if(logged_user_ele){
			const name = logged_user_ele?.textContent.trim();

			chrome.storage.local.set({ traceq_logged_user: name })
			.then(() => {
				// console.log("User Value is captured");
			})
			.catch((error) => {
				console.log("TraceQ Extension User-Capture Content-Script Error: "+error);
			});

		}
	}
	catch(error){
		console.log("TraceQ Extension User-Capture Content-Script Error: "+error);
	}
}
ext_capture();

setTimeout(() => { ext_capture(); }, 5000);