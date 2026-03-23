import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import { generateOrderCode } from '@/utils/generateOrderCode';

export async function POST(req) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("USER ID:", user?.id);

    const body = await req.json();
    const { vendor_id, items } = body;

    if (!vendor_id || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const total_amount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_code: generateOrderCode(),
        user_id: user.id,
        student_id: user.id,
        vendor_id,
        total_amount,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Supabase insert order error:', orderError);
      throw new Error(orderError.message || 'Failed to insert order');
    }

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(
        items.map((item) => ({
          order_id: order.id,
          item_id: item.id,
          quantity: item.quantity,
          price_at_time: item.price
        }))
      );

    if (itemsError) {
      console.error('Supabase insert order_items error:', itemsError);
      throw new Error(itemsError.message || 'Failed to insert order items');
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('API create-order error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
