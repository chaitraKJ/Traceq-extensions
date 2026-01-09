class Static_global {
	static password_input = null;
}

var s = function (sketch){

	let p_input = null;

	sketch.setup = function(){
		console.log("p5 sketch extension");
		try{
			p_input = Static_global.password_input;
			const body = document.querySelector("body");

			document.body.style.userSelect = "none";
			let h = document.body.clientHeight;
			let c = sketch.createCanvas(sketch.windowWidth, h);
			c.parent(body);
			c.position(0, 0);
			c.style('pointer-events', 'none');
			sketch.clear();
		}
		catch(error){
			console.log("TraceQ Extension Content-Script P5 Error: "+error);
		}		
	};

	sketch.draw = function(){
		try{
			sketch.clear();
			const coords = p_input?.getBoundingClientRect();

			if(coords) {
				const x1 = coords.left + window.scrollX;
				const y1 = coords.top + window.scrollY + 9;
				const x2 = x1 + coords.width;

				sketch.stroke(0);
				sketch.strokeWeight(coords.height);
				sketch.line(x1, y1, x2, y1);
			}
			
		}
		catch(error){
			console.log("TraceQ Extension Content-Script P5 Error: "+error);
		}
	};
};