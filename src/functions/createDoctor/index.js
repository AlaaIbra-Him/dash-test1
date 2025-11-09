import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// الـ Service Role Key موجود على السيرفر فقط
const supabaseAdmin = createClient(
    Deno.env.get("VITE_SUPABASE_URL"),
    Deno.env.get("VITE_SUPABASE_SERVICE_ROLE_KEY")
);

serve(async (req) => {
    try {
        if (req.method !== "POST") {
            return new Response("Method Not Allowed", { status: 405 });
        }

        const body = await req.json();
        const { email, password, fullName, specialty } = body;

        if (!email || !password || !fullName || !specialty) {
            return new Response("Missing fields", { status: 400 });
        }

        // 1️⃣ إنشاء المستخدم في Auth (Service Role)
        const { data: user, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // يفعّل الايميل تلقائياً
        });

        if (signUpError) throw signUpError;

        // 2️⃣ إنشاء Profile
        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .insert({
                id: user.id,
                email,
                full_name: fullName,
                specialty,
                role: "doctor",
            });

        if (profileError) throw profileError;

        return new Response(JSON.stringify({ message: "Doctor created", userId: user.id }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
