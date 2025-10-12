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
    <header className="bg-green-600 backdrop-blur-sm text-white fixed top-0 w-full z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" title={t('logo.title')}>
          <img className="h-10 w-auto" src={logo} alt="logo" />
        </Link>
        <div className="flex md:gap-4 items-center gap-4 ">
          <LanguageSwitcher />

          {/* Menu desktop */}

          <nav className="hidden md:flex space-x-6 text-sm items-center">
            <Link to={`/${lng}/home`}>{t('navbar.acc')}</Link>
            <Link to={`/${lng}/posts`}>{t('navbar.ann')}</Link>
            <Link to={`/${lng}/about`}>{t('navbar.aprop')}</Link>
            <Link to={`/${lng}/contact`}>{t('navbar.cont')}</Link>
            {user ? (
              <Link to={`/${lng}/dashboard`} className="text-xl">
                <FaHouseUser />
              </Link>
            ) : (
              <Link to={`/${lng}/login`} className="text-xl">
                <FaUserCircle />
              </Link>
            )

            }
          </nav>

          {/* Icône burger visible uniquement sur mobile (md:hidden) */}

          <button className="md:hidden text-2xl" onClick={toggleMenu}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden px-6 pb-4 pt-2 space-y-3 bg-green-600 text-sm">
          <Link to={`/${lng}/home`} className="block">{t('navbar.acc')}</Link>
          <Link to={`/${lng}/posts`} className="block">{t('navbar.ann')}</Link>
          <Link to={`/${lng}/about`} className="block">{t('navbar.aprop')}</Link>
          <Link to={`/${lng}/contact`} className="block">{t('navbar.cont')}</Link>
          {user ? (
            <Link to={`/${lng}/dashboard`} className="block">
              {t('navbar.dash')}
            </Link>
          ) : (
            <Link to={`/${lng}/login`} className="block">
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
