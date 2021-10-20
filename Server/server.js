const express = require("express");
const app = express();
const http = require("http");
const mysql = require("mysql");

const server = http.createServer(app);
const socketio = require("socket.io");
const { isBuffer } = require("util");
const io = socketio(server);

const PORT = 3000;

const db = mysql.createConnection({
    host        : "localhost",
    user        : "root",
    password    : "123456",
    database    : "nodemysql"
});

//nodemysql: einkaufsliste (id, text, checked(TinyInt(1)))

db.connect((err) => {
    if(err) throw err;
    console.log("Database connected");
})

io.on("connection", (socket) => {
    console.log("someone connected");
    let sql = `SELECT * FROM einkaufsliste`
    let query = db.query(sql, (err, result) => {
        result.forEach((res) => {
            socket.emit("alleEintraege", res);
        })
    })
    socket.on("eingabe", (eingabe) =>{
        let sql = `SELECT * FROM einkaufsliste WHERE text = "${eingabe}"`;
        let query = db.query(sql, (err, result) => {
            if(err) throw err;
            if(Object.keys(result).length > 0){
                socket.emit("eintragExists");
            }else{
                let eintrag = {text: eingabe, checked: 0};
                let sql = "INSERT INTO einkaufsliste SET ?";
                let query = db.query(sql, eintrag, (err, result) => {
                    if(err) throw err;
                    let sql = `SELECT id FROM einkaufsliste WHERE text = "${eingabe}"`;
                    let query = db.query(sql, (err, result) => {
                        let id = result[0].id;
                        io.emit("eingabe", {eingabe: eingabe, class: id});
                    });
                });
            }
        });
    });
    socket.on("checked", (clicked_class) => {
        let sql = 'UPDATE einkaufsliste SET checked = ' + 1 + ' WHERE id = ' + clicked_class ;
            let query = db.query(sql, (err, result) => {
                if(err) throw err;
                io.emit("checked", clicked_class);
            });
    });
    socket.on("unchecked", (clicked_class) => {
        let sql = 'UPDATE einkaufsliste SET checked = ' + 0 + ' WHERE id = ' + clicked_class ;
            let query = db.query(sql, (err, result) => {
                if(err) throw err;
                io.emit("unchecked", clicked_class);
            });
    });
    socket.on("delete", (clicked_class) => {
        let sql = 'DELETE FROM einkaufsliste WHERE id = ' + clicked_class.charAt(0);
            let query = db.query(sql, (err, result) => {
                if(err) throw err;
                io.emit("delete", clicked_class);
            });
    });
    socket.on("disconnect", () => {
        console.log("someone disconnected");
    })
});


server.listen(PORT, "192.168.178.104", () => {
    console.log(`Server listening on ${PORT}`)
});