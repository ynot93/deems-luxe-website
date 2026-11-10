'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ChoiceGroup, SelectInput, TextInput } from '@/components/ui/form'

type Intent = 'rent' | 'buy'

// Values are KES ranges, so the full request form can read them back.
const budgets: Record<Intent, { value: string; label: string }[]> = {
  rent: [
    { value: '0-30000', label: 'Under KES 30,000 a month' },
    { value: '30000-60000', label: 'KES 30,000 to 60,000 a month' },
    { value: '60000-120000', label: 'KES 60,000 to 120,000 a month' },
    { value: '120000-250000', label: 'KES 120,000 to 250,000 a month' },
    { value: '250000-', label: 'Over KES 250,000 a month' },
  ],
  buy: [
    { value: '0-5000000', label: 'Under KES 5 million' },
    { value: '5000000-10000000', label: 'KES 5 to 10 million' },
    { value: '10000000-20000000', label: 'KES 10 to 20 million' },
    { value: '20000000-50000000', label: 'KES 20 to 50 million' },
    { value: '50000000-', label: 'Over KES 50 million' },
  ],
}

// The homepage's 3-field start to a request. It hands its answers to the full form as
// URL parameters, so it works without JavaScript too.
export const QuickRequest = () => {
  const [intent, setIntent] = useState<Intent>('rent')

  return (
    <form
      action="/post-a-request"
      method="get"
      className="grid gap-5 rounded-card border border-line bg-white p-5 sm:p-6"
    >
      <ChoiceGroup
        legend="I want to"
        name="intent"
        defaultValue="rent"
        options={[
          { label: 'Rent', value: 'rent' },
          { label: 'Buy', value: 'buy' },
        ]}
        inputProps={{ onChange: (event) => setIntent(event.currentTarget.value as Intent) }}
      />
      <TextInput label="Where" name="area" placeholder="Area, estate or town" />
      <SelectInput key={intent} label="Budget" name="budget" defaultValue="">
        <option value="">Choose a range</option>
        {budgets[intent].map((band) => (
          <option key={band.value} value={band.value}>
            {band.label}
          </option>
        ))}
      </SelectInput>
      <div className="grid gap-3 sm:flex sm:items-center sm:gap-5">
        <Button type="submit" size="lg">
          Continue
        </Button>
        <p className="text-sm text-mute">About 2 minutes. No account needed.</p>
      </div>
    </form>
  )
}
