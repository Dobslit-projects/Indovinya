import dotenv from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function fetchAllUniqueProducts(
  client: SupabaseClient,
  label: string
): Promise<Set<string>> {
  const products = new Set<string>();
  const PAGE_SIZE = 1000;
  let offset = 0;
  let keepGoing = true;

  while (keepGoing) {
    const { data, error } = await client
      .from("dados_acelerado")
      .select("nome_produto")
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error(`[${label}] Error at offset ${offset}:`, error.message);
      break;
    }

    if (!data || data.length === 0) {
      keepGoing = false;
      break;
    }

    for (const row of data) {
      if (row.nome_produto) {
        products.add(row.nome_produto);
      }
    }

    console.log(
      `  [${label}] Fetched ${data.length} rows (offset ${offset}), unique so far: ${products.size}`
    );

    if (data.length < PAGE_SIZE) {
      keepGoing = false;
    } else {
      offset += PAGE_SIZE;
    }
  }

  return products;
}

async function main() {
  console.log("=== Supabase Product Count: SERVICE ROLE vs ANON ===\n");
  console.log("URL:", SUPABASE_URL, "\n");

  // --- Service Role ---
  console.log("--- SERVICE ROLE KEY (bypasses RLS) ---");
  const serviceClient = createClient(SUPABASE_URL, SERVICE_KEY);
  const serviceProducts = await fetchAllUniqueProducts(serviceClient, "SERVICE");
  console.log(`Service role unique products: ${serviceProducts.size}\n`);

  // --- Anon Key ---
  console.log("--- ANON KEY (respects RLS) ---");
  const anonClient = createClient(SUPABASE_URL, ANON_KEY);
  const anonProducts = await fetchAllUniqueProducts(anonClient, "ANON");
  console.log(`Anon key unique products: ${anonProducts.size}\n`);

  // --- Compare ---
  console.log("=== COMPARISON ===");
  console.log(`Service role: ${serviceProducts.size} unique products`);
  console.log(`Anon key:     ${anonProducts.size} unique products`);

  if (serviceProducts.size === anonProducts.size) {
    console.log("Both keys return the same number of unique products.");
  } else {
    const diff = serviceProducts.size - anonProducts.size;
    console.log(
      `Difference: ${diff} products visible only via service role (hidden by RLS).`
    );

    // Show which products are missing from anon
    const missing = [...serviceProducts].filter((p) => !anonProducts.has(p));
    if (missing.length > 0 && missing.length <= 50) {
      console.log("\nProducts visible via service role but NOT via anon key:");
      missing.forEach((p) => console.log(`  - ${p}`));
    }

    // Show which products are only in anon (shouldn't happen but just in case)
    const extra = [...anonProducts].filter((p) => !serviceProducts.has(p));
    if (extra.length > 0) {
      console.log("\nProducts visible via anon but NOT via service role:");
      extra.forEach((p) => console.log(`  - ${p}`));
    }
  }
}

main().catch(console.error);
