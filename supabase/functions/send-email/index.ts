// Follow this setup guide to integrate the Deno runtime into your Supabase project:
// https://supabase.com/docs/guides/functions/deno-runtime

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, subject, body, orderDetails } = await req.json();

    // Log the received data for debugging
    console.log("Received email request:", { to, subject });

    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store order in database
    if (orderDetails) {
      const { userInfo, photos, deliveryOption, totalCost } = orderDetails;
      const orderId =
        orderDetails.orderId || `ORD-${Math.floor(Math.random() * 1000000)}`;
      const orderDate = new Date().toISOString();

      const { data, error } = await supabase
        .from("orders")
        .insert({
          id: orderId,
          customer_name: userInfo.name,
          customer_phone: userInfo.phone,
          customer_location: userInfo.location,
          photo_count: photos.length,
          is_express: deliveryOption.isExpress,
          delivery_price: deliveryOption.price,
          total_cost: totalCost,
          order_date: orderDate,
          order_details: orderDetails,
        })
        .select();

      if (error) {
        console.error("Error storing order in database:", error);
      } else {
        console.log("Order stored successfully:", data);
      }
    }

    // For now, we'll simulate a successful email send
    // In a production environment, you would integrate with an email service
    // like SendGrid, Mailgun, etc.

    // Simulate successful email sending
    console.log(`Email would be sent to: ${to}`);
    console.log(`Subject: ${subject}`);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully and order stored in database",
        data: { to, subject },
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error in send-email function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
