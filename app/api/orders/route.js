import { auth } from "@clerk/nextjs/server";
import { connectToDB } from "../../../lib/connectToDB";
import Order from "../../../lib/models/order.model";
import User from "../../../lib/models/user.model";

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { items, amount, address } = await req.json();

    if (!items || !amount || !address) {
      return Response.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    await connectToDB();

    const newOrder = await Order.create({
      userId,
      items,
      amount,
      address,
      status: "Order Placed",
    });

    await User.findByIdAndUpdate(userId, { cartItems: {} });

    return Response.json({ success: true, order: newOrder });

  } catch (error) {
    console.error("Order error:", error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    const orders = await Order.find({ userId }).sort({ date: -1 });

    return Response.json({ success: true, orders });

  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

