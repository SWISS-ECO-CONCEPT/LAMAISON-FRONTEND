import React, { useState } from 'react'
import logo from '../assets/logo.jpg'
import { FaUserCircle, FaBars, FaTimes, FaHouseUser } from 'react-icons/fa'
import LanguageSwitcher from './LanguageSwitcher'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'

const Navbar: React.FC = () => {
  // État local qui gère si le menu mobile est ouvert (true) ou fermé (false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Fonction pour inverser l'état du menu (ouvrir/fermer)
  const toggleMenu = () => setMenuOpen(!menuOpen)

  const { t } = useTranslation();
  const { lng } = useParams<{ lng: string }>();
  const { user } = useUser()
  return (
    <header className="fixed top-0 z-50 w-full bg-green-600 backdrop-blur-sm text-white fixed top-0 w-full z-50 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" title={t('logo.title')}>
          <img className="h-10 w-auto" src={logo} alt="logo" />
        </Link>
        <div className="flex md:gap-4 items-center gap-4 ">
          <LanguageSwitcher />

          {/* Menu desktop */}

          <nav className="hidden md:flex space-x-6 text-sm items-center font-medium">
            <Link className='hover:opacity-80' to={`/${lng}/home`}>{t('navbar.acc')}</Link>
            <Link className='hover:opacity-80' to={`/${lng}/posts`}>{t('navbar.ann')}</Link>
            <Link className='hover:opacity-80' to={`/${lng}/about`}>{t('navbar.aprop')}</Link>
            <Link className='hover:opacity-80' to={`/${lng}/contact`}>{t('navbar.cont')}</Link>
            {user ? (
              <Link to={`/${lng}/dashboard`} className="text-xl hover:opacity-80">
                <FaHouseUser />
              </Link>
            ) : (
              <Link to={`/${lng}/login`} className="text-xl hover:opacity-80">
                <FaUserCircle />
              </Link>
            )

            }
          </nav>

          {/* Icône burger visible uniquement sur mobile (md:hidden) */}

          <button className="md:hidden text-2xl hover:opacity-80" onClick={toggleMenu}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden px-6 pb-4 pt-2 space-y-3 bg-green-600 text-sm">
          <Link to={`/${lng}/home`} className="block hover:opacity-80">{t('navbar.acc')}</Link>
          <Link to={`/${lng}/posts`} className="block hover:opacity-80">{t('navbar.ann')}</Link>
          <Link to={`/${lng}/about`} className="block hover:opacity-80">{t('navbar.aprop')}</Link>
          <Link to={`/${lng}/contact`} className="block hover:opacity-80">{t('navbar.cont')}</Link>
          {user ? (
            <Link to={`/${lng}/dashboard`} className="block hover:opacity-80">
              {t('navbar.dash')}
            </Link>
          ) : (
            <Link to={`/${lng}/login`} className="block hover:opacity-80">
              {t('navbar.connex')}
            </Link>
          )
          
          }
        </div>
      )}

    </header>
  )
}

export default Navbar
