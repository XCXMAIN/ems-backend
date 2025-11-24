// .env 파일을 읽어오는 라이브러리 (ESM 방식)
import dotenv from 'dotenv';
dotenv.config();

// PostgreSQL 클라이언트 불러오기
import pg from 'pg';
const { Pool } = pg;

// PostgreSQL 연결 풀 생성
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// 연결 테스트
pool.on('connect', () => {
  console.log('✅ PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

// export (ESM 방식)
export default pool;