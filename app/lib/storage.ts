'use client';

import { Connection, Category } from './types';
import { DEFAULT_CATEGORIES } from './categories';

const CONNECTIONS_KEY = 'rl_connections';
const CUSTOM_SUBCATEGORIES_KEY = 'rl_custom_subcategories';

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
