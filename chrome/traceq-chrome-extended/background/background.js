console.log("TraceQ Background Service Worker");

const LOCAL_SITE_URL = "http://localhost/traceq-task/traceqlabs-credential-masking";
const SITE_URL = "https://traceqlabs.com";

const MAIN_URL = SITE_URL;

chrome.runtime.onInstalled.addListener(async () => {
	await chrome.storage.local.clear();
	await chrome.scripting.unregisterContentScripts();
});

const disable_password_sharing = () => {
	return new Promise ((resolve, reject) => {
		try{
			let getting = chrome.privacy.services.passwordSavingEnabled.get({});
			getting.then((got) => {
				if(got.levelOfControl == "controlled_by_this_extension" || got.levelOfControl == "controllable_by_this_extension"){
					chrome.privacy.services.passwordSavingEnabled.set({ value: false }, function() {
						if (chrome.runtime.lastError === undefined) {
							console.log("SUCCESS : PASSWORD STORING IS DISABLED");
							resolve(true);
						} else {
							reject(new Error("Sadness!", chrome.runtime.lastError));
						}
					});
				}
				else{
					reject(new Error("FAILED : NOT ABLE TO SET PASSWORD_SAVING_ENABLED - "+ got.levelOfControl));
				}
			})
			.catch((error) => { 
				reject(new Error(error));
			});
		}
		catch(error){
			reject(new Error(error));
		}
	});
}

const fetch_application_data = (app_id) => {
	return new Promise (async (resolve, reject) => {
		try{
			const form = new FormData();
			form.append("application_id", app_id);

			const response = await fetch(`${MAIN_URL}/ad-get-application-information`, {
				method: "POST",
				body: form
			});
			const result = await response.json();

			if(result['type'] == "success"){
				resolve({
					application_id: app_id,
					url: result['url'],
					username: result['username'],
					password: result['password']
				});
			}
			else{
				reject(new Error("ERROR : "+result));
			}
		}
		catch(error){
			reject(new Error(error));
		}	
	});
}

const create_new_tab = (url) => {
	return new Promise((resolve, reject) => {
		chrome.tabs.create({active: true, url: url})
		.then((tab) => {
			console.log("SUCCESS : CREATED NEW TAB");
			resolve(tab);
		})
		.catch((error) => {
			reject(new Error(error));
		});
	});
}

const inject_script = (tab, file) => {
	return new Promise((resolve, reject) => {
		chrome.scripting.executeScript({
			target: { tabId: tab.id },
			files : ["scripts/mask_script/p5.js", "scripts/mask_script/mask_input.js", "scripts/mask_script/canvas_generator.js", `scripts/website_script/${file}.js`]
		})
		.then(() => {
			console.log("SUCCESS : RIGHT MOUSE CLICK AND COPY/PASTE/CUT/... FUNCTIONALITIES DISABLED");
			resolve(true);
		})
		.catch((error) => {
			console.log(error);
		});
	});
}

const send_user_activity_data = (data) => {
	return new Promise(async (resolve, reject) => {
		const form = new FormData();
		form.append("user", data['user']);
		form.append("application", data['application']);
		form.append("url", data['url']);
		form.append("activity", data['activity']);
		form.append("amount", data['amount']);
		fetch(`${MAIN_URL}/ad-log-user-activity`, {
			method: "POST",
			body: form
		})
		.then((response) => {
			return response.json();
		})
		.then((result) => {
			resolve(true);
		})
		.catch((error) => {
			reject(new Error(error));
		})		
	});
}

// Event listener
async function handleMessages(message, sender, sendResponse) {
	try{
		if(message['type'] == "APP_DATA"){
			let tab = null;

			// GET THE INFO
			let application_id = message['application_id'];
			let tab_type = message['tab'];

			await disable_password_sharing();

			const result = await fetch_application_data(application_id); 

			tab = (tab_type == "NEW") ? await create_new_tab(result['url']) : sender['tab'];

			if(result['username'] != "" && result['password'] != "" && result['url'] != ""){

				// GET THE FILE INFO
				let url_obj = URL.parse(result['url']);
				let file_name = url_obj.hostname.replace(/[.]/g, '_');

				// STORE THE USERNAME AND PASSWORD
				await chrome.storage.local.set({ [file_name]: 
					{ 
						application_id: btoa(application_id),
						username: btoa(result['username']), 
						password: btoa(result['password']) 
					} 
				});

				// INJECT THE SCRIPTS
				await inject_script(tab, file_name);
			}			
		}
		else if(message['type'] == "REGISTER"){
			let url = message['url'];
			let file_name = message['file_name'];

			if(file_name && url){
				chrome.scripting.registerContentScripts([{
					id: "default_id",
					matches: [url],
					js: ["scripts/mask_script/p5.js", "scripts/mask_script/mask_input.js", "scripts/mask_script/canvas_generator.js", `scripts/website_script/${file_name}.js`]
				}])
				.then(() => {
					console.log("Script Registered");
				})
				.catch((error) => {
					console.log(error);
				})
			}
		}
		else if(message['type'] == "UNREGISTER"){
			await chrome.scripting.unregisterContentScripts();
		}
		else if(message['type'] == "USER_ACTIVITY"){
			if(message['data']){
				await send_user_activity_data(message['data']);
			}
		}
	}
	catch(error){
		console.log("TraceQ Extension Background-Worker Error: "+error);
	}
}
chrome.runtime.onMessage.addListener(handleMessages);