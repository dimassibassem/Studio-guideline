'use client'

import React from 'react'
import { Transition } from '@headlessui/react'
import { usePathname } from 'next/navigation'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import clsx from 'clsx'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'

function CheckIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" {...props}>
      <circle cx="10" cy="10" r="10" strokeWidth="0" />
      <path
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="m6.75 10.813 2.438 2.437c1.218-4.469 4.062-6.5 4.062-6.5"
      />
    </svg>
  )
}

function FeedbackButton(
  props: Omit<React.ComponentPropsWithoutRef<'button'>, 'type' | 'className'>,
) {
  return (
    <button
      type="submit"
      className="px-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-900/2.5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
      {...props}
    />
  )
}

function FeedbackForm({
  onSubmit,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'form'>) {
  return (
    <form
      {...props}
      onSubmit={onSubmit}
      className={clsx(
        className,
        'absolute inset-0 flex items-center justify-center gap-6 md:justify-start',
      )}
    >
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Was this page helpful?
      </p>
      <div className="group grid h-8 grid-cols-[1fr,1px,1fr] overflow-hidden rounded-full border border-zinc-900/10 dark:border-white/10">
        <FeedbackButton data-response="yes">Yes</FeedbackButton>
        <div className="bg-zinc-900/10 dark:bg-white/10" />
        <FeedbackButton data-response="no">No</FeedbackButton>
      </div>
    </form>
  )
}

function FeedbackThanks({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'absolute flex justify-center md:justify-start',
      )}
    >
      <div className="flex items-center gap-3 rounded-full bg-indigo-50/50 p-1.5 text-sm text-indigo-900 ring-1 ring-inset ring-indigo-500/20 dark:bg-indigo-500/5 dark:text-indigo-200 dark:ring-indigo-500/30">
        <CheckIcon className="h-5 w-5 flex-none fill-indigo-500 stroke-white dark:fill-indigo-200/20 dark:stroke-indigo-200" />
        {children || 'Thanks for your feedback!'}
      </div>
    </div>
  )
}

function FeedbackError({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'absolute inset-0 flex justify-center md:justify-start',
      )}
    >
      <div className="flex items-center gap-3 rounded-full bg-red-50/50 px-3 py-1 text-sm text-red-900 ring-1 ring-inset ring-red-500/20 dark:bg-red-500/5 dark:text-red-200 dark:ring-red-500/30">
        {children || 'An error occurred'}
      </div>
    </div>
  )
}

export function Feedback() {
  const pathname = usePathname()

  // Define the mutation function
  const mutationFn = async (response: string) => {
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    const deviceId = result.visitorId

    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pathname,
        response,
        deviceId,
      }),
    })

    if (!res.ok) {
      // If the status is 400 or any other non-ok status, throw an error
      const errorData = await res.json()
      throw new Error(errorData.error || 'An unknown error occurred')
    }

    return res.json()
  }

  // Use the useMutation hook
  const { data, status, mutate, error, isPending } = useMutation({
    mutationFn,
  })

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const response = (event.nativeEvent as any).submitter.dataset.response
    mutate(response)
  }

  const repoUrl = process.env.NEXT_PUBLIC_REPO_URL
  const filePath = `${pathname.replace(/\/$/, '')}/page.mdx`
  const editBranch = 'dev'
  const editUrl = `${repoUrl}/edit/${editBranch}/src/app${filePath}`

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-8">
        <Transition show={status === 'idle'}>
          <FeedbackForm
            className="duration-300 data-[leave]:pointer-events-none data-[closed]:opacity-0"
            onSubmit={onSubmit}
          />
        </Transition>
        <Transition show={isPending}>
          <div className="flex items-center justify-center space-x-1">
            <span className="sr-only">Loading...</span>
            <div className="h-4 w-4 animate-bounce rounded-full bg-brand-400 [animation-delay:-0.3s] dark:bg-brand-600"></div>
            <div className="h-4 w-4 animate-bounce rounded-full bg-brand-400 [animation-delay:-0.15s] dark:bg-brand-600"></div>
            <div className="h-4 w-4 animate-bounce rounded-full bg-brand-400 dark:bg-brand-600"></div>
          </div>
        </Transition>
        <Transition show={status === 'success'}>
          <FeedbackThanks className="delay-150 duration-300 data-[closed]:opacity-0">
            {data?.isHelpfulPercentage ? (
              <span>
                Thanks for your feedback!{' '}
                <span className="font-medium">{data.isHelpfulPercentage}%</span>{' '}
                of users found this helpful.
              </span>
            ) : undefined}
          </FeedbackThanks>
        </Transition>
        <Transition show={status === 'error'}>
          <FeedbackError className="delay-150 duration-300 data-[closed]:opacity-0">
            {error?.message || 'An error occurred'}
          </FeedbackError>
        </Transition>
      </div>
      <Link
        href={editUrl}
        target="_blank"
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        Edit this page
      </Link>
    </div>
  )
}
