"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect("/login?message=" + encodeURIComponent(error.message));
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const businessName = `${name}'s Business`;
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);
  const colorPrimary = "#4f46e5";
  const colorSecondary = "#ffffff";

  // 1. Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  if (authError) {
    return redirect("/register?message=" + authError.message);
  }

  // 2. Insert Business
  if (authData.user) {
    const { error: businessError } = await supabase
      .from("businesses")
      .insert({
        owner_id: authData.user.id,
        name: businessName,
        slug: slug,
        color_primary: colorPrimary,
        color_secondary: colorSecondary,
      });

    if (businessError) {
      console.error("Error creating business:", businessError);
      // Depending on Supabase settings, if email confirmation is required,
      // the insert might fail because RLS requires auth.uid() and the user 
      // is not fully logged in yet. 
      // You may need to disable Email Confirmations in Supabase Auth settings 
      // for this flow to work smoothly without a Service Role key.
    }
  }

  revalidatePath("/", "layout");
  redirect("/login?message=Verifica+tu+correo+electrónico+(se+te+envió+un+mail+de+confirmación)&success=true");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
