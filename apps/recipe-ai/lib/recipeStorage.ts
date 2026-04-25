import { Recipe } from '@/types/recipe';

async function fetchApi(
  endpoint: string,
  options: RequestInit = {}
): Promise<unknown> {
  const res = await fetch(`/api/recipes${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'API Error');
  }

  return res.json();
}

export async function getSavedRecipes(): Promise<Recipe[]> {
  try {
    const data = await fetchApi('') as Recipe[];
    return data ?? [];
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  await fetchApi('', {
    method: 'POST',
    body: JSON.stringify(recipe),
  });
}

export async function updateRecipe(
  id: string,
  updates: Partial<Pick<Recipe, 'rating' | 'comment'>>
): Promise<void> {
  await fetchApi('', {
    method: 'PUT',
    body: JSON.stringify({ id, ...updates }),
  });
}

export async function deleteRecipe(id: string): Promise<void> {
  await fetchApi(`?id=${id}`, {
    method: 'DELETE',
  });
}
