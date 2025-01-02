'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { AnimatePresence, motion, useIsPresent } from 'framer-motion'
import { redirect } from 'next/navigation'

import { useIsInsideMobileNavigation } from '@/components/MobileNavigation'
import { useSectionStore } from '@/components/SectionProvider'
import { Tag } from '@/components/Tag'
import { remToPx } from '@/lib/remToPx'

interface NavGroup {
  title: string
  links: Array<{
    title: string
    href: string
  }>
}

function useInitialValue<T>(value: T, condition = true) {
  let initialValue = useRef(value).current
  return condition ? initialValue : value
}

function TopLevelNavItem({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <li className="md:hidden">
      <Link
        href={href}
        className="block py-1 text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        {children}
      </Link>
    </li>
  )
}

function NavLink({
  href,
  children,
  tag,
  active = false,
  isAnchorLink = false,
}: {
  href: string
  children: React.ReactNode
  tag?: string
  active?: boolean
  isAnchorLink?: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'flex justify-between gap-2 py-1 pr-3 text-sm transition',
        isAnchorLink ? 'pl-7' : 'pl-4',
        active
          ? 'text-zinc-900 dark:text-white'
          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white',
      )}
    >
      <span className="truncate">{children}</span>
      {tag && (
        <Tag variant="small" color="zinc">
          {tag}
        </Tag>
      )}
    </Link>
  )
}

function VisibleSectionHighlight({
  group,
  pathname,
}: {
  group: NavGroup
  pathname: string
}) {
  let [sections, visibleSections] = useInitialValue(
    [
      useSectionStore((s) => s.sections),
      useSectionStore((s) => s.visibleSections),
    ],
    useIsInsideMobileNavigation(),
  )

  let isPresent = useIsPresent()
  let firstVisibleSectionIndex = Math.max(
    0,
    [{ id: '_top' }, ...sections].findIndex(
      (section) => section.id === visibleSections[0],
    ),
  )
  let itemHeight = remToPx(2)
  let height = isPresent
    ? Math.max(1, visibleSections.length) * itemHeight
    : itemHeight
  let top =
    group.links.findIndex((link) => link.href === pathname) * itemHeight +
    firstVisibleSectionIndex * itemHeight

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      className="absolute inset-x-0 top-0 bg-zinc-800/2.5 will-change-transform dark:bg-white/2.5"
      style={{ borderRadius: 8, height, top }}
    />
  )
}

function ActivePageMarker({
  group,
  pathname,
}: {
  group: NavGroup
  pathname: string
}) {
  let itemHeight = remToPx(2)
  let offset = remToPx(0.25)
  let activePageIndex = group.links.findIndex((link) => link.href === pathname)
  let top = offset + activePageIndex * itemHeight

  return (
    <motion.div
      layout
      className="absolute left-2 h-6 w-px bg-indigo-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      style={{ top }}
    />
  )
}

function NavigationGroup({
  group,
  className,
}: {
  group: NavGroup
  className?: string
}) {
  // If this is the mobile navigation then we always render the initial
  // state, so that the state does not change during the close animation.
  // The state will still update when we re-open (re-render) the navigation.
  let isInsideMobileNavigation = useIsInsideMobileNavigation()
  let [pathname, sections] = useInitialValue(
    [usePathname(), useSectionStore((s) => s.sections)],
    isInsideMobileNavigation,
  )

  let isActiveGroup =
    group.links.findIndex((link) => link.href === pathname) !== -1

  return (
    <li className={clsx('relative mt-6', className)}>
      <motion.button
        layout="position"
        className={clsx(
          'flex w-full items-center justify-between rounded-md px-2 py-1 text-sm font-semibold text-zinc-900 dark:text-white',
          isActiveGroup
            ? 'cursor-default'
            : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 dark:hover:bg-opacity-10',
        )}
        onClick={() => {
          if (!isActiveGroup) {
            redirect(group.links[0].href)
          }
        }}
      >
        {group.title}
      </motion.button>

      {isActiveGroup && (
        <div className="relative mt-3 pl-2">
          <AnimatePresence initial={!isInsideMobileNavigation}>
            <VisibleSectionHighlight group={group} pathname={pathname} />
          </AnimatePresence>
          <motion.div
            layout
            className="absolute inset-y-0 left-2 w-px bg-zinc-900/10 dark:bg-white/5"
          />
          <AnimatePresence initial={false}>
            {isActiveGroup && (
              <ActivePageMarker group={group} pathname={pathname} />
            )}
          </AnimatePresence>
          <ul role="list" className="border-l border-transparent">
            {group.links.map((link) => (
              <motion.li key={link.href} layout="position" className="relative">
                <NavLink href={link.href} active={link.href === pathname}>
                  {link.title}
                </NavLink>
                <AnimatePresence mode="popLayout" initial={false}>
                  {link.href === pathname && sections.length > 0 && (
                    <motion.ul
                      role="list"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 1,
                        transition: { delay: 0.1 },
                      }}
                      exit={{
                        opacity: 0,
                        transition: { duration: 0.15 },
                      }}
                    >
                      {sections.map((section) => (
                        <li key={section.id}>
                          <NavLink
                            href={`${link.href}#${section.id}`}
                            tag={section.tag}
                            isAnchorLink
                          >
                            {section.title}
                          </NavLink>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </li>
  )
}

export const navigation: Array<NavGroup> = [
  {
    title: 'Guides',
    links: [
      { title: 'Introduction', href: '/' },
      { title: 'Authentication', href: '/authentication' },
      { title: 'Authorization', href: '/authorization' },
    ],
  },
  {
    title: 'Business Process',
    links: [
      { title: 'Business Process Introduction', href: '/business-process' },
      { title: 'Processes List', href: '/business-process/processes-list' },
      { title: 'Process Preview', href: '/business-process/process-preview' },
      { title: 'Modeler', href: '/business-process/modeler' },
    ],
  },
  {
    title: 'Forms',
    links: [
      { title: 'Forms Introduction', href: '/forms' },
      { title: 'Forms List', href: '/forms/forms-list' },
      { title: 'Form Preview', href: '/forms/form-preview' },
      { title: 'Form Builder', href: '/forms/form-builder' },
    ],
  },
  {
    title: 'Decision Tables',
    links: [
      { title: 'Decision Tables Introduction', href: '/decisions' },
      {
        title: 'Decision Tables list',
        href: '/decisions/decisions-list',
      },
      {
        title: 'Decision Tables Preview',
        href: '/decisions/decision-table-preview',
      },
      {
        title: 'Decision Tables Builder',
        href: '/decisions/decision-table-builder',
      },
    ],
  },
  {
    title: 'Apps',
    links: [
      { title: 'Apps Introduction', href: '/apps' },
      { title: 'Apps List', href: '/apps/apps-list' },
      { title: 'App Preview', href: '/apps/app-preview' },
      { title: 'App Builder', href: '/apps/app-builder' },
    ],
  },
  {
    title: 'Message Center',
    links: [
      { title: 'Message Center Introduction', href: '/message-center' },
      { title: 'Messages List', href: '/message-center/messages-list' },
      { title: 'Message Preview', href: '/message-center/message-preview' },
      { title: 'Message Builder', href: '/message-center/message-builder' },
    ],
  },
]

export function Navigation(props: React.ComponentPropsWithoutRef<'nav'>) {
  return (
    <nav {...props}>
      <ul role="list">
        {navigation.map((group, groupIndex) => (
          <NavigationGroup
            key={group.title}
            group={group}
            className={groupIndex === 0 ? 'md:mt-0' : ''}
          />
        ))}
      </ul>
    </nav>
  )
}
