import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Initialize homepage sections in admin_content table
 * Uses service role key to bypass RLS policies
 * Run this script once to seed default homepage sections
 */

// Use service role key (bypasses RLS)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const defaultSections = [
  {
    section_name: "hero",
    content: {
      title: "Handcrafted Ceramics for Modern Living",
      subtitle: "Discover our curated collection of artisan ceramics",
      desktopImage: "",
      mobileImage: "",
    },
  },
  {
    section_name: "quote",
    content: {
      quote: "Every piece tells a story of craftsmanship and tradition.",
      author: "Carmella Artisans",
    },
  },
  {
    section_name: "newsletter",
    content: {
      title: "Stay Updated",
      description: "Get exclusive offers and new collection announcements",
      placeholder: "Enter your email",
    },
  },
  {
    section_name: "testimonials",
    content: {
      title: "What Our Customers Say",
      subtitle: "Real feedback from our valued clients",
    },
  },
];

async function initializeHomepageSections() {
  try {
    console.log("Initializing homepage sections...");

    for (const section of defaultSections) {
      // Check if section already exists
      const { data: existing } = await supabase
        .from("admin_content")
        .select("id")
        .eq("section_name", section.section_name)
        .single();

      if (existing) {
        console.log(`✓ Section "${section.section_name}" already exists, skipping...`);
        continue;
      }

      // Insert new section using service role (bypasses RLS)
      const { error } = await supabase.from("admin_content").insert([section]);

      if (error) {
        console.error(`✗ Failed to initialize "${section.section_name}":`, error);
      } else {
        console.log(`✓ Initialized section: ${section.section_name}`);
      }
    }

    console.log("✓ Homepage sections initialization complete!");
  } catch (error) {
    console.error("Failed to initialize homepage sections:", error);
    process.exit(1);
  }
}

initializeHomepageSections();
