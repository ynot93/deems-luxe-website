'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useId, type ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { submitRequest } from '@/app/(site)/post-a-request/actions'
import { CheckboxField, CheckboxGroup, ChoiceGroup, SelectInput, TextArea, TextInput } from '@/components/ui/form'
import { SUGGESTED_AREAS } from '@/lib/locations/areas'
import { countiesForPicker, type County } from '@/lib/locations/counties'
import {
  CATEGORIES,
  INTENTS,
  MUST_HAVES,
  PAYMENT_MODES,
  PROPERTY_TYPES,
  TIMELINES,
  TITLE_REQUIREMENTS,
} from '@/lib/schemas/request-criteria'
import { parseAmount, requestFormSchema, type RequestFormValues } from '@/lib/schemas/request-form'
import { ContactFields, FormSent, SubmitRow, useLeadSubmit } from './lead-form'

const BEDROOMS = [
  { value: '', label: 'Any' },
  { value: '0', label: 'Studio or more' },
  { value: '1', label: '1 or more' },
  { value: '2', label: '2 or more' },
  { value: '3', label: '3 or more' },
  { value: '4', label: '4 or more' },
  { value: '5', label: '5 or more' },
]

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="grid gap-5 border-t border-line pt-8 first:border-t-0 first:pt-0">
    <h2 className="text-h3">{title}</h2>
    {children}
  </section>
)

const roughly = (amount: number | undefined, currency: string, kesPerUsd: number | null) => {
  if (!amount || !kesPerUsd) return undefined
  const other = currency === 'KES' ? amount / kesPerUsd : amount * kesPerUsd
  const code = currency === 'KES' ? 'USD' : 'KES'
  const rounded = other >= 1_000_000 ? `${(other / 1_000_000).toFixed(1)} million` : Math.round(other).toLocaleString('en-KE')
  return `About ${code} ${rounded}`
}

export const RequestForm = ({
  defaults,
  kesPerUsd,
}: {
  defaults: { intent: 'rent' | 'buy'; areas: string; budgetMin: string; budgetMax: string }
  kesPerUsd: number | null
}) => {
  const areasListId = useId()
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      intent: defaults.intent,
      category: 'residential',
      propertyTypes: [],
      bedrooms: '',
      county: 'Nairobi',
      areas: defaults.areas,
      currency: 'KES',
      budgetMin: defaults.budgetMin,
      budgetMax: defaults.budgetMax,
      paymentMode: '',
      mustHaves: [],
      titleRequirement: '',
      timeline: undefined,
      notes: '',
      whatsapp: true,
      name: '',
      phone: '',
      email: '',
      consent: undefined,
      company: '',
    },
  })
  const { register, control, setValue, formState } = form
  const { errors } = formState
  const [intent, category, county, currency, budgetMax] = useWatch({
    control,
    name: ['intent', 'category', 'county', 'currency', 'budgetMax'],
  })
  const { sent, message, onSubmit, submitting } = useLeadSubmit(form, submitRequest)

  // A new category has different property types, so clear the old picks. Land has only one.
  useEffect(() => setValue('propertyTypes', category === 'land' ? ['plot'] : []), [category, setValue])

  if (sent) {
    return (
      <FormSent title="Request sent">
        <p>Thanks, {form.getValues('name').split(' ')[0]}. Your request is with the Deems team.</p>
        <p>An agent will contact you on {form.getValues('phone')} about what you’re looking for.</p>
      </FormSent>
    )
  }

  const perMonth = intent === 'rent' ? ' a month' : ''
  const areaSuggestions = SUGGESTED_AREAS[county as County] ?? []

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-10">
      <Section title="What you’re looking for">
        <ChoiceGroup legend="I want to" name="intent" options={INTENTS} inputProps={register('intent')} />
        <ChoiceGroup legend="Type of property" name="category" options={CATEGORIES} inputProps={register('category')} />
        {category !== 'land' ? (
          <CheckboxGroup
            key={category}
            legend="Which kinds?"
            hint="Choose all that would work for you."
            options={PROPERTY_TYPES.filter((type) => type.category === category)}
            error={errors.propertyTypes?.message}
            inputProps={register('propertyTypes')}
          />
        ) : null}
        {category === 'residential' ? (
          <SelectInput label="Bedrooms" {...register('bedrooms')}>
            {BEDROOMS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        ) : null}
      </Section>

      <Section title="Where">
        <SelectInput label="County" error={errors.county?.message} {...register('county')}>
          {countiesForPicker().map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </SelectInput>
        <TextInput
          label="Areas or estates"
          optional
          hint="Separate them with commas, such as Kilimani, Lavington."
          list={areaSuggestions.length ? areasListId : undefined}
          error={errors.areas?.message}
          {...register('areas')}
        />
        {areaSuggestions.length ? (
          <datalist id={areasListId}>
            {areaSuggestions.map((area) => (
              <option key={area} value={area} />
            ))}
          </datalist>
        ) : null}
      </Section>

      <Section title="Budget">
        <div className="max-w-56">
          <ChoiceGroup
            legend="Currency"
            name="currency"
            options={[
              { label: 'KES', value: 'KES' },
              { label: 'USD', value: 'USD' },
            ]}
            inputProps={register('currency')}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput
            label={`Lowest${perMonth}`}
            optional
            inputMode="numeric"
            error={errors.budgetMin?.message}
            {...register('budgetMin')}
          />
          <TextInput
            label={`Highest${perMonth}`}
            inputMode="numeric"
            hint={roughly(parseAmount(budgetMax ?? ''), currency, kesPerUsd)}
            error={errors.budgetMax?.message}
            {...register('budgetMax')}
          />
        </div>
        {intent === 'buy' ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectInput label="How you’ll pay" optional {...register('paymentMode')}>
              <option value="">Not sure yet</option>
              {PAYMENT_MODES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
            <SelectInput label="Title you need" optional {...register('titleRequirement')}>
              <option value="">Not sure yet</option>
              {TITLE_REQUIREMENTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
          </div>
        ) : null}
      </Section>

      {category !== 'land' ? (
        <Section title="Must-haves">
          <CheckboxGroup
            legend="Anything you can’t do without?"
            optional
            options={MUST_HAVES}
            inputProps={register('mustHaves')}
          />
        </Section>
      ) : null}

      <Section title="When">
        <SelectInput label={intent === 'rent' ? 'When you’d move in' : 'When you’d buy'} error={errors.timeline?.message} {...register('timeline')}>
          <option value="">Choose one</option>
          {TIMELINES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectInput>
        <TextArea
          label="Anything else we should know?"
          optional
          hint="Schools nearby, a quiet street, a ground floor: whatever matters to you."
          error={errors.notes?.message}
          {...register('notes')}
        />
      </Section>

      <Section title="Your details">
        <p className="-mt-2 text-mute">Sellers and other agents never see these. Only Deems staff do.</p>
        <ContactFields
          register={register}
          errors={errors}
          extra={<CheckboxField {...register('whatsapp')}>You can contact me on WhatsApp too.</CheckboxField>}
        />
      </Section>

      <SubmitRow label="Send my request" submitting={submitting} message={message} />
    </form>
  )
}
