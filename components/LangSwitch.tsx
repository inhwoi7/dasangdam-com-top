'use client'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

export default function LangSwitch() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLang = (lang: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${lang}`)
    router.push(newPath)
  }

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <button
        onClick={() => switchLang('ko')}
        className={`px-2 py-1 rounded transition-colors ${
          locale === 'ko' ? 'font-bold' : 'text-gray-400 hover:text-gray-700'
        }`}
      >
        KO
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => switchLang('en')}
        className={`px-2 py-1 rounded transition-colors ${
          locale === 'en' ? 'font-bold' : 'text-gray-400 hover:text-gray-700'
        }`}
      >
        EN
      </button>
    </div>
  )
}