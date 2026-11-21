import { BaseLinkerOrder, BaseLinkerOrderStatus } from "@/types/baselinker";
import { DiagnosticIssueItem } from "@/types";

/**
 * Calculates total gross price for an order including products and delivery.
 */
export function calculateOrderTotal(order: BaseLinkerOrder): number {
  const productsTotal = (order.products || []).reduce((acc, p) => {
    return acc + (p.price_brutto || 0) * (p.quantity || 1);
  }, 0);
  const deliveryPrice = Number(order.delivery_price) || 0;
  return Math.round((productsTotal + deliveryPrice) * 100) / 100;
}

/**
 * Checks if a status name implies the order is already dispatched/completed.
 */
function isDispatchedOrFinishedStatus(statusName: string): boolean {
  const lower = statusName.toLowerCase();
  return (
    lower.includes("wysłan") ||
    lower.includes("zrealizowan") ||
    lower.includes("odebran") ||
    lower.includes("doręczon") ||
    lower.includes("shipped") ||
    lower.includes("delivered") ||
    lower.includes("closed")
  );
}

/**
 * Checks if a status name implies the order is cancelled.
 */
function isCancelledStatus(statusName: string): boolean {
  const lower = statusName.toLowerCase();
  return (
    lower.includes("anulowan") ||
    lower.includes("zwrot") ||
    lower.includes("cancelled") ||
    lower.includes("odrzucon")
  );
}

/**
 * Diagnostic checks for Orders.
 */
