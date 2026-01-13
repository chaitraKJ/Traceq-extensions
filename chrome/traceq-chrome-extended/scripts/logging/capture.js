console.log("TraceQ Logger is running");

class Capture{
	constructor(){
		this.user = "";	 
		this.url = "";
		
		this.body = document.querySelector('body');

		this.get_logged_user();
		this.get_website_info();
		this.inject_logger();
	}
	get_logged_user(){
		let obj = this;
		chrome.storage.local.get(["traceq_logged_user"]).then((result) => {
			try{
				obj.user = result['traceq_logged_user'] ?? "Anon";			
			}
			catch(error){
				console.log("TraceQ Extension Content-Script Error: "+error);
			}	
		});
	}
	get_website_info(){
		this.url = window.origin;
	}
	inject_logger(){
		let obj = this;		
		if(obj.url.includes("tapestry.fidlar.com")){
			obj.tapestry();
		}
		else if(obj.url.includes("icounty.org")){
			obj.icounty();
		}
		else if(obj.url.includes("titlesearcher.com")){
			obj.title_searcher();
		}
		else if(obj.url.includes("ecclix.com")){
			obj.ecclix();
		}
		else if(obj.url.includes("doxpop.com")){
			obj.doxpop();
		}
		else if(obj.url.includes("texasfile.com")){
			obj.texasfile();
		}
	}
	tapestry(){
		const SEARCH_BTN_ID = "ContentPlaceHolder1_btnSearch";
		const AMOUNT_ID = "ContentPlaceHolder1_lblDataSourceSearchPrice";

		document.getElementById(SEARCH_BTN_ID)?.addEventListener("click", () => {
			try{
				const amount_div = document.getElementById(AMOUNT_ID);
				if(amount_div){
					let amount = amount_div.textContent.trim();
					amount = amount.split(" ");
					amount = amount[amount.length - 1];
					this.send_activity("SEARCH", "FIDLAR", amount);
				}
			}
			catch(error){
				console.log(error);
			}			
		});
	}
	icounty(){
		const FORM_ID = "Payment_Card_Info";
		const SUBMIT_BTN_ID = "btnSubmit";
		const AMOUNT_ID = "lblCharges";

		document.querySelector(`#${FORM_ID} #${SUBMIT_BTN_ID}`)?.addEventListener("click", (e) => {
			try{
				const amount_div = document.getElementById(AMOUNT_ID);
				let amount = "";
				if(amount_div){
					const table_tbody = amount_div?.querySelector("table tbody");
					if(table_tbody){
						const amount = table_tbody?.lastElementChild?.querySelector('td')?.textContent.trim();
					}
				}
				this.send_activity("SUBSCRIPTION", "ICOUNTY", amount);
			}
			catch(error){
				console.log(error);
			}
		});
	}
	title_searcher(){
		const FORM_ID = "payform";
		const SUBMIT_BTN = "input[name='pay']";

		document.querySelector(`#${FORM_ID} ${SUBMIT_BTN}`)?.addEventListener("click", (e) => {
			try{
				const amount_div = document.querySelector("#payform")?.closest("td")?.querySelector("b");
				const amount = amount_div?.textContent.trim();
				this.send_activity("SUBSCRIPTION", "TITLE SEARCHER", amount);
			}
			catch(error){
				console.log(error);
			}
		});
	}
	ecclix(){
		const SUBMIT_BTN = "ctl00_Content_ConfirmationDetails_BtnConfirm";
		const AMOUNT_ID = "ctl00_Content_ConfirmationDetails_oneTimeFeeTotal";

		document.querySelector(`#${SUBMIT_BTN}`)?.addEventListener("click", (e) => {
			try{
				const amount_div = document.querySelector(`#${AMOUNT_ID}`);
				if(amount_div){
					let amount = amount_div?.textContent.trim();
					this.send_activity("SUBSCRIPTION", "ECCLIX", amount);
				}
			}
			catch(error){
				console.log(error);
			}
		});
	}
	doxpop(){
		let url = window.location.href;

		const send_search_activity = () => {
			this.send_activity("SEARCH", "DOXPOP", "");
		}
		const send_subscription_activity = (amount) => {
			this.send_activity("SUBSCRIPTION", "DOXPOP", amount);
		}

		const attach_event_to_result_table = (table) => { 
			const tbodys = table.querySelectorAll("tbody");
			tbodys.forEach((tbody) => {
				const links = tbody?.querySelectorAll("a");
				links.forEach((a) => {
					let label = a.textContent;
					if(label.includes("Search")){					
						a.removeEventListener("click", send_search_activity);
						a.addEventListener("click", send_search_activity);
					}
				});
			});
		}
		const check_result = () => {
			let count = 90;
			const interval = setInterval(() => {
				try{
					const div = document.querySelector("div[class^='app-result-table_results_']");
					const table = div?.querySelector("table");
					if(table){
						clearInterval(interval);
						send_search_activity();
						attach_event_to_result_table(table);
					}

					const alert_div = document.querySelector(".v-alert.warning");
					if(alert_div){
						clearInterval(interval);
					}

					count--;
					if(count <= 0){
						clearInterval(interval);
					}
				}
				catch(error){ console.log(error); }
			}, 1000);
		}

		const form_search_event = () => {
			let search_url = window.location.href;
			setTimeout(() => {
				try{
					let current_url = window.location.href;
					if(search_url != current_url){
						check_result();
					}
				}
				catch(error){ console.log(error); }	
			}, 5000);
		}
		const btn_event = (form) => {
			try{
				let btn = form?.querySelector("button[type='submit']");
				if(btn){
					btn.removeEventListener("click", form_search_event);
					btn.addEventListener("click", form_search_event);
				}
			}	
			catch(error){ console.log(error); }	
		}

		const subscription_btn_event = () => {
			try{
				let amount = "";
				document.querySelectorAll(`#receipt_detail span`)?.forEach((s)=> { 
					try{
						let txt = s.innerText.trim(); 
						if(txt.includes("Payment amount")){
							let txt_arr = txt.split(" ");
							if(txt.length >= 2){
								amount = txt_arr[2];
							}
						}
					}
					catch(error){ console.log(error); }					
				}); 
				send_subscription_activity(amount);
			}
			catch(error){ console.log(error); }	
		}

		const attach_event = () => {	
			let pathname = window.location.pathname;
			if(pathname.includes("/in/")){
				pathname = pathname.replace(/^\/prod\/in/g, '');
			}
			else if(pathname.includes("/mi/")){
				pathname = pathname.replace(/^\/prod\/mi/g, '');
			}
			else {
				pathname = pathname.replace(/^\/prod/g, '');
			}
			
			switch(pathname){
			case "/common/CreateCcPayment":			
				document.querySelector(`#receipt_detail #done_button`)?.removeEventListener("click", subscription_btn_event);			// SUBSCRIPTION	
				document.querySelector(`#receipt_detail #done_button`)?.addEventListener("click", subscription_btn_event);				// SUBSCRIPTION	
				break;	

			case "/":
			case "/court/":
			case "/recorder/":
			case "/tax_warrant/":
			case "/court/CaseSearch":
			case "/court/JudgmentSearch":
			case "/recorder/FindRecordedDocuments":
			case "/tax_warrant/TaxWarrantSearch":				
				document.querySelectorAll("#page__body__main form")?.forEach((form) => { btn_event(form); });							// SEARCHES	& ADVANCED SEARCHES
				document.querySelectorAll("#page__topbar form[id='page__topbar__widget']")?.forEach((form) => { btn_event(form); });	// HEADER FORM
				document.querySelectorAll("div[class^='app-result-table_results_']")?.forEach((div) => {								// RESULT TABLE
					const table = div?.querySelector("table");
					if(table){
						try{ attach_event_to_result_table(table); }
						catch(error){ console.log(error); }
					}
				});
				break;

			default: break;					                  
			}
		}
		attach_event();

		setInterval(() => {
			try{ attach_event(); }
			catch(error){ console.log(error); }	
		}, 2000);
	}
	texasfile(){
		const event = () => {
			let amount_ele = document.querySelector(".Receipt-total--amount");
			let amount = amount_ele?.textContent.trim();
			this.send_activity("SUBSCRIPTION", "TEXAS-FILE", amount);
		}

		// SUBSCRIPTION
		setInterval(() => {
			const purchase_btns = document.querySelectorAll(".addFundsBtn");
			purchase_btns.forEach((btn, i) => {
				let text = btn.textContent?.trim();
				if(text == "Purchase"){
					btn.removeEventListener("click", event);
					btn.addEventListener("click", event);
				}
			})
		}, 2000);
	}
	async send_activity(activity, application="", amount=null){
		try{
			const data = {
				user: this.user,
				application: application,
				url: this.url,
				activity: activity,
				amount: amount
			};
			const message = {
				type: "USER_ACTIVITY",
				data: data
			};
			await chrome.runtime.sendMessage(message);
		}
		catch(error){
			console.log(error);
		}			
	}
}

new Capture();