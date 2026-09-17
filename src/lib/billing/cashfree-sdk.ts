/**
 * Loads Cashfree's gateway checkout SDK (v3) in the browser and opens the
 * hosted gateway for a payment session created by the server.
 */

type CashfreeInstance = {
  checkout: (options: {
    paymentSessionId: string;
    redirectTarget?: string;
  }) => Promise<{ error?: { message?: string } } | void>;
};

type CashfreeFactory = (options: { mode: "production" | "sandbox" }) => CashfreeInstance;

const SDK_URL = "https://sdk.cashfree.com/js/v3/cashfree.js";

let loader: Promise<CashfreeFactory> | null = null;

function loadSdk(): Promise<CashfreeFactory> {
  if (loader) return loader;
  loader = new Promise<CashfreeFactory>((resolve, reject) => {
    const existing = (window as unknown as { Cashfree?: CashfreeFactory }).Cashfree;
    if (existing) {
      resolve(existing);
      return;
    }
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => {
      const factory = (window as unknown as { Cashfree?: CashfreeFactory }).Cashfree;
      if (factory) resolve(factory);
      else reject(new Error("Could not load the payment gateway."));
    };
    script.onerror = () => reject(new Error("Could not load the payment gateway."));
    document.head.appendChild(script);
  });
  return loader;
}

export async function openCashfreeCheckout(paymentSessionId: string): Promise<void> {
  const factory = await loadSdk();
  const cashfree = factory({ mode: "production" });
  const result = await cashfree.checkout({ paymentSessionId, redirectTarget: "_self" });
  if (result && "error" in result && result.error) {
    throw new Error(result.error.message ?? "Payment could not be started.");
  }
}
