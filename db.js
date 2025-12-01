// DB 연결 (옵션 - 현재 메모리 모드)
// PostgreSQL 연결이 필요하면 이 파일을 수정하세요

let pool = null;

// 현재는 메모리 모드로 운영
console.log('ℹ️  Running in memory-only mode (no database)');

export default pool;
