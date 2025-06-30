import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// Inicializa e exporta o cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
