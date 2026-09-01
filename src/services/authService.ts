const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function updateUserRole(clerkId: string, newRole: string, token: string) {
  try {
    const response = await fetch(`${API_URL}/auth/update-role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
          // La route exige maintenant requireAuth() : sans ce token, Clerk traite
        // la requête comme non authentifiée et répond par une redirection (302)
        // plutôt qu'une simple erreur — d'où le PUT vers "/" qu'on observait.
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        clerkId,
        newRole,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la mise à jour du rôle');
    }

    return await response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du rôle';
    throw new Error(errorMessage);
  }
}
