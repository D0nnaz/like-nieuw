require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const socketIO = require("socket.io");
const { engine } = require("express-handlebars");
const Like = require("./models/like");

const { MONGO_URI } = process.env;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.static("static"));
app.use(express.static("public"));
app.use("/js", express.static("public/js"));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");


for (let i = 1; i <= 30; i++) {
  app.get(`/${i}`, async (req, res) => {
    const likeDoc = await Like.findOne({ page: i });
    const likeCount = likeDoc ? likeDoc.count : 0;

    res.render("index", {
      liked: false,
      likeCount,
    });
  });
}

io.on("connection", (socket) => {
  socket.on("getLikeCount", async (page) => {
    try {
      const likeDoc = await Like.findOne({ page });

      if (!likeDoc) {
        socket.emit("updateLikes", { likeCount: 0 });
      } else {
        socket.emit("updateLikes", { likeCount: likeDoc.count });
      }
    } catch (error) {
      console.error("Error getting like count:", error);
    }
  });

  socket.on("incrementLike", async (page) => { 
    try {
      let likeDoc = await Like.findOne({ page });

      if (!likeDoc) {
        likeDoc = new Like({ page, count: 1 });
      } else {
        likeDoc.count++;
      }

      await likeDoc.save();

      io.emit("updateLikes", { likeCount: likeDoc.count });
    } catch (error) {
      console.error("Error incrementing like:", error);
    }
  });

  socket.on("decrementLike", async (page) => { 
    try {
      let likeDoc = await Like.findOne({ page });

      if (!likeDoc) {
        socket.emit("updateLikes", { likeCount: 0 });
      } else {
        likeDoc.count--;

        if (likeDoc.count < 0) {
          likeDoc.count = 0;
        }

        await likeDoc.save();

        io.emit("updateLikes", { likeCount: likeDoc.count });
      }
    } catch (error) {
      console.error("Error decrementing like:", error);
    }
  });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});