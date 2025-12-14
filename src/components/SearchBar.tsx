import { t } from 'i18next';
import React, { useState } from 'react';
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa';

const SearchBar: React.FC = () => {
  // État pour gérer l'ouverture/fermeture du panneau de filtres
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // État pour stocker ce que l'utilisateur tape dans la recherche
  const [searchQuery] = useState('');

  // État pour tous nos filtres avec des valeurs par défaut
  const [filters, setFilters] = useState({

    projet: '',       // Vide par défaut (l'utilisateur doit choisir)
    typeBien: '',     // Vide par défaut
    budget: '',       // Vide par défaut
    surface: { min: '', max: '' },  // Surface minimum et maximum
    chambres: '',     // Nombre de chambres
    options: {        // Options cochables
      piscine: false,   // Non cochée par défaut
      terrasse: false,  // Non cochée par défaut
      jardin: false,    // Non cochée par défaut
      cheminée: false,  // Non cochée par défaut
      parking: false,
      climatisation: false,
      security: false,
      guard: false
    }

  });

  // Options pour le menu déroulant "Projet"
  const projets = [
    { value: 'achat', label: t('searchbar.achat') },      // Option 1
    { value: 'location', label: t('searchbar.loc') }  // Option 2
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
    { value: '<10000000', label: '<10M FCFA' },
    { value: '25000000-49000000', label: '25M-49M FCFA' },
    { value: '>=50000000', label: '>=50M FCFA' }
  ];

  // Fonction appelée quand on soumet le formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page
    console.log('Recherche effectuée avec :', {
      query: searchQuery,
      filters
    });
    // Ici on pourra ajouter ton appel API plus tard
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
          {/* Grille pour les 4 filtres principaux (2 colonnes mobile, 4 desktop) */}
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


            {/* Champ de recherche texte - Conteneur relatif pour positionner l'icône */}
            {/* <div className="relative col-span-2 md:col-span-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchbar.plchol')}
                className="w-full p-3 pl-10 border-0 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-black"
              /> */}
              {/* Icône de loupe positionnée absolument à gauche */}
              {/* <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" />
            </div> */}
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

          {/* Grille des filtres avancés (1 colonne mobile, 3 desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

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
                    onClick={() => setFilters({ ...filters, chambres: item.toString() })}
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

            {/* Filtre Options */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Options</h4>
              <div className="space-y-2">
                {Object.entries(filters.options).map(([key, value]) => {
                  // const space: Record<string, string> = {
                  //   piscine: "piscine",
                  //   terrasse: "terrasse",
                  //   jardin: "jardin",
                  //   cheminée: "cheminée",
                  //   parking: "parking",
                  //   climatisation: "climatisation",
                  //   security: "système de vidéo surveillance",
                  //   guard: "société de gardiennage"
                  // }
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

                      {/* <span>{space[key] || key}</span> */}
                      <span> {t(`options.${key}`)}</span>
                    </label>
                  )
                })}
              </div>
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
              onClick={() => {
                console.log('Filtres appliqués :', filters);
                setIsFilterOpen(false);
              }}
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