'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { FieldErrors, FieldValues, Path, UseFormRegister, UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { CheckboxField, TextInput } from '@/components/ui/form'
import type { SubmitResult } from '@/lib/leads/save'

const NETWORK_ERROR = 'We couldn’t send the form. Check your connection and try again, or call us.'

// Sends a validated form to a server action and applies what comes back: field errors go
// onto their fields, anything else shows above the button.
export const useLeadSubmit = <T extends FieldValues>(
  form: UseFormReturn<T>,
  action: (values: T) => Promise<SubmitResult>,
) => {
  const [sent, setSent] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const onSubmit = form.handleSubmit(async (values) => {
    setMessage(null)
    try {
      const result = await action(values)
      if (result.ok) return setSent(true)
      setMessage(result.message)
      for (const [field, error] of Object.entries(result.fieldErrors ?? {})) {
        form.setError(field as Path<T>, { message: error }, { shouldFocus: true })
      }
    } catch {
      setMessage(NETWORK_ERROR)
    }
  })
  return { sent, message, onSubmit, submitting: form.formState.isSubmitting }
}

const errorOf = (errors: FieldErrors, name: string) => errors[name]?.message as string | undefined

type ContactProps<T extends FieldValues> = {
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  phoneHint?: string
  extra?: ReactNode
}

// Name, phone, email and consent, plus a hidden field that only bots fill in
export const ContactFields = <T extends FieldValues>({ register, errors, phoneHint, extra }: ContactProps<T>) => (
  <>
    <TextInput label="Your name" autoComplete="name" error={errorOf(errors, 'name')} {...register('name' as Path<T>)} />
    <TextInput
      label="Phone number"
      type="tel"
      autoComplete="tel"
      hint={phoneHint ?? 'From abroad? Start with your country code, such as +44.'}
      error={errorOf(errors, 'phone')}
      {...register('phone' as Path<T>)}
    />
    <TextInput
      label="Email"
      type="email"
      autoComplete="email"
      optional
      error={errorOf(errors, 'email')}
      {...register('email' as Path<T>)}
    />
    {extra}
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Company (leave this empty)
        <input type="text" tabIndex={-1} autoComplete="off" {...register('company' as Path<T>)} />
      </label>
    </div>
    <CheckboxField error={errorOf(errors, 'consent')} {...register('consent' as Path<T>)}>
      I agree that Deems Luxe Homes may use these details to handle my request, as set out in the{' '}
      <Link href="/privacy" className="font-semibold text-purple underline underline-offset-2">
        privacy policy
      </Link>
      .
    </CheckboxField>
  </>
)

export const SubmitRow = ({ label, submitting, message }: { label: string; submitting: boolean; message: string | null }) => (
  <div className="grid gap-4">
    {message ? (
      <p role="alert" className="rounded-control border-2 border-danger bg-white px-4 py-3 text-sm font-medium text-danger">
        {message}
      </p>
    ) : null}
    <div>
      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? 'Sending' : label}
      </Button>
    </div>
  </div>
)

// Replaces the form once it's sent. Takes focus so screen readers announce it.
export const FormSent = ({ title, children }: { title: string; children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => ref.current?.focus(), [])
  return (
    <div ref={ref} tabIndex={-1} role="status" className="rounded-card border border-line bg-white p-6 outline-none sm:p-8">
      <h2 className="text-h2">{title}</h2>
      <div className="mt-3 grid gap-3 text-mute">{children}</div>
    </div>
  )
}
