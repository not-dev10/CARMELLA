import { Request, Response } from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";
import { clearCache } from "../middleware/cache.js";

/**
 * Admin utility to verify and fix data structures
 */

// Verify and fix all homepage sections
export const fixDataStructures = async (req: Request, res: Response) => {
  try {
    console.log("[ADMIN_FIX] Starting data structure verification and fix");

    // Define correct structures for each section
    const correctStructures: { [key: string]: any } = {
      hero: {
        badge: "EST. 2024",
        title: "Get the best FMCG deals with Carmella—reliable supply, better margins, and faster delivery.",
        subtitle: "Authentic flavors and quality essentials for every home. Discover our curated B2B collections of premium Indian products.",
        cta1Text: "Shop Wholesale",
        cta1Link: "/shop",
        cta2Text: "View Lookbook",
        cta2Link: "/lookbook",
        badge1Text: "500+ Retailers",
        badge1Subtext: "Worldwide",
        badge2Text: "Premium Quality",
        badge2Subtext: "Authentic",
        badge3Text: "B2B Ready",
        badge3Subtext: "Fast Delivery",
        images: [
          {
            desktopImage: "https://carmella-bucket.s3.amazonaws.com/hero/desktop/hero-products.jpeg",
            mobileImage: "https://carmella-bucket.s3.amazonaws.com/hero/mobile/hero-products.jpeg",
          }
        ],
      },
      categories: {
        title: "Browse Our Collections",
        description: "Shop by Category",
      },
      products: {
        label: "Featured Products",
        title: "Trending Now",
        buttonText: "View All",
        description: "Discover our most popular items",
      },
      newsletter: {
        title: "Stay Updated",
        description: "Get exclusive offers and new collection announcements",
        placeholder: "Enter your email",
      },
    };

    const results: any = {};

    for (const [sectionName, correctContent] of Object.entries(correctStructures)) {
      console.log(`[ADMIN_FIX] Checking section: ${sectionName}`);

      // Get current content - use admin client
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from("admin_content")
        .select("id, content")
        .eq("section_name", sectionName)
        .single();

      if (fetchError) {
        console.log(`[ADMIN_FIX] Section ${sectionName} doesn't exist, creating...`);
        const { error: insertError } = await supabaseAdmin
          .from("admin_content")
          .insert([{ section_name: sectionName, content: correctContent }]);

        if (insertError) {
          console.error(`[ADMIN_FIX] Failed to create ${sectionName}:`, insertError);
          results[sectionName] = { status: "error", error: insertError.message };
        } else {
          console.log(`[ADMIN_FIX] ✓ Created ${sectionName}`);
          results[sectionName] = { status: "created" };
        }
      } else {
        // Check if structure matches
        const currentContent = existing.content || {};
        const isStructureCorrect = 
          JSON.stringify(currentContent) === JSON.stringify(correctContent);

        if (!isStructureCorrect) {
          console.log(`[ADMIN_FIX] Structure mismatch for ${sectionName}, fixing...`);
          console.log(`[ADMIN_FIX] Current:`, JSON.stringify(currentContent).substring(0, 100));
          console.log(`[ADMIN_FIX] Expected:`, JSON.stringify(correctContent).substring(0, 100));

          // Replace with correct structure - use admin client
          const { error: updateError } = await supabaseAdmin
            .from("admin_content")
            .update({ content: correctContent })
            .eq("section_name", sectionName);

          if (updateError) {
            console.error(`[ADMIN_FIX] Failed to fix ${sectionName}:`, updateError);
            results[sectionName] = { status: "error", error: updateError.message };
          } else {
            console.log(`[ADMIN_FIX] ✓ Fixed ${sectionName}`);
            results[sectionName] = { status: "fixed" };
            
            // Clear cache for this section
            clearCache(`/content/${sectionName}`);
          }
        } else {
          console.log(`[ADMIN_FIX] ✓ ${sectionName} structure correct`);
          results[sectionName] = { status: "ok" };
        }
      }
    }

    console.log("[ADMIN_FIX] Verification complete");
    res.json({
      success: true,
      message: "Data structure verification and fix complete",
      results,
    });
  } catch (error) {
    console.error("[ADMIN_FIX] Error:", error);
    res.status(500).json({ error: "Failed to verify/fix data structures" });
  }
};
