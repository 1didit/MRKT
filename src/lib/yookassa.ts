import "server-only";
import { randomUUID } from "node:crypto";

const SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const SECRET = process.env.YOOKASSA_SECRET_KEY;
const API = "https://api.yookassa.ru/v3";

export function isConfigured(): boolean {
  return Boolean(SHOP_ID && SECRET);
}

function authHeader(): string {
  return "Basic " + Buffer.from(`${SHOP_ID}:${SECRET}`).toString("base64");
}

export interface CreatePaymentParams {
  amount: number; // in rubles (integer)
  orderId: string;
  orderNumber: string;
  returnUrl: string;
  description: string;
}

export async function createPayment(
  params: CreatePaymentParams,
): Promise<{ id: string; confirmationUrl: string } | null> {
  if (!isConfigured()) return null;
  try {
    const res = await fetch(`${API}/payments`, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Idempotence-Key": randomUUID(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: { value: params.amount.toFixed(2), currency: "RUB" },
        capture: true,
        confirmation: { type: "redirect", return_url: params.returnUrl },
        description: params.description,
        metadata: { orderId: params.orderId, orderNumber: params.orderNumber },
      }),
    });
    if (!res.ok) {
      console.error("YooKassa create payment failed:", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const url = data?.confirmation?.confirmation_url;
    if (!data?.id || !url) return null;
    return { id: data.id, confirmationUrl: url };
  } catch (e) {
    console.error("YooKassa create payment error:", e);
    return null;
  }
}

export async function getPayment(id: string): Promise<{
  id: string;
  status: string;
  paid: boolean;
  metadata?: Record<string, string>;
} | null> {
  if (!isConfigured()) return null;
  try {
    const res = await fetch(`${API}/payments/${id}`, {
      headers: { Authorization: authHeader() },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id: data.id,
      status: data.status,
      paid: Boolean(data.paid),
      metadata: data.metadata,
    };
  } catch {
    return null;
  }
}
