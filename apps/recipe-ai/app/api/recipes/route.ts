import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

function createSupabase() {
  return createClient(supabaseUrl, supabaseKey);
}

export async function GET() {
  const supabase = createSupabase();
  
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const supabase = createSupabase();
  
  const { error } = await supabase.from('recipes').insert({
    id: body.id,
    title: body.title,
    ingredients: body.ingredients,
    steps: body.steps,
    duration: body.duration,
    difficulty: body.difficulty,
    filters: body.filters,
    cuisine_type: body.cuisineType,
    nutrition: body.nutrition,
    rating: body.rating,
    comment: body.comment,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest) {
  const { id, rating, comment } = await request.json();
  const supabase = createSupabase();
  
  const { error } = await supabase
    .from('recipes')
    .update({ rating, comment })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = createSupabase();
  const { error } = await supabase.from('recipes').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
