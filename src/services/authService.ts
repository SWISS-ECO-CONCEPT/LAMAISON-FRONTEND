const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function updateUserRole(clerkId: string, newRole: string) {
  try {
    const response = await fetch(`${API_URL}/auth/update-role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
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
