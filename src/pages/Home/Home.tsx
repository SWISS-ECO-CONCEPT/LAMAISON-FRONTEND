import React, { useState } from 'react'
import SearchBar, { type SearchFilters } from '../../components/SearchBar'
import HeroSection from './HeroSection'
import AnnoncesPreview from './AnnoncesPreview'

const Home: React.FC = () => {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({})

  return (

    // Conteneur principal en colonne avec espacement vertical entre les sections
    <div className="flex flex-col gap-6">
      {/* Section d'en-tête avec Hero */}
      <HeroSection />

      {/* SearchBar complète avec filtres intégrés */}
      <div className="px-4 md:px-0">
        <SearchBar onSearch={setSearchFilters} />
      </div>

      {/* Aperçu des annonces en bas */}
      <AnnoncesPreview filters={searchFilters} />
    </div>
  )
}

export default Home

