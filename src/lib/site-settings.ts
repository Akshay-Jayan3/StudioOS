import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

export type SiteSettings = {
  studio_name: string;
  location: string;
  contact_email: string;
};

const DEFAULTS: SiteSettings = {
  studio_name: "Datrium",
  location: "Kerala, India",
  contact_email: "hello@datrium.in",
};

async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );
    const { data, error } = await supabase
      .from("site_settings")
      .select("studio_name, location, contact_email")
      .eq("id", "default")
      .single();

    if (error || !data) throw new Error("no settings row");
    return data as SiteSettings;
  } catch {
    return DEFAULTS;
  }
}

// Cached so every page/layout fetching settings during the same request window
// doesn't hit the DB repeatedly. Invalidated via revalidateTag("site-settings")
// whenever the admin Settings page saves a change.
export const getSiteSettings = unstable_cache(fetchSiteSettings, ["site-settings"], {
  tags: ["site-settings"],
  revalidate: 60,
});
