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
		try{
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
			else if(obj.url.includes("okcountyrecords.com")){
				obj.okcountyrecords();
			}
			else if(obj.url.includes("eclerksla.com")){
				obj.eclerksla();
			}
			else if(obj.url.includes("clerkconnect.com")){
				obj.clerkconnect();
			}
			else if(obj.url.includes("idocmarket.com")){
				obj.idocmarket();
			}
			else if(obj.url.includes("searchiqs.com")){
				obj.searchiqs();
			}
		}
		catch(error){ console.log(error); }
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
			catch(error){ console.log(error); }			
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
			catch(error){ console.log(error); }
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
			catch(error){ console.log(error); }
		});
	}
	ecclix(){
		const btn = document.querySelector(`#ctl00_Content_ConfirmationDetails_BtnConfirm`);
		if(btn){
			btn.addEventListener("click", (e) => {
				try{
					const amount_1 = document.querySelector(`#ctl00_Content_ConfirmationDetails_oneTimeFeeTotal`)?.textContent.trim();
					const amount_2 = document.querySelector(`#ctl00_Content_ConfirmationDetails_lblEChkAuthSingleAmt`)?.textContent.trim();
					const amount = amount_1 ? amount_1 : amount_2 ? amount_2 : "";
					this.send_activity("SUBSCRIPTION", "ECCLIX", amount);
				}
				catch(error){ console.log(error); }
			});
		}
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
			try{
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
			catch(error){ console.log(error); }
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
			try	{
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
			catch(error){ console.log(error); }
		}
		attach_event();

		setInterval(() => {
			try{ attach_event(); }
			catch(error){ console.log(error); }	
		}, 2000);
	}
	texasfile(){
		const event = () => {
			try{
				let amount_ele = document.querySelector(".Receipt-total--amount");
				let amount = amount_ele?.textContent.trim();
				this.send_activity("SUBSCRIPTION", "TEXAS-FILE", amount);
			}
			catch(error){ console.log(error); }		
		}

		// SUBSCRIPTION
		setInterval(() => {
			try{
				const purchase_btns = document.querySelectorAll(".addFundsBtn");
				purchase_btns.forEach((btn, i) => {
					let text = btn.textContent?.trim();
					if(text == "Purchase"){
						btn.removeEventListener("click", event);
						btn.addEventListener("click", event);
					}
				})
			}
			catch(error){ console.log(error); }		
		}, 2000);
	}
	okcountyrecords(){	
		try{
			const btn = document.querySelector("button[name='charge-card']");
			if(btn){
				btn.addEventListener("click", () => {
					try{
						let amount = document.querySelector("#payment-one-time-amount-charge")?.textContent?.replace(/[: ]/g,'');
						this.send_activity("SUBSCRIPTION", "OK-COUNTY-RECORDS", amount);
					}
					catch(error){ console.log(error); }					
				});
			}
		}	
		catch(error){ console.log(error); }		
	}
	eclerksla(){
		try{
			const btn = document.querySelector(".shopping-cart-purchase-area button");
			if(btn){
				btn.addEventListener("click", () => {
					try{
						let amount = document.querySelector("form ul")?.lastElementChild?.lastElementChild?.textContent.trim();
						this.send_activity("SUBSCRIPTION", "ECLERKS-LA", amount);
					}
					catch(error){ console.log(error); }	
				});
			}
		}
		catch(error){ console.log(error); }		
	}
	clerkconnect(){
		const event = () => {
			try{
				const form = document.querySelector("#buysubscriptionform");
				let amount = form.querySelector("md-radio-button")?.textContent.split(" ");
				amount = (amount && amount.length >= 3) ? amount[3] : amount;
				this.send_activity("SUBSCRIPTION", "CLERK-CONNECT", amount);
			}
			catch(error){ console.log(error); }	
		}
		let interval = setInterval(() => {
			try{
				const btn = document.querySelector("#buyButton");
				if(btn){
					btn.removeEventListener("click", event);
					btn.addEventListener("click", event);
				}
			}
			catch(error){ console.log(error); }	
		}, 2000);
	}
	idocmarket(){
		try{
			const btn = document.querySelector("#goButton");
			if(btn){
				btn.addEventListener("click", () => {
					try{
						let amount = document.querySelector("#master-container .well")?.lastElementChild?.lastChild?.textContent.trim()
						this.send_activity("SUBSCRIPTION", "IDOCMARKET", amount);
					}
					catch(error){ console.log(error); }
				});
			}
		}
		catch(error){ console.log(error); }		
	}
	searchiqs(){
		const event = () => {
			try{
				let amount = document.querySelector("#cboSelectAmt")?.value;
				this.send_activity("SUBSCRIPTION", "SEARCHIQS", "$"+amount);
			}
			catch(error){ console.log(error); }	
		}
		let interval = setInterval(() => {
			try{
				const btn = document.querySelector("#btnProcessPayment");
				if(btn){
					btn.removeEventListener("click", event);
					btn.addEventListener("click", event);
				}
			}
			catch(error){ console.log(error); }	
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