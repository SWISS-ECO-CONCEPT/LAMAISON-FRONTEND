import Flag from 'react-world-flags';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowDown } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();
    const languages = [
        { code: 'fr', emoji: 'FR' },
        { code: 'en', emoji: 'GB' },
    ] as const; // Use 'as const' to infer literal types for 'code' and 'emoji'

    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const changeLang = (code: string) => {
        i18n.changeLanguage(code);
        const currentPath = location.pathname;
        const newPath = `/${code}${currentPath.startsWith('/en') || currentPath.startsWith('/fr')
                ? currentPath.substring(3)
                : currentPath
            }`;
        navigate(newPath);
        setOpen(false); // referme le menu après sélection
    };

    const currentLang = languages.find((l) => l.code === i18n.language);

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-1 text-sm border-none hover:bg-gray-100 hover:text-black transition-colors rounded-2xl"
            >
                {currentLang && ( // 'flagCode' is not a property of 'languages' array elements. Use 'emoji' instead.
                    <Flag code={currentLang.emoji} style={{ width: 24, height: 16 }} />
                )}

                <FaArrowDown
                    size={16}
                    className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-36 bg-white border text-black border-gray-200 rounded shadow-lg z-10">
                    {languages.map((lang) => {
                        const isActive = lang.code === i18n.language;
                        return (
                            <button
                                key={lang.code}
                                onClick={() => changeLang(lang.code)}
                                className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors
                  hover:bg-gray-100
                  ${isActive ? 'bg-gray-200 font-semibold border-l-4 border-blue-500' : ''}`}
                            >
                                <Flag code={lang.emoji} style={{ width: 24, height: 16 }} /> {/* 'flagCode' is not a property of 'languages' array elements. Use 'emoji' instead. */}
                                <span className="ml-2">{lang.code.toUpperCase()}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;


// import React, { useState } from 'react'
// import { useTranslation } from 'react-i18next';
// import { FaArrowDown } from 'react-icons/fa';
// import { useLocation, useNavigate } from 'react-router-dom';


// const LanguageSwitcher: React.FC= () => {
//     const {i18n}= useTranslation()
//     const languages = [
//         {code: "fr", label: "FR", emoji: "FR"},
//         {code: "en", label: "EN", emoji: "EN"}
//     ]
//     const [open, setOpen]=useState(false)
//     const navigate = useNavigate()
//     const location = useLocation()
//     const changeLang = (code: string) => {
//        i18n.changeLanguage(code)
//        const currentPath = location.pathname
//        const newPath = `/${code}${currentPath.startsWith('/en') ||
//        currentPath.startsWith('/fr')
//        ? currentPath.substring(3)
//         : currentPath}`
//        navigate(newPath)
//     }
//     const currentLang = languages.find((l) => l.code === i18n.language)
//     return (
//         <div className="relative inline-block text-left">
//             <button
//                 onClick={() => setOpen(!open)}
//                 className="flex items-center gap-2 px-3 py-1 text-sm border-none hover:bg-gray-100 hover:text-black"
//             >
//                 {currentLang?.code.toUpperCase()}
//                 <FaArrowDown size={16} />
//             </button>

//             {open && (
//                 <div className="absolute right-0 mt-2 w-36 bg-white border text-black border-gray-200 rounded shadow-lg z-10">
//                     {languages.map((lang) => (
//                         <button
//                             key={lang.code}
//                             onClick={() => changeLang(lang.code)}
//                             className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
//                         >
//                              {lang.label}
//                         </button>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }

// export default LanguageSwitcher