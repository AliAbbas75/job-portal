// In-browser database for mock mode, persisted to localStorage so demos survive a reload.
import { ApiError } from '../client';

const STORAGE_KEY = 'pr-mock-db-v1';
const LATENCY_MS = import.meta.env.MODE === 'test' ? 0 : 250;

function emptyDb() {
  return { accounts: {}, profiles: {}, documents: {}, applications: {}, session: null, seq: 100 };
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? emptyDb();
  } catch {
    return emptyDb();
  }
}

let db = load();

export function getDb() {
  return db;
}

export function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Storage unavailable (private mode): keep the data in memory only.
  }
}

export function resetDb() {
  db = emptyDb();
  save();
}

export function nextSeq() {
  db.seq += 1;
  save();
  return db.seq;
}

export function respond(value) {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), LATENCY_MS));
}

export function fail(code) {
  return new Promise((_, reject) => setTimeout(() => reject(new ApiError(code, code)), LATENCY_MS));
}

/** Candidate id of the logged-in mock session, or null. */
export function sessionCandidateId() {
  return db.session;
}
