import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Interprete de seña DEMO',
  description: 'Gestos de la mano 👌a texto',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex items-center justify-center px-5 bg-gradient-to-r from-black via-gray-800 to-gray-900 animate-gradient-x">
          <ul className='circles'>
            <li></li>
            <li></li>
            <li></li>
            <li></li>

          </ul>
          <div>
              {children}
          </div>
        </div>
      </body>
    </html>
  )
}
