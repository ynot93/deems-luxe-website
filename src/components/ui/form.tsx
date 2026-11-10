import { useId, type ComponentProps, type ReactNode } from 'react'

const controlClasses =
  'block w-full rounded-control border border-control bg-white px-3.5 text-base text-ink placeholder:text-mute aria-invalid:border-danger aria-invalid:border-2'

type FieldProps = { label: string; hint?: string; error?: string; optional?: boolean }

const describedBy = (id: string, { hint, error }: FieldProps) =>
  [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined

const Field = ({
  id,
  label,
  hint,
  error,
  optional,
  children,
}: FieldProps & { id: string; children: ReactNode }) => (
  <div className="grid gap-1.5">
    <label htmlFor={id} className="text-sm font-semibold text-ink">
      {label}
      {optional ? <span className="font-normal text-mute"> (optional)</span> : null}
    </label>
    {hint ? (
      <p id={`${id}-hint`} className="text-sm text-mute">
        {hint}
      </p>
    ) : null}
    {children}
    {error ? (
      <p id={`${id}-error`} className="text-sm font-medium text-danger">
        {error}
      </p>
    ) : null}
  </div>
)

export const TextInput = ({
  label,
  hint,
  error,
  optional,
  className = '',
  ...props
}: FieldProps & ComponentProps<'input'>) => {
  const id = useId()
  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { label, hint, error })}
        className={`${controlClasses} min-h-12 ${className}`}
        {...props}
      />
    </Field>
  )
}

export const SelectInput = ({
  label,
  hint,
  error,
  optional,
  className = '',
  children,
  ...props
}: FieldProps & ComponentProps<'select'>) => {
  const id = useId()
  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { label, hint, error })}
        className={`${controlClasses} min-h-12 ${className}`}
        {...props}
      >
        {children}
      </select>
    </Field>
  )
}

export const TextArea = ({
  label,
  hint,
  error,
  optional,
  className = '',
  ...props
}: FieldProps & ComponentProps<'textarea'>) => {
  const id = useId()
  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional}>
      <textarea
        id={id}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { label, hint, error })}
        className={`${controlClasses} py-3 ${className}`}
        {...props}
      />
    </Field>
  )
}

export const CheckboxField = ({
  error,
  children,
  ...props
}: { error?: string; children: ReactNode } & Omit<ComponentProps<'input'>, 'type'>) => {
  const id = useId()
  return (
    <div className="grid gap-1.5">
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 size-5 shrink-0 accent-purple"
          {...props}
        />
        <label htmlFor={id} className="text-sm text-ink">
          {children}
        </label>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}

const segmentClasses =
  'flex min-h-12 cursor-pointer items-center justify-center rounded-control border border-control bg-white px-3 text-center text-[0.9375rem] font-semibold text-ink transition-colors peer-checked:border-purple peer-checked:bg-purple peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-purple'

type GroupInputProps = Omit<ComponentProps<'input'>, 'type' | 'value' | 'defaultChecked'>

const GroupError = ({ id, error }: { id: string; error?: string }) =>
  error ? (
    <p id={`${id}-error`} className="text-sm font-medium text-danger">
      {error}
    </p>
  ) : null

// One choice from a few, shown as segments in a row
export const ChoiceGroup = ({
  legend,
  name,
  options,
  error,
  defaultValue,
  inputProps,
}: {
  legend: string
  name: string
  options: readonly { label: string; value: string }[]
  error?: string
  defaultValue?: string
  inputProps?: GroupInputProps
}) => {
  const id = useId()
  return (
    <fieldset className="grid gap-1.5" aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="mb-1.5 text-sm font-semibold text-ink">{legend}</legend>
      <div className="grid auto-cols-fr grid-flow-col gap-2">
        {options.map((option) => (
          <label key={option.value} className="relative">
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={defaultValue === undefined ? undefined : option.value === defaultValue}
              className="peer absolute inset-0 opacity-0"
              {...inputProps}
            />
            <span className={segmentClasses}>{option.label}</span>
          </label>
        ))}
      </div>
      <GroupError id={id} error={error} />
    </fieldset>
  )
}

// Any number of choices, shown as chips that wrap
export const CheckboxGroup = ({
  legend,
  hint,
  options,
  error,
  optional,
  inputProps,
}: {
  legend: string
  hint?: string
  options: readonly { label: string; value: string }[]
  error?: string
  optional?: boolean
  inputProps?: GroupInputProps
}) => {
  const id = useId()
  return (
    <fieldset
      className="grid gap-1.5"
      aria-describedby={[hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined}
    >
      <legend className="mb-1.5 text-sm font-semibold text-ink">
        {legend}
        {optional ? <span className="font-normal text-mute"> (optional)</span> : null}
      </legend>
      {hint ? (
        <p id={`${id}-hint`} className="-mt-1 mb-1 text-sm text-mute">
          {hint}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="relative">
            <input type="checkbox" value={option.value} className="peer absolute inset-0 opacity-0" {...inputProps} />
            <span className={`${segmentClasses} min-h-11 px-4`}>{option.label}</span>
          </label>
        ))}
      </div>
      <GroupError id={id} error={error} />
    </fieldset>
  )
}
