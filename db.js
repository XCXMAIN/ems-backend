// .env 파일을 읽어오는 라이브러리 (ESM 방식)
import dotenv from 'dotenv';
dotenv.config();

// PostgreSQL 클라이언트 불러오기
import pg from 'pg';
const { Pool } = pg;

// PostgreSQL 연결 풀 생성 (옵셔널)
let pool = null;

if (process.env.DATABASE_URL) {
  // Render 등 클라우드 환경
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  pool.on('connect', () => {
    console.log('✅ PostgreSQL connected (Render)');
  });
} else if (process.env.DB_HOST && process.env.DB_DATABASE) {
  // 로컬 환경
  pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  pool.on('connect', () => {
    console.log('✅ PostgreSQL connected (Local)');
  });
} else {
  console.log('ℹ️  PostgreSQL not configured (memory-only mode)');
}

if (pool) {
  pool.on('error', (err) => {
    console.error('❌ PostgreSQL connection error:', err.message);
  });
}

// export (ESM 방식)
export default pool;