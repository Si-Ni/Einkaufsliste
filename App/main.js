const socket = io("http://192.168.178.104:3000/", { transports : ['websocket'] });

var form = document.getElementById("eingabeForm");
var input = document.getElementById("eingabe");
var item;

form.addEventListener("submit", (e) => {
    e.preventDefault();
    if(input.value){
        socket.emit("eingabe", input.value);
        input.value = "";
        input.focus();
    }
});


socket.on("eingabe", data => {
    add(data);
});

socket.on("checked", clicked_class => {
    document.getElementsByClassName(clicked_class)[0].checked = true;
});

socket.on("unchecked", clicked_class => {
    document.getElementsByClassName(clicked_class)[0].checked = false;
});

socket.on("delete", clicked_class => {
    item = document.getElementsByClassName(clicked_class+"d")[0];
    item.remove();
});

function add(data){
    item = document.createElement("li");
    item.innerHTML =    `<form id="changeForm">
        	            <input class="${data.class}" id="checkbox" type="checkbox" 
                        onClick="reply_clickCheckbox(this.className)">
                        <p>${data.eingabe}</p>
                        <button type="button" id="buttonD" class="${data.class + 'b'}" 
                        onClick="reply_clickButton(this.className)">loeschen</button></form>`;
    item.className = data.class + "bd";
    ausgabe.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}

function reply_clickCheckbox(clicked_class){
    if(document.getElementsByClassName(clicked_class)[0].checked){
    socket.emit("checked", clicked_class);
    } else {
    socket.emit("unchecked", clicked_class);
    }
}

function reply_clickButton(clicked_class){
    socket.emit("delete", clicked_class);
}

socket.on("eintragExists", () => {
    console.log("Dieser Eintrag existiert bereits, keine doppelten Eintragungen möglich")
})

socket.on("alleEintraege", (data) => {
    add({eingabe: data.text, class: data.id});
    if(data.checked == 1) {
        document.getElementsByClassName(data.id)[0].checked = true;
    }
})