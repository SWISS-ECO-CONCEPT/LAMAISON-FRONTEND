import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import  {Navigate, Outlet, useParams}  from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react';

// Déclare le type des propriétés (props) attendues par Layout
// Ici, 'children' est le contenu dynamique qu'on va afficher entre Navbar et Footer
// type PageProps = {
//     children: ReactNode // Représente n'importe quel contenu JSX : texte, composants, etc.
// }


// Déclaration du composant 'Layout' en tant que Functional Component (React.FC)
// Il reçoit des props de type PageProps et on extrait 'children' directement
// const Layout: React.FC<PageProps> = ({ children }: PageProps) => {

const Layout: React.FC = () => {
    const { user }: any = useUser();
    // const { lng } = useParams<{ lng: string }>();
    console.log(user)
    // if (user) return <Navigate to={`/${lng}/Dashboard`} />
    return (
        <>

            <Navbar />
            <main className='flex-grow'>
                {/* {children} */}
                 <Outlet /> {/*C’est ici que les pages (Home, Annonces, etc.) vont s’afficher */}
            </main>
            <Footer />
        </>
    )
}


export default Layout
