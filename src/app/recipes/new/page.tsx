'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/src/components/layout/MainLayout'
import RecipeForm, { type RecipeFormValues } from '@/src/components/recipes/RecipeForm'
import { useRecipes } from '@/src/context/RecipeContext'
import { useAuth } from '@/src/context/AuthContext'
import { createRecipe } from '@/src/services/recipes'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'

export default function NewRecipePage() {
  const router = useRouter()
  const { dispatch } = useRecipes()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(values: RecipeFormValues) {
    setIsSubmitting(true)
    try {
      const { imageFile, ...recipeValues } = values

      // Build the Recipe entity (generates local id + timestamps)
      const recipe = createRecipe({
        ...recipeValues,
        ingredients: recipeValues.ingredients.map((ing, i) => ({
          ...ing,
          id: `ing-${Date.now()}-${i}`,
        })),
        steps: recipeValues.steps.map((step, i) => ({ ...step, order: i + 1 })),
      })

      // Upload image to Supabase Storage before persisting the recipe
      if (imageFile && user) {
        const supabase = createSupabaseBrowserClient()
        const ext = imageFile.name.split('.').pop()?.toLowerCase() ?? 'jpg'
        const path = `${user.id}/${recipe.id}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('recipe-images')
          .upload(path, imageFile, { upsert: true })
        if (!uploadErr) {
          const {
            data: { publicUrl },
          } = supabase.storage.from('recipe-images').getPublicUrl(path)
          recipe.photoUrl = publicUrl
        }
      }

      dispatch({ type: 'ADD', payload: recipe })
      router.push(`/recipes/${recipe.id}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">New Recipe</h1>
        <RecipeForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/recipes')}
          isSubmitting={isSubmitting}
          submitLabel="Create Recipe"
        />
      </div>
    </MainLayout>
  )
}

