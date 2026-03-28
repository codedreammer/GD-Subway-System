export const ORDER_FILTERS = {
  ALL: "all",
  DELAYED: "delayed",
};

export const CONTROL_STATUS_ORDER = ["pending", "preparing", "ready", "completed", "rejected"];

export const FLOW_STAGE_LABELS = {
  pending: "Pending",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
};

const PREPARING_STATUSES = new Set(["accepted", "preparing"]);
const DELAY_THRESHOLD_MS = 15 * 60 * 1000;
const ORDERS_PER_MINUTE_WINDOW_MS = 5 * 60 * 1000;

export function createEmptyStatusCounts() {
  return {
    pending: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
    rejected: 0,
  };
}

export function normalizeOrderStatus(status) {
  return String(status || "").toLowerCase();
}

export function getControlStatus(status) {
  const normalizedStatus = normalizeOrderStatus(status);

  if (PREPARING_STATUSES.has(normalizedStatus)) {
    return "preparing";
  }

  if (normalizedStatus === "cancelled") {
    return "rejected";
  }

  return normalizedStatus;
}

export function buildStatusCounts(statusRows = []) {
  return statusRows.reduce((counts, row) => {
    const statusKey = getControlStatus(row?.status);

    if (statusKey in counts) {
      counts[statusKey] += 1;
    }

    return counts;
  }, createEmptyStatusCounts());
}

export function updateStatusCounts(currentCounts, eventType, previousStatus, nextStatus) {
  const nextCounts = {
    ...createEmptyStatusCounts(),
    ...currentCounts,
  };

  const previousKey = getControlStatus(previousStatus);
  const nextKey = getControlStatus(nextStatus);

  if ((eventType === "DELETE" || eventType === "UPDATE") && previousKey in nextCounts) {
    nextCounts[previousKey] = Math.max(0, nextCounts[previousKey] - 1);
  }

  if ((eventType === "INSERT" || eventType === "UPDATE") && nextKey in nextCounts) {
    nextCounts[nextKey] += 1;
  }

  return nextCounts;
}

export function upsertOrderRecord(orders = [], row) {
  if (!row?.id) {
    return orders;
  }

  const remainingOrders = orders.filter((order) => order.id !== row.id);

  return [row, ...remainingOrders].sort(
    (left, right) => new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime(),
  );
}

export function removeOrderRecord(orders = [], orderId) {
  return orders.filter((order) => order.id !== orderId);
}

export function isDelayedOrder(order, now = Date.now()) {
  if (!order?.created_at) {
    return false;
  }

  const createdAt = new Date(order.created_at).getTime();
  const status = normalizeOrderStatus(order.status);

  if (!Number.isFinite(createdAt)) {
    return false;
  }

  return now - createdAt > DELAY_THRESHOLD_MS && status !== "completed";
}

export function filterOrdersByMetric(orders = [], filter = ORDER_FILTERS.ALL, now = Date.now()) {
  if (filter === ORDER_FILTERS.ALL) {
    return orders;
  }

  if (filter === ORDER_FILTERS.DELAYED) {
    return orders.filter((order) => isDelayedOrder(order, now));
  }

  if (filter === "preparing") {
    return orders.filter((order) => PREPARING_STATUSES.has(normalizeOrderStatus(order.status)));
  }

  return orders.filter((order) => getControlStatus(order.status) === filter);
}

export function calculateAveragePrepTimeMinutes(orders = []) {
  let totalMinutes = 0;
  let completedOrders = 0;

  orders.forEach((order) => {
    if (normalizeOrderStatus(order?.status) !== "completed" || !order?.pickup_time || !order?.created_at) {
      return;
    }

    const createdAt = new Date(order.created_at).getTime();
    const pickupTime = new Date(order.pickup_time).getTime();

    if (!Number.isFinite(createdAt) || !Number.isFinite(pickupTime) || pickupTime < createdAt) {
      return;
    }

    totalMinutes += (pickupTime - createdAt) / 60000;
    completedOrders += 1;
  });

  return completedOrders > 0 ? totalMinutes / completedOrders : 0;
}

export function calculateOrdersPerMinute(orders = [], now = Date.now()) {
  const recentThreshold = now - ORDERS_PER_MINUTE_WINDOW_MS;
  const recentOrders = orders.reduce((count, order) => {
    if (!order?.created_at) {
      return count;
    }

    const createdAt = new Date(order.created_at).getTime();
    return Number.isFinite(createdAt) && createdAt >= recentThreshold ? count + 1 : count;
  }, 0);

  return recentOrders / 5;
}

export function getVendorLoadDistribution(vendorLoad = {}, vendorLookup = {}, limit = 4) {
  return Object.entries(vendorLoad)
    .map(([vendorId, totalOrders]) => ({
      vendorId,
      vendorName: vendorLookup[vendorId] || `Vendor ${String(vendorId).slice(0, 6)}`,
      totalOrders,
    }))
    .sort((left, right) => right.totalOrders - left.totalOrders)
    .slice(0, limit);
}

export function getOrderFlowStages(statusCounts = createEmptyStatusCounts()) {
  return ["pending", "preparing", "ready", "completed"].map((stageKey) => ({
    key: stageKey,
    label: FLOW_STAGE_LABELS[stageKey],
    count: statusCounts[stageKey] || 0,
  }));
}

export function formatMinutes(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return "--";
  }

  return `${Math.round(value)} mins`;
}

export function formatOrdersPerMinute(value) {
  if (!Number.isFinite(value)) {
    return "0.0";
  }

  return value >= 10 ? value.toFixed(0) : value.toFixed(1);
}

export function formatOrderAge(createdAt, now = Date.now()) {
  if (!createdAt) {
    return "--";
  }

  const diffMs = now - new Date(createdAt).getTime();

  if (!Number.isFinite(diffMs) || diffMs < 0) {
    return "--";
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}
