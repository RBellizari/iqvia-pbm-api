import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT NOW() as time');
    return NextResponse.json({ 
      message: 'Conexão com o banco de dados bem-sucedida!',
      time: result[0].time,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    return NextResponse.json(
      { error: 'Erro ao conectar ao banco de dados', details: error.message },
      { status: 500 }
    );
  }
}