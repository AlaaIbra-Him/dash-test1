// import express from "express";
// import fetch from "node-fetch";
// import dotenv from "dotenv";
// import cors from "cors";
// import { createClient } from "@supabase/supabase-js";

// dotenv.config();
// const app = express();
// app.use(cors({ origin: "http://localhost:5173" }));
// app.use(express.json());

// // إنشاء كائن Supabase مع service role key
// const supabaseAdmin = createClient(
//     process.env.VITE_SUPABASE_URL,
//     process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
// );

// // 1️⃣ POST - CREATE DOCTOR
// app.post("/createDoctor", async (req, res) => {
//     try {
//         const { email, password, fullName, specialty } = req.body;
//         if (!email || !password || !fullName || !specialty)
//             return res.status(400).json({ error: "Missing fields" });

//         console.log(" Creating user with email:", email);

//         // ✅ إنشاء user في auth
//         const { data: userData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
//             email,
//             password,
//             email_confirm: true,
//         });

//         if (signUpError) {
//             console.error("❌ Auth error:", signUpError);
//             throw signUpError;
//         }

//         // ✅ احصل على الـ ID من userData.user
//         const userId = userData?.user?.id;
//         console.log("✅ Auth user created with ID:", userId);

//         if (!userId) {
//             throw new Error("Failed to get user ID from auth response");
//         }

//         // ✅ استخدم نفس الـ ID في profile
//         const { error: profileError } = await supabaseAdmin
//             .from("profiles")
//             .insert({
//                 id: userId, // ✅ نفس الـ ID من auth
//                 email,
//                 full_name: fullName,
//                 specialty,
//                 role: "doctor",
//                 created_at: new Date().toISOString(),
//             });

//         if (profileError) {
//             console.error("❌ Profile error:", profileError);
//             // احذف الـ auth user إذا فشل profile
//             await supabaseAdmin.auth.admin.deleteUser(userId);
//             throw profileError;
//         }

//         console.log("✅ Profile created with ID:", userId);

//         // ✅ رد الـ response الصحيح
//         res.json({
//             success: true,
//             userId: userId,
//             email: email,
//             fullName: fullName,
//             specialty: specialty
//         });

//     } catch (err) {
//         console.error("❌ Error in createDoctor:", err.message);
//         res.status(500).json({
//             error: err.message,
//             success: false
//         });
//     }
// });

// // 2️⃣ DELETE - DELETE DOCTOR
// app.delete("/deleteDoctor/:doctorId", async (req, res) => {
//     try {
//         const { doctorId } = req.params;

//         if (!doctorId)
//             return res.status(400).json({ error: "Doctor ID required" });

//         console.log("🗑️ Deleting doctor with ID:", doctorId);

//         // احذف appointments أولاً
//         const { error: appointmentsError } = await supabaseAdmin
//             .from("appointments")
//             .delete()
//             .eq("doctor_id", doctorId);

//         if (appointmentsError) {
//             console.error("❌ Appointments deletion error:", appointmentsError);
//             throw appointmentsError;
//         }
//         console.log("✅ Appointments deleted");

//         // احذف profile
//         const { error: profileError } = await supabaseAdmin
//             .from("profiles")
//             .delete()
//             .eq("id", doctorId);

//         if (profileError) {
//             console.error("❌ Profile deletion error:", profileError);
//             throw profileError;
//         }
//         console.log("✅ Profile deleted");

//         // احذف auth user
//         const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
//             doctorId
//         );

//         if (authError) {
//             console.error("❌ Auth deletion error:", authError);
//             throw authError;
//         }
//         console.log("✅ Auth user deleted");

//         res.json({
//             success: true,
//             message: "Doctor deleted successfully",
//             deletedId: doctorId
//         });

//     } catch (err) {
//         console.error("❌ Error in deleteDoctor:", err.message);
//         res.status(500).json({
//             error: err.message,
//             success: false
//         });
//     }
// });

// app.listen(3000, () => {
//     console.log("     Server running on http://localhost:3000");
// });

import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Supabase client with Service Role Key
const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// =====================================
// 1️⃣ CREATE DOCTOR
// =====================================
app.post("/createDoctor", async (req, res) => {
    try {
        const { email, password, fullName, specialty } = req.body;

        if (!email || !password || !fullName || !specialty)
            return res.status(400).json({ error: "Missing fields" });

        console.log("Creating user:", email);

        // Create Auth user
        const { data: userData, error: signUpError } =
            await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
            });

        if (signUpError) {
            console.error("❌ Auth error:", signUpError);
            throw signUpError;
        }

        const userId = userData?.user?.id;

        if (!userId) throw new Error("Failed to get user ID");
        console.log("✅ Auth user created:", userId);

        // UPDATE profile (trigger already inserted base row)
        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .update({
                full_name: fullName,
                specialty,
                role: "doctor",
            })
            .eq("id", userId);

        if (profileError) {
            console.error("❌ Profile update error:", profileError);
            throw profileError;
        }

        console.log("✅ Profile updated:", userId);

        res.json({
            success: true,
            userId,
            email,
        });

    } catch (err) {
        console.error("❌ Error in createDoctor:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// =====================================
// 2️⃣ DELETE DOCTOR
// =====================================
app.delete("/deleteDoctor/:doctorId", async (req, res) => {
    try {
        const { doctorId } = req.params;

        console.log("Deleting doctor:", doctorId);

        // Delete appointments
        await supabaseAdmin.from("appointments").delete().eq("doctor_id", doctorId);

        // Delete profile
        await supabaseAdmin.from("profiles").delete().eq("id", doctorId);

        // Delete auth user
        await supabaseAdmin.auth.admin.deleteUser(doctorId);

        console.log("✅ Doctor deleted:", doctorId);

        res.json({
            success: true,
            deletedId: doctorId,
        });

    } catch (err) {
        console.error("❌ Error in deleteDoctor:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// =====================================
// Start server
// =====================================
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
