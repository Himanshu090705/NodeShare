import mongoose from 'mongoose';

const db = process.env.DB || "mongodb://localhost:27018/NodeShare"
mongoose.connect(db).then(() => {
    console.log("Database connected successfully");
}).catch((error) => {
    console.log('Unable to connect to database due to ', error);
})
