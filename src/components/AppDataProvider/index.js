import React from "react";
import { SQLiteProvider } from "expo-sqlite";
import JournalsProvider from "./JournalsProvider";
import HabitsProvider from "./HabitsProvider";

// Migration / initialization function
const migrateDbIfNeeded = async (db) => {

    // await db.execAsync(`DROP TABLE IF EXISTS habits;`);
    // await db.execAsync(`DROP TABLE IF EXISTS journal_entries;`);
    // await db.execAsync(`DROP TABLE IF EXISTS habit_entries;`);
    // await db.execAsync(`DROP TABLE IF EXISTS moods;`);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER,
      uuid TEXT UNIQUE PRIMARY KEY,
      user_uuid TEXT,
      title TEXT,
      content TEXT,
      audio_uri TEXT,
      transcript TEXT,
      mood_id INTEGER,
      mood_label TEXT,
      created_at TEXT,
      updated_at TEXT,
      synced INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS moods (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER,
      uuid TEXT UNIQUE PRIMARY KEY,
      user_uuid TEXT,
      title TEXT,
      description TEXT,
      frequency TEXT,
      reminder_time TEXT,
      color TEXT,
      icon TEXT,
      next_due_date TEXT,
      priority INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT,
      updated_at TEXT,
      synced INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS habit_entries (
      id INTEGER,
      uuid TEXT UNIQUE PRIMARY KEY,
      habit_uuid TEXT,
      habit_id TEXT,
      user_uuid TEXT,
      date TEXT,
      updated_at TEXT,
      completed INTEGER DEFAULT 0,
      note TEXT,
      synced INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0,
      UNIQUE(uuid)
    );
  `);
};

export default function AppDataProvider({ children }) {
  return (
    <SQLiteProvider databaseName="zeniahub.db" onInit={migrateDbIfNeeded}>
      {/* Both providers now receive the db from SQLiteProvider context */}
      <JournalsProvider />
      <HabitsProvider />
      {children}
    </SQLiteProvider>
  );
}
