// src/pages/Dashboard/Settings/Settings.tsx
import { useState } from "react";

const Settings = () => {
  // Langue
  const [language, setLanguage] = useState("fr");

  // Notifications
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
  });

  // Mot de passe
  const [password, setPassword] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.newPass !== password.confirm) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }
    console.log("Mot de passe changé avec succès ✅");
    alert("Mot de passe mis à jour !");
    setPassword({ current: "", newPass: "", confirm: "" });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

      {/* Mot de passe */}
      <section className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4"> Sécurité</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Mot de passe actuel</label>
            <input
              type="password"
              value={password.current}
              onChange={(e) =>
                setPassword({ ...password, current: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              value={password.newPass}
              onChange={(e) =>
                setPassword({ ...password, newPass: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Confirmer</label>
            <input
              type="password"
              value={password.confirm}
              onChange={(e) =>
                setPassword({ ...password, confirm: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
          >
            Mettre à jour
          </button>
        </form>
      </section>

      {/* Langue */}
      <section className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4"> Langue</h2>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border px-3 py-2 rounded-md"
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </section>

      {/* Notifications */}
      <section className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4"> Notifications</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={() =>
                setNotifications({ ...notifications, email: !notifications.email })
              }
              className="w-5 h-5"
            />
            Recevoir des notifications par e-mail
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={notifications.push}
              onChange={() =>
                setNotifications({ ...notifications, push: !notifications.push })
              }
              className="w-5 h-5"
            />
            Recevoir des notifications push
          </label>
        </div>
      </section>
    </div>
  );
};

export default Settings;
