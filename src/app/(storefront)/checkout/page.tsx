import { getSessionUser } from "@/lib/auth";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getSessionUser();
  return (
    <CheckoutForm
      defaultName={user?.name ?? ""}
      defaultEmail={user?.email ?? ""}
    />
  );
}
