document.addEventListener("copy", disable);
document.addEventListener("cut", disable);
document.addEventListener("drag", disable);
document.addEventListener("dragstart", disable);
document.addEventListener("dragover", disable);
document.addEventListener("dragend", disable);
document.addEventListener("drop", disable); 
document.addEventListener("paste", disable); 
document.addEventListener('contextmenu', disable);
function disable(e) {
	if (e) e.preventDefault();
	return false; 
} 

document.addEventListener("keydown", function(event) {     
    if (event.which === 123) { // Prevent F12
    	event.preventDefault();
    } 
    else if (event.ctrlKey && event.shiftKey && event.which == 73) { // Prevent Ctrl+Shift+I        
    	event.preventDefault();
    }
    else if (event.ctrlKey && event.which == 85) { // Prevent Ctrl+U      
    	event.preventDefault();
    }
});