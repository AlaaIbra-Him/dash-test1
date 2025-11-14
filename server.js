import express from "express";
// eslint-disable-next-line no-unused-vars
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
    // eslint-disable-next-line no-undef
    process.env.VITE_SUPABASE_URL,
    // eslint-disable-next-line no-undef
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

        console.log("📝 Creating doctor with email:", email);

        // Step 1: Create Auth user
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

        if (!userId) throw new Error("Failed to get user ID from auth");
        console.log("✅ Auth user created with ID:", userId);

        // Step 2: Update doctor info (trigger automatically created base user record)
        const { error: updateError } = await supabaseAdmin
            .from("users")
            .update({
                name: fullName,
                specialty,
                role: "doctor"
            })
            .eq("id", userId);

        if (updateError) {
            console.error("❌ Users table update error:", updateError);
            // Delete auth user if update fails
            await supabaseAdmin.auth.admin.deleteUser(userId);
            throw updateError;
        }

        console.log("✅ Doctor profile updated:", userId);

        res.json({
            success: true,
            userId,
            email,
            fullName,
            specialty,
            message: "Doctor created successfully"
        });

    } catch (err) {
        console.error("❌ Error in createDoctor:", err.message);
        res.status(500).json({ 
            error: err.message,
            success: false
        });
    }
});

// =====================================
// 2️⃣ DELETE DOCTOR
// =====================================
app.delete("/deleteDoctor/:doctorId", async (req, res) => {
    try {
        const { doctorId } = req.params;

        if (!doctorId)
            return res.status(400).json({ error: "Doctor ID required" });

        console.log("🗑️ Deleting doctor with ID:", doctorId);

        // Step 1: Delete appointments
        const { error: appointmentsError } = await supabaseAdmin
            .from("appointments")
            .delete()
            .eq("doctor_id", doctorId);

        if (appointmentsError) {
            console.error("❌ Appointments deletion error:", appointmentsError);
            throw appointmentsError;
        }
        console.log("✅ Appointments deleted");

        // Step 2: Delete from users table
        const { error: usersError } = await supabaseAdmin
            .from("users")
            .delete()
            .eq("id", doctorId);

        if (usersError) {
            console.error("❌ Users table deletion error:", usersError);
            throw usersError;
        }
        console.log("✅ Doctor deleted from users table");

        // Step 3: Delete auth user
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
            doctorId
        );

        if (authError) {
            console.error("❌ Auth deletion error:", authError);
            throw authError;
        }
        console.log("✅ Auth user deleted");

        res.json({
            success: true,
            message: "Doctor deleted successfully",
            deletedId: doctorId
        });

    } catch (err) {
        console.error("❌ Error in deleteDoctor:", err.message);
        res.status(500).json({ 
            error: err.message,
            success: false
        });
    }
});

// =====================================
// Start server
// =====================================
app.listen(3000, () => {
    console.log("✅ Server running on http://localhost:3000");
});