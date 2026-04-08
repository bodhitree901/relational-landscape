'use client';

import { Connection, Category, SharedComparison } from './types';
import { DEFAULT_CATEGORIES } from './categories';

const CONNECTIONS_KEY = 'rl_connections';
const CUSTOM_SUBCATEGORIES_KEY = 'rl_custom_subcategories';
const SHARED_COMPARISONS_KEY = 'rl_shared_comparisons';

export function getConnections(): Connection[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(CONNECTIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getConnection(id: string): Connection | undefined {
  return getConnections().find((c) => c.id === id);
}

export function saveConnection(connection: Connection): void {
  const connections = getConnections();
  const index = connections.findIndex((c) => c.id === connection.id);
  if (index >= 0) {
    connections[index] = { ...connection, updatedAt: new Date().toISOString() };
  } else {
    connections.push(connection);
  }
  localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(connections));
}

export function deleteConnection(id: string): void {
  const connections = getConnections().filter((c) => c.id !== id);
  localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(connections));
}

export function getCustomSubcategories(): Record<string, string[]> {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem(CUSTOM_SUBCATEGORIES_KEY);
  return data ? JSON.parse(data) : {};
}

export function addCustomSubcategory(categoryId: string, subcategory: string): void {
  const custom = getCustomSubcategories();
  if (!custom[categoryId]) custom[categoryId] = [];
  if (!custom[categoryId].includes(subcategory)) {
    custom[categoryId].push(subcategory);
  }
  localStorage.setItem(CUSTOM_SUBCATEGORIES_KEY, JSON.stringify(custom));
}

export function getCategoriesWithCustom(): Category[] {
  const custom = getCustomSubcategories();
  return DEFAULT_CATEGORIES.map((cat) => ({
    ...cat,
    subcategories: [...cat.subcategories, ...(custom[cat.id] || [])],
  }));
}

// Shared comparisons
export function getSharedComparisons(): SharedComparison[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(SHARED_COMPARISONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getSharedComparison(id: string): SharedComparison | undefined {
  return getSharedComparisons().find((c) => c.id === id);
}

export function getSharedComparisonForConnection(connectionId: string): SharedComparison | undefined {
  return getSharedComparisons().find((c) => c.myConnectionId === connectionId);
}

export function saveSharedComparison(comparison: SharedComparison): void {
  const comparisons = getSharedComparisons();
  // Replace if one already exists for the same connection
  const index = comparisons.findIndex((c) => c.myConnectionId === comparison.myConnectionId);
  if (index >= 0) {
    comparisons[index] = comparison;
  } else {
    comparisons.push(comparison);
  }
  localStorage.setItem(SHARED_COMPARISONS_KEY, JSON.stringify(comparisons));
}

export function deleteSharedComparison(id: string): void {
  const comparisons = getSharedComparisons().filter((c) => c.id !== id);
  localStorage.setItem(SHARED_COMPARISONS_KEY, JSON.stringify(comparisons));
}
