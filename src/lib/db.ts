import { Pool } from 'pg';

// Initialize PostgreSQL connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function saveRedditToken(subreddit: string, refreshToken: string): Promise<void> {
  const query = `
    INSERT INTO subreddit_tokens (subreddit, refresh_token, created_at)
    VALUES ($1, $2, NOW())
    ON CONFLICT (subreddit) 
    DO UPDATE SET refresh_token = $2, updated_at = NOW()
  `;

  await pool.query(query, [subreddit, refreshToken]);
}

export async function getRedditToken(subreddit: string): Promise<string | null> {
  await maybeInitDatabase();

  const query = 'SELECT refresh_token FROM subreddit_tokens WHERE subreddit = $1';
  const result = await pool.query(query, [subreddit]);

  return result.rows[0]?.refresh_token || null;
}

export async function deleteRedditToken(subreddit: string): Promise<void> {
  await maybeInitDatabase();

  const query = 'DELETE FROM subreddit_tokens WHERE subreddit = $1';
  await pool.query(query, [subreddit]);
}

export async function getTokenInfo(subreddit: string): Promise<{ refreshToken: string } | null> {
  await maybeInitDatabase();

  const query = 'SELECT refresh_token FROM subreddit_tokens WHERE subreddit = $1';
  const result = await pool.query(query, [subreddit]);

  if (result.rows[0]) {
    return {
      refreshToken: result.rows[0].refresh_token,
    };
  }

  return null;
}

let initAttempted = false;
async function maybeInitDatabase(): Promise<void> {
  if (initAttempted) {
    return;
  }

  initAttempted = true;
  return initDatabase();
}

// Initialize the database table
export async function initDatabase(): Promise<void> {
  const query = `
    CREATE TABLE IF NOT EXISTS subreddit_tokens (
      subreddit VARCHAR(255) PRIMARY KEY,
      refresh_token TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await pool.query(query);
}
