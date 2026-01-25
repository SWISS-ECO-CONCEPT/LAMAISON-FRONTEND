import { t } from 'i18next';
import React, { useState } from 'react';
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa';

export interface SearchFilters {
  search?: string;
  type?: string;
  prixMin?: number;
  prixMax?: number;
  surfaceMin?: number;
  surfaceMax?: number;
  chambres?: number;
  douches?: number;
  ville?: string;
  projet?: string;
}

interface SearchBarProps {
  onSearch?: (filters: SearchFilters) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  // État pour gérer l'ouverture/fermeture du panneau de filtres
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // État pour tous nos filtres avec des valeurs par défaut
  const [filters, setFilters] = useState({
    search: '',       // Recherche textuelle
    projet: '',       // Vide par défaut (achat/location)
    typeBien: '',     // Vide par défaut
    budget: '',       // Vide par défaut
    ville: '',        // Ville
    surface: { min: '', max: '' },  // Surface minimum et maximum
    chambres: '',     // Nombre de chambres
    douches: '',      // Nombre de douches
    options: {        // Options cochables
      piscine: false,
      terrasse: false,
      jardin: false,
      cheminée: false,
      parking: false,
      climatisation: false,
      security: false,
      guard: false
    }
  });

  // Options pour le menu déroulant "Projet"
  const projets = [
    { value: 'achat', label: t('searchbar.achat') },
    { value: 'location', label: t('searchbar.loc') }
  ];

  // Options pour le menu déroulant "Type de bien"
  const typesBiens = [
    { value: 'maison', label: t('searchbar.maison') },
    { value: 'appartement', label: t('searchbar.appart') },
    { value: 'terrain', label: t('searchbar.terrain') },
    { value: 'chambre', label: t('searchbar.chambre') },
    { value: 'meublé', label: t('searchbar.meub') }
  ];

  // Options pour le menu déroulant "Budget"
  const budgets = [
    { value: '<10000000', label: '<10M FCFA', min: undefined, max: 10000000 },
    { value: '25000000-49000000', label: '25M-49M FCFA', min: 25000000, max: 49000000 },
    { value: '>=50000000', label: '>=50M FCFA', min: 50000000, max: undefined }
  ];

  // Fonction pour convertir les filtres internes en paramètres API
  const buildSearchParams = (): SearchFilters => {
    const params: SearchFilters = {};

    // Recherche textuelle
    if (filters.search.trim()) {
      params.search = filters.search.trim();
    }

    // Projet
    if (filters.projet) {
      params.projet = filters.projet;
    }

    // Type de bien
    if (filters.typeBien) {
      params.type = filters.typeBien;
    }

    // Ville
    if (filters.ville.trim()) {
      params.ville = filters.ville.trim();
    }

    // Projet (achat/location)
    if (filters.projet) {
      params.projet = filters.projet;
    }

    // Budget (décomposer la plage)
    if (filters.budget) {
      const budgetOption = budgets.find(b => b.value === filters.budget);
      if (budgetOption) {
        if (budgetOption.min !== undefined) params.prixMin = budgetOption.min;
        if (budgetOption.max !== undefined) params.prixMax = budgetOption.max;
      }
    }

    // Surface
    if (filters.surface.min) {
      params.surfaceMin = Number(filters.surface.min);
    }
    if (filters.surface.max) {
      params.surfaceMax = Number(filters.surface.max);
    }

    // Chambres
    if (filters.chambres) {
      const chambresValue = filters.chambres === '5+' ? 5 : Number(filters.chambres);
      params.chambres = chambresValue;
    }

    // Douches
    if (filters.douches) {
      const douchesValue = filters.douches === '5+' ? 5 : Number(filters.douches);
      params.douches = douchesValue;
    }

    return params;
  };

