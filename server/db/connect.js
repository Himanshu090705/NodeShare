<<<<<<< HEAD
import mongoose from 'mongoose';

const db = process.env.DB || "mongodb://localhost:27018/NodeShare"
mongoose.connect(db).then(() => {
    console.log("Database connected successfully");
}).catch((error) => {
    console.log('Unable to connect to database due to ', error);
})
=======
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "../../config.js";
const url = SUPABASE_URL;
const anonKey = SUPABASE_KEY;

export const supabase = createClient(url, anonKey);
>>>>>>> 28e6fdf48fdfdb7390e0687af8e65b096a5830eb
