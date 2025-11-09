import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseAdmin = createClient(
    Deno.env.get("VITE_SUPABASE_URL"),
    Deno.env.get("VITE_SUPABASE_SERVICE_ROLE_KEY")
);

serve(async (req) => {
    // CORS headers
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // ممكن تغيره لـ localhost فقط
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // الرد على preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers });
    }

    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers });
    }

    try {
        const body = await req.json();
        const { email, password, fullName, specialty } = body;

        if (!email || !password || !fullName || !specialty) {
            return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers });
        }

        // إنشاء المستخدم في Auth
        const { data: user, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });

        if (signUpError) throw signUpError;

        // إنشاء Profile
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
            headers,
        });

    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
});
