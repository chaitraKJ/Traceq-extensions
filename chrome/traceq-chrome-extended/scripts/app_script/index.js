console.log("TraceQ extension running");

function attach_event(){
	try{
		const list_data = document.getElementById('list_data');
		if(list_data){
			const app_link = list_data.querySelectorAll(".app-link");
			app_link.forEach((app, i) => {
				app.removeEventListener('click', handle_click);
				app.addEventListener('click', handle_click);
			});
		}
	}
	catch(error){
		console.log("TraceQ Extension Content-Script Error: "+error);
	}
}

async function handle_click(event){
	try{
		const app = event.srcElement;
		if(app){
			const application_id = app.dataset.appid;
			if(application_id){
				const message = {
					type: "APP_DATA",
					tab: "NEW",
					application_id: application_id
				}
				await chrome.runtime.sendMessage(message);
			}
			else{
				throw new Error("Application Id is missing");
			}
		}
	}
	catch(error){
		console.log("TraceQ Extension Content-Script Error: "+error);
	}
}

let interval = null;
attach_event();
interval = setInterval(() => {
	try{
		const list_data = document.getElementById('list_data');
		if(list_data.children.length > 0){ 
			attach_event();
		}
	}
	catch(error){
		console.log("TraceQ Extension Content-Script Error: "+error);
	}	
}, 1000);