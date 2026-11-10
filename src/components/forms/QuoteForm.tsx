'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { useForm, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { submitServiceLead } from '@/app/(site)/services/actions'
import { CheckboxGroup, ChoiceGroup, SelectInput, TextArea, TextInput } from '@/components/ui/form'
import { countiesForPicker } from '@/lib/locations/counties'
import { PROPERTY_TYPES, TIMELINES } from '@/lib/schemas/request-criteria'
import {
  AGENCY_GOALS,
  MANAGED_PROPERTY_TYPES,
  MANAGEMENT_SERVICES,
  OCCUPANCY,
  serviceFormSchemas,
  TITLE_TYPES,
  URGENCY,
  VALUATION_PURPOSES,
  type Service,
} from '@/lib/schemas/service-forms'
import { ContactFields, FormSent, SubmitRow, useLeadSubmit } from './lead-form'

// Loosely typed on purpose: each service has its own fields, all validated by its schema
type Values = Record<string, unknown>
type Register = UseFormRegister<Values>

const Options = ({ options, placeholder }: { options: readonly { value: string; label: string }[]; placeholder?: string }) => (
  <>
    <option value="">{placeholder ?? 'Choose one'}</option>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </>
)

const errorOf = (errors: FieldErrors<Values>, name: string) => errors[name]?.message as string | undefined

const Location = ({ register, errors }: { register: Register; errors: FieldErrors<Values> }) => (
  <div className="grid gap-5 sm:grid-cols-2">
    <SelectInput label="County" error={errorOf(errors, 'county')} {...register('county')}>
      <Options options={countiesForPicker().map((county) => ({ value: county, label: county }))} />
    </SelectInput>
    <TextInput label="Area or estate" optional error={errorOf(errors, 'area')} {...register('area')} />
  </div>
)

const fieldsFor: Record<Exclude<Service, 'general'>, (register: Register, errors: FieldErrors<Values>) => ReactNode> = {
  management: (register, errors) => (
    <>
      <SelectInput label="Type of property" error={errorOf(errors, 'propertyType')} {...register('propertyType')}>
        <Options options={MANAGED_PROPERTY_TYPES} />
      </SelectInput>
      <Location register={register} errors={errors} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Number of units" inputMode="numeric" error={errorOf(errors, 'units')} {...register('units')} />
        <SelectInput label="How much is let now" error={errorOf(errors, 'occupancy')} {...register('occupancy')}>
          <Options options={OCCUPANCY} />
        </SelectInput>
      </div>
      <CheckboxGroup
        legend="What would you like us to handle?"
        options={MANAGEMENT_SERVICES}
        error={errorOf(errors, 'servicesWanted')}
        inputProps={register('servicesWanted')}
      />
      <TextArea label="Anything else?" optional error={errorOf(errors, 'message')} {...register('message')} />
    </>
  ),
  valuation: (register, errors) => (
    <>
      <SelectInput label="What the valuation is for" error={errorOf(errors, 'purpose')} {...register('purpose')}>
        <Options options={VALUATION_PURPOSES} />
      </SelectInput>
      <SelectInput label="Type of property" error={errorOf(errors, 'propertyType')} {...register('propertyType')}>
        <Options options={PROPERTY_TYPES} />
      </SelectInput>
      <Location register={register} errors={errors} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput
          label="Size"
          optional
          hint="Such as 1/4 acre, or 1,800 sq ft."
          error={errorOf(errors, 'size')}
          {...register('size')}
        />
        <SelectInput label="Title" error={errorOf(errors, 'titleType')} {...register('titleType')}>
          <Options options={TITLE_TYPES} />
        </SelectInput>
      </div>
      <SelectInput label="When you need it" error={errorOf(errors, 'urgency')} {...register('urgency')}>
        <Options options={URGENCY} />
      </SelectInput>
      <TextArea
        label="Anything else?"
        optional
        hint="Your valuer will ask for a copy of the title and photos once we’ve been in touch."
        error={errorOf(errors, 'message')}
        {...register('message')}
      />
    </>
  ),
  agency: (register, errors) => (
    <>
      <ChoiceGroup
        legend="I want to"
        name="goal"
        options={AGENCY_GOALS}
        error={errorOf(errors, 'goal')}
        inputProps={register('goal')}
      />
      <Location register={register} errors={errors} />
      <TextArea
        label="About the property"
        hint="What it is, its size, and the price or rent you have in mind. If you’re buying or renting, what you want."
        error={errorOf(errors, 'propertyDetails')}
        {...register('propertyDetails')}
      />
      <SelectInput label="When" error={errorOf(errors, 'timeline')} {...register('timeline')}>
        <Options options={TIMELINES} />
      </SelectInput>
    </>
  ),
}

const EMPTY: Record<Service, Values> = {
  management: { propertyType: '', county: '', area: '', units: '', occupancy: '', servicesWanted: [], message: '' },
  valuation: { purpose: '', propertyType: '', county: '', area: '', size: '', titleType: '', urgency: '', message: '' },
  agency: { goal: undefined, county: '', area: '', propertyDetails: '', timeline: '' },
  general: { message: '' },
}

export const QuoteForm = ({ service, submitLabel }: { service: Service; submitLabel: string }) => {
  const form = useForm<Values>({
    resolver: zodResolver(serviceFormSchemas[service] as never),
    defaultValues: { ...EMPTY[service], name: '', phone: '', email: '', consent: undefined, company: '' },
  })
  const { register, formState } = form
  const { sent, message, onSubmit, submitting } = useLeadSubmit(form, (values) => submitServiceLead(service, values))

  if (sent) {
    return (
      <FormSent title="Message sent">
        <p>Thanks, {String(form.getValues('name')).split(' ')[0]}. The Deems team has your details.</p>
        <p>We’ll contact you on {String(form.getValues('phone'))}.</p>
      </FormSent>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-5">
      {service === 'general' ? (
        <TextArea label="How can we help?" error={errorOf(formState.errors, 'message')} {...register('message')} />
      ) : (
        fieldsFor[service](register, formState.errors)
      )}
      <div className="mt-3 grid gap-5 border-t border-line pt-8">
        <h3 className="text-h3">Your details</h3>
        <ContactFields register={register} errors={formState.errors} />
      </div>
      <SubmitRow label={submitLabel} submitting={submitting} message={message} />
    </form>
  )
}
