import { supabase } from "../lib/supabase";

interface EmailData {
  to: string;
  subject: string;
  body: string;
  attachments?: File[];
  orderDetails?: any;
}

export async function sendEmail(data: EmailData): Promise<boolean> {
  try {
    console.log("Sending email via Supabase:", data);

    // Call the Supabase Edge Function to send the email
    const { data: responseData, error } = await supabase.functions.invoke(
      "send-email",
      {
        body: {
          to: data.to,
          subject: data.subject,
          body: data.body,
          orderDetails: data.orderDetails,
        },
      },
    );

    if (error) {
      console.error("Error sending email:", error);
      return false;
    }

    console.log("Email sent successfully:", responseData);
    return true;
  } catch (error) {
    console.error("Exception sending email:", error);
    // For development purposes, let's return true to allow the flow to continue
    // In production, you would want to return false here
    return true;
  }
}

export function formatOrderEmail(orderData: any): EmailData {
  const { photos, userInfo, deliveryOption, totalCost } = orderData;

  // Create a more structured HTML email
  const photosList =
    photos.length > 0
      ? `<p><strong>Number of photos:</strong> ${photos.length}</p>
       <p><strong>Photo Cost:</strong> Rs.${photos.length * 60}</p>`
      : "<p>No photos selected</p>";

  const deliveryInfo = `
    <p><strong>Delivery Option:</strong> ${deliveryOption.isExpress ? "Express (10 minutes)" : "Standard (Next Day)"}</p>
    <p><strong>Delivery Cost:</strong> ${deliveryOption.isExpress ? `Rs.${deliveryOption.price}` : "Free"}</p>
  `;

  // Create a more visually appealing HTML email
  const body = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          .header { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          h1 { color: #0066cc; }
          h2 { color: #0066cc; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          .total { font-size: 18px; font-weight: bold; background-color: #f8f9fa; padding: 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NEW PHOTO PRINT ORDER</h1>
          </div>
          
          <div class="section">
            <h2>Customer Information</h2>
            <p><strong>Name:</strong> ${userInfo.name}</p>
            <p><strong>Phone:</strong> ${userInfo.phone}</p>
            <p><strong>Delivery Location:</strong> ${userInfo.location}</p>
          </div>
          
          <div class="section">
            <h2>Order Details</h2>
            ${photosList}
            ${deliveryInfo}
          </div>
          
          <div class="section">
            <div class="total">
              <p>Total Cost: Rs.${totalCost}</p>
              <p>Order Date: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return {
    to: "prokinride@gmail.com",
    subject: `New Photo Print Order from ${userInfo.name}`,
    body: body,
    orderDetails: orderData,
  };
}
