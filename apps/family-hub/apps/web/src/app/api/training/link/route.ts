import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const TRAINING_CAMP_API = process.env.TRAINING_CAMP_API || 'https://training-camp.onrender.com/api';

export async function DELETE() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { data: member } = await supabase
      .from('family_members')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Membre introuvable' }, { status: 404 });
    }

    await supabase
      .from('member_integrations')
      .delete()
      .eq('member_id', member.id)
      .eq('provider', 'training-camp');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[training/link DELETE]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { email, password } = await request.json();

    // Login sur Training-Camp
    const res = await fetch(`${TRAINING_CAMP_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[training/link] login failed', res.status, res.url, body);
      return NextResponse.json({ error: 'Identifiants Training-Camp invalides' }, { status: 400 });
    }

    // Le token est dans le cookie httpOnly de la réponse, pas dans le body JSON
    const setCookieHeader = res.headers.get('set-cookie') ?? '';
    const tokenMatch = setCookieHeader.match(/access_token=([^;]+)/);
    const access_token = tokenMatch?.[1];

    if (!access_token) {
      console.error('[training/link] access_token absent du cookie', setCookieHeader);
      return NextResponse.json({ error: 'Token Training-Camp non reçu' }, { status: 500 });
    }

    // Récupère le member_id lié à cet utilisateur Supabase
    const { data: member } = await supabase
      .from('family_members')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Membre familial introuvable' }, { status: 404 });
    }

    // Upsert dans member_integrations (avec le mot de passe pour le re-login automatique)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase
      .from('member_integrations')
      .upsert({
        member_id: member.id,
        provider: 'training-camp',
        access_token,
        token_expires_at: expiresAt,
        provider_email: email,
        provider_password: password,
        status: 'active',
      }, { onConflict: 'member_id,provider' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[training/link]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
