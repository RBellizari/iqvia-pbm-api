import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Rotas que não precisam de autenticação
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/test'
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Verificar se é uma rota pública
  if (publicRoutes.includes(path) || path.startsWith('/api/setup')) {
    // Usar NextResponse explicitamente em uma variável
    const response = NextResponse.next();
    return response;
  }
  
  // Resto do código permanece o mesmo...
}

export const config = {
  matcher: ['/api/:path*']
};