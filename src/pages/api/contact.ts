// src/pages/api/contact.ts

import Database from 'better-sqlite3';

// 🚨 Mecanismo de Rate Limiting (Guardar las IPs que tocan el timbre)
const rateLimitMap = new Map();
const MAX_REQUESTS = 5; // Máximo 5 toques
const WINDOW_MS = 60000; // Por minuto (60 segundos)

export async function POST({ request }) {
    const data = await request.formData();
    const name = data.get('name') as string;
    const email = data.get('email') as string;
    const message = data.get('message') as string;
    
    // Intentamos obtener la IP del que envía el formulario
    const clientIP = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // 1. 🛡️ Rate Limiting Check
    const requests = rateLimitMap.get(clientIP) || 0;
    if (requests >= MAX_REQUESTS) {
        return new Response(JSON.stringify({ error: "Demasiadas peticiones. Espera un momento." }), 
            { status: 429 });
    }
    rateLimitMap.set(clientIP, requests + 1);
    // Borramos el "toque" de la cuenta después de 1 minuto
    setTimeout(() => rateLimitMap.set(clientIP, rateLimitMap.get(clientIP) - 1), WINDOW_MS);

    // 2. 🛡️ Validaciones
    if (!name || name.length > 100 || message.length > 500) {
        return new Response(JSON.stringify({ error: "Longitud de campo inválida." }), { status: 400 });
    }

    try {
        const db = new Database('db/database.db');
        
        // 🚨 SQL Injection: Usamos '?' (consultas parametrizadas) para seguridad máxima
        const stmt = db.prepare('INSERT INTO contacts (name, email, message, timestamp, ip) VALUES (?, ?, ?, ?, ?)');
        stmt.run(name, email, message, new Date().toISOString(), clientIP);
        
        db.close();
        
        return new Response(JSON.stringify({ message: "Mensaje enviado, ¡gracias!" }), { status: 200 });
    } catch (error) {
        // En caso de error de la base de datos
        console.error("DB Error:", error);
        return new Response(JSON.stringify({ error: "Error interno del servidor. Intenta de nuevo." }), { status: 500 });
    }
}