export function diagnoseOrders(
  orders: BaseLinkerOrder[],
  statuses: BaseLinkerOrderStatus[],
  referenceNowMs: number = Date.now()
): DiagnosticIssueItem[] {
  const issues: DiagnosticIssueItem[] = [];
  const statusMap = new Map<number, string>();
  for (const s of statuses) {
    statusMap.set(s.id, s.name);
  }

  const referenceNowSec = Math.floor(referenceNowMs / 1000);
  const SEVEN_DAYS_SEC = 7 * 24 * 3600;
  const FOURTEEN_DAYS_SEC = 14 * 24 * 3600;
  const THREE_DAYS_SEC = 3 * 24 * 3600;

  for (const order of orders) {
    const orderIdStr = order.order_id.toString();
    const orderDateSec = order.date_add || order.date_confirmed || 0;
    const ageSec = referenceNowSec - orderDateSec;
    const statusName = statusMap.get(order.order_status_id) || `Status #${order.order_status_id}`;
    const orderTotal = calculateOrderTotal(order);
    const paymentDone = Number(order.payment_done) || 0;
    const isCod =
      order.payment_method_cod === true ||
      order.payment_method_cod === "1" ||
      order.payment_method?.toLowerCase().includes("pobrani") ||
      order.payment_method?.toLowerCase().includes("cod");

    const isFinished = isDispatchedOrFinishedStatus(statusName);
    const isCancelled = isCancelledStatus(statusName);

    // Skip cancelled orders from most active checks
    if (isCancelled) {
      continue;
    }

    // 1. Stuck order check (orders in processing/open state for too long)
    if (!isFinished && ageSec > FOURTEEN_DAYS_SEC) {
      const days = Math.floor(ageSec / 86400);
      issues.push({
        category: "ORDER",
        severity: "CRITICAL",
        code: "ORD_STUCK_PROCESSING_CRITICAL",
        title: `Zamówienie zablokowane w realizacji (${days} dni)`,
        description: `Zamówienie #${order.order_id} (${order.delivery_fullname || "Klient"}) oczekuje w statusie "${statusName}" od ${days} dni bez finalizacji.`,
        affectedEntityId: orderIdStr,
        affectedIdentifier: `#${order.order_id}`,
        details: { orderId: order.order_id, days, statusName, orderTotal },
        suggestedFix:
          "Zweryfikuj stan zamówienia z magazynem lub skontaktuj się z klientem i zmień status na właściwy.",
      });
    } else if (!isFinished && ageSec > SEVEN_DAYS_SEC) {
      const days = Math.floor(ageSec / 86400);
      issues.push({
        category: "ORDER",
        severity: "WARNING",
        code: "ORD_STUCK_PROCESSING_WARNING",
        title: `Przeterminowana realizacja zamówienia (${days} dni)`,
        description: `Zamówienie #${order.order_id} ma ponad tydzień (${days} dni) i wciąż pozostaje w statusie "${statusName}".`,
        affectedEntityId: orderIdStr,
        affectedIdentifier: `#${order.order_id}`,
        details: { orderId: order.order_id, days, statusName },
        suggestedFix:
          "Przyspiesz kompletację lub poinformuj klienta o opóźnieniu dostawy.",
      });
    }

    // 2. Paid order unfulfilled (> 3 days)
    if (
      !isFinished &&
      paymentDone >= orderTotal &&
      orderTotal > 0 &&
      ageSec > THREE_DAYS_SEC &&
      !order.delivery_package_nr
    ) {
      issues.push({
        category: "ORDER",
        severity: "WARNING",
        code: "ORD_PAID_UNSHIPPED",
        title: "Opłacone zamówienie bez nadania przesyłki (> 72h)",
        description: `Zamówienie #${order.order_id} zostało opłacone (${paymentDone} PLN), ale po 3 dniach nadal nie wygenerowano listu przewozowego.`,
        affectedEntityId: orderIdStr,
        affectedIdentifier: `#${order.order_id}`,
        details: { orderId: order.order_id, paymentDone, orderTotal },
        suggestedFix:
          "Wygeneruj etykietę kurierską w Base.com i przekaż paczkę do wysyłki.",
      });
    }

    // 3. Shipped order missing tracking number (CRITICAL)
    if (isFinished && !order.delivery_package_nr) {
      issues.push({
        category: "SHIPPING",
        severity: "CRITICAL",
        code: "ORD_MISSING_TRACKING",
        title: "Brak numeru listu przewozowego dla wysłanego zamówienia",
        description: `Zamówienie #${order.order_id} ma status "${statusName}", lecz brak w nim zapisanego numeru przesyłki (tracking number).`,
        affectedEntityId: orderIdStr,
        affectedIdentifier: `#${order.order_id}`,
        details: {
          orderId: order.order_id,
          statusName,
          deliveryMethod: order.delivery_method,
        },
        suggestedFix:
          "Wprowadź numer listu przewozowego, aby powiadomić klienta i uniknąć kar w Allegro / Amazon za brak trackingu.",
      });
    }

    // 4. Financial risk: Sent/Finished without payment and not COD
    if (isFinished && !isCod && paymentDone <= 0 && orderTotal > 0) {
      issues.push({
        category: "ORDER",
        severity: "CRITICAL",
        code: "ORD_UNPAID_SHIPPED",
        title: "Wysłano zamówienie bez odnotowanej wpłaty! (Brak pobrania)",
        description: `Zamówienie #${order.order_id} na kwotę ${orderTotal} PLN zostało oznaczone jako "${statusName}", mimo że kwota wpłaty wynosi 0.00 PLN i zamówienie nie było za pobraniem!`,
        affectedEntityId: orderIdStr,
        affectedIdentifier: `#${order.order_id}`,
        details: {
          orderId: order.order_id,
          paymentDone,
          orderTotal,
          paymentMethod: order.payment_method,
        },
        suggestedFix:
          "Pilnie sprawdź wyciąg bankowy / bramkę płatności (PayU, Przelewy24, Stripe) i potwierdź zaksięgowanie wpłaty.",
      });
    }

    // 5. Partial underpayment (not COD)
    if (!isCod && paymentDone > 0 && paymentDone < orderTotal) {
      const missingAmount = Math.round((orderTotal - paymentDone) * 100) / 100;
      issues.push({
        category: "ORDER",
        severity: "WARNING",
        code: "ORD_PARTIAL_PAYMENT",
        title: `Niedopłata w zamówieniu (brakuje ${missingAmount} PLN)`,
        description: `Dla zamówienia #${order.order_id} wpłacono ${paymentDone} PLN z wymaganych ${orderTotal} PLN (niedopłata: ${missingAmount} PLN).`,
        affectedEntityId: orderIdStr,
        affectedIdentifier: `#${order.order_id}`,
        details: { orderId: order.order_id, paymentDone, orderTotal, missingAmount },
        suggestedFix:
          "Wyślij do klienta prośbę o dopłatę różnicy lub skoryguj pozycje zamówienia przed wysyłką.",
      });
    }
  }

  return issues;
}
