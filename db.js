// .env 파일을 읽어오는 라이브러리 (ESM 방식)
import dotenv from 'dotenv';
dotenv.config();

// PostgreSQL 클라이언트 불러오기
import pg from 'pg';
const { Pool } = pg;

// PostgreSQL 연결 풀 생성 (옵셔널)
let pool = null;

if (process.env.DATABASE_URL) {
  // Render 등 클라우드 환경 (명시적으로 설정된 경우만)
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    console.log('✅ PostgreSQL pool created (Cloud mode)');
  } catch (err) {
    console.error('❌ PostgreSQL pool creation failed:', err.message);
    pool = null;
  }
} else if (process.env.DB_HOST && process.env.DB_DATABASE) {
  // 로컬 환경
  try {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    console.log('✅ PostgreSQL pool created (Local mode)');
  } catch (err) {
    console.error('❌ PostgreSQL pool creation failed:', err.message);
    pool = null;
  }
} else {
  console.log('ℹ️  PostgreSQL not configured (memory-only mode)');
}

// export (ESM 방식)
export default pool;