import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to send order confirmation email
async function sendOrderConfirmationEmail(
  email: string,
  fullName: string,
  orderNumber: string,
  orderDate: Date,
  items: any[],
  subtotal: number,
  shippingFee: number,
  total: number,
  shippingAddress: string,
  request: NextRequest
) {
  try {
    // Email sending is now enabled with hardcoded API key

    const itemsList = items
      .map((item) => `${item.productName} – ${item.quantity} x Rs. ${item.price.toFixed(2)}`)
      .join("\n");

    const message = `
Dear ${fullName},

Thank you for your purchase! We are pleased to confirm that your order has been successfully placed and is being processed.

Order Details:
Order Number: ${orderNumber}
Order Date: ${orderDate.toLocaleDateString()}
Customer Name: ${fullName}
Shipping Address: ${shippingAddress}

Items Ordered:
${itemsList}

Subtotal: Rs. ${subtotal.toFixed(2)}
Shipping Charges: Rs. ${shippingFee.toFixed(2)}
Order Total: Rs. ${total.toFixed(2)}

Payment Method: Cash on Delivery

If you have any questions or need assistance, feel free to contact our support team at info@designagartistry.com or +92 324 1272547.

Thank you for shopping with us!

Best regards,
DesigNagArtistry
info@designagartistry.com
+92 324 1272547
`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .logo { text-align: center; margin-bottom: 20px; }
    .logo img { max-width: 200px; height: auto; }
    .header { background-color: #704204; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px; }
    .order-details { background-color: white; padding: 15px; border-radius: 5px; margin-top: 15px; }
    .items-list { margin-top: 10px; }
    .item { padding: 10px 0; border-bottom: 1px solid #eee; }
    .total { font-size: 18px; font-weight: bold; margin-top: 20px; color: #704204; }
    .track-button { display: inline-block; background-color: #704204; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
    .track-button:hover { background-color: #8a5626; }
    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="https://www.designagartistry.com/images/MainImage3.png" alt="DesigNagArtistry Logo" />
    </div>
    <div class="header">
      <h1>Order Confirmation</h1>
    </div>
    <div class="content">
      <p>Dear ${fullName},</p>
      <p>Thank you for your purchase! We are pleased to confirm that your order has been successfully placed and is being processed.</p>
      
      <div class="order-details">
        <h3>Order Details</h3>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Order Date:</strong> ${orderDate.toLocaleDateString()}</p>
        <p><strong>Customer Name:</strong> ${fullName}</p>
        <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
        
        <h3 style="margin-top: 20px;">Items Ordered</h3>
        <div class="items-list">
          ${items.map(item => `
            <div class="item">
              <strong>${item.productName}</strong> – ${item.quantity} x Rs. ${item.price.toFixed(2)}
            </div>
          `).join('')}
        </div>
        
        <p><strong>Subtotal:</strong> Rs. ${subtotal.toFixed(2)}</p>
        <p><strong>Shipping Charges:</strong> Rs. ${shippingFee.toFixed(2)}</p>
        <div class="total">
          Order Total: Rs. ${total.toFixed(2)}
        </div>
        
        <a href="https://www.designagartistry.com/track-order?orderNumber=${orderNumber}" class="track-button">Track Order</a>
        
        <p style="margin-top: 20px;"><strong>Payment Method:</strong> Cash on Delivery</p>
      </div>
      
      <p>If you have any questions or need assistance, feel free to contact our support team at <a href="mailto:info@designagartistry.com">info@designagartistry.com</a> or <a href="https://wa.me/923241272547">+92 324 1272547</a>.</p>
      
      <p>Thank you for shopping with us!</p>
      
      <div class="footer">
        <p><strong>Best regards,</strong><br>
        DesigNagArtistry<br>
        <a href="mailto:info@designagartistry.com">info@designagartistry.com</a><br>
        <a href="https://wa.me/923241272547">+92 324 1272547</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;

    const response = await fetch(`${request.nextUrl.origin}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        subject: `Order Confirmation – Your Order Has Been Placed Successfully (${orderNumber})`,
        message,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to send email:", error);
    } else {
      console.log("Order confirmation email sent successfully to:", email);
    }
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.headers.get("x-session-id");
    const body = await request.json();

    const {
      fullName,
      email,
      phone,
      country,
      city,
      area,
      postalCode,
      addressLine,
      notes,
      subtotal,
      shippingFee,
      total,
      cartItems,
      paymentMethod,
    } = body;

    console.log("Creating order for guest:", { sessionId, fullName, total });

    // Create address for guest (we'll use a temporary user or create without userId)
    // For guest checkout, we need to handle address differently since Address requires userId
    // We'll create the order without a user and handle addresses differently

    // Generate order number
    const orderNumber = "ORD-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Store guest customer + address data as a JSON object in notes
    const fullNotes = JSON.stringify({
      _guest: { email, fullName, phone, country, city, area, postalCode, addressLine },
      _userNotes: notes || "",
    });

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        subtotal,
        shippingFee,
        discount: 0,
        total,
        paymentStatus: "pending",
        orderStatus: "pending",
        notes: fullNotes,
      },
    });

    // Create order items
    for (const item of cartItems) {
      const price = typeof item.product.price === 'string' ? parseFloat(item.product.price) : item.product.price;
      const salePrice = item.product.salePrice ? (typeof item.product.salePrice === 'string' ? parseFloat(item.product.salePrice) : item.product.salePrice) : null;
      const finalPrice = item.product.isOnSale && salePrice ? salePrice : price;

      // Fetch fabric and color details if selected
      let fabricName = null;
      let colorName = null;
      let colorHex = null;

      if (item.fabricId) {
        const fabric = await prisma.fabric.findUnique({
          where: { id: item.fabricId },
          select: { name: true },
        });
        if (fabric) fabricName = fabric.name;
      }

      if (item.colorId) {
        const color = await prisma.color.findUnique({
          where: { id: item.colorId },
          select: { name: true, hexCode: true },
        });
        if (color) {
          colorName = color.name;
          colorHex = color.hexCode;
        }
      }

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: finalPrice,
          total: finalPrice * item.quantity,
          variantId: item.variantId || null,
          fabricName,
          colorName,
          colorHex,
        },
      });
    }

    // Decrement stock for each ordered item
    for (const item of cartItems) {
      // Decrement overall product stock (floor at 0)
      await prisma.product.updateMany({
        where: { id: item.product.id, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });

      // Decrement variant (size) stock if a size was selected
      if (item.variantId) {
        await prisma.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    // Record payment method
    if (paymentMethod) {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod === "bank_transfer" ? "Bank Transfer" : "Card",
          amount: total,
          status: "pending",
        },
      });
    }

    // Clear cart for guest
    if (sessionId) {
      const cart = await prisma.cart.findFirst({
        where: { sessionId },
      });

      if (cart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }
    }

    console.log("Order created successfully:", order.id);

    // Send order confirmation email
    const shippingAddress = `${addressLine}, ${area}, ${city}, ${country} - ${postalCode}`;
    await sendOrderConfirmationEmail(
      email,
      fullName,
      order.orderNumber,
      order.createdAt,
      cartItems.map((item: { product: { name: string; price: number | string }; quantity: number }) => ({
        productName: item.product.name,
        quantity: item.quantity,
        price: typeof item.product.price === 'string' ? parseFloat(item.product.price) : item.product.price,
      })),
      subtotal,
      shippingFee,
      total,
      shippingAddress,
      request
    );

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