  // Fonction appelée quand on soumet le formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = buildSearchParams();
    console.log('SearchBar - handleSubmit: searchParams', searchParams);
    if (onSearch) {
      onSearch(searchParams);
    }
  };

  // Fonction appelée quand on applique les filtres avancés
  const handleApplyFilters = () => {
    const searchParams = buildSearchParams();
    console.log('SearchBar - handleApplyFilters: searchParams', searchParams);
    if (onSearch) {
      onSearch(searchParams);
    }
    setIsFilterOpen(false);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Conteneur principal avec fond blanc et ombre */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm">

        {/* Formulaire de recherche */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col md:flex-row gap-3 w-full"
        >
          {/* Grille pour les 4 filtres principaux */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">

    

            {/* Menu déroulant Projet */}
            <select
              value={filters.projet}
              onChange={(e) => setFilters({ ...filters, projet: e.target.value })}
              className="w-full h-12 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="" disabled>{t('searchbar.projet')}</option>
              {projets.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Menu déroulant Type de bien */}
            <select
              value={filters.typeBien}
              onChange={(e) => setFilters({ ...filters, typeBien: e.target.value })}
              className="w-full h-12 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="" disabled>{t('searchbar.typB')}</option>
              {typesBiens.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Menu déroulant Budget */}
            <select
              value={filters.budget}
              onChange={(e) => setFilters({ ...filters, budget: e.target.value })}
              className="w-full h-12 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="" disabled>{t('searchbar.budg')}</option>
              {budgets.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3">
            {/* Bouton Rechercher */}
            <button
              type="submit"
              className="h-12  bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <FaSearch />
              <span className="hidden md:inline">{t('searchbar.rech')}</span>
            </button>

            {/* Bouton Filtrer */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="h-12  bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <FaFilter />
              <span className="hidden md:inline">{t('searchbar.filt')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Panneau des filtres avancés (s'affiche quand isFilterOpen est true) */}
      {isFilterOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-6">
          {/* En-tête du panneau */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">{t('searchbar.crit')}</h3>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Fermer"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Grille des filtres avancés (1 colonne mobile, 4 desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {/* Filtre Ville */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">{t('annonceList.editPlaceholders.city')}</h4>
              <input
                type="text"
                placeholder="Ex: Yaoundé"
                value={filters.ville}
                onChange={(e) => setFilters({ ...filters, ville: e.target.value })}
                className="w-full h-10 px-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Filtre Surface */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">{t('searchbar.surfm')}</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.surface.min}
                  onChange={(e) => setFilters({
                    ...filters,
                    surface: { ...filters.surface, min: e.target.value }
                  })}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.surface.max}
                  onChange={(e) => setFilters({
                    ...filters,
                    surface: { ...filters.surface, max: e.target.value }
                  })}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            {/* Filtre Chambres */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">{t('searchbar.chambre')}</h4>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, '5+'].map(item => (
                  <button
                    key={item}
                    onClick={() => setFilters({ ...filters, chambres: item.toString() === filters.chambres ? '' : item.toString() })}
                    className={`px-3 py-1 rounded-full transition ${filters.chambres === item.toString()
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtre Douches */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">{t('annonceDetail.douches')}</h4>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, '5+'].map(item => (
                  <button
                    key={item}
                    onClick={() => setFilters({ ...filters, douches: item.toString() === filters.douches ? '' : item.toString() })}
                    className={`px-3 py-1 rounded-full transition ${filters.douches === item.toString()
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Deuxième rangée : Options */}
          <div className="mt-6 border-t pt-6">
            <h4 className="font-medium text-gray-700 mb-4">Options</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(filters.options).map(([key, value]) => {
                return (
                  < label key={key} className="flex items-center gap-2 cursor-pointer" >
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setFilters({
                        ...filters,
                        options: { ...filters.options, [key]: e.target.checked }
                      })}
                      className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                    />
                    <span> {t(`options.${key}`)}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Boutons en bas du panneau */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setIsFilterOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              {t('searchbar.annuler')}
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              {t('searchbar.appliquer')}
            </button>
          </div>
        </div>
      )
      }
    </div >
  );
};

export default SearchBar;