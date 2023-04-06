/* eslint-disable no-return-assign */
/* eslint-disable consistent-return */
/* eslint-disable no-const-assign */
/* eslint-disable indent */
/* eslint-disable no-nested-ternary */
/* eslint-disable operator-linebreak */
/* eslint-disable comma-dangle */
/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
const http = require("http");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs/promises");
const { myEmitter } = require("./middleware/emiter");

const PORT = process.env.PORT || 5000;

const serveFile = async (filePath, contentType, response) => {
  try {
    const rawData = await fsPromises.readFile(
      filePath,
      !contentType.includes("image") ? "utf8" : ""
    );

    const data =
      contentType === "application/json" ? JSON.parse(rawData) : rawData;
    response.writeHead(filePath.includes("404.html") ? 404 : 200, {
      "Content-Type": contentType,
    });

    response.end(
      contentType === "application/json" ? JSON.stringify(data) : data
    );
  } catch (err) {
    console.log(err);
    myEmitter.emit("log", `${err.name}: ${err.message}`, "errLog.txt");
    response.statusCode = 500;
    response.end();
  }
};

const server = http.createServer((req, res) => {
  console.log(req.url, req.method);
  myEmitter.emit("log", `${req.url}\t${req.method}`, "reqLog.txt");

  const extension = path.extname(req.url);
  let contentType;

  switch (extension) {
    case ".css":
      contentType = "text/css";
      break;
    case ".js":
      contentType = "text/javascript";
      break;
    case ".json":
      contentType = "application/json";
      break;
    case ".jpg":
      contentType = "image/jpeg";
      break;
    case ".png":
      contentType = "image/png";
      break;
    case ".txt":
      contentType = "text/plain";
      break;
    default:
      contentType = "text/html";
  }

  const filePath =
    contentType === "text/html" && req.url === "/"
      ? path.join(__dirname, "..", "public", "index.html")
      : contentType === "text/html" && req.url.slice(-1) === "/"
      ? path.join(__dirname, "..", "public", req.url, "index.html")
      : contentType === "text/html"
      ? path.join(__dirname, "..", "public", req.url)
      : path.join(__dirname, req.url);

  if (!extension && req.url.slice(-1) !== "/") return (filePath += ".html");

  const fileExists = fs.existsSync(filePath);
  if (!fileExists) {
    switch (path.parse(filePath).base) {
      case "old-page.html":
        res.writeHead(301, { Location: "/new-page.html" });
        res.end();
        break;
      case "www-page.html":
        res.writeHead(301, { Location: "/" });
        res.end();
        break;
      default:
        serveFile(
          path.join(__dirname, "..", "public", "404.html"),
          "text/html",
          res
        );
    }
  } else {
    serveFile(filePath, contentType, res);
  }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
