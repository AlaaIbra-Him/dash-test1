import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors"; // نضيف استيراد الكورس
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const app = express(); // تعريف app قبل أي حاجة
app.use(cors({ origin: "http://localhost:5173" })); // بعد تعريف app
app.use(express.json());

// إنشاء كائن Supabase
const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// نقطة النهاية POST
app.post("/createDoctor", async (req, res) => {
    try {
        const { email, password, fullName, specialty } = req.body;
        if (!email || !password || !fullName || !specialty)
            return res.status(400).json({ error: "Missing fields" });

        const { data: user, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });
        if (signUpError) throw signUpError;

        const { error: profileError } = await supabaseAdmin.from("profiles").insert({
            id: user.id,
            email,
            full_name: fullName,
            specialty,
            role: "doctor",
        });
        if (profileError) throw profileError;
        console.log('Created user:', user); // ده هوريك شكل الـ object فعليًا


        res.json({ userId: user.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
