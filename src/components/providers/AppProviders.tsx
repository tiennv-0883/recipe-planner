'use client'

import { RecipeProvider } from '@/src/context/RecipeContext'
import { MealPlanProvider } from '@/src/context/MealPlanContext'
import { GroceryProvider } from '@/src/context/GroceryContext'
import { CatalogProvider } from '@/src/context/CatalogContext'

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <RecipeProvider>
      <MealPlanProvider>
        <GroceryProvider>
          <CatalogProvider>{children}</CatalogProvider>
        </GroceryProvider>
      </MealPlanProvider>
    </RecipeProvider>
  )
}
