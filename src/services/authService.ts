import { API_BASE } from '../config/api';
export async function signInUser(clerkId: string, token: string) {
  try {
    const response = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ clerkId }),
    });

    if (!response.ok) {
      let errorMsg = `Erreur lors de la synchronisation de la session (${response.status})`;
      try {
        const errJson = await response.json();
        errorMsg = errJson?.error?.message ?? errJson?.message ?? errorMsg;
      } catch { /* fallback */ }
      throw new Error(errorMsg);
    }

    const json = await response.json();
    if (json?.success !== true) {
      throw new Error(json?.error?.message ?? json?.message ?? 'Réponse invalide du serveur');
    }
    return json?.data ?? json;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la synchronisation';
    throw new Error(errorMessage);
  }
}

export async function signUpUser(
  clerkId: string,
  firstname: string,
  role: 'PROSPECT' | 'AGENT',
  phone: string,
  token: string
) {
  try {
    const response = await fetch(`${API_BASE}/auth/signup`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ clerkId, firstname, role, phone }),
    });

    if (!response.ok) {
      let errorMsg = `Erreur lors de la création du profil local (${response.status})`;
      try {
        const errJson = await response.json();
        errorMsg = errJson?.error?.message ?? errJson?.message ?? errorMsg;
      } catch { /* fallback */ }
      throw new Error(errorMsg);
    }

    const json = await response.json();
    if (json?.success !== true) {
      throw new Error(json?.error?.message ?? json?.message ?? 'Réponse invalide du serveur');
    }
    return json?.data ?? json;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du profil';
    throw new Error(errorMessage);
  }
}

export async function updateUserRole(clerkId: string, newRole: string, token: string) {
  try {
    const response = await fetch(`${API_BASE}/auth/update-role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({
        clerkId,
        newRole,
      }),
    });

    if (!response.ok) {
      let errorMsg = `Erreur lors de la mise à jour du rôle (${response.status})`;
      try {
        const errJson = await response.json();
        errorMsg = errJson?.error?.message ?? errJson?.message ?? errorMsg;
      } catch { /* fallback */ }
      throw new Error(errorMsg);
    }

    const json = await response.json();
    if (json?.success !== true) {
      throw new Error(json?.error?.message ?? json?.message ?? 'Réponse invalide du serveur');
    }
    return json?.data ?? json;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du rôle';
    throw new Error(errorMessage);
  }
}
