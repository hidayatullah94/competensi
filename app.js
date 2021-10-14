const express = require("express");
const path = require("path");
const http = require("http");
const mysql = require("mysql2");
const hbs = require("hbs");

//for database
//========================================
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_player",
});

//for Conection
connection.connect((err, conn) => {
  if (err) throw err;
  console.log("mysql connected...");
});

//=============================================
// handle multer
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = function (req, file, cb) {
  if (!file.originalname.match(/\.(jpg|JPG|png|PNG|svg|SVG)$/)) {
    req.fileValidationError = {
      message: "Only image files are allowed",
    };

    return cb(new Error("Only image files are allowed", false));
  }

  cb(null, true);
};

const sizeMB = 20;
const maxSize = sizeMB * 1024 * 1024;

//upload function
const upload = multer({
  storage: storage,
  fileFilter,
  limits: {
    fileSize: maxSize,
  },
});

//=====================================================================
//for set app
const app = express();
app.use("/static", express.static(path.join(__dirname, "public")));
app.use("/upload", express.static(path.join(__dirname, "upload")));
app.use(express.urlencoded({ extended: true }));

//set view
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

hbs.registerPartials(path.join(__dirname, "views/partials"));

//====================================================================
// get connection route

app.get("/index", (req, res) => {
  const query = "SELECT * FROM tb_heroes ORDER BY id DESC ";

  connection.connect((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      let hero = results;

      res.render("index", { title: "index", hero });
    });
  });
});

//====================================================================
app.get("/addType", (req, res) => {
  const query = "SELECT * FROM tb_type ORDER BY id DESC ";

  connection.connect((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      let type = results;

      res.render("addType", { title: "addType", type });
    });
  });
});

app.post("/addType", (req, res) => {
  let { name } = req.body;

  const query = "INSERT INTO tb_type (name) VALUE (?)";

  connection.connect((err, conn) => {
    if (err) throw err;

    conn.query(query, [name], (err, results) => {
      if (err) throw err;

      res.redirect("/addType");
      return;
    });
  });
});

app.get("/delete/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM tb_type WHERE id = ?";

  connection.connect((err, conn) => {
    if (err) throw err;

    conn.query(query, [id], (err, results) => {
      if (err) throw err;

      res.redirect("/addType");
    });
  });
});

//====================================================================
//handle addHero

app.get("/addHero", (req, res) => {
  res.render("addHero", { title: "addHero" });
});

app.post("/addHero", upload.single("photo"), (req, res) => {
  let { name } = req.body;

  let photo = req.file.filename;

  const query = "INSERT INTO tb_heroes (name, photo) VALUES (?,?)";

  connection.connect((err, conn) => {
    if (err) throw err;

    conn.query(query, [name, photo], (err, results) => {
      if (err) throw err;

      res.redirect("/index");
    });
  });
});

app.get("/delete/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM tb_heroes WHERE id = ?";

  connection.connect((err, conn) => {
    if (err) throw err;

    conn.query(query, [id], (err, results) => {
      if (err) throw err;

      res.redirect("/index");
    });
  });
});
//====================================================================

const server = http.createServer(app);
const port = 3000;
server.listen(port, () => {
  console.log("server running in port: ", port);
});
